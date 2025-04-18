import { IPaymentModuleService } from "@medusajs/framework/types"

import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"

jest.setTimeout(30000)

moduleIntegrationTestRunner<IPaymentModuleService>({
  moduleName: Modules.PAYMENT,
  testSuite: ({ service }) => {
    describe("Payment Module Service", () => {
      describe("providers", () => {
        it("should load payment plugins", async () => {
          let error = await service
            .createPaymentCollections([
              {
                amount: 200,
              } as any,
            ])
            .catch((e) => e)

          expect(error.message).toContain(
            "Value for PaymentCollection.currency_code is required, 'undefined' found"
          )
        })

        it("should create a payment collection successfully", async () => {
          const [createdPaymentCollection] =
            await service.createPaymentCollections([
              { currency_code: "USD", amount: 200 },
            ])

          expect(createdPaymentCollection).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              status: "not_paid",
              payment_providers: [],
              payment_sessions: [],
              payments: [],
              currency_code: "USD",
              amount: 200,
            })
          )
        })
      })
    })
  },
})
