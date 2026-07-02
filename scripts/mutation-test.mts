/**
 * FAFOaaS mutation testing — do the gates and the generated contract tests
 * actually bite, or are they decorative?
 *
 * Two mutant populations, two oracles:
 *
 *   CLIENT mutants — deliberate defects injected into the GENERATED clients
 *   (wire-key renames derived from the covered keys in vectors.json,
 *   validation-weakening in the Python converters, corrupted contract
 *   constants). Oracle: that language's generated contract tests. A mutant
 *   the tests don't kill means the vectors don't constrain the code.
 *
 *   SPEC mutants — deliberate incoherence injected into the SPECS (enum
 *   divergence, bound divergence, const flip, dropped required field,
 *   unwired channel, schema.ts drift). Oracle: scripts/validate.sh. A mutant
 *   the gate doesn't kill means the pipeline's defenses are decorative.
 *
 * Every mutant MUST be killed (oracle exits nonzero). Survivors fail the run
 * and are listed by name — a survivor is a test gap, and now you know its
 * exact shape. Run after `npm run codegen`:
 *
 *   npm run test:mutation
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

interface Mutant {
  id: string;
  files: Record<string, string>; // path -> mutated content
  restoreAlso?: string[];        // files the oracle itself may rewrite
  oracle: string[];              // argv; killed iff exit != 0
  cwd?: string;
}

const read = (p: string) => readFileSync(p, "utf8");

function mustReplaceAll(src: string, find: string | RegExp, replace: string, ctx: string): string {
  const out = src.replaceAll(find as any, replace);
  if (out === src) throw new Error(`mutation operator went stale: no match for ${String(find)} (${ctx})`);
  return out;
}

/* ------------------------------------------------------------- oracles */

const ORACLES = {
  go: { oracle: ["go", "test", "./..."], cwd: "gen/go/fafo" },
  py: { oracle: ["python3", "-m", "fafo.contract_test"], cwd: "gen/python" },
  ts: { oracle: ["npx", "tsx", "gen/typescript/fafo/contract.test.ts"] },
  server: { oracle: ["npx", "tsx", "gen/typescript/fafo-server/server.test.ts"] },
  spec: { oracle: ["./scripts/validate.sh"] },
} as const;

function run(oracle: string[], cwd?: string): boolean {
  try {
    execFileSync(oracle[0], oracle.slice(1), { cwd, stdio: "pipe" });
    return true; // suite passed
  } catch {
    return false; // suite failed
  }
}

/* ------------------------------------------- derive covered wire keys */

if (!existsSync("gen/go/fafo/vectors.json")) {
  throw new Error("gen/ not found — run `npm run codegen` first");
}
const vectors = JSON.parse(read("gen/go/fafo/vectors.json")).vectors as Array<{
  kind: string;
  payload: Record<string, unknown>;
}>;

const coveredKeys = new Set<string>();
for (const v of vectors) {
  if (v.kind !== "valid") continue;
  for (const [k, val] of Object.entries(v.payload)) {
    coveredKeys.add(k);
    if (val && typeof val === "object" && !Array.isArray(val)) {
      for (const nested of Object.keys(val)) coveredKeys.add(nested);
    }
  }
}

/* ------------------------------------------------------ client mutants */

const mutants: Mutant[] = [];
const goSrc = read("gen/go/fafo/models.go");
const pySrc = read("gen/python/fafo/models.py");
const tsSrc = read("gen/typescript/fafo/models.ts");

for (const key of [...coveredKeys].sort()) {
  // Go: rename the wire key in every struct tag that carries it.
  if (goSrc.includes(`json:"${key}"`) || goSrc.includes(`json:"${key},omitempty"`)) {
    mutants.push({
      id: `go.wirekey.${key}`,
      files: {
        "gen/go/fafo/models.go": goSrc
          .replaceAll(`json:"${key}"`, `json:"${key}__mut"`)
          .replaceAll(`json:"${key},omitempty"`, `json:"${key}__mut,omitempty"`),
      },
      ...ORACLES.go,
    });
  }
  // Python: from_dict stops reading the wire key.
  if (pySrc.includes(`obj.get("${key}")`)) {
    mutants.push({
      id: `py.wirekey.${key}`,
      files: {
        "gen/python/fafo/models.py": mustReplaceAll(
          pySrc, `obj.get("${key}")`, `obj.get("${key}__mut")`, `py wirekey ${key}`,
        ),
      },
      ...ORACLES.py,
    });
  }
  // TypeScript: rename the wire key in the runtime type map.
  if (tsSrc.includes(`json: "${key}"`)) {
    mutants.push({
      id: `ts.wirekey.${key}`,
      files: {
        "gen/typescript/fafo/models.ts": mustReplaceAll(
          tsSrc, `json: "${key}"`, `json: "${key}__mut"`, `ts wirekey ${key}`,
        ),
      },
      ...ORACLES.ts,
    });
  }
  // Python: strip the runtime type validation from a converter call —
  // the client silently trusts the wire. The type vectors must object.
  const weaken = new RegExp(`from_(?:str|int|bool|float)\\(obj\\.get\\("${key}"\\)\\)`, "g");
  if (weaken.test(pySrc)) {
    mutants.push({
      id: `py.novalidate.${key}`,
      files: {
        "gen/python/fafo/models.py": pySrc.replaceAll(weaken, `obj.get("${key}")`),
      },
      ...ORACLES.py,
    });
  }
}

// Contract constants: corrupt the error code and the findout topic per language.
const constantMutations: Array<[string, string, string, string, keyof typeof ORACLES]> = [
  // gofmt aligns the constant block, so match on the stable suffix only.
  ["go.const.errorcode", "gen/go/fafo/contract.go", "FafoErrorCode = -32042", "FafoErrorCode = -32999", "go"],
  ["go.const.topic", "gen/go/fafo/contract.go", '"findout": "fafo.v1.findout"', '"findout": "fafo.v1.wrong"', "go"],
  ["py.const.errorcode", "gen/python/fafo/contract.py", "NON_APPEALABLE = -32042", "NON_APPEALABLE = -32999", "py"],
  ["py.const.topic", "gen/python/fafo/contract.py", '"findout": "fafo.v1.findout"', '"findout": "fafo.v1.wrong"', "py"],
  ["ts.const.errorcode", "gen/typescript/fafo/contract.ts", "NonAppealable = -32042", "NonAppealable = -32999", "ts"],
  ["ts.const.topic", "gen/typescript/fafo/contract.ts", '"findout": "fafo.v1.findout"', '"findout": "fafo.v1.wrong"', "ts"],
];
for (const [id, file, find, replace, oracle] of constantMutations) {
  mutants.push({
    id,
    files: { [file]: mustReplaceAll(read(file), find, replace, id) },
    ...ORACLES[oracle],
  });
}

/* ------------------------------------------------------ server mutants */
// The generated server must be constrained by its conformance test.
const serverMutations: Array<[string, string, string | RegExp, string]> = [
  // A server that claims fuck_around is safe. It is not safe.
  ["server.annotation.destructive", "gen/typescript/fafo-server/surface.ts", /"destructiveHint": true/g, '"destructiveHint": false'],
  // A server that breaks the ancestral subtitle format. The whole homage.
  ["server.homage.subtitle", "gen/typescript/fafo-server/bureau.ts", 'subtitle: "- You found out."', 'subtitle: "You found out."'],
  // A server that attenuates consequences. Law 1 forbids exactly this.
  ["server.law1.attenuation", "gen/typescript/fafo-server/bureau.ts", "recklessnessIntegral * 1.08", "recklessnessIntegral * 0.5"],
];
for (const [id, file, find, replace] of serverMutations) {
  mutants.push({
    id,
    files: { [file]: mustReplaceAll(read(file), find, replace, id) },
    ...ORACLES.server,
  });
}

/* -------------------------------------------------------- spec mutants */

const specMutations: Array<[string, string, string | RegExp, string]> = [
  // Enum divergence: a category the MCP schema has never heard of.
  ["spec.enum.jaywalking", "spec/components/schemas/fafo-category.yaml", "  - reply_all", "  - reply_all\n  - jaywalking"],
  // Bound divergence: this amp goes to twelve on one side only.
  ["spec.bounds.recklessness", "spec/components/schemas/intent.yaml", "maximum: 11", "maximum: 12"],
  // Const flip: a warning that was, historically, heeded.
  ["spec.const.heeded", "spec/components/schemas/warning.yaml", "const: false", "const: true"],
  // Dropped required field: consequences without severity.
  ["spec.required.severity", "spec/components/schemas/consequence.yaml", "\n  - severity", ""],
  // Unwired channel: operations now reference a channel that isn't there.
  ["spec.wiring.findout", "spec/asyncapi.yaml", "  findout:\n    $ref: './channels/findout.yaml'\n", ""],
];
for (const [id, file, find, replace] of specMutations) {
  mutants.push({
    id,
    files: { [file]: mustReplaceAll(read(file), find, replace, id) },
    ...ORACLES.spec,
  });
}
// schema.ts drift: the TypeScript source of truth quietly disagrees.
// validate.sh stage 4 regenerates schema.json in place, so restore it too.
mutants.push({
  id: "spec.drift.schema-ts",
  files: {
    "spec/mcp/schema.ts": mustReplaceAll(read("spec/mcp/schema.ts"), "@maximum 11", "@maximum 12", "schema.ts drift"),
  },
  restoreAlso: ["spec/mcp/schema.json"],
  ...ORACLES.spec,
});

/* --------------------------------------------------------------- runner */

console.log(`mutation: ${mutants.length} mutants derived (${coveredKeys.size} covered wire keys)`);

console.log("mutation: checking green baseline first...");
for (const [name, { oracle, cwd }] of Object.entries(ORACLES)) {
  if (!run([...oracle], (ORACLES as any)[name].cwd)) {
    throw new Error(`baseline is red for oracle '${name}' — fix the suite before mutating it`);
  }
}

const survivors: string[] = [];
let killed = 0;
for (const m of mutants) {
  const touched = [...Object.keys(m.files), ...(m.restoreAlso ?? [])];
  const backups = new Map(touched.map((p) => [p, read(p)]));
  try {
    for (const [p, content] of Object.entries(m.files)) writeFileSync(p, content);
    const passed = run([...m.oracle], m.cwd);
    if (passed) {
      survivors.push(m.id);
      console.log(`  SURVIVED  ${m.id}`);
    } else {
      killed++;
      console.log(`  killed    ${m.id}`);
    }
  } finally {
    for (const [p, content] of backups) writeFileSync(p, content);
  }
}

console.log("mutation: verifying baseline is green again after restore...");
for (const [name, { oracle }] of Object.entries(ORACLES)) {
  if (!run([...oracle], (ORACLES as any)[name].cwd)) {
    throw new Error(`restore failed: oracle '${name}' is red on unmutated code`);
  }
}

const score = ((killed / mutants.length) * 100).toFixed(1);
if (survivors.length) {
  console.error(`\nmutation score ${score}% — ${survivors.length} SURVIVOR(S):`);
  for (const s of survivors) console.error(`  ✗ ${s}`);
  console.error("A survivor is a defect the suite cannot see. That is a warning. Warnings are, historically, unheeded.");
  process.exit(1);
}
console.log(`\nmutation score ${score}% — all ${mutants.length} mutants killed. The tests bite. The gates bite. Nobody fucks around here undetected.`);
