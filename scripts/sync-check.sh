#!/usr/bin/env bash
# sync-check.sh
# Verifies that src/index.tsx and src/index.ts are in sync except for:
#   1. The platform-specific serveStatic import line
#   2. Platform-specific comment lines (Cloudflare / Vercel descriptions)
#
# Run before committing: bash scripts/sync-check.sh

set -euo pipefail

CLOUDFLARE="src/index.tsx"
VERCEL="src/index.ts"

# Strip comment-only lines and normalize the serveStatic import,
# then diff the remaining code.
normalize() {
  grep -v '^\s*//' "$1" \
    | sed 's|from .hono/cloudflare-workers.|from "PLATFORM_STATIC"|g' \
    | sed 's|from .@hono/node-server/serve-static.|from "PLATFORM_STATIC"|g'
}

diff_output=$(diff <(normalize "$CLOUDFLARE") <(normalize "$VERCEL")) || true

if [ -z "$diff_output" ]; then
  echo "✓ $CLOUDFLARE and $VERCEL code is in sync (comments and serveStatic import may differ)."
  exit 0
else
  echo "✗ $CLOUDFLARE and $VERCEL are OUT OF SYNC:"
  echo ""
  echo "$diff_output"
  echo ""
  echo "Apply the same changes to both files, keeping each file's serveStatic import."
  exit 1
fi
