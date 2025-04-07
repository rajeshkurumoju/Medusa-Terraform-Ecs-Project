import { Modules, OrderWorkflowEvents } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  IOrderModuleService,
  OrderDTO,
  RegisterOrderChangeDTO,
  UpdateOrderDTO,
  UpsertOrderAddressDTO,
} from "@medusajs/types"
import { emitEventStep, useRemoteQueryStep } from "../../common"
import { previewOrderChangeStep, registerOrderChangesStep } from "../../order"
import { validateDraftOrderStep } from "../steps/validate-draft-order"

export const updateDraftOrderWorkflowId = "update-draft-order"

export interface UpdateDraftOrderWorkflowInput {
  /**
   * The ID of the draft order to update.
   */
  id: string
  /**
   * The ID of the user updating the draft order.
   */
  user_id: string
  /**
   * Create or update the shipping address of the draft order.
   */
  shipping_address?: UpsertOrderAddressDTO
  /**
   * Create or update the billing address of the draft order.
   */
  billing_address?: UpsertOrderAddressDTO
  /**
   * The ID of the customer to associate the draft order with.
   */
  customer_id?: string
  /**
   * The new email of the draft order.
   */
  email?: string
  /**
   * The ID of the sales channel to associate the draft order with.
   */
  sales_channel_id?: string
  /**
   * The new metadata of the draft order.
   */
  metadata?: Record<string, unknown> | null
}

interface UpdateDraftOrderStepInput {
  order: OrderDTO
  input: UpdateOrderDTO
}

const updateDraftOrderStep = createStep(
  "update-draft-order",
  async ({ order, input }: UpdateDraftOrderStepInput, { container }) => {
    const service = container.resolve<IOrderModuleService>(Modules.ORDER)

    const updatedOrders = await service.updateOrders([
      {
        id: order.id,
        ...input,
      },
    ])

    const updatedOrder = updatedOrders[0]

    return new StepResponse(updatedOrder, order)
  },
  async function (prevData, { container }) {
    if (!prevData) {
      return
    }

    const service = container.resolve<IOrderModuleService>(Modules.ORDER)

    await service.updateOrders([prevData as UpdateOrderDTO])
  }
)

export const updateDraftOrderWorkflow = createWorkflow(
  updateDraftOrderWorkflowId,
  function (input: WorkflowData<UpdateDraftOrderWorkflowInput>) {
    const order = useRemoteQueryStep({
      entry_point: "orders",
      fields: [
        "id",
        "customer_id",
        "status",
        "is_draft_order",
        "sales_channel_id",
        "email",
        "customer_id",
        "shipping_address.*",
        "billing_address.*",
        "metadata",
      ],
      variables: {
        id: input.id,
      },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    validateDraftOrderStep({ order })

    const updateInput = transform(
      { input, order },
      ({
        input,
        order,
      }: {
        input: UpdateDraftOrderWorkflowInput
        order: OrderDTO
      }) => {
        const update: UpdateOrderDTO = {}

        if (input.shipping_address) {
          const address = {
            ...order.shipping_address,
            ...input.shipping_address,
          }
          delete address.id
          update.shipping_address = address
        }

        if (input.billing_address) {
          const address = {
            ...order.billing_address,
            ...input.billing_address,
          }
          delete address.id
          update.billing_address = address
        }

        return { ...input, ...update }
      }
    )

    const updatedOrder = updateDraftOrderStep({
      order,
      input: updateInput,
    })

    const orderChangeInput = transform(
      { input, updatedOrder, order },
      ({ input, updatedOrder, order }) => {
        const changes: RegisterOrderChangeDTO[] = []

        if (input.shipping_address) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.id,
            created_by: input.user_id,
            confirmed_by: input.user_id,
            details: {
              type: "shipping_address",
              old: order.shipping_address,
              new: updatedOrder.shipping_address,
            },
          })
        }

        if (input.billing_address) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.id,
            created_by: input.user_id,
            confirmed_by: input.user_id,
            details: {
              type: "billing_address",
              old: order.billing_address,
              new: updatedOrder.billing_address,
            },
          })
        }

        if (input.customer_id) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.id,
            created_by: input.user_id,
            confirmed_by: input.user_id,
            details: {
              type: "customer_id",
              old: order.customer_id,
              new: updatedOrder.customer_id,
            },
          })
        }

        if (input.email) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.id,
            created_by: input.user_id,
            confirmed_by: input.user_id,
            details: {
              type: "email",
              old: order.email,
              new: updatedOrder.email,
            },
          })
        }

        if (input.sales_channel_id) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.id,
            created_by: input.user_id,
            confirmed_by: input.user_id,
            details: {
              type: "sales_channel_id",
              old: order.sales_channel_id,
              new: updatedOrder.sales_channel_id,
            },
          })
        }

        if (input.metadata) {
          changes.push({
            change_type: "update_order" as const,
            order_id: input.id,
            created_by: input.user_id,
            confirmed_by: input.user_id,
            details: {
              type: "metadata",
              old: order.metadata,
              new: updatedOrder.metadata,
            },
          })
        }

        return changes
      }
    )

    registerOrderChangesStep(orderChangeInput)

    emitEventStep({
      eventName: OrderWorkflowEvents.UPDATED,
      data: { id: input.id },
    })

    const preview = previewOrderChangeStep(input.id)

    return new WorkflowResponse(preview)
  }
)
