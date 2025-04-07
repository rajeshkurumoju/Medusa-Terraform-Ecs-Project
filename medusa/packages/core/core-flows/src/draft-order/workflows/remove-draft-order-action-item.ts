import { OrderChangeStatus, PromotionActions } from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  OrderChangeDTO,
  OrderDTO,
  OrderPreviewDTO,
  OrderWorkflow,
} from "@medusajs/types"
import { useRemoteQueryStep } from "../../common"
import {
  deleteOrderChangeActionsStep,
  previewOrderChangeStep,
} from "../../order"
import { validateDraftOrderChangeStep } from "../steps/validate-draft-order-change"
import { validateDraftOrderRemoveActionItemStep } from "../steps/validate-draft-order-remove-action-item"
import { draftOrderFieldsForRefreshSteps } from "../utils/fields"
import { refreshDraftOrderAdjustmentsWorkflow } from "./refresh-draft-order-adjustments"

export const removeDraftOrderActionItemWorkflowId =
  "remove-draft-order-action-item"

export const removeDraftOrderActionItemWorkflow = createWorkflow(
  removeDraftOrderActionItemWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.DeleteOrderEditItemActionWorkflowInput>
  ): WorkflowResponse<OrderPreviewDTO> {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["id", "status", "is_draft_order", "canceled_at", "items.*"],
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "version", "actions.*"],
      variables: {
        filters: {
          order_id: input.order_id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    validateDraftOrderChangeStep({ order, orderChange })

    validateDraftOrderRemoveActionItemStep({
      input,
      orderChange,
    })

    deleteOrderChangeActionsStep({ ids: [input.action_id] })

    const refetchedOrder = useRemoteQueryStep({
      entry_point: "orders",
      fields: draftOrderFieldsForRefreshSteps,
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "refetched-order-query" })

    const appliedPromoCodes: string[] = transform(
      refetchedOrder,
      (refetchedOrder) => {
        const promotionLink = (refetchedOrder as any).promotion_link

        if (!promotionLink) {
          return []
        }

        if (Array.isArray(promotionLink)) {
          return promotionLink.map((promo) => promo.promotion.code)
        }

        return [promotionLink.promotion.code]
      }
    )

    // If any the order has any promo codes, then we need to refresh the adjustments.
    when(
      appliedPromoCodes,
      (appliedPromoCodes) => appliedPromoCodes.length > 0
    ).then(() => {
      refreshDraftOrderAdjustmentsWorkflow.runAsStep({
        input: {
          order: refetchedOrder,
          promo_codes: appliedPromoCodes,
          action: PromotionActions.REPLACE,
        },
      })
    })

    return new WorkflowResponse(previewOrderChangeStep(input.order_id))
  }
)
