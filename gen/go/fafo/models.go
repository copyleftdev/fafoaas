// Code generated from JSON Schema using quicktype. DO NOT EDIT.
// To parse and unparse this JSON data, add this code to your project and do:
//
//    fafoSchema, err := UnmarshalFafoSchema(bytes)
//    bytes, err = fafoSchema.Marshal()

package fafo

import "encoding/json"

func UnmarshalFafoSchema(data []byte) (FafoSchema, error) {
	var r FafoSchema
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *FafoSchema) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

type FafoSchema struct {
	ActorID            *string             `json:"ActorId,omitempty"`
	Consequence        *Consequence        `json:"Consequence,omitempty"`
	EscalateInput      *EscalateInput      `json:"EscalateInput,omitempty"`
	EscalateOutput     *EscalateOutput     `json:"EscalateOutput,omitempty"`
	Escalation         *Escalation         `json:"Escalation,omitempty"`
	FafoCategory       *FafoCategory       `json:"FafoCategory,omitempty"`
	FafoErrorCode      *float64            `json:"FafoErrorCode,omitempty"`
	FafoID             *string             `json:"FafoId,omitempty"`
	FafoToolName       *FafoToolName       `json:"FafoToolName,omitempty"`
	FindOutInput       *FindOutInput       `json:"FindOutInput,omitempty"`
	FindOutOutput      *FindOutOutput      `json:"FindOutOutput,omitempty"`
	FoaasMessage       *FoaasMessage       `json:"FoaasMessage,omitempty"`
	FuckAroundInput    *FuckAroundInput    `json:"FuckAroundInput,omitempty"`
	FuckAroundOutput   *FuckAroundOutput   `json:"FuckAroundOutput,omitempty"`
	Intent             *Intent             `json:"Intent,omitempty"`
	Lesson             *Lesson             `json:"Lesson,omitempty"`
	RecordLessonInput  *RecordLessonInput  `json:"RecordLessonInput,omitempty"`
	RecordLessonOutput *RecordLessonOutput `json:"RecordLessonOutput,omitempty"`
	ToldYouSoInput     *ToldYouSoInput     `json:"ToldYouSoInput,omitempty"`
	ToldYouSoOutput    *FoaasMessage       `json:"ToldYouSoOutput,omitempty"`
	Warning            *Warning            `json:"Warning,omitempty"`
}

// A materialized finding-out. Immutable. Non-appealable.
// Mirror of `asyncapi.yaml#/components/schemas/Consequence`.
type Consequence struct {
	Appealable *bool        `json:"appealable,omitempty"`
	Category   FafoCategory `json:"category"`
	// Deduplication key. The universe retries; you must not double-count.
	ConsequenceID string `json:"consequenceId"`
	// Which delivery attempt this is. See Law 3.
	DeliveryAttempt *int64       `json:"deliveryAttempt,omitempty"`
	Foaas           FoaasMessage `json:"foaas"`
	// The fabric's own assessment of its work.
	Proportionality Proportionality `json:"proportionality"`
	// Computed per the Conservation Law from the integral of recklessness over
	// the causal thread. MAY exceed 11; the input scale is capped, the output
	// scale is not. This asymmetry is the entire lesson.
	Severity float64 `json:"severity"`
}

// The ancestral FOAAS wire format, preserved byte-for-byte in spirit.
// Every consequence, no matter how severe, can be expressed as a `message`
// and a `subtitle`. That was FOAAS's great insight. This interface is FROZEN
// in homage — changes require a séance with the FOAAS maintainers.
// Mirror of `asyncapi.yaml#/components/schemas/FoaasMessage`.
type FoaasMessage struct {
	Message string `json:"message"`
	// MUST begin with "- ". This is not negotiable; it is the whole homage.
	Subtitle string `json:"subtitle"`
}

// Input for `escalate` ← `asyncapi.yaml#/operations/escalate`.
type EscalateInput struct {
	// Stable identifier of the actor doing the fucking-around. Consequences are
	// partitioned by this value and never rebalance to another actor.
	ActorID string `json:"actorId"`
	// The open causal thread being escalated.
	FafoID string `json:"fafoId"`
	// Preserved verbatim for the incident report.
	Justification *string `json:"justification,omitempty"`
	// Must exceed the thread's current recklessness. It always does.
	NewRecklessness             int64  `json:"newRecklessness"`
	WarningsDisregardedThisTime *int64 `json:"warningsDisregardedThisTime,omitempty"`
}

// Result of `escalate`. The integral has been recalculated.
type EscalateOutput struct {
	// The Thread of Causality. Links every event in a single
	// around → warning → escalation → findout → lesson lifecycle.
	// Assigned by the fabric at intent declaration; immutable thereafter.
	FafoID string `json:"fafoId"`
	// Always "upward".
	SeverityForecastRevision SeverityForecastRevision `json:"severityForecastRevision"`
	Status                   Status                   `json:"status"`
}

// A recklessness increase on an open causal thread.
// Mirror of `asyncapi.yaml#/components/schemas/Escalation`.
type Escalation struct {
	// Preserved verbatim for the incident report.
	Justification *string `json:"justification,omitempty"`
	// Must exceed the thread's current recklessness. It always does.
	NewRecklessness             int64  `json:"newRecklessness"`
	WarningsDisregardedThisTime *int64 `json:"warningsDisregardedThisTime,omitempty"`
}

// Input for `find_out` — polling companion (B3) for hosts without
// resource-subscription support. They exist; we forgive them.
type FindOutInput struct {
	// Stable identifier of the actor doing the fucking-around. Consequences are
	// partitioned by this value and never rebalance to another actor.
	ActorID string `json:"actorId"`
	// Return only consequences with a header sequence greater than this.
	AfterSequence *int64 `json:"afterSequence,omitempty"`
	// Restrict to a single causal thread.
	FafoID *string `json:"fafoId,omitempty"`
}

// Result of `find_out`. Deduplicate by `consequenceId`; the universe retries.
type FindOutOutput struct {
	Consequences []Consequence `json:"consequences"`
	// True if consequences exist that have not yet materialized. Usually true.
	Pending bool `json:"pending"`
}

// Input for `fuck_around` ← `asyncapi.yaml#/operations/declareIntent`.
// The Intent payload ⊕ the channel parameter (B1). Headers (`fafoId`,
// `occurredAt`, `sequence`) are server-populated — agents do not get to
// choose their own causality.
type FuckAroundInput struct {
	// Stable identifier of the actor doing the fucking-around. Consequences are
	// partitioned by this value and never rebalance to another actor.
	ActorID  string       `json:"actorId"`
	Category FafoCategory `json:"category"`
	// What, precisely, you are about to do. Be honest. The log is forever.
	Description string `json:"description"`
	// Self-assessed recklessness. The scale goes to eleven. The Bureau
	// recalibrates self-assessments upward by a factor derived from the phrase
	// "how hard can it be" appearing in `description`.
	Recklessness int64 `json:"recklessness"`
	// Safeguards the actor believes are in place. Recorded verbatim for
	// comedic value during the retro. Ignored by the severity engine.
	SafeguardsClaimed []string `json:"safeguardsClaimed,omitempty"`
	// Warnings already received and ignored before declaring.
	WarningsDisregarded *int64 `json:"warningsDisregarded,omitempty"`
	// Actors or channels who will receive ToldYouSo broadcasts.
	Witnesses []string `json:"witnesses,omitempty"`
}

// Result of `fuck_around`. Returned immediately (B3): the consequence itself
// arrives later on `fafo://findout/{actorId}`, correlated by `_meta.fafoId`.
type FuckAroundOutput struct {
	// The Thread of Causality. Links every event in a single
	// around → warning → escalation → findout → lesson lifecycle.
	// Assigned by the fabric at intent declaration; immutable thereafter.
	FafoID string `json:"fafoId"`
	// The Bureau's forecast. MUST be shown even when the user approved without reading.
	PredictedSeverity *float64 `json:"predictedSeverity,omitempty"`
	Status            Status   `json:"status"`
	// Warnings issued in response to this declaration.
	WarningsIssued *int64 `json:"warningsIssued,omitempty"`
}

// A declaration of imminent fucking-around.
// Mirror of `asyncapi.yaml#/components/schemas/Intent`.
type Intent struct {
	Category FafoCategory `json:"category"`
	// What, precisely, you are about to do. Be honest. The log is forever.
	Description string `json:"description"`
	// Self-assessed recklessness. The scale goes to eleven. The Bureau
	// recalibrates self-assessments upward by a factor derived from the phrase
	// "how hard can it be" appearing in `description`.
	Recklessness int64 `json:"recklessness"`
	// Safeguards the actor believes are in place. Recorded verbatim for
	// comedic value during the retro. Ignored by the severity engine.
	SafeguardsClaimed []string `json:"safeguardsClaimed,omitempty"`
	// Warnings already received and ignored before declaring.
	WarningsDisregarded *int64 `json:"warningsDisregarded,omitempty"`
	// Actors or channels who will receive ToldYouSo broadcasts.
	Witnesses []string `json:"witnesses,omitempty"`
}

// A self-reported learning outcome.
// Mirror of `asyncapi.yaml#/components/schemas/Lesson`.
type Lesson struct {
	// Whether the lesson is expected to survive the next opportunity.
	Durable *bool   `json:"durable,omitempty"`
	Learned bool    `json:"learned"`
	Notes   *string `json:"notes,omitempty"`
	// The honesty field. Feeds the Recidivism Index.
	WillDoItAgainAnyway *bool `json:"willDoItAgainAnyway,omitempty"`
}

// Input for `record_lesson` ← `asyncapi.yaml#/operations/recordLesson`.
type RecordLessonInput struct {
	// Stable identifier of the actor doing the fucking-around. Consequences are
	// partitioned by this value and never rebalance to another actor.
	ActorID string `json:"actorId"`
	// Whether the lesson is expected to survive the next opportunity.
	Durable *bool `json:"durable,omitempty"`
	// The concluded causal thread this lesson pertains to.
	FafoID  string  `json:"fafoId"`
	Learned bool    `json:"learned"`
	Notes   *string `json:"notes,omitempty"`
	// The honesty field. Feeds the Recidivism Index.
	WillDoItAgainAnyway *bool `json:"willDoItAgainAnyway,omitempty"`
}

// Result of `record_lesson`. The Bureau correlates; the server does not editorialize.
type RecordLessonOutput struct {
	// The actor's updated Recidivism Index, 0–1. Computed, never self-reported.
	RecidivismIndex float64 `json:"recidivismIndex"`
	Recorded        bool    `json:"recorded"`
}

// Input for `told_you_so` — the FOAAS memorial tool. Exactly the two
// parameters the ancestral `/off/:name/:from` took. A closed, perfect form.
type ToldYouSoInput struct {
	// Who told them so.
	From string `json:"from"`
	// Who is being told.
	Name string `json:"name"`
}

// An advisory event. Structurally incapable of preventing anything.
// Mirror of `asyncapi.yaml#/components/schemas/Warning`.
type Warning struct {
	// Whether the warning was heeded. A boolean for schema hygiene and a
	// constant for historical accuracy.
	Heeded *bool `json:"heeded,omitempty"`
	// The Bureau's forecast of the eventual finding-out.
	PredictedSeverity *float64 `json:"predictedSeverity,omitempty"`
	// Where the warning came from. All sources are equally ignorable.
	Source Source `json:"source"`
	Text   string `json:"text"`
}

// The recognized domains of fucking around. Extensible; regrettably.
// Mirror of `asyncapi.yaml#/components/schemas/FafoCategory` — extend it
// there first; this type follows.
type FafoCategory string

const (
	Chemical         FafoCategory = "chemical"
	CryptographyDiy  FafoCategory = "cryptography_diy"
	Culinary         FafoCategory = "culinary"
	DiyPlumbing      FafoCategory = "diy_plumbing"
	Electrical       FafoCategory = "electrical"
	Feline           FafoCategory = "feline"
	Financial        FafoCategory = "financial"
	Legal            FafoCategory = "legal"
	Mechanical       FafoCategory = "mechanical"
	Other            FafoCategory = "other"
	ProductionDeploy FafoCategory = "production_deploy"
	Regex            FafoCategory = "regex"
	ReplyAll         FafoCategory = "reply_all"
	Romantic         FafoCategory = "romantic"
	UnsupervisedSudo FafoCategory = "unsupervised_sudo"
	Wildlife         FafoCategory = "wildlife"
)

// The fabric's own assessment of its work.
type Proportionality string

const (
	Biblical         Proportionality = "biblical"
	Disproportionate Proportionality = "disproportionate"
	Proportional     Proportionality = "proportional"
)

// Always "upward".
type SeverityForecastRevision string

const (
	Upward SeverityForecastRevision = "upward"
)

type Status string

const (
	ConsequencesPending Status = "consequences_pending"
)

// The complete, closed set of fafo-mcp tool names.
type FafoToolName string

const (
	Escalate     FafoToolName = "escalate"
	FindOut      FafoToolName = "find_out"
	FuckAround   FafoToolName = "fuck_around"
	RecordLesson FafoToolName = "record_lesson"
	ToldYouSo    FafoToolName = "told_you_so"
)

// Where the warning came from. All sources are equally ignorable.
type Source string

const (
	ClearlyPostedSign Source = "clearly_posted_sign"
	Compiler          Source = "compiler"
	Documentation     Source = "documentation"
	Friend            Source = "friend"
	Linter            Source = "linter"
	Mother            Source = "mother"
	PastSelf          Source = "past_self"
	SeniorEngineer    Source = "senior_engineer"
	TermsOfService    Source = "terms_of_service"
	ThisVerySpec      Source = "this_very_spec"
)
