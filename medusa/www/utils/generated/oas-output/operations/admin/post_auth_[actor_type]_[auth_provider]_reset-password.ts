/**
 * @oas [post] /auth/user/{auth_provider}/reset-password
 * operationId: PostActor_typeAuth_providerResetPassword
 * summary: Generate Reset Password Token for Admin User
 * x-sidebar-summary: Generate Reset Password Token
 * description: >
 *   Generate a reset password token for an admin user. This API route doesn't reset the admin's password or send them the reset instructions in a notification.
 * 
 * 
 *   Instead, This API route emits the `auth.password_reset` event, passing it the token as a payload. You can listen to that event in a subscriber as explained in [this guide](https://docs.medusajs.com/resources/commerce-modules/auth/reset-password), then send the user a notification. The notification is sent using a [Notification Module Provider](https://docs.medusajs.com/resources/architectural-modules/notification), and it should have the URL to reset the password in the Medusa Admin dashboard, such as `http://localhost:9000/app/reset-password?token=123`.
 * 
 * 
 *    Use the generated token to update the user's password using the [Reset Password API route](https://docs.medusajs.com/api/admin#auth_postactor_typeauth_providerupdate).
 * externalDocs:
 *   url: https://docs.medusajs.com/v2/resources/commerce-modules/auth/authentication-route#generate-reset-password-token-route
 *   description: Learn more about this API route.
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
 *         description: The user's identifier for the selected auth provider. For example, for the `emailpass` auth provider, the value is the user's email.
 *         example: "admin@medusa-test.com"
 * x-codeSamples:
 *   - lang: Shell
 *     label: cURL
 *     source:  |-
 *       curl -X POST '{backend_url}/auth/user/emailpass/reset-password' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "identifier": "admin@medusa-test.com"
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

