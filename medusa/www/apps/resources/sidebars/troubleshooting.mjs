/** @type {import('types').Sidebar.SidebarItem[]} */
export const troubleshootingSidebar = [
  {
    type: "link",
    path: "/troubleshooting",
    title: "Overview",
  },
  {
    type: "separator",
  },
  {
    type: "category",
    title: "Installation",
    initialOpen: true,
    children: [
      {
        type: "link",
        path: "/troubleshooting/create-medusa-app-errors",
        title: "Create Medusa App Errors",
      },
      {
        type: "link",
        path: "/troubleshooting/errors-installing-cli",
        title: "Errors Installing CLI",
      },
      {
        type: "link",
        path: "/troubleshooting/general-errors",
        title: "General Errors",
      },
    ],
  },
  {
    type: "category",
    title: "Upgrade",
    initialOpen: true,
    children: [
      {
        type: "link",
        path: "/troubleshooting/errors-after-upgrading",
        title: "Errors After Upgrading",
      },
    ],
  },
  {
    type: "category",
    title: "Framework",
    initialOpen: true,
    children: [
      {
        type: "link",
        path: "/troubleshooting/eaddrinuse",
        title: "EADDRINUSE Error",
      },
      {
        type: "link",
        path: "/troubleshooting/database-errors",
        title: "Database Errors",
      },
      {
        type: "link",
        path: "/troubleshooting/dist-imports",
        title: "Importing from /dist",
      },
      {
        type: "sub-category",
        title: "Query",
        children: [
          {
            type: "link",
            path: "/troubleshooting/query/filter-linked",
            title: "Not Exising Property",
          },
        ],
      },
      {
        type: "sub-category",
        title: "Workflows",
        children: [
          {
            type: "link",
            path: "/troubleshooting/workflow-errors/when-then",
            title: "Handler Not Found",
          },
          {
            type: "link",
            path: "/troubleshooting/workflow-errors/step-x-defined",
            title: "Step Already Defined",
          },
        ],
      },
      {
        type: "link",
        path: "/troubleshooting/test-errors",
        title: "Test Errors",
      },
    ],
  },
  {
    type: "category",
    title: "Frontend",
    initialOpen: true,
    children: [
      {
        type: "link",
        path: "/troubleshooting/cors-errors",
        title: "CORS Errors",
      },
    ],
  },
  {
    type: "category",
    title: "Integrations",
    initialOpen: true,
    children: [
      {
        type: "link",
        path: "/troubleshooting/s3",
        title: "S3 Module Provider Errors",
      },
    ],
  },
  {
    type: "category",
    title: "Admin Development",
    initialOpen: true,
    children: [
      {
        type: "link",
        path: "/troubleshooting/medusa-admin/no-widget-route",
        title: "Widget or Route not Showing",
      },
      {
        type: "link",
        path: "/troubleshooting/medusa-admin/blocked-request",
        title: "Blocked Request",
      },
    ],
  },
  {
    type: "category",
    title: "Storefront",
    initialOpen: true,
    children: [
      {
        type: "sub-category",
        title: "Next.js Starter",
        children: [
          {
            type: "link",
            path: "/troubleshooting/nextjs-starter-rewrites",
            title: "Cloud Run Error",
          },
        ],
      },
      {
        type: "sub-category",
        title: "Publishable API Key Errors",
        children: [
          {
            type: "link",
            path: "/troubleshooting/storefront-missing-pak",
            title: "Missing Publishable API Key",
          },
          {
            type: "link",
            path: "/troubleshooting/storefront-pak-sc",
            title: "Sales Channels Error",
          },
        ],
      },
    ],
  },
]
