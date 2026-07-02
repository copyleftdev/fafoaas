# AGENTS.md — instructions for AI coding agents

This repository is a specification-first system. The specs are the program;
nearly everything else is computed from them. Work with the grain or the
gates will find you out.

## The iron rules

1. **Never hand-edit generated artifacts.** Everything under `gen/` and
   `spec/mcp/schema.json` is generated. To change them, change the sources
   (`spec/**/*.yaml`, `spec/mcp/schema.ts`) or the generator
   (`scripts/codegen.mts`), then run `npm run codegen`. The validation gate
   detects hand-edits and fails.
2. **Two sources of truth, one vocabulary.** Payload schemas live in BOTH
   `spec/components/schemas/*.yaml` (AsyncAPI) and `spec/mcp/schema.ts`
   (MCP). Any schema change must land in both — the B5 drift gate
   (`scripts/check-b5-drift.mjs`) fails the build on divergence, by design.
3. **The jokes are load-bearing.** `heeded: const false`,
   `appealable: const false`, recklessness capped at 11 while severity is
   uncapped, and FoaasMessage subtitles beginning with `"- "` are normative
   schema constraints with tests and mutants attached. Do not "clean them up."
4. **`FoaasMessage` is frozen** (`spec/components/schemas/foaas-message.yaml`)
   in homage to FOAAS. Changes require a séance, not a PR.
5. **No cloud CI.** Verification is local (`scripts/validate.sh`, optionally
   symlinked as a pre-push hook). Do not add GitHub Actions workflows.

## Commands

| Command | Purpose |
|---|---|
| `npm run validate` | 5-stage spec gate (AsyncAPI tree → bundle → tsc → schema.json sync → B5 drift) |
| `npm run codegen` | validate + generate Go/Python/TS clients + fafo-mcp server + run all contract tests and server conformance |
| `npm run test:mutation` | 98 mutants across clients, specs, and server; all must be killed |
| `npx tsx gen/typescript/fafo-server/server.ts` | run the reference MCP server (stdio) |

## Architecture map

- `spec/asyncapi.yaml` — root event contract (wiring only; stable public JSON Pointers)
- `spec/{channels,components,servers}/` — single-responsibility spec modules ($ref composition; dependencies point downward only)
- `spec/mcp/{schema.ts,schema.json,FAFO-MCP.md}` — MCP spec (TypeScript-first; prose defers to schema)
- `scripts/` — validate.sh, check-b5-drift.mjs, codegen.mts, mutation-test.mts
- `gen/{go,python,typescript}/fafo` — generated clients + derived contract tests (vectors.json)
- `gen/typescript/fafo-server/` — generated MCP reference server + conformance test
- `docs/` — the GitHub Pages landing site (self-contained; deployed from branch)

## Extension recipes

See `spec/README.md`. Short version: a new enum value = one YAML edit + the
mirror edit in `schema.ts`; a new event = new schema + message modules, a
channel entry, wiring in the root, and the mirror interfaces in `schema.ts`.
Then `npm run codegen` — vectors, tests, and three clients update themselves.

## Definition of done

`npm run codegen` fully green (includes all contract tests and the 14 server
conformance checks) AND `npm run test:mutation` reports every mutant killed.
If you touched `docs/`, view the page locally (`python3 -m http.server` in
`docs/`) and check desktop + mobile. If you changed the mutant population or
vector counts, update the numbers in README.md and docs/index.html — the
traction section only works because the numbers are real.
