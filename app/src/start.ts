import { createMiddleware } from "@tanstack/react-start"
import { isRedirect } from "@tanstack/react-router"
import { createStart } from "@tanstack/react-start"

const convertRedirectErrorToExceptionMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const result = await next()
  if ('error' in result && isRedirect(result.error)) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw result.error
  }
  return result
})

export const startInstance = createStart(() => ({
  functionMiddleware: [convertRedirectErrorToExceptionMiddleware],
}))
