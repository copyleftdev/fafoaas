#!/usr/bin/env sh
# FAFOaaS polyglot codegen — THE one command.
#
#   ./scripts/codegen.sh      (or: npm run codegen)
#
#   1. Run the full 5-stage validation gate (specs must be coherent before
#      anything is generated from them).
#   2. Generate Go + Python + TypeScript packages under gen/ from the two
#      sources of truth (schema.ts imported directly; models via schema.json).
#   3. Prove the output: go vet + go test, python compile + smoke round-trip
#      of the canonical prodFriday example, tsc typecheck.
#
# Generated code that doesn't compile is a consequence delivered at build
# time, which is the earliest anyone has ever found out.
set -eu
cd "$(dirname "$0")/.."

echo "==> [gen 1/3] validating specs"
./scripts/validate.sh

echo "==> [gen 2/3] generating go, python, typescript"
npx tsx scripts/codegen.mts
gofmt -w gen/go/fafo

echo "==> [gen 3/3] running generated contract tests + server conformance"
( cd gen/go/fafo && go vet ./... && go test ./... )
( cd gen/python && python3 -m fafo.contract_test )
npx tsc --noEmit
npx tsx gen/typescript/fafo/contract.test.ts
npx tsx gen/typescript/fafo-server/server.test.ts
find gen -name __pycache__ -type d -exec rm -rf {} +

echo "==> OK: three languages, one contract, zero drift. Fuck around in the language of your choice."
