import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/family/form/gift-details')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/family/form/gift-details"!</div>
}
