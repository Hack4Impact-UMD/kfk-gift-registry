import { useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { AuthErrorCodes } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLoginMutation } from '@/hooks/mutations/loginMutation'
import { UserRole } from '@/server/auth'
import adminVolunteerLoginBg from '@assets/admin-volunteer-login-bg.png'
import kfkFoundationLogo from '@assets/kfk-foundation-logo.png'

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
    .min(1, 'Password is required'),  
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

type LoginAsRole = 'staff' | 'donor'

function RouteComponent() {
  const navigate = useNavigate()
  const router = useRouter()
  const { redirect } = Route.useSearch()

  const loginMutation = useLoginMutation()
  const [loginAs, setLoginAs] = useState<LoginAsRole>('staff')
  const [rememberMe, setRememberMe] = useState(false)

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

      await navigate({
        to:
          redirect ??
          (auth.authUser.role === UserRole.Donor ? "/donor" : "/staff/home"),
      })
    },
  })

  const isSubmitting = form.state.isSubmitting || loginMutation.isPending
  const isDonor = loginAs === 'donor'
  const accentBg = isDonor ? 'bg-kfk-red' : 'bg-kfk-blue'
  const accentHover = isDonor ? 'hover:bg-kfk-red/90' : 'hover:bg-kfk-blue/90'
  const accentText = isDonor ? 'text-kfk-red' : 'text-kfk-blue'

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30 p-6">
      {/* Two separate rounded sections: image (537×671), login (532×671) on top */}
      <div className="flex items-stretch">
        {/* Image section: 537×671, rounded – donor vs admin/volunteer background */}
        <div
          className={`w-[537px] h-[671px] shrink-0 rounded-2xl bg-cover bg-center ${isDonor ? 'bg-kfk-red/10' : 'bg-kfk-blue/10'}`}
          style={{
            backgroundImage: isDonor
              ? "url('/donor-login-bg.png')"
              : `url(${adminVolunteerLoginBg})`,
          }}
          role="img"
          aria-label="Decorative background"
        />
        {/* Login section: 532×671, rounded, overlapping image */}
        <div className="w-[532px] h-[671px] shrink-0 rounded-2xl overflow-hidden bg-white shadow-xl flex flex-col -ml-8 z-10">
          {/* Top bar – red for donor, blue for admin/volunteer */}
          <div className={`w-full h-[30px] shrink-0 rounded-t-2xl ${accentBg}`} aria-hidden />
          <div className="flex-1 flex flex-col items-center justify-center p-10">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="w-full max-w-[288px] flex flex-col gap-5"
          >
            <div className="flex flex-col gap-0">
              <h1 className="text-[18px] font-semibold text-foreground text-center">
                Welcome Back!
              </h1>
              {/* Logo from assets */}
              <div className="flex justify-center">
                <img
                  src={kfkFoundationLogo}
                  alt="Kisses for Kyle Foundation"
                  className="w-[351px] h-[106px] object-contain"
                />
              </div>
            </div>

            {/* Login as: pill widget with two circular buttons (119px each) inside */}
            <div className="flex flex-col gap-2 items-center">
              <label className="text-[12px] font-medium text-muted-foreground text-center">
                Login as
              </label>
              <div className={`p-[2px] flex w-[238px] h-[31px] rounded-full border overflow-hidden items-center justify-center ${isDonor ? 'border-kfk-red' : 'border-foreground'}`}>
                <button
                  type="button"
                  onClick={() => setLoginAs('staff')}
                  className={
                    'flex-1 min-w-0 h-full rounded-full flex items-center justify-center text-[12px] font-medium transition-colors ' +
                    (loginAs === 'staff'
                      ? `${accentBg} text-white`
                      : 'bg-white text-muted-foreground hover:bg-muted/30 cursor-pointer')
                  }
                >
                  Admin/Volunteer
                </button>
                <button
                  type="button"
                  onClick={() => setLoginAs('donor')}
                  className={
                    'flex-1 min-w-0 h-full rounded-full flex items-center justify-center text-[12px] font-medium transition-colors ' +
                    (loginAs === 'donor'
                      ? `${accentBg} text-white`
                      : 'bg-white text-muted-foreground hover:bg-muted/30 cursor-pointer')
                  }
                >
                  Donor
                </button>
              </div>
            </div>

            <form.Field name="email">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-[287px] h-[39px] rounded-lg border-input"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-kfk-red">
                      {issueToMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-[287px] h-[39px] rounded-lg border-input"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-kfk-red">
                      {issueToMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`rounded-full border-input size-4 ${isDonor ? 'text-kfk-red focus:ring-kfk-red' : 'text-kfk-blue focus:ring-kfk-blue'}`}
                />
                <span className="text-sm text-foreground">Remember me</span>
              </label>
              <a
                href="#"
                className={`text-sm underline hover:opacity-80 ${accentText}`}
              >
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-[288px] h-[42px] rounded-[100px] text-white disabled:opacity-50 flex items-center justify-center ${accentBg} ${accentHover}`}
            >
              {isSubmitting ? 'Logging in…' : 'Login'}
            </Button>

            {loginMutation.isError && (
              <p className="text-sm text-kfk-red text-center">
                {getLoginErrorMessage(loginMutation.error)}
              </p>
            )}
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}
