import { verifySession } from '@/server/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    try {
      const user = await verifySession();
      return {
        auth: user
      }
    } catch (err) {
      console.error("_authenticated beforeLoad error:");
      console.error(err);
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      })
    }
  },
  component: () => <RouteComponent />,
  ssr: false,
})

function RouteComponent() {
  return <Outlet />
}
