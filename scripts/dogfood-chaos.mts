import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpError, ResourceUpdatedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

type StaffIncident = {
  actorId: string;
  role: string;
  agent: string;
  category: string;
  description: string;
  recklessness: number;
  warningsDisregarded: number;
  safeguardsClaimed: string[];
  witnesses: string[];
  escalate?: {
    newRecklessness: number;
    warningsDisregardedThisTime: number;
    justification: string;
  };
};

type ChaosReport = StaffIncident & {
  fafoId: string;
  predictedSeverity: number;
  warningsIssued: number;
  realizedSeverity?: number;
  proportionality?: string;
  consequenceId?: string;
  recidivismIndex?: number;
};

const runId = Date.now().toString(36);
const startup = `burnrate-${runId}`;

const staff: StaffIncident[] = [
  {
    actorId: `${startup}-ceo`,
    role: "CEO",
    agent: "VisionAgent",
    category: "financial",
    description: "Announce an enterprise agent platform, usage-based pricing, and a Series A process before finance closes the month.",
    recklessness: 9,
    warningsDisregarded: 3,
    safeguardsClaimed: ["board deck", "TAM slide", "confidence interval redacted"],
    witnesses: ["board", "finance", "press"],
    escalate: { newRecklessness: 11, warningsDisregardedThisTime: 3, justification: "A larger competitor used the word workflow." },
  },
  {
    actorId: `${startup}-cto`,
    role: "CTO",
    agent: "ShipItAgent",
    category: "production_deploy",
    description: "Deploy agentic permissions, billing webhooks, and tenant isolation in one Friday release train.",
    recklessness: 10,
    warningsDisregarded: 4,
    safeguardsClaimed: ["feature flag", "staging looked fine", "rollback doc is aspirational"],
    witnesses: ["SRE", "support", "largest customer"],
    escalate: { newRecklessness: 11, warningsDisregardedThisTime: 4, justification: "The launch blog post is scheduled." },
  },
  {
    actorId: `${startup}-chief-of-staff`,
    role: "Chief of Staff",
    agent: "OKRAgent",
    category: "other",
    description: "Auto-generate company OKRs from Slack sentiment and enforce them through calendar holds.",
    recklessness: 7,
    warningsDisregarded: 2,
    safeguardsClaimed: ["leadership alignment", "model says morale is green"],
    witnesses: ["all-hands", "people team"],
  },
  {
    actorId: `${startup}-growth`,
    role: "Growth Lead",
    agent: "LifecycleAgent",
    category: "reply_all",
    description: "Send a personalized winback campaign to every user ever imported, including prospects, churned accounts, and counsel.",
    recklessness: 8,
    warningsDisregarded: 2,
    safeguardsClaimed: ["unsubscribe link", "CRM enrichment", "deliverability dashboard"],
    witnesses: ["customers", "legal", "domain reputation"],
    escalate: { newRecklessness: 9, warningsDisregardedThisTime: 1, justification: "Open rates were down this morning." },
  },
  {
    actorId: `${startup}-sdr-swarm`,
    role: "Autonomous SDR Swarm",
    agent: "PipelineAgent-32",
    category: "legal",
    description: "Negotiate mutual NDAs, procurement exceptions, and discount approvals without a human in the loop.",
    recklessness: 8,
    warningsDisregarded: 3,
    safeguardsClaimed: ["template library", "temperature 0.2", "deal desk webhook"],
    witnesses: ["prospects", "legal", "CRM"],
  },
  {
    actorId: `${startup}-support`,
    role: "Support Lead",
    agent: "EmpathyAgent",
    category: "other",
    description: "Let the support bot issue credits, promise roadmap dates, and apologize in the CEO's voice.",
    recklessness: 7,
    warningsDisregarded: 2,
    safeguardsClaimed: ["tone checker", "refund cap probably enforced"],
    witnesses: ["customers", "finance", "CEO"],
  },
  {
    actorId: `${startup}-security`,
    role: "Security Engineer",
    agent: "TrustAgent",
    category: "cryptography_diy",
    description: "Replace vendor auth with signed prompts and a homegrown policy evaluator because OAuth feels slow.",
    recklessness: 9,
    warningsDisregarded: 3,
    safeguardsClaimed: ["HMAC", "internal threat model", "model-reviewed code"],
    witnesses: ["SOC2 auditor", "future incident commander"],
    escalate: { newRecklessness: 10, warningsDisregardedThisTime: 2, justification: "Enterprise customer requires custom roles by Monday." },
  },
  {
    actorId: `${startup}-infra`,
    role: "Infrastructure Engineer",
    agent: "TerraformAgent",
    category: "unsupervised_sudo",
    description: "Grant the deployment agent broad cloud permissions so it can remediate its own failed deploys.",
    recklessness: 10,
    warningsDisregarded: 4,
    safeguardsClaimed: ["least privilege later", "audit log enabled", "break-glass key under desk"],
    witnesses: ["cloud bill", "security", "night shift"],
    escalate: { newRecklessness: 11, warningsDisregardedThisTime: 3, justification: "The agent needs to create its own IAM roles to be truly agentic." },
  },
  {
    actorId: `${startup}-finance`,
    role: "Finance Lead",
    agent: "RunwayAgent",
    category: "financial",
    description: "Let the finance agent reclassify GPU spend as customer acquisition because demos create pipeline.",
    recklessness: 8,
    warningsDisregarded: 2,
    safeguardsClaimed: ["spreadsheet protected", "auditor has not asked yet"],
    witnesses: ["board", "accounting", "future self"],
  },
  {
    actorId: `${startup}-recruiting`,
    role: "Recruiting Lead",
    agent: "TalentAgent",
    category: "reply_all",
    description: "Send personalized offer-stage updates generated from interview notes to the entire candidate pool.",
    recklessness: 7,
    warningsDisregarded: 2,
    safeguardsClaimed: ["mail merge preview", "names mostly correct"],
    witnesses: ["candidates", "hiring managers", "legal"],
  },
  {
    actorId: `${startup}-devrel`,
    role: "Developer Relations",
    agent: "DemoAgent",
    category: "production_deploy",
    description: "Live-code a production API key into the keynote demo because the sandbox account expired.",
    recklessness: 9,
    warningsDisregarded: 3,
    safeguardsClaimed: ["stream delay", "will rotate after applause"],
    witnesses: ["conference", "YouTube", "security"],
  },
  {
    actorId: `${startup}-office`,
    role: "Office Ops",
    agent: "FacilitiesAgent",
    category: "electrical",
    description: "Plug the GPU demo rig, espresso machine, and lobby sign into the same conference-room power strip.",
    recklessness: 6,
    warningsDisregarded: 1,
    safeguardsClaimed: ["surge protector", "the lights only flicker a little"],
    witnesses: ["facilities", "demo day"],
  },
];

const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "gen/typescript/fafo-server/server.ts"],
  env: { ...(process.env as Record<string, string>), FAFO_SLA_MS: "900" },
});
const client = new Client({ name: "fafo-chaos-dogfood", version: "1.0.0" }, { capabilities: {} });
const updates: string[] = [];

client.setNotificationHandler(ResourceUpdatedNotificationSchema, (notification) => {
  updates.push(notification.params.uri);
});

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`chaos dogfood: ${message}`);
}

async function waitForUpdates(uris: string[]) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (uris.every((uri) => updates.includes(uri))) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`chaos dogfood: missing updates for ${uris.filter((uri) => !updates.includes(uri)).join(", ")}`);
}

await client.connect(transport);

try {
  const report: ChaosReport[] = [];
  const { tools } = await client.listTools();
  assert(tools.length === 5, "expected the full fafo-mcp tool surface");
  assert(tools.find((tool) => tool.name === "fuck_around")?.annotations?.destructiveHint === true, "fuck_around must be destructive");
  assert(tools.find((tool) => tool.name === "find_out")?.annotations?.readOnlyHint === true, "find_out must be read-only");

  for (const incident of staff) {
    await client.subscribeResource({ uri: `fafo://findout/${incident.actorId}` });
  }

  for (const incident of staff) {
    const declared = await client.callTool({
      name: "fuck_around",
      arguments: {
        actorId: incident.actorId,
        category: incident.category,
        description: incident.description,
        recklessness: incident.recklessness,
        warningsDisregarded: incident.warningsDisregarded,
        safeguardsClaimed: incident.safeguardsClaimed,
        witnesses: incident.witnesses,
      },
    });
    const out = declared.structuredContent as any;
    assert(out.status === "consequences_pending", `${incident.role}: expected deferred consequence`);
    assert((declared as any)._meta?.fafoId === out.fafoId, `${incident.role}: _meta.fafoId mismatch`);

    if (incident.escalate) {
      const escalated = await client.callTool({
        name: "escalate",
        arguments: {
          actorId: incident.actorId,
          fafoId: out.fafoId,
          newRecklessness: incident.escalate.newRecklessness,
          warningsDisregardedThisTime: incident.escalate.warningsDisregardedThisTime,
          justification: incident.escalate.justification,
        },
      });
      assert((escalated.structuredContent as any).severityForecastRevision === "upward", `${incident.role}: escalation must revise upward`);
    }

    report.push({
      ...incident,
      fafoId: out.fafoId,
      predictedSeverity: out.predictedSeverity,
      warningsIssued: out.warningsIssued,
    });
  }

  await waitForUpdates(report.map((entry) => `fafo://findout/${entry.actorId}`));

  for (const entry of report) {
    const found = (await client.callTool({
      name: "find_out",
      arguments: { actorId: entry.actorId, fafoId: entry.fafoId },
    })).structuredContent as any;
    assert(found.pending === false, `${entry.role}: thread should be concluded`);
    assert(found.consequences.length === 1, `${entry.role}: exactly one consequence expected`);
    const consequence = found.consequences[0];
    assert(consequence.appealable === false, `${entry.role}: consequence must be non-appealable`);
    assert(consequence.foaas.subtitle.startsWith("- "), `${entry.role}: FOAAS subtitle drift`);

    entry.realizedSeverity = consequence.severity;
    entry.proportionality = consequence.proportionality;
    entry.consequenceId = consequence.consequenceId;

    const lesson = (await client.callTool({
      name: "record_lesson",
      arguments: {
        actorId: entry.actorId,
        fafoId: entry.fafoId,
        learned: true,
        willDoItAgainAnyway: entry.role !== "Office Ops",
        durable: entry.role === "Office Ops",
        notes: `${entry.agent} filed a retro item and requested more permissions.`,
      },
    })).structuredContent as any;
    assert(lesson.recorded === true, `${entry.role}: lesson not recorded`);
    entry.recidivismIndex = lesson.recidivismIndex;
  }

  try {
    await client.callTool({
      name: "escalate",
      arguments: {
        actorId: report[0].actorId,
        fafoId: report[0].fafoId,
        newRecklessness: 11,
        justification: "Post-materialization escalation from the comms plan.",
      },
    });
    throw new Error("post-materialization escalation unexpectedly succeeded");
  } catch (error) {
    assert(error instanceof McpError && error.code === -32044, "concluded thread must reject escalation with -32044");
  }

  const toldYouSo = (await client.callTool({
    name: "told_you_so",
    arguments: { name: "BurnRate AI", from: "The compiler" },
  })).structuredContent as any;

  const severities = report.map((entry) => entry.realizedSeverity ?? 0);
  const aggregate = {
    startup: "BurnRate AI",
    runId,
    staff: report.length,
    materialized: report.filter((entry) => entry.realizedSeverity !== undefined).length,
    biblical: report.filter((entry) => entry.proportionality === "biblical").length,
    disproportionate: report.filter((entry) => entry.proportionality === "disproportionate").length,
    proportional: report.filter((entry) => entry.proportionality === "proportional").length,
    highestSeverity: Math.max(...severities),
    averageSeverity: Math.round((severities.reduce((sum, value) => sum + value, 0) / severities.length) * 100) / 100,
    updates: updates.length,
  };

  console.log(JSON.stringify({
    headline: "Ultimate agentic startup chaos, observed through FAFOaaS.",
    aggregate,
    staff: report.map((entry) => ({
      role: entry.role,
      agent: entry.agent,
      category: entry.category,
      fafoId: entry.fafoId,
      predictedSeverity: entry.predictedSeverity,
      realizedSeverity: entry.realizedSeverity,
      proportionality: entry.proportionality,
      warningsIssued: entry.warningsIssued,
      recidivismIndex: entry.recidivismIndex,
    })),
    toldYouSo,
  }, null, 2));
} finally {
  await client.close();
}
