/**
 * @oas [post] /auth/customer/{auth_provider}/reset-password
 * operationId: PostActor_typeAuth_providerResetPassword
 * summary: Generate Reset Password Token for Customer
 * x-sidebar-summary: Generate Reset Password Token
 * description: >
 *   Generate a reset password token for a customer. This API route doesn't reset the customer password or send them the reset instructions in a notification.
 * 
 * 
 *   Instead, This API route emits the `auth.password_reset` event, passing it the token as a payload. You can listen to that event in a subscriber as explained in [this guide](https://docs.medusajs.com/resources/commerce-modules/auth/reset-password), then send the customer a notification. The notification is sent using a [Notification Module Provider](https://docs.medusajs.com/resources/architectural-modules/notification), and it should have a URL that accepts a `token` query parameter, allowing the customer to reset their password from the storefront.
 * 
 * 
 *    Use the generated token to update the customer's password using the [Reset Password API route](https://docs.medusajs.com/api/store#auth_postactor_typeauth_providerupdate).
 * externalDocs:
 *   url: https://docs.medusajs.com/v2/resources/storefront-development/customers/reset-password#1-request-reset-password-page
 *   description: "Storefront development: How to create the request reset password page."
 * x-authenticated: false
 * parameters:
 *   - name: auth_provider
 *     in: path
 *     description: The provider used for authentication.
 *     required: true
 *     schema:
 *       type: string
 *       example: "emailpass"
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         title: identifier
 *         description: The customer's identifier for the selected auth provider. For example, for the `emailpass` auth provider, the value is the customer's email.
 *         example: "customer@gmail.com"
 * x-codeSamples:
 *   - lang: Shell
 *     label: cURL
 *     source:  |-
 *       curl -X POST '{backend_url}/auth/customer/emailpass/reset-password' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "identifier": "customer@gmail.com"
 *       }'
 * tags:
 *   - Auth
 * responses:
 *   "201":
 *     description: OK
 *   "400":
 *     $ref: "#/components/responses/400_error"
 *   "401":
 *     $ref: "#/components/responses/unauthorized"
 *   "404":
 *     $ref: "#/components/responses/not_found_error"
 *   "409":
 *     $ref: "#/components/responses/invalid_state_error"
 *   "422":
 *     $ref: "#/components/responses/invalid_request_error"
 *   "500":
 *     $ref: "#/components/responses/500_error"
 * x-workflow: generateResetPasswordTokenWorkflow
 * 
*/

