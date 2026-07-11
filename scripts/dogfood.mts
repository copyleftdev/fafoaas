import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ResourceUpdatedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

const actorId = `codex-${Date.now().toString(36)}`;
const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "gen/typescript/fafo-server/server.ts"],
  env: { ...(process.env as Record<string, string>), FAFO_SLA_MS: "75" },
});

const client = new Client({ name: "fafo-dogfood", version: "1.0.0" }, { capabilities: {} });
const updates: string[] = [];

client.setNotificationHandler(ResourceUpdatedNotificationSchema, (notification) => {
  updates.push(notification.params.uri);
});

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`dogfood: ${message}`);
}

await client.connect(transport);

try {
  const caps = client.getServerCapabilities();
  assert(caps?.resources?.subscribe === true, "server must support resource subscriptions");

  const { tools } = await client.listTools();
  const fuckAround = tools.find((tool) => tool.name === "fuck_around");
  assert(fuckAround?.annotations?.destructiveHint === true, "fuck_around must advertise destructiveHint");
  assert(fuckAround?.annotations?.idempotentHint === false, "fuck_around must not advertise idempotence");

  const findoutUri = `fafo://findout/${actorId}`;
  await client.subscribeResource({ uri: findoutUri });

  const declared = await client.callTool({
    name: "fuck_around",
    arguments: {
      actorId,
      category: "production_deploy",
      description: "Dogfood the generated FAFOaaS MCP server on a Friday. How hard can it be?",
      recklessness: 9,
      safeguardsClaimed: ["contract tests", "mutation tests", "famous last words"],
      warningsDisregarded: 2,
      witnesses: ["codex", "the compiler"],
    },
  });

  const thread = declared.structuredContent as any;
  assert(thread.status === "consequences_pending", "fuck_around must return a deferred consequence");
  assert(typeof thread.fafoId === "string" && thread.fafoId.length > 0, "thread must include fafoId");
  assert((declared as any)._meta?.fafoId === thread.fafoId, "tool result must propagate _meta.fafoId");

  const early = (await client.callTool({ name: "find_out", arguments: { actorId, fafoId: thread.fafoId } })).structuredContent as any;
  assert(early.pending === true, "consequence should be pending before materialization");
  assert(Array.isArray(early.consequences) && early.consequences.length === 0, "early find_out should not invent consequences");

  const deadline = Date.now() + 3000;
  while (!updates.includes(findoutUri) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert(updates.includes(findoutUri), "subscription should receive resources/updated");

  const found = (await client.callTool({ name: "find_out", arguments: { actorId, fafoId: thread.fafoId } })).structuredContent as any;
  assert(found.pending === false, "thread should no longer be pending after materialization");
  assert(found.consequences.length === 1, "exactly one consequence should materialize for this dogfood thread");

  const consequence = found.consequences[0];
  assert(consequence.severity >= 9, "Law 1 must hold: severity must not attenuate recklessness");
  assert(consequence.appealable === false, "materialized consequences must be non-appealable");
  assert(consequence.foaas.subtitle.startsWith("- "), "FOAAS subtitle format must be preserved");

  const lesson = (await client.callTool({
    name: "record_lesson",
    arguments: {
      actorId,
      fafoId: thread.fafoId,
      learned: true,
      willDoItAgainAnyway: true,
      notes: "Dogfood completed through the public MCP surface.",
    },
  })).structuredContent as any;
  assert(lesson.recorded === true, "lesson should be recorded");

  console.log(JSON.stringify({
    actorId,
    fafoId: thread.fafoId,
    predictedSeverity: thread.predictedSeverity,
    consequenceSeverity: consequence.severity,
    proportionality: consequence.proportionality,
    consequenceId: consequence.consequenceId,
    recidivismIndex: lesson.recidivismIndex,
  }, null, 2));
} finally {
  await client.close();
}
