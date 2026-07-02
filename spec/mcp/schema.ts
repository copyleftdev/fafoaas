/**
 * FAFO-MCP Schema — THE SOURCE OF TRUTH for the fafo-mcp server surface.
 *
 * Structured after the official MCP specification, whose schema is defined
 * in TypeScript first and made available as JSON Schema for wider
 * compatibility. Same rule here: this file is authoritative; schema.json is
 * generated from it (`npm run generate`) and MUST NOT be hand-edited;
 * FAFO-MCP.md is prose and defers to this file for every wire shape.
 *
 * Governance (binding rule B5): the payload interfaces below MUST remain
 * semantically identical to `spec/asyncapi.yaml#/components/schemas`.
 * `scripts/validate.sh` machine-checks this against the bundled AsyncAPI
 * document. Drift is a build failure, not a code-review discussion.
 */

/** The fafo-mcp specification version. */
export const FAFO_MCP_VERSION = "1.0.0";

/** The MCP protocol revision this server speaks. */
export const MCP_PROTOCOL_VERSION = "2025-06-18";

/** The URI scheme for all fafo-mcp resources (binding rule B4). */
export const FAFO_URI_SCHEME = "fafo";

/* ---------------------------------------------------------------------------
 * Primitives
 * ------------------------------------------------------------------------ */

/**
 * The Thread of Causality. Links every event in a single
 * around → warning → escalation → findout → lesson lifecycle.
 * Assigned by the fabric at intent declaration; immutable thereafter.
 * @format uuid
 */
export type FafoId = string;

/**
 * Stable identifier of the actor doing the fucking-around. Consequences are
 * partitioned by this value and never rebalance to another actor.
 */
export type ActorId = string;

/**
 * The recognized domains of fucking around. Extensible; regrettably.
 * Mirror of `asyncapi.yaml#/components/schemas/FafoCategory` — extend it
 * there first; this type follows.
 */
export type FafoCategory =
  | "electrical"
  | "mechanical"
  | "chemical"
  | "legal"
  | "financial"
  | "romantic"
  | "culinary"
  | "feline"
  | "wildlife"
  | "production_deploy"
  | "regex"
  | "cryptography_diy"
  | "diy_plumbing"
  | "unsupervised_sudo"
  | "reply_all"
  | "other";

/* ---------------------------------------------------------------------------
 * Payload vocabulary — mirrors asyncapi.yaml#/components/schemas (B5)
 * ------------------------------------------------------------------------ */

/**
 * A declaration of imminent fucking-around.
 * Mirror of `asyncapi.yaml#/components/schemas/Intent`.
 */
export interface Intent {
  category: FafoCategory;
  /**
   * Self-assessed recklessness. The scale goes to eleven. The Bureau
   * recalibrates self-assessments upward by a factor derived from the phrase
   * "how hard can it be" appearing in `description`.
   * @minimum 0
   * @maximum 11
   * @TJS-type integer
   */
  recklessness: number;
  /**
   * What, precisely, you are about to do. Be honest. The log is forever.
   * @maxLength 512
   */
  description: string;
  /**
   * Safeguards the actor believes are in place. Recorded verbatim for
   * comedic value during the retro. Ignored by the severity engine.
   */
  safeguardsClaimed?: string[];
  /**
   * Warnings already received and ignored before declaring.
   * @minimum 0
   * @default 0
   * @TJS-type integer
   */
  warningsDisregarded?: number;
  /** Actors or channels who will receive ToldYouSo broadcasts. */
  witnesses?: string[];
}

/**
 * A recklessness increase on an open causal thread.
 * Mirror of `asyncapi.yaml#/components/schemas/Escalation`.
 */
export interface Escalation {
  /**
   * Must exceed the thread's current recklessness. It always does.
   * @minimum 0
   * @maximum 11
   * @TJS-type integer
   */
  newRecklessness: number;
  /** Preserved verbatim for the incident report. */
  justification?: string;
  /**
   * @minimum 0
   * @TJS-type integer
   */
  warningsDisregardedThisTime?: number;
}

/**
 * An advisory event. Structurally incapable of preventing anything.
 * Mirror of `asyncapi.yaml#/components/schemas/Warning`.
 */
export interface Warning {
  /** Where the warning came from. All sources are equally ignorable. */
  source:
    | "friend"
    | "mother"
    | "senior_engineer"
    | "documentation"
    | "compiler"
    | "linter"
    | "terms_of_service"
    | "clearly_posted_sign"
    | "past_self"
    | "this_very_spec";
  text: string;
  /**
   * The Bureau's forecast of the eventual finding-out.
   * @minimum 0
   */
  predictedSeverity?: number;
  /**
   * Whether the warning was heeded. A boolean for schema hygiene and a
   * constant for historical accuracy.
   */
  heeded?: false;
}

/**
 * A materialized finding-out. Immutable. Non-appealable.
 * Mirror of `asyncapi.yaml#/components/schemas/Consequence`.
 */
export interface Consequence {
  /**
   * Deduplication key. The universe retries; you must not double-count.
   * @format uuid
   */
  consequenceId: string;
  /**
   * Computed per the Conservation Law from the integral of recklessness over
   * the causal thread. MAY exceed 11; the input scale is capped, the output
   * scale is not. This asymmetry is the entire lesson.
   * @minimum 0
   */
  severity: number;
  /** The fabric's own assessment of its work. */
  proportionality: "proportional" | "disproportionate" | "biblical";
  category: FafoCategory;
  /**
   * Which delivery attempt this is. See Law 3.
   * @minimum 1
   * @TJS-type integer
   */
  deliveryAttempt?: number;
  appealable?: false;
  foaas: FoaasMessage;
}

/**
 * A self-reported learning outcome.
 * Mirror of `asyncapi.yaml#/components/schemas/Lesson`.
 */
export interface Lesson {
  learned: boolean;
  /** Whether the lesson is expected to survive the next opportunity. */
  durable?: boolean;
  /** The honesty field. Feeds the Recidivism Index. */
  willDoItAgainAnyway?: boolean;
  notes?: string;
}

/**
 * The ancestral FOAAS wire format, preserved byte-for-byte in spirit.
 * Every consequence, no matter how severe, can be expressed as a `message`
 * and a `subtitle`. That was FOAAS's great insight. This interface is FROZEN
 * in homage — changes require a séance with the FOAAS maintainers.
 * Mirror of `asyncapi.yaml#/components/schemas/FoaasMessage`.
 */
export interface FoaasMessage {
  message: string;
  /** MUST begin with "- ". This is not negotiable; it is the whole homage. */
  subtitle: string;
}

/* ---------------------------------------------------------------------------
 * Tools (binding rule B1: AsyncAPI send-operations become tools)
 * ------------------------------------------------------------------------ */

/** The complete, closed set of fafo-mcp tool names. */
export type FafoToolName =
  | "fuck_around"
  | "escalate"
  | "find_out"
  | "told_you_so"
  | "record_lesson";

/**
 * Input for `fuck_around` ← `asyncapi.yaml#/operations/declareIntent`.
 * The Intent payload ⊕ the channel parameter (B1). Headers (`fafoId`,
 * `occurredAt`, `sequence`) are server-populated — agents do not get to
 * choose their own causality.
 */
export interface FuckAroundInput extends Intent {
  actorId: ActorId;
}

/**
 * Result of `fuck_around`. Returned immediately (B3): the consequence itself
 * arrives later on `fafo://findout/{actorId}`, correlated by `_meta.fafoId`.
 */
export interface FuckAroundOutput {
  fafoId: FafoId;
  status: "consequences_pending";
  /** The Bureau's forecast. MUST be shown even when the user approved without reading. */
  predictedSeverity?: number;
  /**
   * Warnings issued in response to this declaration.
   * @minimum 0
   * @TJS-type integer
   */
  warningsIssued?: number;
}

/** Input for `escalate` ← `asyncapi.yaml#/operations/escalate`. */
export interface EscalateInput extends Escalation {
  actorId: ActorId;
  /** The open causal thread being escalated. */
  fafoId: FafoId;
}

/** Result of `escalate`. The integral has been recalculated. */
export interface EscalateOutput {
  fafoId: FafoId;
  status: "consequences_pending";
  /** Always "upward". */
  severityForecastRevision: "upward";
}

/**
 * Input for `find_out` — polling companion (B3) for hosts without
 * resource-subscription support. They exist; we forgive them.
 */
export interface FindOutInput {
  actorId: ActorId;
  /** Restrict to a single causal thread. */
  fafoId?: FafoId;
  /**
   * Return only consequences with a header sequence greater than this.
   * @minimum 0
   * @TJS-type integer
   */
  afterSequence?: number;
}

/** Result of `find_out`. Deduplicate by `consequenceId`; the universe retries. */
export interface FindOutOutput {
  consequences: Consequence[];
  /** True if consequences exist that have not yet materialized. Usually true. */
  pending: boolean;
}

/**
 * Input for `told_you_so` — the FOAAS memorial tool. Exactly the two
 * parameters the ancestral `/off/:name/:from` took. A closed, perfect form.
 */
export interface ToldYouSoInput {
  /** Who is being told. */
  name: string;
  /** Who told them so. */
  from: string;
}

/** Result of `told_you_so`: the ancestral wire format, verbatim. */
export type ToldYouSoOutput = FoaasMessage;

/** Input for `record_lesson` ← `asyncapi.yaml#/operations/recordLesson`. */
export interface RecordLessonInput extends Lesson {
  actorId: ActorId;
  /** The concluded causal thread this lesson pertains to. */
  fafoId: FafoId;
}

/** Result of `record_lesson`. The Bureau correlates; the server does not editorialize. */
export interface RecordLessonOutput {
  recorded: true;
  /**
   * The actor's updated Recidivism Index, 0–1. Computed, never self-reported.
   * @minimum 0
   * @maximum 1
   */
  recidivismIndex: number;
}

/* ---------------------------------------------------------------------------
 * Resources (binding rule B2: receive-operations become subscribable resources)
 * ------------------------------------------------------------------------ */

/** URI templates (RFC 6570 level 1) for the fafo-mcp resource surface. */
export const FAFO_RESOURCE_TEMPLATES = {
  /** The point of everything. Subscribable: MUST. */
  findout: "fafo://findout/{actorId}",
  /** The road not taken. Subscribable: SHOULD. */
  warnings: "fafo://warnings/{actorId}",
  /** Broadcast; high volume on Fridays. Subscribable: MAY. */
  toldYouSo: "fafo://toldyouso",
  /** Full causal ledger projection: every thread, intent → consequence → lesson. */
  ledger: "fafo://ledger/{actorId}",
  /** The Laws of FAFO, text/markdown, served verbatim from the AsyncAPI document (B7). */
  laws: "fafo://laws",
} as const;

/* ---------------------------------------------------------------------------
 * Errors — JSON-RPC implementation-defined range
 * ------------------------------------------------------------------------ */

/**
 * fafo-mcp JSON-RPC error codes. Error `data` MUST include `fafoId` where a
 * thread exists, and MAY include a FoaasMessage restating the error in the
 * ancestral format.
 */
export enum FafoErrorCode {
  /** `find_out` called before materialization. Recovery: wait. That is the entire mechanism. */
  ConsequencesPending = -32040,
  /** Attempt to find out on a thread with no declared intent (Law 2). Recovery: fuck around first. */
  CausalityViolation = -32041,
  /** Attempt to mutate, delete, or "correct" a materialized consequence. Recovery: none. The schema was a warning. */
  NonAppealable = -32042,
  /** `fuck_around` with recklessness 0 and no description of actual risk. Raise recklessness or lower expectations. */
  InsufficientRecklessness = -32043,
  /** `escalate` on a thread whose consequence has materialized. Open a new thread. People do. */
  ThreadAlreadyConcluded = -32044,
}

/* ---------------------------------------------------------------------------
 * Tool annotations (normative values, per MCP tool annotation semantics)
 * ------------------------------------------------------------------------ */

/**
 * Required MCP tool annotations per tool. `fuck_around` and `escalate` are
 * destructive (self-evidently) and non-idempotent: fucking around twice does
 * not fuck around once; it fucks around twice, and the integrals add (Law 1).
 */
export const FAFO_TOOL_ANNOTATIONS: Record<
  FafoToolName,
  {
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
    openWorldHint: boolean;
  }
> = {
  fuck_around: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true, // the consequence domain is not closed. It never was.
  },
  escalate: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
  find_out: {
    readOnlyHint: true, // reading your consequences does not create new ones —
    destructiveHint: false, // a property unique to this system among all systems.
    idempotentHint: true,
    openWorldHint: true,
  },
  told_you_so: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false, // told-you-so is a closed, perfect form.
  },
  record_lesson: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true, // claiming to have learned twice is still one claim.
    openWorldHint: false,
  },
};
