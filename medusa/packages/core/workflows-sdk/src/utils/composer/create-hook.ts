import { type ZodSchema } from "zod"
import { OrchestrationUtils } from "@medusajs/utils"
import type { CreateWorkflowComposerContext } from "./type"
import { CompensateFn, createStep, InvokeFn } from "./create-step"
import { createStepHandler } from "./helpers/create-step-handler"
import { StepResponse } from "./helpers"

const NOOP_RESULT = Symbol.for("NOOP")

/**
 * Representation of a hook definition.
 */
export type Hook<Name extends string, Input, Output> = {
  __type: typeof OrchestrationUtils.SymbolWorkflowHook
  name: Name

  /**
   * Returns the result of the hook
   */
  getResult(): Output | undefined

  /**
   * By prefixing a key with a space, we remove it from the
   * intellisense of TypeScript. This is needed because
   * input is not set at runtime. It is a type-only
   * property to infer input data type of a hook
   */
  " output": Output
  " input": Input
}

/**
 * Expose a hook in your workflow where you can inject custom functionality as a step function.
 *
 * A handler hook can later be registered to consume the hook and perform custom functionality.
 *
 * Learn more in [this documentation](https://docs.medusajs.com/learn/fundamentals/workflows/workflow-hooks).
 *
 * @param name - The hook's name. This is used when the hook handler is registered to consume the workflow.
 * @param input - The input to pass to the hook handler.
 * @returns A workflow hook.
 *
 * @example
 * import {
 *   createStep,
 *   createHook,
 *   createWorkflow,
 *   WorkflowResponse,
 * } from "@medusajs/framework/workflows-sdk"
 * import { createProductStep } from "./steps/create-product"
 *
 * export const myWorkflow = createWorkflow(
 *   "my-workflow",
 *   function (input) {
 *     const product = createProductStep(input)
 *     const productCreatedHook = createHook(
 *       "productCreated",
 *       { productId: product.id }
 *     )
 *
 *     return new WorkflowResponse(product, {
 *       hooks: [productCreatedHook],
 *     })
 *   }
 * )
 */
export function createHook<Name extends string, TInvokeInput, TInvokeOutput>(
  name: Name,
  input: TInvokeInput,
  options: {
    resultValidator?: ZodSchema<TInvokeOutput>
  } = {}
): Hook<Name, TInvokeInput, TInvokeOutput> {
  const context = global[
    OrchestrationUtils.SymbolMedusaWorkflowComposerContext
  ] as CreateWorkflowComposerContext

  const getHookResultStep = createStep(
    `get-${name}-result`,
    (_, context) => {
      const result = context[" getStepResult"](name)
      if (result === NOOP_RESULT) {
        return new StepResponse(undefined)
      }
      if (options.resultValidator) {
        return options.resultValidator.parse(result)
      }
      if (result === undefined) {
        return new StepResponse(undefined)
      }
      return result
    },
    () => void 0
  )

  context.hookBinder(name, function (this: CreateWorkflowComposerContext) {
    /**
     * We start by registering a new step within the workflow. This will be a noop
     * step that can be replaced (optionally) by the workflow consumer.
     */
    createStep(
      name,
      (_: TInvokeInput) => new StepResponse(NOOP_RESULT),
      () => void 0
    )(input)

    function hook<
      TInvokeResultCompensateInput
    >(this: CreateWorkflowComposerContext, invokeFn: InvokeFn<TInvokeInput, unknown, TInvokeResultCompensateInput>, compensateFn?: CompensateFn<TInvokeResultCompensateInput>) {
      const handlers = createStepHandler.bind(this)({
        stepName: name,
        input,
        invokeFn,
        compensateFn,
      })

      if (this.hooks_.registered.includes(name)) {
        throw new Error(
          `Cannot define multiple hook handlers for the ${name} hook`
        )
      }

      this.hooks_.registered.push(name)
      this.handlers.set(name, handlers)
    }

    return hook
  })

  return {
    __type: OrchestrationUtils.SymbolWorkflowHook,
    name,
    getResult() {
      if ("cachedResult" in this) {
        return this.cachedResult
      }
      const result = getHookResultStep()
      this["cachedResult"] = result
      return result
    },
  } as Hook<Name, TInvokeInput, TInvokeOutput>
}
