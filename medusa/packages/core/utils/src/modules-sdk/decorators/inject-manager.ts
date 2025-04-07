import { Context } from "@medusajs/types"
import { isPresent } from "../../common"
import { MedusaContextType } from "./context-parameter"

export function InjectManager(managerProperty?: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: any
  ): void {
    if (!target.MedusaContextIndex_) {
      throw new Error(
        `To apply @InjectManager you have to flag a parameter using @MedusaContext`
      )
    }

    managerProperty ??= "baseRepository_"

    const originalMethod = descriptor.value
    const argIndex = target.MedusaContextIndex_[propertyKey]

    descriptor.value = function (...args: any[]) {
      const originalContext = args[argIndex] ?? {}
      const copiedContext = {} as Context
      for (const key in originalContext) {
        if (key === "manager" || key === "transactionManager") {
          continue
        }

        Object.defineProperty(copiedContext, key, {
          get: function () {
            return originalContext[key]
          },
          set: function (value) {
            originalContext[key] = value
          },
        })
      }

      const resourceWithManager = !managerProperty
        ? this
        : this[managerProperty]

      if (
        !isPresent(resourceWithManager) &&
        !isPresent(originalContext.manager)
      ) {
        throw new Error(
          `Could not find a manager in the context. Ensure that ${this.managerProperty} is set on your service that points to a repository.`
        )
      }

      copiedContext.manager =
        originalContext.manager ?? resourceWithManager.getFreshManager()

      if (originalContext?.transactionManager) {
        copiedContext.transactionManager = originalContext?.transactionManager
      }

      copiedContext.__type = MedusaContextType

      args[argIndex] = copiedContext

      return originalMethod.apply(this, args)
    }
  }
}
