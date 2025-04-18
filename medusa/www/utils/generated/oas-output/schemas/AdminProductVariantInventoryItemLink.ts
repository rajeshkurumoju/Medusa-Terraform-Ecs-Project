/**
 * @schema AdminProductVariantInventoryItemLink
 * type: object
 * description: An association between a product variant and an inventory item.
 * x-schemaName: AdminProductVariantInventoryItemLink
 * required:
 *   - id
 *   - variant_id
 *   - inventory_item_id
 * properties:
 *   id:
 *     type: string
 *     title: id
 *     description: The ID of the association.
 *   variant_id:
 *     type: string
 *     title: variant_id
 *     description: The associated product variant's ID.
 *   variant:
 *     $ref: "#/components/schemas/AdminProductVariant"
 *   inventory_item_id:
 *     type: string
 *     title: inventory_item_id
 *     description: The associated inventory item's ID.
 *   inventory:
 *     $ref: "#/components/schemas/AdminInventoryItem"
 * 
*/

