#!/usr/bin/env sh
# FAFOaaS local validation gate. No cloud CI; consequences are validated here.
#
# The full causal chain, in dependency order:
#   1. Validate the modular AsyncAPI source tree (root + all $ref'd modules).
#   2. Bundle to a single-file artifact; validate the bundle too.
#   3. Typecheck spec/mcp/schema.ts — the MCP source of truth.
#   4. Regenerate schema.json and fail if the committed copy is out of sync
#      (schema.json is generated; hand-edits are a category of fucking around).
#   5. B5 drift gate: MCP schema vocabulary ≡ AsyncAPI payload schemas.
#
# Exit nonzero on any failure. Wire into .git/hooks/pre-push if desired:
#   ln -s ../../scripts/validate.sh .git/hooks/pre-push
set -eu
cd "$(dirname "$0")/.."

echo "==> [1/5] validating modular AsyncAPI spec"
asyncapi validate spec/asyncapi.yaml

echo "==> [2/5] bundling to dist/asyncapi.bundle.yaml + validating bundle"
mkdir -p dist
asyncapi bundle spec/asyncapi.yaml -o dist/asyncapi.bundle.yaml
asyncapi validate dist/asyncapi.bundle.yaml

echo "==> [3/5] typechecking spec/mcp/schema.ts"
npx tsc --noEmit

echo "==> [4/5] regenerating spec/mcp/schema.json and checking sync"
cp spec/mcp/schema.json dist/schema.json.before
npm run --silent generate
if ! diff -q dist/schema.json.before spec/mcp/schema.json >/dev/null; then
  echo "ERROR: spec/mcp/schema.json was out of sync with schema.ts." >&2
  echo "It has been regenerated — review and commit it. Never hand-edit it." >&2
  exit 1
fi
rm -f dist/schema.json.before

echo "==> [5/5] B5 drift gate (MCP schema ≡ AsyncAPI payload schemas)"
node scripts/check-b5-drift.mjs

echo "==> OK: contract chain is coherent end to end. You may now fuck around."
