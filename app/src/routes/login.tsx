import { login } from '@/server/auth'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import z from 'zod'

const searchSchema = z.object({
  redirect: z.string().optional().default("/")
})

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const handleLogin = useCallback(async () => {
    await login({
      data: {
        email: "hello@hello.com",
        password: "abcdef"
      }
    })

    await navigate({
      to: search.redirect
    })
  }, [])
  return <div className='p-2'>
    <button className='p-2 bg-blue-400 text-white rounded cursor-pointer' onClick={handleLogin}>
      Login
    </button>
  </div>
}
