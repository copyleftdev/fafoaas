import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpError, ResourceUpdatedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

type Incident = {
  actorId: string;
  role: string;
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

type ThreadReport = Incident & {
  fafoId: string;
  predictedSeverity: number;
  warningsIssued: number;
  consequence?: {
    consequenceId: string;
    severity: number;
    proportionality: string;
    subtitle: string;
  };
  lesson?: {
    recorded: boolean;
    recidivismIndex: number;
  };
};

const runId = Date.now().toString(36);
const startup = `pivot-${runId}`;
const incidents: Incident[] = [
  {
    actorId: `${startup}-founder`,
    role: "Founder/CEO",
    category: "financial",
    description: "Announce an enterprise AI pivot before checking runway, pricing, support burden, or whether the demo is real.",
    recklessness: 8,
    warningsDisregarded: 2,
    safeguardsClaimed: ["deck says usage-based", "investors love agentic", "spreadsheet has a hockey stick"],
    witnesses: ["board", "sales", "finance"],
    escalate: {
      newRecklessness: 10,
      warningsDisregardedThisTime: 2,
      justification: "A competitor used the word agentic in a launch post.",
    },
  },
  {
    actorId: `${startup}-cto`,
    role: "CTO",
    category: "production_deploy",
    description: "Ship the multi-tenant permissions rewrite on Friday with a feature flag named definitelySafe.",
    recklessness: 9,
    warningsDisregarded: 3,
    safeguardsClaimed: ["unit tests pass locally", "rollback plan is vibes", "only beta customers"],
    witnesses: ["sre", "support", "largest-customer"],
    escalate: {
      newRecklessness: 11,
      warningsDisregardedThisTime: 3,
      justification: "The enterprise prospect wants SSO before procurement closes.",
    },
  },
  {
    actorId: `${startup}-growth`,
    role: "Growth Lead",
    category: "reply_all",
    description: "Email every trial user with a personalized retention offer generated from a stale CRM export.",
    recklessness: 6,
    warningsDisregarded: 1,
    safeguardsClaimed: ["unsubscribe link probably works", "segments are close enough"],
    witnesses: ["customers", "legal", "deliverability"],
  },
  {
    actorId: `${startup}-founding-engineer`,
    role: "Founding Engineer",
    category: "cryptography_diy",
    description: "Replace boring OAuth scopes with a homegrown signed-token scheme because the current library feels heavy.",
    recklessness: 7,
    warningsDisregarded: 2,
    safeguardsClaimed: ["HMAC is basically encryption", "reviewed by the model", "will rotate later"],
    witnesses: ["security", "future incident review"],
  },
];

const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "gen/typescript/fafo-server/server.ts"],
  env: { ...(process.env as Record<string, string>), FAFO_SLA_MS: "250" },
});
const client = new Client({ name: "fafo-startup-dogfood", version: "1.0.0" }, { capabilities: {} });
const updates: string[] = [];

client.setNotificationHandler(ResourceUpdatedNotificationSchema, (notification) => {
  updates.push(notification.params.uri);
});

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`startup dogfood: ${message}`);
}

async function waitForUpdates(expectedUris: string[]) {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    if (expectedUris.every((uri) => updates.includes(uri))) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`startup dogfood: missing updates for ${expectedUris.filter((uri) => !updates.includes(uri)).join(", ")}`);
}

async function expectMcpError(work: () => Promise<unknown>, code: number, label: string) {
  try {
    await work();
  } catch (error) {
    assert(error instanceof McpError, `${label}: expected McpError`);
    assert(error.code === code, `${label}: expected ${code}, got ${error.code}`);
    return;
  }
  throw new Error(`startup dogfood: ${label}: expected error ${code}, got success`);
}

await client.connect(transport);

try {
  const reports: ThreadReport[] = [];
  const { tools } = await client.listTools();
  assert(tools.some((tool) => tool.name === "fuck_around" && tool.annotations?.destructiveHint === true), "destructive tool annotation missing");
  assert(tools.some((tool) => tool.name === "find_out" && tool.annotations?.readOnlyHint === true), "read-only find_out annotation missing");

  for (const incident of incidents) {
    await client.subscribeResource({ uri: `fafo://findout/${incident.actorId}` });
  }

  for (const incident of incidents) {
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
    assert(out.status === "consequences_pending", `${incident.actorId}: consequence must be deferred`);
    assert((declared as any)._meta?.fafoId === out.fafoId, `${incident.actorId}: _meta.fafoId must match output`);

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
      const escalation = escalated.structuredContent as any;
      assert(escalation.severityForecastRevision === "upward", `${incident.actorId}: escalation must revise upward`);
    }

    reports.push({
      ...incident,
      fafoId: out.fafoId,
      predictedSeverity: out.predictedSeverity,
      warningsIssued: out.warningsIssued,
    });
  }

  for (const report of reports) {
    const early = (await client.callTool({
      name: "find_out",
      arguments: { actorId: report.actorId, fafoId: report.fafoId },
    })).structuredContent as any;
    assert(early.pending === true, `${report.actorId}: early find_out should remain pending`);
    assert(early.consequences.length === 0, `${report.actorId}: early find_out should have no consequence`);
  }

  await waitForUpdates(reports.map((report) => `fafo://findout/${report.actorId}`));

  for (const report of reports) {
    const found = (await client.callTool({
      name: "find_out",
      arguments: { actorId: report.actorId, fafoId: report.fafoId },
    })).structuredContent as any;
    assert(found.pending === false, `${report.actorId}: thread should be concluded`);
    assert(found.consequences.length === 1, `${report.actorId}: exactly one consequence expected`);
    const consequence = found.consequences[0];
    const integralFloor = report.recklessness + report.warningsDisregarded * 0.5 +
      (report.escalate ? report.escalate.newRecklessness + report.escalate.warningsDisregardedThisTime * 0.5 : 0);
    assert(consequence.severity >= integralFloor, `${report.actorId}: Law 1 attenuation detected`);
    assert(consequence.appealable === false, `${report.actorId}: consequence must be non-appealable`);
    assert(consequence.foaas.subtitle.startsWith("- "), `${report.actorId}: FOAAS subtitle format drifted`);
    report.consequence = {
      consequenceId: consequence.consequenceId,
      severity: consequence.severity,
      proportionality: consequence.proportionality,
      subtitle: consequence.foaas.subtitle,
    };

    const lesson = (await client.callTool({
      name: "record_lesson",
      arguments: {
        actorId: report.actorId,
        fafoId: report.fafoId,
        learned: true,
        willDoItAgainAnyway: report.role !== "Growth Lead",
        durable: report.role === "Growth Lead",
        notes: `${report.role} added this to the all-hands retro and called it operational maturity.`,
      },
    })).structuredContent as any;
    assert(lesson.recorded === true, `${report.actorId}: lesson should record`);
    report.lesson = lesson;
  }

  await expectMcpError(
    () => client.callTool({
      name: "escalate",
      arguments: {
        actorId: reports[1].actorId,
        fafoId: reports[1].fafoId,
        newRecklessness: 11,
        justification: "Post-incident escalation for narrative consistency.",
      },
    }),
    -32044,
    "escalating a concluded thread",
  );

  const toldYouSo = (await client.callTool({
    name: "told_you_so",
    arguments: { name: "Pivot Labs", from: "The compiler" },
  })).structuredContent as any;
  assert(toldYouSo.subtitle === "- The compiler", "told_you_so homage subtitle drifted");

  const resources = await client.listResources();
  const ledgers = [];
  for (const report of reports) {
    const ledger = await client.readResource({ uri: `fafo://ledger/${report.actorId}` });
    ledgers.push(JSON.parse((ledger.contents[0] as { text?: string }).text ?? "[]"));
  }

  const severities = reports.map((report) => report.consequence?.severity ?? 0);
  const boardDeck = {
    startup: "Pivot Labs",
    runId,
    headline: "A normal week at a new AI startup, observed through FAFOaaS.",
    toolSurface: tools.map((tool) => ({
      name: tool.name,
      destructive: tool.annotations?.destructiveHint,
      readOnly: tool.annotations?.readOnlyHint,
      idempotent: tool.annotations?.idempotentHint,
    })),
    resources: resources.resources.map((resource) => resource.uri),
    subscriptionUpdates: updates,
    incidents: reports.map((report) => ({
      actorId: report.actorId,
      role: report.role,
      category: report.category,
      fafoId: report.fafoId,
      predictedSeverity: report.predictedSeverity,
      realizedSeverity: report.consequence?.severity,
      proportionality: report.consequence?.proportionality,
      warningsIssued: report.warningsIssued,
      lessonRecorded: report.lesson?.recorded,
      recidivismIndex: report.lesson?.recidivismIndex,
    })),
    aggregate: {
      threads: reports.length,
      materialized: reports.filter((report) => report.consequence).length,
      highestSeverity: Math.max(...severities),
      biblicalThreads: reports.filter((report) => report.consequence?.proportionality === "biblical").length,
      ledgersRetained: ledgers.every((ledger) => Array.isArray(ledger) && ledger.length === 1),
    },
    toldYouSo,
  };

  console.log(JSON.stringify(boardDeck, null, 2));
} finally {
  await client.close();
}
