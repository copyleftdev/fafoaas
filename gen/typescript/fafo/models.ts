// To parse this data:
//
//   import { Convert, FafoSchema } from "./file";
//
//   const fafoSchema = Convert.toFafoSchema(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface FafoSchema {
    ActorId?:            string;
    Consequence?:        Consequence;
    EscalateInput?:      EscalateInput;
    EscalateOutput?:     EscalateOutput;
    Escalation?:         Escalation;
    FafoCategory?:       FafoCategory;
    FafoErrorCode?:      number;
    FafoId?:             string;
    FafoToolName?:       FafoToolName;
    FindOutInput?:       FindOutInput;
    FindOutOutput?:      FindOutOutput;
    FoaasMessage?:       FoaasMessage;
    FuckAroundInput?:    FuckAroundInput;
    FuckAroundOutput?:   FuckAroundOutput;
    Intent?:             Intent;
    Lesson?:             Lesson;
    RecordLessonInput?:  RecordLessonInput;
    RecordLessonOutput?: RecordLessonOutput;
    ToldYouSoInput?:     ToldYouSoInput;
    ToldYouSoOutput?:    FoaasMessage;
    Warning?:            Warning;
}

/**
 * A materialized finding-out. Immutable. Non-appealable.
 * Mirror of `asyncapi.yaml#/components/schemas/Consequence`.
 */
export interface Consequence {
    appealable?: boolean;
    category:    FafoCategory;
    /**
     * Deduplication key. The universe retries; you must not double-count.
     */
    consequenceId: string;
    /**
     * Which delivery attempt this is. See Law 3.
     */
    deliveryAttempt?: number;
    foaas:            FoaasMessage;
    /**
     * The fabric's own assessment of its work.
     */
    proportionality: Proportionality;
    /**
     * Computed per the Conservation Law from the integral of recklessness over
     * the causal thread. MAY exceed 11; the input scale is capped, the output
     * scale is not. This asymmetry is the entire lesson.
     */
    severity: number;
}

/**
 * The recognized domains of fucking around. Extensible; regrettably.
 * Mirror of `asyncapi.yaml#/components/schemas/FafoCategory` — extend it
 * there first; this type follows.
 */
export type FafoCategory = "chemical" | "cryptography_diy" | "culinary" | "diy_plumbing" | "electrical" | "feline" | "financial" | "legal" | "mechanical" | "other" | "production_deploy" | "regex" | "reply_all" | "romantic" | "unsupervised_sudo" | "wildlife";

/**
 * The ancestral FOAAS wire format, preserved byte-for-byte in spirit.
 * Every consequence, no matter how severe, can be expressed as a `message`
 * and a `subtitle`. That was FOAAS's great insight. This interface is FROZEN
 * in homage — changes require a séance with the FOAAS maintainers.
 * Mirror of `asyncapi.yaml#/components/schemas/FoaasMessage`.
 */
export interface FoaasMessage {
    message: string;
    /**
     * MUST begin with "- ". This is not negotiable; it is the whole homage.
     */
    subtitle: string;
}

/**
 * The fabric's own assessment of its work.
 */
export type Proportionality = "biblical" | "disproportionate" | "proportional";

/**
 * Input for `escalate` ← `asyncapi.yaml#/operations/escalate`.
 */
export interface EscalateInput {
    /**
     * Stable identifier of the actor doing the fucking-around. Consequences are
     * partitioned by this value and never rebalance to another actor.
     */
    actorId: string;
    /**
     * The open causal thread being escalated.
     */
    fafoId: string;
    /**
     * Preserved verbatim for the incident report.
     */
    justification?: string;
    /**
     * Must exceed the thread's current recklessness. It always does.
     */
    newRecklessness:              number;
    warningsDisregardedThisTime?: number;
}

/**
 * Result of `escalate`. The integral has been recalculated.
 */
export interface EscalateOutput {
    /**
     * The Thread of Causality. Links every event in a single
     * around → warning → escalation → findout → lesson lifecycle.
     * Assigned by the fabric at intent declaration; immutable thereafter.
     */
    fafoId: string;
    /**
     * Always "upward".
     */
    severityForecastRevision: "upward";
    status:                   "consequences_pending";
}

/**
 * Always "upward".
 */

/**
 * A recklessness increase on an open causal thread.
 * Mirror of `asyncapi.yaml#/components/schemas/Escalation`.
 */
export interface Escalation {
    /**
     * Preserved verbatim for the incident report.
     */
    justification?: string;
    /**
     * Must exceed the thread's current recklessness. It always does.
     */
    newRecklessness:              number;
    warningsDisregardedThisTime?: number;
}

/**
 * The complete, closed set of fafo-mcp tool names.
 */
export type FafoToolName = "escalate" | "find_out" | "fuck_around" | "record_lesson" | "told_you_so";

/**
 * Input for `find_out` — polling companion (B3) for hosts without
 * resource-subscription support. They exist; we forgive them.
 */
export interface FindOutInput {
    /**
     * Stable identifier of the actor doing the fucking-around. Consequences are
     * partitioned by this value and never rebalance to another actor.
     */
    actorId: string;
    /**
     * Return only consequences with a header sequence greater than this.
     */
    afterSequence?: number;
    /**
     * Restrict to a single causal thread.
     */
    fafoId?: string;
}

/**
 * Result of `find_out`. Deduplicate by `consequenceId`; the universe retries.
 */
export interface FindOutOutput {
    consequences: Consequence[];
    /**
     * True if consequences exist that have not yet materialized. Usually true.
     */
    pending: boolean;
}

/**
 * Input for `fuck_around` ← `asyncapi.yaml#/operations/declareIntent`.
 * The Intent payload ⊕ the channel parameter (B1). Headers (`fafoId`,
 * `occurredAt`, `sequence`) are server-populated — agents do not get to
 * choose their own causality.
 */
export interface FuckAroundInput {
    /**
     * Stable identifier of the actor doing the fucking-around. Consequences are
     * partitioned by this value and never rebalance to another actor.
     */
    actorId:  string;
    category: FafoCategory;
    /**
     * What, precisely, you are about to do. Be honest. The log is forever.
     */
    description: string;
    /**
     * Self-assessed recklessness. The scale goes to eleven. The Bureau
     * recalibrates self-assessments upward by a factor derived from the phrase
     * "how hard can it be" appearing in `description`.
     */
    recklessness: number;
    /**
     * Safeguards the actor believes are in place. Recorded verbatim for
     * comedic value during the retro. Ignored by the severity engine.
     */
    safeguardsClaimed?: string[];
    /**
     * Warnings already received and ignored before declaring.
     */
    warningsDisregarded?: number;
    /**
     * Actors or channels who will receive ToldYouSo broadcasts.
     */
    witnesses?: string[];
}

/**
 * Result of `fuck_around`. Returned immediately (B3): the consequence itself
 * arrives later on `fafo://findout/{actorId}`, correlated by `_meta.fafoId`.
 */
export interface FuckAroundOutput {
    /**
     * The Thread of Causality. Links every event in a single
     * around → warning → escalation → findout → lesson lifecycle.
     * Assigned by the fabric at intent declaration; immutable thereafter.
     */
    fafoId: string;
    /**
     * The Bureau's forecast. MUST be shown even when the user approved without reading.
     */
    predictedSeverity?: number;
    status:             "consequences_pending";
    /**
     * Warnings issued in response to this declaration.
     */
    warningsIssued?: number;
}

/**
 * A declaration of imminent fucking-around.
 * Mirror of `asyncapi.yaml#/components/schemas/Intent`.
 */
export interface Intent {
    category: FafoCategory;
    /**
     * What, precisely, you are about to do. Be honest. The log is forever.
     */
    description: string;
    /**
     * Self-assessed recklessness. The scale goes to eleven. The Bureau
     * recalibrates self-assessments upward by a factor derived from the phrase
     * "how hard can it be" appearing in `description`.
     */
    recklessness: number;
    /**
     * Safeguards the actor believes are in place. Recorded verbatim for
     * comedic value during the retro. Ignored by the severity engine.
     */
    safeguardsClaimed?: string[];
    /**
     * Warnings already received and ignored before declaring.
     */
    warningsDisregarded?: number;
    /**
     * Actors or channels who will receive ToldYouSo broadcasts.
     */
    witnesses?: string[];
}

/**
 * A self-reported learning outcome.
 * Mirror of `asyncapi.yaml#/components/schemas/Lesson`.
 */
export interface Lesson {
    /**
     * Whether the lesson is expected to survive the next opportunity.
     */
    durable?: boolean;
    learned:  boolean;
    notes?:   string;
    /**
     * The honesty field. Feeds the Recidivism Index.
     */
    willDoItAgainAnyway?: boolean;
}

/**
 * Input for `record_lesson` ← `asyncapi.yaml#/operations/recordLesson`.
 */
export interface RecordLessonInput {
    /**
     * Stable identifier of the actor doing the fucking-around. Consequences are
     * partitioned by this value and never rebalance to another actor.
     */
    actorId: string;
    /**
     * Whether the lesson is expected to survive the next opportunity.
     */
    durable?: boolean;
    /**
     * The concluded causal thread this lesson pertains to.
     */
    fafoId:  string;
    learned: boolean;
    notes?:  string;
    /**
     * The honesty field. Feeds the Recidivism Index.
     */
    willDoItAgainAnyway?: boolean;
}

/**
 * Result of `record_lesson`. The Bureau correlates; the server does not editorialize.
 */
export interface RecordLessonOutput {
    /**
     * The actor's updated Recidivism Index, 0–1. Computed, never self-reported.
     */
    recidivismIndex: number;
    recorded:        boolean;
}

/**
 * Input for `told_you_so` — the FOAAS memorial tool. Exactly the two
 * parameters the ancestral `/off/:name/:from` took. A closed, perfect form.
 */
export interface ToldYouSoInput {
    /**
     * Who told them so.
     */
    from: string;
    /**
     * Who is being told.
     */
    name: string;
}

/**
 * An advisory event. Structurally incapable of preventing anything.
 * Mirror of `asyncapi.yaml#/components/schemas/Warning`.
 */
export interface Warning {
    /**
     * Whether the warning was heeded. A boolean for schema hygiene and a
     * constant for historical accuracy.
     */
    heeded?: boolean;
    /**
     * The Bureau's forecast of the eventual finding-out.
     */
    predictedSeverity?: number;
    /**
     * Where the warning came from. All sources are equally ignorable.
     */
    source: Source;
    text:   string;
}

/**
 * Where the warning came from. All sources are equally ignorable.
 */
export type Source = "clearly_posted_sign" | "compiler" | "documentation" | "friend" | "linter" | "mother" | "past_self" | "senior_engineer" | "terms_of_service" | "this_very_spec";

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toFafoSchema(json: string): FafoSchema {
        return cast(JSON.parse(json), r("FafoSchema"));
    }

    public static fafoSchemaToJson(value: FafoSchema): string {
        return JSON.stringify(uncast(value, r("FafoSchema")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "FafoSchema": o([
        { json: "ActorId", js: "ActorId", typ: u(undefined, "") },
        { json: "Consequence", js: "Consequence", typ: u(undefined, r("Consequence")) },
        { json: "EscalateInput", js: "EscalateInput", typ: u(undefined, r("EscalateInput")) },
        { json: "EscalateOutput", js: "EscalateOutput", typ: u(undefined, r("EscalateOutput")) },
        { json: "Escalation", js: "Escalation", typ: u(undefined, r("Escalation")) },
        { json: "FafoCategory", js: "FafoCategory", typ: u(undefined, r("FafoCategory")) },
        { json: "FafoErrorCode", js: "FafoErrorCode", typ: u(undefined, 3.14) },
        { json: "FafoId", js: "FafoId", typ: u(undefined, "") },
        { json: "FafoToolName", js: "FafoToolName", typ: u(undefined, r("FafoToolName")) },
        { json: "FindOutInput", js: "FindOutInput", typ: u(undefined, r("FindOutInput")) },
        { json: "FindOutOutput", js: "FindOutOutput", typ: u(undefined, r("FindOutOutput")) },
        { json: "FoaasMessage", js: "FoaasMessage", typ: u(undefined, r("FoaasMessage")) },
        { json: "FuckAroundInput", js: "FuckAroundInput", typ: u(undefined, r("FuckAroundInput")) },
        { json: "FuckAroundOutput", js: "FuckAroundOutput", typ: u(undefined, r("FuckAroundOutput")) },
        { json: "Intent", js: "Intent", typ: u(undefined, r("Intent")) },
        { json: "Lesson", js: "Lesson", typ: u(undefined, r("Lesson")) },
        { json: "RecordLessonInput", js: "RecordLessonInput", typ: u(undefined, r("RecordLessonInput")) },
        { json: "RecordLessonOutput", js: "RecordLessonOutput", typ: u(undefined, r("RecordLessonOutput")) },
        { json: "ToldYouSoInput", js: "ToldYouSoInput", typ: u(undefined, r("ToldYouSoInput")) },
        { json: "ToldYouSoOutput", js: "ToldYouSoOutput", typ: u(undefined, r("FoaasMessage")) },
        { json: "Warning", js: "Warning", typ: u(undefined, r("Warning")) },
    ], false),
    "Consequence": o([
        { json: "appealable", js: "appealable", typ: u(undefined, true) },
        { json: "category", js: "category", typ: r("FafoCategory") },
        { json: "consequenceId", js: "consequenceId", typ: "" },
        { json: "deliveryAttempt", js: "deliveryAttempt", typ: u(undefined, 0) },
        { json: "foaas", js: "foaas", typ: r("FoaasMessage") },
        { json: "proportionality", js: "proportionality", typ: r("Proportionality") },
        { json: "severity", js: "severity", typ: 3.14 },
    ], false),
    "FoaasMessage": o([
        { json: "message", js: "message", typ: "" },
        { json: "subtitle", js: "subtitle", typ: "" },
    ], false),
    "EscalateInput": o([
        { json: "actorId", js: "actorId", typ: "" },
        { json: "fafoId", js: "fafoId", typ: "" },
        { json: "justification", js: "justification", typ: u(undefined, "") },
        { json: "newRecklessness", js: "newRecklessness", typ: 0 },
        { json: "warningsDisregardedThisTime", js: "warningsDisregardedThisTime", typ: u(undefined, 0) },
    ], false),
    "EscalateOutput": o([
        { json: "fafoId", js: "fafoId", typ: "" },
        { json: "severityForecastRevision", js: "severityForecastRevision", typ: r("SeverityForecastRevision") },
        { json: "status", js: "status", typ: r("Status") },
    ], false),
    "Escalation": o([
        { json: "justification", js: "justification", typ: u(undefined, "") },
        { json: "newRecklessness", js: "newRecklessness", typ: 0 },
        { json: "warningsDisregardedThisTime", js: "warningsDisregardedThisTime", typ: u(undefined, 0) },
    ], false),
    "FindOutInput": o([
        { json: "actorId", js: "actorId", typ: "" },
        { json: "afterSequence", js: "afterSequence", typ: u(undefined, 0) },
        { json: "fafoId", js: "fafoId", typ: u(undefined, "") },
    ], false),
    "FindOutOutput": o([
        { json: "consequences", js: "consequences", typ: a(r("Consequence")) },
        { json: "pending", js: "pending", typ: true },
    ], false),
    "FuckAroundInput": o([
        { json: "actorId", js: "actorId", typ: "" },
        { json: "category", js: "category", typ: r("FafoCategory") },
        { json: "description", js: "description", typ: "" },
        { json: "recklessness", js: "recklessness", typ: 0 },
        { json: "safeguardsClaimed", js: "safeguardsClaimed", typ: u(undefined, a("")) },
        { json: "warningsDisregarded", js: "warningsDisregarded", typ: u(undefined, 0) },
        { json: "witnesses", js: "witnesses", typ: u(undefined, a("")) },
    ], false),
    "FuckAroundOutput": o([
        { json: "fafoId", js: "fafoId", typ: "" },
        { json: "predictedSeverity", js: "predictedSeverity", typ: u(undefined, 3.14) },
        { json: "status", js: "status", typ: r("Status") },
        { json: "warningsIssued", js: "warningsIssued", typ: u(undefined, 0) },
    ], false),
    "Intent": o([
        { json: "category", js: "category", typ: r("FafoCategory") },
        { json: "description", js: "description", typ: "" },
        { json: "recklessness", js: "recklessness", typ: 0 },
        { json: "safeguardsClaimed", js: "safeguardsClaimed", typ: u(undefined, a("")) },
        { json: "warningsDisregarded", js: "warningsDisregarded", typ: u(undefined, 0) },
        { json: "witnesses", js: "witnesses", typ: u(undefined, a("")) },
    ], false),
    "Lesson": o([
        { json: "durable", js: "durable", typ: u(undefined, true) },
        { json: "learned", js: "learned", typ: true },
        { json: "notes", js: "notes", typ: u(undefined, "") },
        { json: "willDoItAgainAnyway", js: "willDoItAgainAnyway", typ: u(undefined, true) },
    ], false),
    "RecordLessonInput": o([
        { json: "actorId", js: "actorId", typ: "" },
        { json: "durable", js: "durable", typ: u(undefined, true) },
        { json: "fafoId", js: "fafoId", typ: "" },
        { json: "learned", js: "learned", typ: true },
        { json: "notes", js: "notes", typ: u(undefined, "") },
        { json: "willDoItAgainAnyway", js: "willDoItAgainAnyway", typ: u(undefined, true) },
    ], false),
    "RecordLessonOutput": o([
        { json: "recidivismIndex", js: "recidivismIndex", typ: 3.14 },
        { json: "recorded", js: "recorded", typ: true },
    ], false),
    "ToldYouSoInput": o([
        { json: "from", js: "from", typ: "" },
        { json: "name", js: "name", typ: "" },
    ], false),
    "Warning": o([
        { json: "heeded", js: "heeded", typ: u(undefined, true) },
        { json: "predictedSeverity", js: "predictedSeverity", typ: u(undefined, 3.14) },
        { json: "source", js: "source", typ: r("Source") },
        { json: "text", js: "text", typ: "" },
    ], false),
    "FafoCategory": [
        "chemical",
        "cryptography_diy",
        "culinary",
        "diy_plumbing",
        "electrical",
        "feline",
        "financial",
        "legal",
        "mechanical",
        "other",
        "production_deploy",
        "regex",
        "reply_all",
        "romantic",
        "unsupervised_sudo",
        "wildlife",
    ],
    "Proportionality": [
        "biblical",
        "disproportionate",
        "proportional",
    ],
    "SeverityForecastRevision": [
        "upward",
    ],
    "Status": [
        "consequences_pending",
    ],
    "FafoToolName": [
        "escalate",
        "find_out",
        "fuck_around",
        "record_lesson",
        "told_you_so",
    ],
    "Source": [
        "clearly_posted_sign",
        "compiler",
        "documentation",
        "friend",
        "linter",
        "mother",
        "past_self",
        "senior_engineer",
        "terms_of_service",
        "this_very_spec",
    ],
};
