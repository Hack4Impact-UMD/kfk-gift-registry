import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location, context }) => {
    if (!context.auth.isAuthed) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      })
    }

    return {
      auth: context.auth
    }
  },
  component: () => <RouteComponent />,
})

/**
 * Renders the matched child route content.
 *
 * @returns The element that renders the matched child route's content.
 */
function RouteComponent() {
  return <Outlet />
}