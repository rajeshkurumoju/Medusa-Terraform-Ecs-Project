import { ModuleJoinerConfig } from "@medusajs/framework/types"
import { LINKS, Modules } from "@medusajs/framework/utils"

export const OrderCart: ModuleJoinerConfig = {
  serviceName: LINKS.OrderCart,
  isLink: true,
  databaseConfig: {
    tableName: "order_cart",
    idPrefix: "ordercart",
  },
  alias: [
    {
      name: ["order_cart", "order_carts"],
      entity: "LinkOrderCart",
    },
  ],
  primaryKeys: ["id", "order_id", "cart_id"],
  relationships: [
    {
      serviceName: Modules.ORDER,
      entity: "Order",
      primaryKey: "id",
      foreignKey: "order_id",
      alias: "order",
      args: {
        methodSuffix: "Orders",
      },
      hasMany: true,
    },
    {
      serviceName: Modules.CART,
      entity: "Cart",
      primaryKey: "id",
      foreignKey: "cart_id",
      alias: "cart",
      args: {
        methodSuffix: "Carts",
      },
    },
  ],
  extends: [
    {
      serviceName: Modules.ORDER,
      entity: "Order",
      fieldAlias: {
        cart: "cart_link.cart",
      },
      relationship: {
        serviceName: LINKS.OrderCart,
        primaryKey: "order_id",
        foreignKey: "id",
        alias: "cart_link",
      },
    },
    {
      serviceName: Modules.CART,
      entity: "Cart",
      fieldAlias: {
        order: "order_link.order",
      },
      relationship: {
        serviceName: LINKS.OrderCart,
        primaryKey: "cart_id",
        foreignKey: "id",
        alias: "order_link",
      },
    },
  ],
}
