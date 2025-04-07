import {
  ChangeActionType,
  OrderChangeStatus,
  PromotionActions,
} from "@medusajs/framework/utils"
import {
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowData,
} from "@medusajs/framework/workflows-sdk"
import { OrderChangeDTO, OrderDTO } from "@medusajs/types"
import { useRemoteQueryStep } from "../../common"
import { deleteOrderChangesStep, deleteOrderShippingMethods } from "../../order"
import { restoreDraftOrderShippingMethodsStep } from "../steps/restore-draft-order-shipping-methods"
import { validateDraftOrderChangeStep } from "../steps/validate-draft-order-change"
import { draftOrderFieldsForRefreshSteps } from "../utils/fields"
import { refreshDraftOrderAdjustmentsWorkflow } from "./refresh-draft-order-adjustments"

export const cancelDraftOrderEditWorkflowId = "cancel-draft-order-edit"

export interface CancelDraftOrderEditWorkflowInput {
  order_id: string
}

export const cancelDraftOrderEditWorkflow = createWorkflow(
  cancelDraftOrderEditWorkflowId,
  function (input: WorkflowData<CancelDraftOrderEditWorkflowInput>) {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["version", ...draftOrderFieldsForRefreshSteps],
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

    const shippingToRemove = transform(
      { orderChange, input },
      ({ orderChange }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.SHIPPING_ADD)
          .map(({ id }) => id)
      }
    )

    const shippingToRestore = transform(
      { orderChange, input },
      ({ orderChange }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.SHIPPING_UPDATE)
          .map(({ reference_id, details }) => ({
            id: reference_id,
            before: {
              shipping_option_id: details?.old_shipping_option_id,
              amount: details?.old_amount,
            },
            after: {
              shipping_option_id: details?.new_shipping_option_id,
              amount: details?.new_amount,
            },
          }))
      }
    )

    const promotionsToRemove = transform(
      { orderChange, input },
      ({ orderChange }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.PROMOTION_ADD)
          .map(({ details }) => details?.added_code)
          .filter(Boolean) as string[]
      }
    )

    const promotionsToRestore = transform(
      { orderChange, input },
      ({ orderChange }) => {
        return (orderChange.actions ?? [])
          .filter((a) => a.action === ChangeActionType.PROMOTION_REMOVE)
          .map(({ details }) => details?.removed_code)
          .filter(Boolean) as string[]
      }
    )

    const promotionsToRefresh = transform(
      { order, promotionsToRemove, promotionsToRestore },
      ({ order, promotionsToRemove, promotionsToRestore }) => {
        const promotionLink = (order as any).promotion_link
        const codes: Set<string> = new Set()

        if (promotionLink) {
          if (Array.isArray(promotionLink)) {
            promotionLink.forEach((promo) => {
              codes.add(promo.promotion.code)
            })
          } else {
            codes.add(promotionLink.promotion.code)
          }
        }

        for (const code of promotionsToRemove) {
          codes.delete(code)
        }

        for (const code of promotionsToRestore) {
          codes.add(code)
        }

        return Array.from(codes)
      }
    )

    parallelize(
      deleteOrderChangesStep({ ids: [orderChange.id] }),
      deleteOrderShippingMethods({ ids: shippingToRemove })
    )

    refreshDraftOrderAdjustmentsWorkflow.runAsStep({
      input: {
        order,
        promo_codes: promotionsToRefresh,
        action: PromotionActions.REPLACE,
      },
    })

    when(shippingToRestore, (methods) => {
      return !!methods?.length
    }).then(() => {
      restoreDraftOrderShippingMethodsStep({
        shippingMethods: shippingToRestore as any,
      })
    })
  }
)
