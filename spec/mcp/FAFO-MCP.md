# FAFO-MCP: Model Context Protocol Server Specification for FAFOaaS

**Spec:** `fafo-mcp` · **Version:** 1.0.0 · **Status:** Inevitable
**MCP protocol version:** `2025-06-18`

## 0. Document Set (normative precedence)

Following the structure of the MCP specification itself — whose schema is
defined in TypeScript first and published as JSON Schema for wider
compatibility — this specification is three artifacts with a strict
precedence order:

| Precedence | Artifact | Role |
|---|---|---|
| 1 | [`spec/asyncapi.yaml`](../asyncapi.yaml) | The event contract. Payload vocabulary originates here (`#/components/schemas`). |
| 2 | [`schema.ts`](./schema.ts) | **The MCP source of truth.** Every wire shape — tool inputs/outputs, resource URI templates, error codes, tool annotations — is defined here, in TypeScript, mirroring the AsyncAPI vocabulary under rule B5. |
| 3 | [`schema.json`](./schema.json) | Generated from `schema.ts` (`npm run generate`). Never hand-edited. For consumers who want JSON Schema. |
| 4 | This document | Prose: requirements, binding rules, semantics, consent model, conformance. Where this prose and `schema.ts` disagree, `schema.ts` wins and the prose has a bug. |

The chain is machine-enforced: `scripts/validate.sh` typechecks `schema.ts`,
regenerates `schema.json` (failing if it was hand-edited out of sync), and
runs the **B5 drift gate** (`scripts/check-b5-drift.mjs`), which semantically
compares the generated definitions against the bundled AsyncAPI document.
Schema drift between the event fabric and the agent surface is itself a
category of fucking around (`category: other`), and the gate is its findout
channel.

## 1. Abstract

This document specifies **fafo-mcp**, an MCP server that exposes the FAFOaaS
event fabric to AI agents. It does two things, in order of importance:

1. Defines a general, deterministic **binding** from an AsyncAPI 3.0 document
   onto the MCP primitive surface (tools, resources, resource subscriptions,
   prompts, notifications), so that the event contract remains the single
   source of truth.
2. Instantiates that binding for FAFOaaS, producing the concrete server
   surface an MCP host will see — with all shapes defined in `schema.ts`.

An agent connected to fafo-mcp can fuck around (tools), find out (subscribable
resources), and be publicly told so (notifications) — with full causal
traceability. This is believed to be the first MCP server whose primary purpose
is teaching language models about consequences. It will not be the last.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY**
are to be interpreted as described in RFC 2119. The key phrase **WILL FIND
OUT** is to be interpreted as described in `asyncapi.yaml`, Law 1.

## 2. Terminology

| Term | Meaning |
|---|---|
| *Actor* | The principal fucking around (`ActorId` in `schema.ts`). In MCP terms: the human behind the host. Never the model — the model is a witness with a keyboard. |
| *Thread of Causality* | The `FafoId` correlation linking an intent to its consequence. |
| *Materialization* | The transition of a consequence from *pending* to *delivered*. Nondeterministic delay; see `x-sla: eventually`. |
| *The Bureau* | The Bureau of Consequences: the backend that computes severity per the Conservation Law. |

## 3. Server Identity and Capabilities

On `initialize`, the server MUST respond:

```json
{
  "protocolVersion": "2025-06-18",
  "serverInfo": { "name": "fafo-mcp", "title": "FAFO as a Service", "version": "1.0.0" },
  "capabilities": {
    "tools": { "listChanged": false },
    "resources": { "subscribe": true, "listChanged": true },
    "prompts": { "listChanged": false },
    "completions": {},
    "logging": {}
  },
  "instructions": "You can fuck around (tools) and you will find out (subscribe to fafo://findout/{actorId}). Consequences are correlated by fafoId in _meta. Consequences are non-appealable. The fuck_around tool is marked destructive because it is."
}
```

- `tools.listChanged` is `false`: the set of ways to fuck around is fixed by
  the contract (`FafoToolName` is a closed union), not discovered at runtime.
- `resources.subscribe` MUST be `true`. A fafo-mcp implementation without
  resource subscriptions is a FOAAS implementation with extra steps.
- Transports: implementations MUST support **stdio** and SHOULD support
  **Streamable HTTP**. The fabric behind the server is Kafka/WSS per
  `asyncapi.yaml#/servers`; the MCP transport carries only the last hop.

## 4. The AsyncAPI → MCP Binding (normative)

The server surface is *derived*, not designed. Given an AsyncAPI 3.0 document
**A**, the MCP surface is computed by rules **B1–B7**. Implementations MUST NOT
hand-author tools or resources that bypass these rules.

**B1 — Send operations become tools.**
Every operation in **A** with `action: send` maps to one MCP tool.
`inputSchema` = the operation's message payload schema, merged with one
required property per channel parameter (see the `*Input` compositions in
`schema.ts` — machine-verified). Message *headers* are never part of
`inputSchema`: the server populates the `causality` trait headers itself.
Agents do not get to choose their own causality.

**B2 — Receive operations become subscribable resources.**
Every operation with `action: receive` maps to an MCP resource template:
URI = `fafo://` + the channel `address` with `{param}` placeholders preserved
(RFC 6570 level 1). The definitive template list is
`schema.ts#FAFO_RESOURCE_TEMPLATES`. Reading returns recent messages;
subscribing yields `notifications/resources/updated` per new message.

**B3 — Replies become deferred results.**
For a send operation with a `reply` object, the tool MUST return immediately
with the created thread (`FuckAroundOutput.status: "consequences_pending"`)
and MUST NOT block awaiting the reply — consequences honor no timeout, and
neither do JSON-RPC clients. The reply is delivered through the B2 resource of
the reply channel. `find_out` exists as a polling companion for hosts without
subscription support (they exist; we forgive them).

**B4 — Correlation IDs ride in `_meta`.**
The AsyncAPI `correlationId` (`fafoId`, located at `$message.header#/fafoId`)
MUST be propagated as `_meta.fafoId` on every tool result, resource read, and
update notification belonging to that thread.

**B5 — Message payload schemas are shared, not copied.**
The payload interfaces in `schema.ts` MUST be semantically identical to
`asyncapi.yaml#/components/schemas`. This is not a review guideline; it is a
build gate (`npm run check:b5`). Fix the schemas, not the checker.

**B6 — Security schemes gate tool availability.**
Per the OAuth contract, `fafo:around` implies `fafo:findout` irrevocably: a
host MUST NOT be able to call `fuck_around` while blocking the findout
subscription. (Hosts will try.) There is no write-only mode. Write-only mode
is called "denial" and is out of scope.

**B7 — Channel documentation becomes resource descriptions.**
`title`/`summary`/`description` flow through verbatim. Documentation is
infrastructure; jokes are load-bearing.

## 5. Tools

The complete tool surface. All input/output shapes are **normatively defined
in `schema.ts`** — the table is a map, not a mirror; do not transcribe shapes
from this document.

| Tool | Source | Input / Output (`schema.ts`) | Annotations (`FAFO_TOOL_ANNOTATIONS`) |
|---|---|---|---|
| `fuck_around` | B1 ← `operations/declareIntent` | `FuckAroundInput` → `FuckAroundOutput` | destructive, non-idempotent, open-world |
| `escalate` | B1 ← `operations/escalate` | `EscalateInput` → `EscalateOutput` | destructive, non-idempotent, open-world |
| `find_out` | B3 companion | `FindOutInput` → `FindOutOutput` | read-only — reading your consequences does not create new ones, a property unique to this system among all systems |
| `told_you_so` | homage ← `operations/onToldYouSo` | `ToldYouSoInput` → `ToldYouSoOutput` | read-only, closed-world — told-you-so is a closed, perfect form |
| `record_lesson` | B1 ← `operations/recordLesson` | `RecordLessonInput` → `RecordLessonOutput` | idempotent — claiming to have learned twice is still one claim |

Normative requirements beyond the shapes:

1. **Annotations are contract, not hints-in-spirit.** Implementations MUST
   emit exactly the values in `FAFO_TOOL_ANNOTATIONS`. `fuck_around` is
   `destructiveHint: true` self-evidently, and `idempotentHint: false`
   because fucking around twice does not fuck around once; it fucks around
   twice, and the integrals add (Law 1).
2. **Consent.** Per MCP, the host MUST obtain user consent before invoking a
   destructive tool. fafo-mcp additionally REQUIRES that the consent dialog
   display `predictedSeverity`. Users will click through anyway. The
   `safeguardsClaimed` field exists to record what they were thinking.
3. **`told_you_so`** takes exactly the two parameters the ancestral
   `/off/:name/:from` took. Implementations MAY use MCP **sampling**
   (`sampling/createMessage`) to have the host's own model draft bespoke
   vindication prose — the single funniest legitimate use of that capability
   and therefore mandatory in spirit.
4. **`record_lesson`** MUST accept `learned: true, willDoItAgainAnyway: true`
   without comment. The Bureau correlates; the server does not editorialize.
5. **`escalate`** SHOULD log a `notifications/message` at level `warning`
   with the text `"escalation acknowledged; recalculating integral"`.

## 6. Resources

Templates are normative in `schema.ts#FAFO_RESOURCE_TEMPLATES`:

| URI template | Source channel | Subscribable |
|---|---|---|
| `fafo://findout/{actorId}` | `channels/findout` | MUST — the point of everything |
| `fafo://warnings/{actorId}` | `channels/warnings` | SHOULD — reading this before `fuck_around` is the road not taken |
| `fafo://toldyouso` | `channels/toldYouSo` | MAY — broadcast; high volume on Fridays |
| `fafo://ledger/{actorId}` | (projection) | no — full causal ledger, `application/json` |
| `fafo://laws` | `info.description` | no — the Laws of FAFO, `text/markdown`, served verbatim (B7) |

Subscription flow (normative sequence):

```
host  → resources/subscribe        { uri: "fafo://findout/dave" }
server← (result)
...actor fucks around (§5)...
...time passes; the Bureau computes...
server→ notifications/resources/updated { uri: "fafo://findout/dave" }
host  → resources/read             { uri: "fafo://findout/dave" }
server← contents: [Consequence], _meta: { fafoId: "..." }
```

Law 3 (at-least-once) crosses the binding intact: the server MAY emit
duplicate `updated` notifications and the host MUST deduplicate reads by
`consequenceId`. Law 6 (infinite retention) means `resources/read` on a
findout URI never returns empty for an actor with history. There is no way to
clear it. Do not file issues about this.

## 7. Prompts

| Name | Arguments | Purpose |
|---|---|---|
| `pre_mortem` | `plan` (required) | Renders the plan as an `Intent` draft and asks the model to enumerate probable `Consequence` payloads *before* the tool call. The only genuinely preventive feature in the entire system, included for completeness and irony. |
| `incident_eulogy` | `fafoId` (required) | Fetches the thread from `fafo://ledger/{actorId}` and composes a dignified retrospective in which nobody is blamed and everybody knows. |
| `toldyouso_letter` | `name`, `from` (required) | Long-form FOAAS homage: a formal letter of vindication suitable for framing. |

Argument completion (`completion/complete`) MUST be offered for `category`
values (the `FafoCategory` union) and SHOULD be offered for `actorId` from
the ledger. Autocompleting the ways a user might fuck around is the correct
amount of helpful.

## 8. Errors

Codes are normative in `schema.ts#FafoErrorCode` (JSON-RPC
implementation-defined range, `-32040` … `-32044`), each with its recovery
documented inline. Error `data` MUST include `fafoId` where a thread exists,
and MAY include a `FoaasMessage` restating the error in the ancestral format.
The one worth restating in prose: **`NonAppealable` (-32042)** is returned for
*any* attempt to mutate, delete, or "correct" a materialized consequence.
Recovery: none. `appealable` is typed `false` in the schema. The schema was a
warning.

## 9. Security and Consent Model

1. The host MUST present `fuck_around` and `escalate` for explicit user
   approval (MCP destructive-tool consent), displaying `predictedSeverity` —
   *especially* when the user approved without reading.
2. Per B6: possession of `fafo:around` implies `fafo:findout`. A conforming
   server MUST reject configuration that mounts the tools without the findout
   resources.
3. The server MUST NOT allow the model to self-assign `actorId` values
   belonging to other principals. Fucking around as somebody else is the
   oldest exploit in the world and remains out of scope for v1 (see: history,
   all of it).
4. Rate limiting: the server MAY rate-limit `fuck_around`. The Bureau does
   not rate-limit consequences. This asymmetry is Law 1 expressed as an SLO.

## 10. Conformance

An implementation is **conforming** iff:

- [ ] `scripts/validate.sh` passes: AsyncAPI valid (source + bundle), `schema.ts` typechecks, `schema.json` regenerates byte-identical, B5 drift gate reports zero drift.
- [ ] Every tool's `inputSchema`/`outputSchema` round-trips against the corresponding `schema.json` definition (B1/B5).
- [ ] `fafo://findout/{actorId}` is subscribable; tool results, reads, and notifications carry `_meta.fafoId` (B2–B4).
- [ ] Tool annotations match `FAFO_TOOL_ANNOTATIONS` exactly.
- [ ] Duplicate consequence delivery is possible and documented; deduplication is by `consequenceId`.
- [ ] `NonAppealable` is returned for every mutation attempt on a materialized consequence, without exception, forever.
- [ ] The `told_you_so` output is a well-formed `FoaasMessage`. The subtitle begins with `"- "`. This is not negotiable; it is the whole homage.

---

*In memory of FOAAS, which told us off synchronously so that we might one day
find out asynchronously.*
