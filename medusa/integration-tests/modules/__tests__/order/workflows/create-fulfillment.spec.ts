import {
  cancelOrderFulfillmentWorkflow,
  createOrderFulfillmentWorkflow,
  createShippingOptionsWorkflow,
} from "@medusajs/core-flows"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  FulfillmentWorkflow,
  IOrderModuleService,
  IRegionModuleService,
  IStockLocationService,
  OrderWorkflow,
  ProductDTO,
  RegionDTO,
  ShippingOptionDTO,
  StockLocationDTO,
} from "@medusajs/types"
import {
  BigNumber,
  ContainerRegistrationKeys,
  Modules,
  remoteQueryObjectFromString,
} from "@medusajs/utils"

jest.setTimeout(500000)

const env = { MEDUSA_FF_MEDUSA_V2: true }
const providerId = "manual_test-provider"
const variantSkuWithInventory = "test-variant"
let inventoryItem

async function prepareDataFixtures({ container }) {
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationModule: IStockLocationService = container.resolve(
    Modules.STOCK_LOCATION
  )
  const productModule = container.resolve(Modules.PRODUCT)
  const inventoryModule = container.resolve(Modules.INVENTORY)

  const shippingProfile = await fulfillmentService.createShippingProfiles({
    name: "test",
    type: "default",
  })

  const fulfillmentSet = await fulfillmentService.createFulfillmentSets({
    name: "Test fulfillment set",
    type: "manual_test",
  })

  const serviceZone = await fulfillmentService.createServiceZones({
    name: "Test service zone",
    fulfillment_set_id: fulfillmentSet.id,
    geo_zones: [
      {
        type: "country",
        country_code: "US",
      },
    ],
  })

  const regionService = container.resolve(
    Modules.REGION
  ) as IRegionModuleService

  const [region] = await regionService.createRegions([
    {
      name: "Test region",
      currency_code: "eur",
      countries: ["fr"],
    },
  ])

  const salesChannel = await salesChannelService.createSalesChannels({
    name: "Webshop",
  })

  const location: StockLocationDTO =
    await stockLocationModule.createStockLocations({
      name: "Warehouse",
      address: {
        address_1: "Test",
        city: "Test",
        country_code: "US",
        postal_code: "12345",
        phone: "12345",
      },
    })

  const [product] = await productModule.createProducts([
    {
      title: "Test product",
      variants: [
        {
          title: "Test variant",
          sku: variantSkuWithInventory,
        },
        {
          title: "Test variant no inventory management",
          sku: "test-variant-no-inventory",
          manage_inventory: false,
        },
      ],
    },
  ])

  inventoryItem = await inventoryModule.createInventoryItems({
    sku: "inv-1234",
  })

  await inventoryModule.createInventoryLevels([
    {
      inventory_item_id: inventoryItem.id,
      location_id: location.id,
      stocked_quantity: 2,
      reserved_quantity: 0,
    },
  ])

  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  await remoteLink.create([
    {
      [Modules.STOCK_LOCATION]: {
        stock_location_id: location.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_test-provider",
      },
    },
  ])

  await remoteLink.create([
    {
      [Modules.PRODUCT]: {
        product_id: product.id,
      },
      [Modules.FULFILLMENT]: {
        shipping_profile_id: shippingProfile.id,
      },
    },
  ])

  await remoteLink.create([
    {
      [Modules.STOCK_LOCATION]: {
        stock_location_id: location.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    },
    {
      [Modules.SALES_CHANNEL]: {
        sales_channel_id: salesChannel.id,
      },
      [Modules.STOCK_LOCATION]: {
        stock_location_id: location.id,
      },
    },
    {
      [Modules.PRODUCT]: {
        variant_id: product.variants[0].id,
      },
      [Modules.INVENTORY]: {
        inventory_item_id: inventoryItem.id,
      },
    },
  ])

  const shippingOptionData: FulfillmentWorkflow.CreateShippingOptionsWorkflowInput =
    {
      name: "Shipping option",
      price_type: "flat",
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      provider_id: providerId,
      type: {
        code: "manual-type",
        label: "Manual Type",
        description: "Manual Type Description",
      },
      prices: [
        {
          currency_code: "usd",
          amount: 10,
        },
        {
          region_id: region.id,
          amount: 100,
        },
      ],
    }

  const { result } = await createShippingOptionsWorkflow(container).run({
    input: [shippingOptionData],
  })

  const remoteQueryObject = remoteQueryObjectFromString({
    entryPoint: "shipping_option",
    variables: {
      id: result[0].id,
    },
    fields: [
      "id",
      "name",
      "price_type",
      "service_zone_id",
      "shipping_profile_id",
      "provider_id",
      "data",
      "metadata",
      "type.*",
      "created_at",
      "updated_at",
      "deleted_at",
      "shipping_option_type_id",
      "prices.*",
    ],
  })

  const remoteQuery = container.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

  const [createdShippingOption] = await remoteQuery(remoteQueryObject)
  return {
    shippingOption: createdShippingOption,
    region,
    salesChannel,
    location,
    product,
  }
}

async function createOrderFixture({ container, product, location }) {
  const orderService: IOrderModuleService = container.resolve(Modules.ORDER)
  let order = await orderService.createOrders({
    region_id: "test_region_id",
    email: "foo@bar.com",
    items: [
      {
        title: "Custom Item 2",
        variant_sku: product.variants[0].sku,
        variant_title: product.variants[0].title,
        variant_id: product.variants[0].id,
        quantity: 1,
        unit_price: 50,
        adjustments: [
          {
            code: "VIP_25 ETH",
            amount: "0.000000000000000005",
            description: "VIP discount",
            promotion_id: "prom_123",
            provider_id: "coupon_kings",
          },
        ],
      },
      {
        title: product.title,
        variant_sku: product.variants[1].sku,
        variant_title: product.variants[1].title,
        variant_id: product.variants[1].id,
        quantity: 1,
        unit_price: 200,
      },
    ],
    transactions: [
      {
        amount: 50,
        currency_code: "usd",
      },
    ],
    sales_channel_id: "test",
    shipping_address: {
      first_name: "Test",
      last_name: "Test",
      address_1: "Test",
      city: "Test",
      country_code: "US",
      postal_code: "12345",
      phone: "12345",
    },
    billing_address: {
      first_name: "Test",
      last_name: "Test",
      address_1: "Test",
      city: "Test",
      country_code: "US",
      postal_code: "12345",
    },
    shipping_methods: [
      {
        name: "Test shipping method",
        amount: 10,
        data: {},
        tax_lines: [
          {
            description: "shipping Tax 1",
            tax_rate_id: "tax_usa_shipping",
            code: "code",
            rate: 10,
          },
        ],
        adjustments: [
          {
            code: "VIP_10",
            amount: 1,
            description: "VIP discount",
            promotion_id: "prom_123",
          },
        ],
      },
    ],
    currency_code: "usd",
    customer_id: "joe",
  })

  const inventoryModule = container.resolve(Modules.INVENTORY)

  const itemWithInventory = order.items!.find(
    (o) => o.variant_sku === variantSkuWithInventory
  )!
  const reservation = await inventoryModule.createReservationItems([
    {
      line_item_id: itemWithInventory.id,
      inventory_item_id: inventoryItem.id,
      location_id: location.id,
      quantity: itemWithInventory.quantity,
    },
  ])

  order = await orderService.retrieveOrder(order.id, {
    relations: ["items"],
  })

  return order
}

medusaIntegrationTestRunner({
  env,
  testSuite: ({ getContainer }) => {
    let container

    beforeAll(() => {
      container = getContainer()
    })

    describe("Order fulfillment workflow", () => {
      let shippingOption: ShippingOptionDTO
      let region: RegionDTO
      let location: StockLocationDTO
      let product: ProductDTO

      let orderService: IOrderModuleService

      beforeEach(async () => {
        const fixtures = await prepareDataFixtures({
          container,
        })

        shippingOption = fixtures.shippingOption
        region = fixtures.region
        location = fixtures.location
        product = fixtures.product

        orderService = container.resolve(Modules.ORDER)
      })

      it("should create a order fulfillment and cancel it", async () => {
        const inventoryModule = container.resolve(Modules.INVENTORY)

        const order = await createOrderFixture({ container, product, location })
        const itemWithInventory = order.items!.find(
          (o) => o.variant_sku === variantSkuWithInventory
        )!

        // Create a fulfillment
        const createOrderFulfillmentData: OrderWorkflow.CreateOrderFulfillmentWorkflowInput =
          {
            order_id: order.id,
            created_by: "user_1",
            items: [
              {
                id: itemWithInventory.id,
                quantity: 1,
              },
            ],
            no_notification: false,
            location_id: undefined,
            metadata: { meta_key: "meta_value" },
          }

        await createOrderFulfillmentWorkflow(container).run({
          input: createOrderFulfillmentData,
        })

        const remoteQuery = container.resolve(
          ContainerRegistrationKeys.REMOTE_QUERY
        )
        const remoteQueryObject = remoteQueryObjectFromString({
          entryPoint: "order",
          variables: {
            id: order.id,
          },
          fields: [
            "*",
            "items.*",
            "shipping_methods.*",
            "total",
            "item_total",
            "fulfillments.*",
          ],
        })

        const [orderFulfill] = await remoteQuery(remoteQueryObject)

        let orderFulfillItemWithInventory = orderFulfill.items!.find(
          (o) => o.variant_sku === variantSkuWithInventory
        )!

        expect(orderFulfill.fulfillments).toHaveLength(1)
        expect(orderFulfillItemWithInventory.detail.fulfilled_quantity).toEqual(
          1
        )
        expect(orderFulfill.fulfillments[0].metadata).toEqual({
          meta_key: "meta_value",
        })

        const reservation = await inventoryModule.listReservationItems({
          line_item_id: itemWithInventory.id,
        })
        expect(reservation).toHaveLength(0)

        const stockAvailability = await inventoryModule.retrieveStockedQuantity(
          inventoryItem.id,
          [location.id]
        )
        expect(stockAvailability).toEqual(new BigNumber(1))

        // Cancel the fulfillment
        const cancelFulfillmentData: OrderWorkflow.CancelOrderFulfillmentWorkflowInput =
          {
            order_id: order.id,
            fulfillment_id: orderFulfill.fulfillments[0].id,
            no_notification: false,
          }

        await cancelOrderFulfillmentWorkflow(container).run({
          input: cancelFulfillmentData,
        })

        const remoteQueryObjectFulfill = remoteQueryObjectFromString({
          entryPoint: "order",
          variables: {
            id: order.id,
          },
          fields: [
            "items.*",
            "shipping_methods.*",
            "total",
            "item_total",
            "fulfillments.*",
          ],
        })

        const [orderFulfillAfterCancelled] = await remoteQuery(
          remoteQueryObjectFulfill
        )

        orderFulfillItemWithInventory = orderFulfillAfterCancelled.items!.find(
          (o) => o.variant_sku === variantSkuWithInventory
        )!

        expect(orderFulfillAfterCancelled.fulfillments).toHaveLength(1)
        expect(
          orderFulfillItemWithInventory.detail.fulfilled_quantity.valueOf()
        ).toEqual(0)

        const stockAvailabilityAfterCancelled =
          await inventoryModule.retrieveStockedQuantity(inventoryItem.id, [
            location.id,
          ])

        expect(stockAvailabilityAfterCancelled.valueOf()).toEqual(2)
      })

      it("should revert an order fulfillment when it fails and recreate it when tried again", async () => {
        const order = await createOrderFixture({ container, product, location })

        const itemId = order.items?.find((i) => i.title === "Custom Item 2")!
          .id as string

        // Create a fulfillment
        const createOrderFulfillmentData: OrderWorkflow.CreateOrderFulfillmentWorkflowInput =
          {
            order_id: order.id,
            created_by: "user_1",
            items: [
              {
                id: itemId,
                quantity: 1,
              },
            ],
            no_notification: false,
            location_id: undefined,
          }

        const worflow = createOrderFulfillmentWorkflow(container)
        worflow.addAction("fail", {
          invoke: () => {
            throw new Error("Fulfillment failed")
          },
        })

        await worflow
          .run({
            input: createOrderFulfillmentData,
          })
          .catch(() => void 0)

        worflow.deleteAction("fail")

        await worflow.run({
          input: createOrderFulfillmentData,
        })

        const remoteQuery = container.resolve(
          ContainerRegistrationKeys.REMOTE_QUERY
        )
        const remoteQueryObject = remoteQueryObjectFromString({
          entryPoint: "order",
          variables: {
            id: order.id,
          },
          fields: [
            "*",
            "items.*",
            "shipping_methods.*",
            "total",
            "item_total",
            "fulfillments.*",
          ],
        })

        const [orderFulfill] = await remoteQuery(remoteQueryObject)

        const fulfilledItem = orderFulfill.items?.find((i) => i.id === itemId)

        expect(orderFulfill.fulfillments).toHaveLength(1)
        expect(fulfilledItem?.detail.fulfilled_quantity).toEqual(1)

        const inventoryModule = container.resolve(Modules.INVENTORY)
        const reservation = await inventoryModule.listReservationItems({
          line_item_id: itemId,
        })
        expect(reservation).toHaveLength(0)

        const stockAvailability = await inventoryModule.retrieveStockedQuantity(
          inventoryItem.id,
          [location.id]
        )
        expect(stockAvailability.valueOf()).toEqual(1)
      })
    })
  },
})
