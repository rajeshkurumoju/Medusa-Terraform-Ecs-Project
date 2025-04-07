import { FormattingOptionsType } from "types"

const cacheOptions: FormattingOptionsType = {
  "^cache/.*ICacheService": {
    reflectionGroups: {
      Constructors: false,
    },
    reflectionDescription: `In this document, you’ll learn about the different methods in the Cache Module's service and how to use them.`,
    frontmatterData: {
      slug: "/references/cache-service",
      tags: ["cache", "server", "how to"],
      sidebar_label: "Use Cache Module",
    },
    reflectionTitle: {
      fullReplacement: "How to Use Cache Module",
    },
    expandMembers: true,
    startSections: [
      `## Resolve Cache Module's Service

In your workflow's step, you can resolve the Cache Module's service from the Medusa container:

\`\`\`ts
import { Modules } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async ({}, { container }) => {
    const cacheModuleService = container.resolve(
      Modules.CACHE
    )
    
    // TODO use cacheModuleService
  } 
)
\`\`\`

This will resolve the service of the configured Cache Module, which is the [In-Memory Cache Module](https://docs.medusajs.com/resources/architectural-modules/cache/in-memory) by default.

You can then use the Cache Module's service's methods in the step. The rest of this guide details these methods.

---
`,
    ],
  },
}

export default cacheOptions
