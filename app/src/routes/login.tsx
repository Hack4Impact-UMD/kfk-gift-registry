import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { AuthErrorCodes } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLoginMutation } from '@/hooks/mutations/loginMutation'
import { UserRole } from '@/server/auth'

const searchSchema = z.object({
  redirect: z.string()
    .optional()
    .default("/hello")
    .refine((val) => val.startsWith("/") && !val.startsWith("//"), {
      message: "Invalid redirect path",
    }),
})

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Email must be a valid email'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === AuthErrorCodes.MFA_REQUIRED) {
      return 'MFA Required'
    }

    if (
      error.code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS ||
      error.code === AuthErrorCodes.INVALID_PASSWORD ||
      error.code === AuthErrorCodes.INVALID_EMAIL
    ) {
      return 'Invalid email or password'
    }

    return 'Login failed'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Login failed'
}

function issueToMessage(issue: unknown): string {
  if (!issue) return 'Invalid value'
  if (typeof issue === 'string') return issue
  if (typeof issue === 'object' && 'message' in issue && typeof (issue as any).message === 'string') {
    return (issue as any).message
  }
  return 'Invalid value'
}

function RouteComponent() {
  const navigate = useNavigate()
  const router = useRouter()
  Route.useSearch()

  const loginMutation = useLoginMutation()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync({
        email: value.email,
        password: value.password,
      })
      await router.invalidate()

      const auth = router.state.matches[0]?.context?.auth

      if (!auth || !auth.isAuthed || !auth.authUser) {
        return
      }

      if (auth.authUser.role === UserRole.Donor) {
        await navigate({ to: '/hello' })
      } else {
        await navigate({ to: '/staff/home' })
      }
    },
  })

  const isSubmitting = form.state.isSubmitting || loginMutation.isPending

  return <div className='p-6 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-background text-foreground'>
    <form onSubmit={(e) => {
      e.preventDefault()
      e.stopPropagation()
      form.handleSubmit()
    }} className='max-w-md w-full flex flex-col gap-3 rounded-lg border bg-card text-card-foreground p-6'>
      <h1 className='text-lg font-bold text-kfk-blue'>Login</h1>

      <form.Field name='email'>
        {(field) => (
          <div className='flex flex-col gap-1'>
            <Input
              type='email'
              placeholder='Enter your email'
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className='text-sm text-kfk-red'>
                {issueToMessage(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name='password'>
        {(field) => (
          <div className='flex flex-col gap-1'>
            <Input
              type='password'
              placeholder='Enter your password'
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className='text-sm text-kfk-red'>
                {issueToMessage(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <Button type='submit' disabled={isSubmitting} className='bg-kfk-blue text-white hover:bg-kfk-blue/90 disabled:opacity-50'>
        {isSubmitting ? 'Logging in…' : 'Login'}
      </Button>

      {loginMutation.isError && (
        <p className='text-sm text-kfk-red'>
          {getLoginErrorMessage(loginMutation.error)}
        </p>
      )}
    </form>
  </div>
}
