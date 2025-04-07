import { PaginatedResponse } from "../../common"
import { AdminDraftOrder, AdminDraftOrderPreview } from "./entities"

export interface AdminDraftOrderResponse {
  draft_order: AdminDraftOrder
}

export interface AdminDraftOrderListResponse
  extends PaginatedResponse<{
    draft_orders: AdminDraftOrder[]
  }> {}

export interface AdminDraftOrderPreviewResponse {
  draft_order_preview: AdminDraftOrderPreview
}
