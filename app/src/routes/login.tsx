import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/server/auth'

const searchSchema = z.object({
  redirect: z.string()
    .optional()
    .default("/hello")
    .refine((val) => val.startsWith("/") && !val.startsWith("//"), {
      message: "Invalid redirect path",
    }),
})

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | undefined>();

  const handleLogin = useCallback(async () => {
    setErr(undefined);
    try {
      await login({
        data: {
          email: email,
          password: password
        }
      })

      await navigate({
        to: search.redirect
      })
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Login failed");
      }
    }
  }, [navigate, email, password, search]);

  return <div className='p-2 py-8 flex flex-col gap-2 items-center'>
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin();
    }} className='max-w-2xl w-full flex flex-col gap-2'>
      <h1 className='text-lg font-bold'>Test Login Page</h1>
      <Input type="email" placeholder='email@example.com' value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">
        Login
      </Button>
      {err && <p className='text-sm text-red-600'>{err}</p>}
    </form>
  </div>
}
