# The FAFOaaS Contract — Module Architecture

The contract is a **module system**, not a document. `asyncapi.yaml` is the
root: identity, the Laws, topology (operations), and the public pointer
index. Everything with substance is a single-responsibility module wired in
by `$ref`.

```
spec/
├── asyncapi.yaml                     # ROOT — wiring only (see header comment)
├── mcp/                              # the agent surface, structured like the
│   │                                 # official MCP spec (TypeScript-first)
│   ├── schema.ts                     #   SOURCE OF TRUTH for all MCP shapes
│   ├── schema.json                   #   generated (npm run generate) — never hand-edit
│   └── FAFO-MCP.md                   #   prose spec; defers to schema.ts
├── servers/
│   ├── production.yaml               # the only environment (Law 7)
│   └── edge.yaml                     # wss findout stream
├── channels/                         # one file per channel
│   ├── around.yaml                   #   write side
│   ├── warnings.yaml                 #   advisory (unheeded)
│   ├── findout.yaml                  #   the point of everything
│   ├── toldyouso.yaml                #   FOAAS homage broadcast
│   ├── lessons.yaml                  #   recidivism ledger
│   └── unclaimed.yaml                #   DLQ — consequences are inherited
└── components/
    ├── messages/                     # message = causality trait ⊕ payload schema
    ├── schemas/                      # payload vocabulary (leaf modules)
    ├── message-traits/causality.yaml # headers + correlationId, defined ONCE
    ├── operation-traits/
    ├── correlation-ids/fafo-thread.yaml
    ├── parameters/actor-id.yaml
    └── security-schemes/
```

## Dependency direction (enforced by review, verified by validator)

```
schemas  ←  messages  ←  channels  ←  root (operations, index)
   ↑            ↑
fafo-category   message-traits/causality ← correlation-ids
foaas-message
```

Leaf modules (`schemas/`) reference nothing outside `schemas/`. Messages
reference schemas and traits. Channels reference messages and parameters.
The root references everything and defines nothing. Dependencies point
*down* only — a schema that wants to know about a channel is fucking around
at the architectural level, and the review process is its findout channel.

## Stable pointer contract

The **keys** in the root's `channels` and `components` maps are the public
API (`#/components/schemas/Intent`, `#/channels/findout`, ...). FAFO-MCP
binds to them normatively (rules B1–B7); code generators key off them.

- Renaming or removing a key → **breaking change**, major version bump.
- Moving/renaming a module *file* → invisible, do it freely.
- The bundled artifact (`dist/asyncapi.bundle.yaml`) inlines everything and
  exposes identical pointers — consumers may use either form.

## Extension recipes

| To add… | Touch | Don't touch |
|---|---|---|
| A fucking-around category | `components/schemas/fafo-category.yaml` (one enum value) | Anything else. It propagates to Intent, Consequence, and MCP tool schemas automatically. |
| A warning source | `components/schemas/warning.yaml` (`source.enum`) | The `heeded` const. It is `false`. It stays `false`. |
| System-wide metadata (new header) | `components/message-traits/causality.yaml`, once | Individual messages — they inherit. |
| A new event type | New `schemas/*.yaml` + new `messages/*.yaml` + entry in its channel file + index keys in root | Existing schemas. Compose; don't mutate. |
| A new channel | New `channels/*.yaml` + one wiring entry + operation(s) in root | Other channels. |
| A new environment | Nothing. Re-read Law 7. | `servers/`. |

Every extension lands under an existing `$ref` seam — which is the
definition of extensible: growth without modification, per Open/Closed.
The one deliberately closed module is `schemas/foaas-message.yaml`,
frozen in homage.

## The two sources of truth, and the gate between them

The **event side** is YAML-first: `asyncapi.yaml` + modules define channels,
operations, and the payload vocabulary. The **agent side** mirrors how
Anthropic defines the MCP specification itself — TypeScript-first:
`mcp/schema.ts` is authoritative, `mcp/schema.json` is generated from it for
wider compatibility, and `mcp/FAFO-MCP.md` is prose that defers to the schema.

Rule B5 (payload schemas are shared, not copied) is what welds the two
together, and it is machine-enforced: `scripts/check-b5-drift.mjs`
semantically diffs the generated MCP definitions against the bundled AsyncAPI
schemas — types, enums, required sets, bounds, const values. A one-line enum
edit on either side that isn't mirrored fails the build.

## Validation

```sh
./scripts/validate.sh    # or: npm run validate
```

Five stages: (1) validate the modular AsyncAPI tree, (2) bundle +
re-validate, (3) typecheck `schema.ts`, (4) regenerate `schema.json` and fail
on hand-edits, (5) B5 drift gate. Runs locally; there is no cloud CI.
Optionally symlink it as a pre-push hook:

```sh
ln -s ../../scripts/validate.sh .git/hooks/pre-push
```

A spec change that skips the validator is `category: other`,
`recklessness: 7`, and you know what happens next.
