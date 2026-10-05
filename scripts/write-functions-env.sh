#!/bin/sh
set -e

{
  [ -z "$SENTRY_RELEASE" ] || echo "SENTRY_RELEASE=$SENTRY_RELEASE"
  [ -z "$RESEND_API_KEY" ] || echo "RESEND_API_KEY=$RESEND_API_KEY"
} > functions/isolate/.env
