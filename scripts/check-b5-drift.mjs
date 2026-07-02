#!/usr/bin/env node
// B5 drift gate: the payload vocabulary in spec/mcp/schema.json (generated
// from schema.ts, the MCP source of truth) MUST remain semantically identical
// to spec/asyncapi.yaml#/components/schemas (the event source of truth).
//
// "Semantically identical" = same types, enums, required sets, property
// names, numeric bounds, const values, formats. Documentation prose, titles,
// examples, and additionalProperties strictness (MCP tool inputs are strict
// by policy; event payloads are open) are intentionally not compared.
//
// Also checks B1 composition: each tool input = payload ⊕ channel params.

import { readFileSync } from "node:fs";
import * as yaml from "js-yaml";

const bundle = yaml.load(readFileSync("dist/asyncapi.bundle.yaml", "utf8"));
const mcp = JSON.parse(readFileSync("spec/mcp/schema.json", "utf8"));

const asyncSchemas = bundle.components.schemas;
const mcpDefs = mcp.definitions;

const SHARED = [
  "Intent",
  "Escalation",
  "Warning",
  "Consequence",
  "Lesson",
  "FoaasMessage",
  "FafoCategory",
];

// B1: tool input = payload schema ⊕ extra params (actorId, fafoId)
const COMPOSITIONS = {
  FuckAroundInput: { base: "Intent", extra: ["actorId"] },
  EscalateInput: { base: "Escalation", extra: ["actorId", "fafoId"] },
  RecordLessonInput: { base: "Lesson", extra: ["actorId", "fafoId"] },
};

const failures = [];

function refName(ref) {
  return ref.split("/").pop();
}

// Project a schema node down to its comparable semantic core.
function normalize(node, defs) {
  if (node == null || typeof node !== "object") return node;
  if (node.$ref) {
    // Fully dereference: the AsyncAPI bundler inlines internal refs while
    // typescript-json-schema keeps them — a representation difference, not a
    // semantic one. Both sides compare in inlined form. (No recursive schemas
    // in this contract; structured outputs wouldn't allow them either.)
    const target = defs?.[refName(node.$ref)];
    if (target) return normalize(target, defs);
    return { $ref: refName(node.$ref) };
  }
  const out = {};
  if (node.type) out.type = node.type;
  if (node.enum) out.enum = [...node.enum].sort();
  if ("const" in node) out.enum = [node.const]; // const ≡ single-value enum
  if (out.enum?.length === 1 && typeof out.enum[0] === "boolean")
    out.type = "boolean";
  for (const k of ["minimum", "maximum", "maxLength", "format", "default"]) {
    if (k in node) out[k] = node[k];
  }
  if (node.items) out.items = normalize(node.items, defs);
  if (node.properties) {
    out.required = [...(node.required ?? [])].sort();
    out.properties = {};
    for (const [k, v] of Object.entries(node.properties).sort()) {
      out.properties[k] = normalize(v, defs);
    }
  }
  return out;
}

function diff(name, a, b, path = name) {
  const [ja, jb] = [JSON.stringify(a), JSON.stringify(b)];
  if (ja === jb) return;
  if (a && b && typeof a === "object" && typeof b === "object") {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      diff(name, a[k], b[k], `${path}.${k}`);
    }
  } else {
    failures.push(`${path}: asyncapi=${ja} mcp=${jb}`);
  }
}

for (const name of SHARED) {
  const a = asyncSchemas[name];
  const m = mcpDefs[name];
  if (!a) { failures.push(`${name}: missing from asyncapi bundle`); continue; }
  if (!m) { failures.push(`${name}: missing from mcp schema.json`); continue; }
  diff(name, normalize(a, asyncSchemas), normalize(m, mcpDefs));
}

for (const [tool, { base, extra }] of Object.entries(COMPOSITIONS)) {
  const t = mcpDefs[tool];
  const b = mcpDefs[base];
  if (!t || !b) { failures.push(`${tool}: missing definition`); continue; }
  const tNorm = normalize(t, mcpDefs);
  const bNorm = normalize(b, mcpDefs);
  for (const [prop, shape] of Object.entries(bNorm.properties)) {
    diff(tool, shape, tNorm.properties[prop], `${tool}.${prop}`);
  }
  for (const prop of extra) {
    if (!tNorm.properties[prop]) failures.push(`${tool}: missing channel/thread param '${prop}' (B1)`);
    if (!tNorm.required.includes(prop)) failures.push(`${tool}: param '${prop}' must be required (B1)`);
  }
  const missingReq = bNorm.required.filter((r) => !tNorm.required.includes(r));
  if (missingReq.length) failures.push(`${tool}: dropped required fields from ${base}: ${missingReq}`);
}

// The homage invariant, checked forever.
const subtitle = mcpDefs.FoaasMessage?.properties?.subtitle;
if (!subtitle) failures.push("FoaasMessage.subtitle: missing — the homage is broken");

if (failures.length) {
  console.error(`B5 DRIFT DETECTED (${failures.length}):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("\nThe AsyncAPI document and schema.ts have diverged.");
  console.error("Fix the schemas, not this checker. Consequences are non-appealable.");
  process.exit(1);
}
console.log(
  `B5: ${SHARED.length} shared schemas + ${Object.keys(COMPOSITIONS).length} tool compositions verified — zero drift.`,
);
