import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { IOrderModuleService } from "@medusajs/types"
import { Modules } from "@medusajs/utils"
import {
  adminHeaders,
  createAdminUser,
} from "../../../helpers/create-admin-user"

jest.setTimeout(50000)

const env = { MEDUSA_FF_MEDUSA_V2: true }

medusaIntegrationTestRunner({
  env,
  testSuite: ({ dbConnection, getContainer, api }) => {
    let appContainer
    let orderModule: IOrderModuleService

    beforeAll(async () => {
      appContainer = getContainer()
      orderModule = appContainer.resolve(Modules.ORDER)
    })

    beforeEach(async () => {
      await createAdminUser(dbConnection, adminHeaders, appContainer)
    })

    describe("Orders - Admin", () => {
      it("should get an order", async () => {
        const created = await orderModule.createOrders({
          region_id: "test_region_id",
          email: "foo@bar.com",
          metadata: {
            foo: "bar",
          },
          items: [
            {
              title: "Custom Item 2",
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

        const response = await api.get(
          "/admin/orders/" +
            created.id +
            "?fields=+raw_total,+raw_subtotal,+raw_discount_total",
          adminHeaders
        )

        const order = response.data.order
        expect(order).toEqual({
          id: expect.any(String),
          status: "pending",
          version: 1,
          display_id: 1,
          payment_collections: [],
          payment_status: "not_paid",
          region_id: "test_region_id",
          fulfillments: [],
          metadata: {
            foo: "bar",
          },
          fulfillment_status: "not_fulfilled",
          summary: expect.objectContaining({
            // TODO: add all summary fields
          }),
          total: 59.9,
          subtotal: 60,
          tax_total: 0.9,
          discount_total: 1.1,
          discount_tax_total: 0.1,
          original_total: 61,
          original_tax_total: 1,
          item_total: 50,
          item_subtotal: 50,
          item_tax_total: 0,
          original_item_total: 50,
          original_item_subtotal: 50,
          original_item_tax_total: 0,
          shipping_total: 9.9,
          shipping_subtotal: 10,
          shipping_tax_total: 0.9,
          original_shipping_tax_total: 1,
          original_shipping_subtotal: 10,
          original_shipping_total: 11,
          created_at: expect.any(String),
          updated_at: expect.any(String),
          raw_total: {
            value: "59.899999999999999995",
            precision: 20,
          },
          raw_subtotal: {
            value: "60",
            precision: 20,
          },
          raw_discount_total: {
            value: "1.100000000000000005",
            precision: 20,
          },
          items: [
            {
              id: expect.any(String),
              title: "Custom Item 2",
              subtitle: null,
              thumbnail: null,
              variant_id: null,
              product_id: null,
              product_title: null,
              product_description: null,
              product_subtitle: null,
              product_type: null,
              product_type_id: null,
              product_collection: null,
              product_handle: null,
              variant_sku: null,
              variant_barcode: null,
              variant_title: null,
              variant_option_values: null,
              requires_shipping: true,
              is_discountable: true,
              is_giftcard: false,
              is_tax_inclusive: false,
              raw_compare_at_unit_price: null,
              raw_unit_price: {
                value: "50",
                precision: 20,
              },
              is_custom_price: false,
              metadata: null,
              created_at: expect.any(String),
              updated_at: expect.any(String),
              deleted_at: null,
              tax_lines: [],
              adjustments: expect.arrayContaining([
                {
                  id: expect.any(String),
                  description: "VIP discount",
                  promotion_id: expect.any(String),
                  code: "VIP_25 ETH",
                  raw_amount: {
                    value: "5e-18",
                    precision: 20,
                  },
                  provider_id: expect.any(String),
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  deleted_at: null,
                  item_id: expect.any(String),
                  amount: 5e-18,
                  subtotal: 5e-18,
                  total: 5e-18,
                  raw_subtotal: {
                    value: "5e-18",
                    precision: 20,
                  },
                  raw_total: {
                    value: "5e-18",
                    precision: 20,
                  },
                },
              ]),
              compare_at_unit_price: null,
              unit_price: 50,
              quantity: 1,
              raw_quantity: {
                value: "1",
                precision: 20,
              },
              detail: expect.objectContaining({
                id: expect.any(String),
                order_id: expect.any(String),
                version: 1,
                item_id: expect.any(String),
                raw_quantity: {
                  value: "1",
                  precision: 20,
                },
                raw_fulfilled_quantity: {
                  value: "0",
                  precision: 20,
                },
                raw_shipped_quantity: {
                  value: "0",
                  precision: 20,
                },
                raw_return_requested_quantity: {
                  value: "0",
                  precision: 20,
                },
                raw_return_received_quantity: {
                  value: "0",
                  precision: 20,
                },
                raw_return_dismissed_quantity: {
                  value: "0",
                  precision: 20,
                },
                raw_written_off_quantity: {
                  value: "0",
                  precision: 20,
                },
                metadata: null,
                created_at: expect.any(String),
                updated_at: expect.any(String),
                deleted_at: null,
                quantity: 1,
                fulfilled_quantity: 0,
                shipped_quantity: 0,
                return_requested_quantity: 0,
                return_received_quantity: 0,
                return_dismissed_quantity: 0,
                written_off_quantity: 0,
              }),
              subtotal: 50,
              total: 50,
              original_total: 50,
              discount_total: 5e-18,
              discount_tax_total: 0,
              discount_subtotal: 5e-18,
              tax_total: 0,
              original_tax_total: 0,
              refundable_total: 50,
              refundable_total_per_unit: 50,
              fulfilled_total: 0,
              return_dismissed_total: 0,
              return_received_total: 0,
              return_requested_total: 0,
              shipped_total: 0,
              write_off_total: 0,
              raw_subtotal: {
                value: "50",
                precision: 20,
              },
              raw_total: {
                value: "49.999999999999999995",
                precision: 20,
              },
              raw_original_total: {
                value: "50",
                precision: 20,
              },
              raw_discount_total: {
                value: "5e-18",
                precision: 20,
              },
              raw_discount_subtotal: {
                precision: 20,
                value: "5e-18",
              },
              raw_discount_tax_total: {
                value: "0",
                precision: 20,
              },
              raw_tax_total: {
                value: "0",
                precision: 20,
              },
              raw_original_tax_total: {
                value: "0",
                precision: 20,
              },
              raw_refundable_total: {
                precision: 20,
                value: "49.999999999999999995",
              },
              raw_refundable_total_per_unit: {
                precision: 20,
                value: "49.999999999999999995",
              },
              raw_fulfilled_total: {
                precision: 20,
                value: "0",
              },
              raw_return_dismissed_total: {
                precision: 20,
                value: "0",
              },
              raw_return_received_total: {
                precision: 20,
                value: "0",
              },
              raw_return_requested_total: {
                precision: 20,
                value: "0",
              },
              raw_shipped_total: {
                precision: 20,
                value: "0",
              },
              raw_write_off_total: {
                precision: 20,
                value: "0",
              },
            },
          ],
          shipping_address: {
            id: expect.any(String),
            customer_id: null,
            company: null,
            first_name: "Test",
            last_name: "Test",
            address_1: "Test",
            address_2: null,
            city: "Test",
            country_code: "US",
            province: null,
            postal_code: "12345",
            phone: "12345",
            metadata: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
            deleted_at: null,
          },
          billing_address: {
            id: expect.any(String),
            customer_id: null,
            company: null,
            first_name: "Test",
            last_name: "Test",
            address_1: "Test",
            address_2: null,
            city: "Test",
            country_code: "US",
            province: null,
            postal_code: "12345",
            phone: null,
            metadata: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
            deleted_at: null,
          },
          shipping_methods: [
            expect.objectContaining({
              id: expect.any(String),
              order_id: expect.any(String),
              name: "Test shipping method",
              description: null,
              raw_amount: {
                value: "10",
                precision: 20,
              },
              is_tax_inclusive: false,
              shipping_option_id: null,
              data: {},
              metadata: null,
              created_at: expect.any(String),
              updated_at: expect.any(String),
              tax_lines: expect.arrayContaining([
                {
                  id: expect.any(String),
                  description: "shipping Tax 1",
                  tax_rate_id: expect.any(String),
                  code: "code",
                  raw_rate: {
                    value: "10",
                    precision: 20,
                  },
                  provider_id: null,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  deleted_at: null,
                  shipping_method_id: expect.any(String),
                  rate: 10,
                  total: 0.9,
                  subtotal: 1,
                  raw_total: {
                    value: "0.9",
                    precision: 20,
                  },
                  raw_subtotal: {
                    value: "1",
                    precision: 20,
                  },
                },
              ]),
              adjustments: expect.arrayContaining([
                {
                  id: expect.any(String),
                  description: "VIP discount",
                  promotion_id: expect.any(String),
                  code: "VIP_10",
                  raw_amount: {
                    value: "1",
                    precision: 20,
                  },
                  provider_id: null,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  deleted_at: null,
                  shipping_method_id: expect.any(String),
                  amount: 1,
                  subtotal: 1,
                  total: 1.1,
                  raw_subtotal: {
                    value: "1",
                    precision: 20,
                  },
                  raw_total: {
                    value: "1.1",
                    precision: 20,
                  },
                },
              ]),
              amount: 10,
              subtotal: 10,
              total: 9.9,
              original_total: 11,
              discount_total: 1.1,
              discount_tax_total: 0.1,
              tax_total: 0.9,
              original_tax_total: 1,
              raw_subtotal: {
                value: "10",
                precision: 20,
              },
              raw_total: {
                value: "9.9",
                precision: 20,
              },
              raw_original_total: {
                value: "11",
                precision: 20,
              },
              raw_discount_total: {
                value: "1.1",
                precision: 20,
              },
              raw_discount_tax_total: {
                value: "0.1",
                precision: 20,
              },
              raw_tax_total: {
                value: "0.9",
                precision: 20,
              },
              raw_original_tax_total: {
                value: "1",
                precision: 20,
              },
            }),
          ],
          credit_lines: [],
          credit_line_subtotal: 0,
          credit_line_tax_total: 0,
          credit_line_total: 0,
        })
      })
    })
  },
})
