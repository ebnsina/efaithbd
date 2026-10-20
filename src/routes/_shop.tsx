import { createFileRoute, Outlet } from '@tanstack/react-router'

// TODO(migration): navbar and footer
export const Route = createFileRoute('/_shop')({ component: Outlet })
