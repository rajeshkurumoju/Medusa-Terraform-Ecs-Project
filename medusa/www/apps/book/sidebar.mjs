/** @type {import("types").Sidebar.Sidebar[]} */
export const sidebars = [
  {
    sidebar_id: "docs",
    title: "Get Started",
    items: [
      {
        type: "category",
        title: "Getting Started",
        children: [
          {
            type: "link",
            path: "/learn",
            title: "Introduction",
          },
          {
            type: "link",
            path: "/learn/installation",
            title: "Installation",
          },
          {
            type: "link",
            title: "Architecture",
            path: "/learn/introduction/architecture",
          },
        ],
      },
      {
        type: "category",
        title: "Customization Tutorial",
        children: [
          {
            type: "link",
            title: "Build Custom Features",
            path: "/learn/customization/custom-features",
            children: [
              {
                type: "link",
                title: "Brand Module",
                path: "/learn/customization/custom-features/module",
              },
              {
                type: "link",
                title: "Brand Workflow",
                path: "/learn/customization/custom-features/workflow",
              },
              {
                type: "link",
                title: "Brand API Route",
                path: "/learn/customization/custom-features/api-route",
              },
            ],
          },
          {
            type: "link",
            title: "Extend Features",
            path: "/learn/customization/extend-features",
            children: [
              {
                type: "link",
                title: "Link Brands and Products",
                path: "/learn/customization/extend-features/define-link",
              },
              {
                type: "link",
                title: "Extend Core Flow",
                path: "/learn/customization/extend-features/extend-create-product",
              },
              {
                type: "link",
                title: "Query Linked Records",
                path: "/learn/customization/extend-features/query-linked-records",
              },
            ],
          },
          {
            type: "link",
            title: "Customize Admin",
            path: "/learn/customization/customize-admin",
            children: [
              {
                type: "link",
                title: "Add Widget",
                path: "/learn/customization/customize-admin/widget",
              },
              {
                type: "link",
                title: "Add UI Route",
                path: "/learn/customization/customize-admin/route",
              },
            ],
          },
          {
            type: "link",
            title: "Integrate Systems",
            path: "/learn/customization/integrate-systems",
            children: [
              {
                type: "link",
                title: "CMS Module",
                path: "/learn/customization/integrate-systems/service",
              },
              {
                type: "link",
                title: "Sync to CMS",
                path: "/learn/customization/integrate-systems/handle-event",
              },
              {
                type: "link",
                title: "Schedule Syncing",
                path: "/learn/customization/integrate-systems/schedule-task",
              },
            ],
          },
          {
            type: "link",
            title: "Re-Use Customizations",
            path: "/learn/customization/reuse-customizations",
          },
          {
            type: "link",
            title: "Next Steps",
            path: "/learn/customization/next-steps",
          },
        ],
      },
      {
        type: "category",
        title: "Framework",
        children: [
          {
            type: "link",
            path: "/learn/fundamentals/medusa-container",
            title: "Medusa Container",
          },
          {
            type: "link",
            path: "/learn/fundamentals/modules",
            title: "Modules",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/modules/modules-directory-structure",
                title: "Directory Structure",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/loaders",
                title: "Loaders",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/isolation",
                title: "Module Isolation",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/container",
                title: "Module Container",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/options",
                title: "Module Options",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/service-factory",
                title: "Service Factory",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/service-constraints",
                title: "Service Constraints",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/db-operations",
                title: "Database Operations",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/multiple-services",
                title: "Multiple Services",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/commerce-modules",
                title: "Commerce Modules",
              },
              {
                type: "link",
                path: "/learn/fundamentals/modules/architectural-modules",
                title: "Architectural Modules",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/fundamentals/module-links",
            title: "Module Links",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/module-links/directions",
                title: "Module Link Direction",
              },
              {
                type: "link",
                path: "/learn/fundamentals/module-links/link",
                title: "Link",
              },
              {
                type: "link",
                path: "/learn/fundamentals/module-links/query",
                title: "Query",
              },
              {
                type: "link",
                path: "/learn/fundamentals/module-links/custom-columns",
                title: "Add Custom Columns",
              },
              {
                type: "link",
                path: "/learn/fundamentals/module-links/read-only",
                title: "Read-Only Links",
              },
              {
                type: "link",
                path: "/learn/fundamentals/module-links/query-context",
                title: "Query Context",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/fundamentals/data-models",
            title: "Data Models",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/data-models/infer-type",
                title: "Infer Type",
              },
              {
                type: "link",
                path: "/learn/fundamentals/data-models/properties",
                title: "Properties",
              },
              {
                type: "link",
                path: "/learn/fundamentals/data-models/relationships",
                title: "Relationships",
              },
              {
                type: "link",
                path: "/learn/fundamentals/data-models/manage-relationships",
                title: "Manage Relationships",
              },
              {
                type: "link",
                path: "/learn/fundamentals/data-models/index",
                title: "Define Index",
              },
              {
                type: "link",
                path: "/learn/fundamentals/data-models/check-constraints",
                title: "Check Constraints",
              },
              {
                type: "link",
                path: "/learn/fundamentals/data-models/write-migration",
                title: "Migrations",
              },
            ],
          },
          {
            type: "link",
            title: "API Routes",
            path: "/learn/fundamentals/api-routes",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/http-methods",
                title: "HTTP Methods",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/parameters",
                title: "Parameters",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/responses",
                title: "Response",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/middlewares",
                title: "Middlewares",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/parse-body",
                title: "Body Parsing",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/validation",
                title: "Validation",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/protected-routes",
                title: "Protected Routes",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/errors",
                title: "Errors",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/cors",
                title: "Handling CORS",
              },
              {
                type: "link",
                path: "/learn/fundamentals/api-routes/additional-data",
                title: "Additional Data",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/fundamentals/workflows",
            title: "Workflows",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/workflows/constructor-constraints",
                title: "Constructor Constraints",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/variable-manipulation",
                title: "Transform Variables",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/conditions",
                title: "When-Then Conditions",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/compensation-function",
                title: "Compensation Function",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/workflow-hooks",
                title: "Workflow Hooks",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/add-workflow-hook",
                title: "Expose a Hook",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/access-workflow-errors",
                title: "Access Workflow Errors",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/retry-failed-steps",
                title: "Retry Failed Steps",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/parallel-steps",
                title: "Run Steps in Parallel",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/workflow-timeout",
                title: "Workflow Timeout",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/store-executions",
                title: "Store Workflow Executions",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/long-running-workflow",
                title: "Long-Running Workflow",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/execute-another-workflow",
                title: "Execute Another Workflow",
              },
              {
                type: "link",
                path: "/learn/fundamentals/workflows/multiple-step-usage",
                title: "Multiple Step Usage",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/fundamentals/events-and-subscribers",
            title: "Events and Subscribers",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/events-and-subscribers/data-payload",
                title: "Events Data Payload",
              },
              {
                type: "link",
                path: "/learn/fundamentals/events-and-subscribers/emit-event",
                title: "Emit Event",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/fundamentals/scheduled-jobs",
            title: "Scheduled Jobs",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/scheduled-jobs/execution-number",
                title: "Execution Number",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/fundamentals/plugins",
            title: "Plugins",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/plugins/create",
                title: "Create Plugin",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/fundamentals/custom-cli-scripts",
            title: "Custom CLI Scripts",
            children: [
              {
                type: "link",
                path: "/learn/fundamentals/custom-cli-scripts/seed-data",
                title: "Seed Data",
              },
            ],
          },
        ],
      },
      {
        type: "category",
        title: "Admin Development",
        children: [
          {
            type: "link",
            path: "/learn/fundamentals/admin",
            title: "Overview",
          },
          {
            type: "link",
            path: "/learn/fundamentals/admin/widgets",
            title: "Admin Widgets",
          },
          {
            type: "link",
            path: "/learn/fundamentals/admin/ui-routes",
            title: "Admin UI Routes",
          },
          {
            type: "link",
            path: "/learn/fundamentals/admin/environment-variables",
            title: "Environment Variables",
          },
          {
            type: "link",
            path: "/learn/fundamentals/admin/routing",
            title: "Routing Customizations",
          },
          {
            type: "link",
            path: "/learn/fundamentals/admin/constraints",
            title: "Constraints",
          },
          {
            type: "link",
            path: "/learn/fundamentals/admin/tips",
            title: "Tips",
          },
        ],
      },
      {
        type: "link",
        path: "/learn/storefront-development",
        title: "Storefront Development",
        chapterTitle: "Storefront",
      },
      {
        type: "category",
        title: "Configurations",
        children: [
          {
            type: "link",
            title: "Environment Variables",
            path: "/learn/fundamentals/environment-variables",
          },
          {
            type: "link",
            title: "Medusa Configuations",
            path: "/learn/configurations/medusa-config",
          },
          {
            type: "link",
            title: "Type Aliases",
            path: "/learn/configurations/ts-aliases",
          },
        ],
      },
      {
        type: "category",
        title: "Debugging & Testing",
        children: [
          {
            type: "link",
            path: "/learn/debugging-and-testing/testing-tools",
            title: "Testing Tools",
          },
          {
            type: "link",
            path: "/learn/debugging-and-testing/testing-tools/integration-tests",
            title: "Integration Tests",
            children: [
              {
                type: "link",
                path: "/learn/debugging-and-testing/testing-tools/integration-tests/api-routes",
                title: "Example: API Routes Tests",
              },
              {
                type: "link",
                path: "/learn/debugging-and-testing/testing-tools/integration-tests/workflows",
                title: "Example: Workflows Tests",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/debugging-and-testing/testing-tools/modules-tests",
            title: "Modules Tests",
            children: [
              {
                type: "link",
                path: "/learn/debugging-and-testing/testing-tools/modules-tests/module-example",
                title: "Example",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/debugging-and-testing/instrumentation",
            title: "Instrumentation",
          },
          {
            type: "link",
            path: "/learn/debugging-and-testing/logging",
            title: "Logging",
          },
        ],
      },
      {
        type: "category",
        title: "Production",
        children: [
          {
            type: "link",
            path: "/learn/build",
            title: "Build",
          },
          {
            type: "link",
            path: "/learn/production/worker-mode",
            title: "Worker Mode",
          },
          {
            type: "link",
            path: "/learn/deployment",
            title: "Deployment Overview",
            children: [
              {
                type: "link",
                path: "/learn/deployment/general",
                title: "General Deployment",
              },
            ],
          },
        ],
      },
      {
        type: "category",
        title: "Upgrade",
        children: [
          {
            type: "link",
            path: "/learn/update",
            title: "Update Medusa",
          },
          {
            type: "external",
            path: "https://github.com/medusajs/medusa/releases",
            title: "Release Notes",
          },
        ],
      },
      {
        type: "category",
        title: "Resources",
        children: [
          {
            type: "sub-category",
            title: "Contribution Guidelines",
            children: [
              {
                type: "link",
                path: "/learn/resources/contribution-guidelines/docs",
                title: "Docs",
              },
              {
                type: "link",
                path: "/learn/resources/contribution-guidelines/admin-translations",
                title: "Admin Translations",
              },
            ],
          },
          {
            type: "link",
            path: "/learn/resources/usage",
            title: "Usage",
          },
        ],
      },
    ],
  },
]
