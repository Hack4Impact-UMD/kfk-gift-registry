import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { verifySession } from '@/server/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    try {
      const user = await verifySession();
      return {
        auth: {
          isAuthed: true,
          authUser: user
        }
      }
    } catch {
      console.log("_authenticated session verification failed!");
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      })
    }
  },
  component: () => <RouteComponent />,
})

function RouteComponent() {
  return <Outlet />
}
