import { OrderChangeStatus, PromotionActions } from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  OrderChangeActionDTO,
  OrderChangeDTO,
  OrderDTO,
  OrderWorkflow,
} from "@medusajs/types"
import { useRemoteQueryStep } from "../../common"
import {
  previewOrderChangeStep,
  updateOrderChangeActionsStep,
} from "../../order"
import { getDraftOrderPromotionContextStep } from "../steps/get-draft-order-promotion-context"
import { validateDraftOrderChangeStep } from "../steps/validate-draft-order-change"
import { validateDraftOrderUpdateActionItemStep } from "../steps/validate-draft-order-update-action-item"
import { draftOrderFieldsForRefreshSteps } from "../utils/fields"
import { refreshDraftOrderAdjustmentsWorkflow } from "./refresh-draft-order-adjustments"

export const updateDraftOrderActionItemId = "update-draft-order-action-item"

export const updateDraftOrderActionItemWorkflow = createWorkflow(
  updateDraftOrderActionItemId,
  function (
    input: WorkflowData<OrderWorkflow.UpdateOrderEditAddNewItemWorkflowInput>
  ) {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: draftOrderFieldsForRefreshSteps,
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

    validateDraftOrderChangeStep({
      order,
      orderChange,
    })

    validateDraftOrderUpdateActionItemStep({
      input,
      orderChange,
    })

    const updateData = transform(
      { orderChange, input },
      ({ input, orderChange }) => {
        const originalAction = (orderChange.actions ?? []).find(
          (a) => a.id === input.action_id
        ) as OrderChangeActionDTO

        const data = input.data

        return {
          id: input.action_id,
          details: {
            quantity: data.quantity ?? originalAction.details?.quantity,
            unit_price: data.unit_price ?? originalAction.details?.unit_price,
            compare_at_unit_price:
              data.compare_at_unit_price ??
              originalAction.details?.compare_at_unit_price,
          },
          internal_note: data.internal_note,
        }
      }
    )

    updateOrderChangeActionsStep([updateData])

    const context = getDraftOrderPromotionContextStep({
      order,
    })

    const appliedPromoCodes: string[] = transform(context, (context) => {
      const promotionLink = (context as any).promotion_link

      if (!promotionLink) {
        return []
      }

      if (Array.isArray(promotionLink)) {
        return promotionLink.map((promo) => promo.promotion.code)
      }

      return [promotionLink.promotion.code]
    })

    // If any the order has any promo codes, then we need to refresh the adjustments.
    when(
      appliedPromoCodes,
      (appliedPromoCodes) => appliedPromoCodes.length > 0
    ).then(() => {
      refreshDraftOrderAdjustmentsWorkflow.runAsStep({
        input: {
          order: context,
          promo_codes: appliedPromoCodes,
          action: PromotionActions.REPLACE,
        },
      })
    })

    return new WorkflowResponse(previewOrderChangeStep(input.order_id))
  }
)
