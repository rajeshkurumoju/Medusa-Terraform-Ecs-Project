import {
  deleteRefundReasonsWorkflow,
  updateRefundReasonsWorkflow,
} from "@medusajs/core-flows"
import { HttpTypes, RefundReasonResponse } from "@medusajs/framework/types"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
  refetchEntity,
} from "@medusajs/framework/http"
import { AdminUpdatePaymentRefundReasonType } from "../validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<RefundReasonResponse>
) => {
  const refund_reason = await refetchEntity(
    "refund_reason",
    req.params.id,
    req.scope,
    req.queryConfig.fields
  )

  res.json({ refund_reason })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdatePaymentRefundReasonType>,
  res: MedusaResponse<RefundReasonResponse>
) => {
  const { id } = req.params

  await updateRefundReasonsWorkflow(req.scope).run({
    input: [
      {
        ...req.validatedBody,
        id,
      },
    ],
  })

  const refund_reason = await refetchEntity(
    "refund_reason",
    req.params.id,
    req.scope,
    req.queryConfig.fields
  )

  res.json({ refund_reason })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminRefundReasonDeleteResponse>
) => {
  const { id } = req.params
  const input = { ids: [id] }

  await deleteRefundReasonsWorkflow(req.scope).run({ input })

  res.json({
    id,
    object: "refund_reason",
    deleted: true,
  })
}
