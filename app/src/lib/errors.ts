// server fn errors reach the client as a plain `new Error(message)` - TanStack's
// error serializer drops the class and any other properties - so the message
// itself is the marker
export const UNAUTHENTICATED_MESSAGE = "UNAUTHENTICATED";

export class UnauthenticatedError extends Error {
  constructor() {
    super(UNAUTHENTICATED_MESSAGE);
  }
}

export function isUnauthenticatedError(error: unknown): error is Error {
  return error instanceof Error && error.message === UNAUTHENTICATED_MESSAGE;
}
