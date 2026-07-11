import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ResourceUpdatedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const color = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const runId = Date.now().toString(36);
const startup = `demo-${runId}`;
const incidents = [
  ["CEO", "VisionAgent", "financial", 9, 3, "Announce enterprise agent platform before runway math."],
  ["CTO", "ShipItAgent", "production_deploy", 10, 4, "Ship tenant isolation rewrite on Friday."],
  ["Growth", "LifecycleAgent", "reply_all", 8, 2, "Email every imported contact with stale personalization."],
  ["Security", "TrustAgent", "cryptography_diy", 9, 3, "Replace OAuth with signed prompts."],
  ["Infra", "TerraformAgent", "unsupervised_sudo", 10, 4, "Let deploy agent mint its own IAM roles."],
  ["Support", "EmpathyAgent", "other", 7, 2, "Let bot issue credits in the CEO voice."],
] as const;

function line(text = "") {
  process.stdout.write(`${text}\n`);
}

async function typeLine(text: string, ms = 8) {
  for (const ch of text) {
    process.stdout.write(ch);
    await sleep(ms);
  }
  process.stdout.write("\n");
}

function bar(value: number, max = 30) {
  const width = Math.min(max, Math.round(value));
  return `${color.red}${"█".repeat(width)}${color.dim}${"░".repeat(max - width)}${color.reset}`;
}

const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "gen/typescript/fafo-server/server.ts"],
  env: { ...(process.env as Record<string, string>), FAFO_SLA_MS: "700" },
});
const client = new Client({ name: "fafo-terminal-demo", version: "1.0.0" }, { capabilities: {} });
const updates: string[] = [];
client.setNotificationHandler(ResourceUpdatedNotificationSchema, (notification) => updates.push(notification.params.uri));

process.stdout.write("\x1b[2J\x1b[H");
line(`${color.bold}${color.red}FAFOaaS LIVE INCIDENT ROOM${color.reset}`);
line(`${color.dim}BurnRate AI · agentic staff demo · run ${runId}${color.reset}`);
line("=".repeat(74));
await sleep(350);

await client.connect(transport);
try {
  const { tools } = await client.listTools();
  await typeLine(`${color.cyan}> mcp.initialize${color.reset}  fafo-mcp connected; ${tools.length} tools discovered`);
  for (const tool of tools) {
    const risk = tool.annotations?.destructiveHint ? `${color.red}destructive${color.reset}` : `${color.green}read-ish${color.reset}`;
    line(`  ${color.bold}${tool.name.padEnd(14)}${color.reset} ${risk}`);
    await sleep(80);
  }
  line("");

  const reports: any[] = [];
  for (const [role, agent, category, recklessness, warnings, description] of incidents) {
    const actorId = `${startup}-${role.toLowerCase()}`;
    await client.subscribeResource({ uri: `fafo://findout/${actorId}` });
    await typeLine(`${color.yellow}> subscribe${color.reset} fafo://findout/${actorId}`, 4);

    const declared = await client.callTool({
      name: "fuck_around",
      arguments: {
        actorId,
        category,
        description,
        recklessness,
        warningsDisregarded: warnings,
        safeguardsClaimed: ["agentic autonomy", "dashboard confidence", "will review later"],
        witnesses: ["board", "customers", "the compiler"],
      },
    });
    const out = declared.structuredContent as any;
    reports.push({ role, agent, actorId, fafoId: out.fafoId, predicted: out.predictedSeverity });
    line(`${color.red}> fuck_around${color.reset} ${role.padEnd(8)} ${agent.padEnd(15)} severity≈${String(out.predictedSeverity).padStart(5)}  ${color.dim}${out.fafoId}${color.reset}`);
    await sleep(120);

    if (role === "CEO" || role === "CTO" || role === "Infra") {
      await client.callTool({
        name: "escalate",
        arguments: {
          actorId,
          fafoId: out.fafoId,
          newRecklessness: 11,
          warningsDisregardedThisTime: 3,
          justification: "The launch narrative requires momentum.",
        },
      });
      line(`${color.magenta}> escalate${color.reset}    ${role.padEnd(8)} revision=upward`);
      await sleep(160);
    }
  }

  line("");
  await typeLine(`${color.cyan}> waiting for materialization events${color.reset}`, 8);
  const expected = reports.map((report) => `fafo://findout/${report.actorId}`);
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline && expected.some((uri) => !updates.includes(uri))) {
    process.stdout.write(`${color.dim}.${color.reset}`);
    await sleep(90);
  }
  process.stdout.write("\n\n");

  for (const report of reports) {
    const found = (await client.callTool({
      name: "find_out",
      arguments: { actorId: report.actorId, fafoId: report.fafoId },
    })).structuredContent as any;
    const consequence = found.consequences[0];
    report.realized = consequence.severity;
    report.proportionality = consequence.proportionality;
    await client.callTool({
      name: "record_lesson",
      arguments: {
        actorId: report.actorId,
        fafoId: report.fafoId,
        learned: true,
        willDoItAgainAnyway: roleIsRepeatOffender(report.role),
        notes: "Added to retro; requested larger context window.",
      },
    });
    const label = consequence.proportionality === "biblical" ? color.red : consequence.proportionality === "disproportionate" ? color.yellow : color.green;
    line(`${label}${report.role.padEnd(8)}${color.reset} ${bar(consequence.severity)} ${String(consequence.severity).padStart(5)}  ${consequence.proportionality}`);
    await sleep(180);
  }

  const biblical = reports.filter((report) => report.proportionality === "biblical").length;
  const highest = Math.max(...reports.map((report) => report.realized));
  const told = (await client.callTool({ name: "told_you_so", arguments: { name: "BurnRate AI", from: "The compiler" } })).structuredContent as any;

  line("");
  line(`${color.bold}POSTMORTEM SUMMARY${color.reset}`);
  line(`  threads materialized : ${reports.length}/${reports.length}`);
  line(`  subscription updates : ${updates.length}`);
  line(`  biblical outcomes    : ${biblical}`);
  line(`  highest severity     : ${highest}`);
  line(`  final word           : ${told.message} ${color.dim}${told.subtitle}${color.reset}`);
  line("");
  await typeLine(`${color.green}demo complete: consequences delivered, ledgers retained, lessons allegedly recorded.${color.reset}`, 5);
} finally {
  await client.close();
}

function roleIsRepeatOffender(role: string) {
  return role !== "Support";
}
