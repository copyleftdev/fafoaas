from enum import Enum
from dataclasses import dataclass
from typing import Any, Optional, List, TypeVar, Type, cast, Callable
from uuid import UUID


T = TypeVar("T")
EnumT = TypeVar("EnumT", bound=Enum)


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def from_float(x: Any) -> float:
    assert isinstance(x, (float, int)) and not isinstance(x, bool)
    return float(x)


def from_bool(x: Any) -> bool:
    assert isinstance(x, bool)
    return x


def from_none(x: Any) -> Any:
    assert x is None
    return x


def from_union(fs, x):
    for f in fs:
        try:
            return f(x)
        except:
            pass
    assert False


def from_int(x: Any) -> int:
    assert isinstance(x, int) and not isinstance(x, bool)
    return x


def to_enum(c: Type[EnumT], x: Any) -> EnumT:
    assert isinstance(x, c)
    return x.value


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


def to_float(x: Any) -> float:
    assert isinstance(x, (int, float))
    return x


def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]


class FafoCategory(Enum):
    """The recognized domains of fucking around. Extensible; regrettably.
    Mirror of `asyncapi.yaml#/components/schemas/FafoCategory` — extend it
    there first; this type follows.
    """
    CHEMICAL = "chemical"
    CRYPTOGRAPHY_DIY = "cryptography_diy"
    CULINARY = "culinary"
    DIY_PLUMBING = "diy_plumbing"
    ELECTRICAL = "electrical"
    FELINE = "feline"
    FINANCIAL = "financial"
    LEGAL = "legal"
    MECHANICAL = "mechanical"
    OTHER = "other"
    PRODUCTION_DEPLOY = "production_deploy"
    REGEX = "regex"
    REPLY_ALL = "reply_all"
    ROMANTIC = "romantic"
    UNSUPERVISED_SUDO = "unsupervised_sudo"
    WILDLIFE = "wildlife"


@dataclass
class FoaasMessage:
    """The ancestral FOAAS wire format, preserved byte-for-byte in spirit.
    Every consequence, no matter how severe, can be expressed as a `message`
    and a `subtitle`. That was FOAAS's great insight. This interface is FROZEN
    in homage — changes require a séance with the FOAAS maintainers.
    Mirror of `asyncapi.yaml#/components/schemas/FoaasMessage`.
    """
    message: str
    subtitle: str
    """MUST begin with "- ". This is not negotiable; it is the whole homage."""

    @staticmethod
    def from_dict(obj: Any) -> 'FoaasMessage':
        assert isinstance(obj, dict)
        message = from_str(obj.get("message"))
        subtitle = from_str(obj.get("subtitle"))
        return FoaasMessage(message, subtitle)

    def to_dict(self) -> dict:
        result: dict = {}
        result["message"] = from_str(self.message)
        result["subtitle"] = from_str(self.subtitle)
        return result


class Proportionality(Enum):
    """The fabric's own assessment of its work."""

    BIBLICAL = "biblical"
    DISPROPORTIONATE = "disproportionate"
    PROPORTIONAL = "proportional"


@dataclass
class Consequence:
    """A materialized finding-out. Immutable. Non-appealable.
    Mirror of `asyncapi.yaml#/components/schemas/Consequence`.
    """
    category: FafoCategory
    consequence_id: UUID
    """Deduplication key. The universe retries; you must not double-count."""

    foaas: FoaasMessage
    proportionality: Proportionality
    """The fabric's own assessment of its work."""

    severity: float
    """Computed per the Conservation Law from the integral of recklessness over
    the causal thread. MAY exceed 11; the input scale is capped, the output
    scale is not. This asymmetry is the entire lesson.
    """
    appealable: Optional[bool] = None
    delivery_attempt: Optional[int] = None
    """Which delivery attempt this is. See Law 3."""

    @staticmethod
    def from_dict(obj: Any) -> 'Consequence':
        assert isinstance(obj, dict)
        category = FafoCategory(obj.get("category"))
        consequence_id = UUID(obj.get("consequenceId"))
        foaas = FoaasMessage.from_dict(obj.get("foaas"))
        proportionality = Proportionality(obj.get("proportionality"))
        severity = from_float(obj.get("severity"))
        appealable = from_union([from_bool, from_none], obj.get("appealable"))
        delivery_attempt = from_union([from_int, from_none], obj.get("deliveryAttempt"))
        return Consequence(category, consequence_id, foaas, proportionality, severity, appealable, delivery_attempt)

    def to_dict(self) -> dict:
        result: dict = {}
        result["category"] = to_enum(FafoCategory, self.category)
        result["consequenceId"] = str(self.consequence_id)
        result["foaas"] = to_class(FoaasMessage, self.foaas)
        result["proportionality"] = to_enum(Proportionality, self.proportionality)
        result["severity"] = to_float(self.severity)
        if self.appealable is not None:
            result["appealable"] = from_union([from_bool, from_none], self.appealable)
        if self.delivery_attempt is not None:
            result["deliveryAttempt"] = from_union([from_int, from_none], self.delivery_attempt)
        return result


@dataclass
class EscalateInput:
    """Input for `escalate` ← `asyncapi.yaml#/operations/escalate`."""

    actor_id: str
    """Stable identifier of the actor doing the fucking-around. Consequences are
    partitioned by this value and never rebalance to another actor.
    """
    fafo_id: UUID
    """The open causal thread being escalated."""

    new_recklessness: int
    """Must exceed the thread's current recklessness. It always does."""

    justification: Optional[str] = None
    """Preserved verbatim for the incident report."""

    warnings_disregarded_this_time: Optional[int] = None

    @staticmethod
    def from_dict(obj: Any) -> 'EscalateInput':
        assert isinstance(obj, dict)
        actor_id = from_str(obj.get("actorId"))
        fafo_id = UUID(obj.get("fafoId"))
        new_recklessness = from_int(obj.get("newRecklessness"))
        justification = from_union([from_str, from_none], obj.get("justification"))
        warnings_disregarded_this_time = from_union([from_int, from_none], obj.get("warningsDisregardedThisTime"))
        return EscalateInput(actor_id, fafo_id, new_recklessness, justification, warnings_disregarded_this_time)

    def to_dict(self) -> dict:
        result: dict = {}
        result["actorId"] = from_str(self.actor_id)
        result["fafoId"] = str(self.fafo_id)
        result["newRecklessness"] = from_int(self.new_recklessness)
        if self.justification is not None:
            result["justification"] = from_union([from_str, from_none], self.justification)
        if self.warnings_disregarded_this_time is not None:
            result["warningsDisregardedThisTime"] = from_union([from_int, from_none], self.warnings_disregarded_this_time)
        return result


class SeverityForecastRevision(Enum):
    """Always "upward"."""

    UPWARD = "upward"


class Status(Enum):
    CONSEQUENCES_PENDING = "consequences_pending"


@dataclass
class EscalateOutput:
    """Result of `escalate`. The integral has been recalculated."""

    fafo_id: UUID
    """The Thread of Causality. Links every event in a single
    around → warning → escalation → findout → lesson lifecycle.
    Assigned by the fabric at intent declaration; immutable thereafter.
    """
    severity_forecast_revision: SeverityForecastRevision
    """Always "upward"."""

    status: Status

    @staticmethod
    def from_dict(obj: Any) -> 'EscalateOutput':
        assert isinstance(obj, dict)
        fafo_id = UUID(obj.get("fafoId"))
        severity_forecast_revision = SeverityForecastRevision(obj.get("severityForecastRevision"))
        status = Status(obj.get("status"))
        return EscalateOutput(fafo_id, severity_forecast_revision, status)

    def to_dict(self) -> dict:
        result: dict = {}
        result["fafoId"] = str(self.fafo_id)
        result["severityForecastRevision"] = to_enum(SeverityForecastRevision, self.severity_forecast_revision)
        result["status"] = to_enum(Status, self.status)
        return result


@dataclass
class Escalation:
    """A recklessness increase on an open causal thread.
    Mirror of `asyncapi.yaml#/components/schemas/Escalation`.
    """
    new_recklessness: int
    """Must exceed the thread's current recklessness. It always does."""

    justification: Optional[str] = None
    """Preserved verbatim for the incident report."""

    warnings_disregarded_this_time: Optional[int] = None

    @staticmethod
    def from_dict(obj: Any) -> 'Escalation':
        assert isinstance(obj, dict)
        new_recklessness = from_int(obj.get("newRecklessness"))
        justification = from_union([from_str, from_none], obj.get("justification"))
        warnings_disregarded_this_time = from_union([from_int, from_none], obj.get("warningsDisregardedThisTime"))
        return Escalation(new_recklessness, justification, warnings_disregarded_this_time)

    def to_dict(self) -> dict:
        result: dict = {}
        result["newRecklessness"] = from_int(self.new_recklessness)
        if self.justification is not None:
            result["justification"] = from_union([from_str, from_none], self.justification)
        if self.warnings_disregarded_this_time is not None:
            result["warningsDisregardedThisTime"] = from_union([from_int, from_none], self.warnings_disregarded_this_time)
        return result


class FafoToolName(Enum):
    """The complete, closed set of fafo-mcp tool names."""

    ESCALATE = "escalate"
    FIND_OUT = "find_out"
    FUCK_AROUND = "fuck_around"
    RECORD_LESSON = "record_lesson"
    TOLD_YOU_SO = "told_you_so"


@dataclass
class FindOutInput:
    """Input for `find_out` — polling companion (B3) for hosts without
    resource-subscription support. They exist; we forgive them.
    """
    actor_id: str
    """Stable identifier of the actor doing the fucking-around. Consequences are
    partitioned by this value and never rebalance to another actor.
    """
    after_sequence: Optional[int] = None
    """Return only consequences with a header sequence greater than this."""

    fafo_id: Optional[UUID] = None
    """Restrict to a single causal thread."""

    @staticmethod
    def from_dict(obj: Any) -> 'FindOutInput':
        assert isinstance(obj, dict)
        actor_id = from_str(obj.get("actorId"))
        after_sequence = from_union([from_int, from_none], obj.get("afterSequence"))
        fafo_id = from_union([lambda x: UUID(x), from_none], obj.get("fafoId"))
        return FindOutInput(actor_id, after_sequence, fafo_id)

    def to_dict(self) -> dict:
        result: dict = {}
        result["actorId"] = from_str(self.actor_id)
        if self.after_sequence is not None:
            result["afterSequence"] = from_union([from_int, from_none], self.after_sequence)
        if self.fafo_id is not None:
            result["fafoId"] = from_union([lambda x: str(x), from_none], self.fafo_id)
        return result


@dataclass
class FindOutOutput:
    """Result of `find_out`. Deduplicate by `consequenceId`; the universe retries."""

    consequences: List[Consequence]
    pending: bool
    """True if consequences exist that have not yet materialized. Usually true."""

    @staticmethod
    def from_dict(obj: Any) -> 'FindOutOutput':
        assert isinstance(obj, dict)
        consequences = from_list(Consequence.from_dict, obj.get("consequences"))
        pending = from_bool(obj.get("pending"))
        return FindOutOutput(consequences, pending)

    def to_dict(self) -> dict:
        result: dict = {}
        result["consequences"] = from_list(lambda x: to_class(Consequence, x), self.consequences)
        result["pending"] = from_bool(self.pending)
        return result


@dataclass
class FuckAroundInput:
    """Input for `fuck_around` ← `asyncapi.yaml#/operations/declareIntent`.
    The Intent payload ⊕ the channel parameter (B1). Headers (`fafoId`,
    `occurredAt`, `sequence`) are server-populated — agents do not get to
    choose their own causality.
    """
    actor_id: str
    """Stable identifier of the actor doing the fucking-around. Consequences are
    partitioned by this value and never rebalance to another actor.
    """
    category: FafoCategory
    description: str
    """What, precisely, you are about to do. Be honest. The log is forever."""

    recklessness: int
    """Self-assessed recklessness. The scale goes to eleven. The Bureau
    recalibrates self-assessments upward by a factor derived from the phrase
    "how hard can it be" appearing in `description`.
    """
    safeguards_claimed: Optional[List[str]] = None
    """Safeguards the actor believes are in place. Recorded verbatim for
    comedic value during the retro. Ignored by the severity engine.
    """
    warnings_disregarded: Optional[int] = None
    """Warnings already received and ignored before declaring."""

    witnesses: Optional[List[str]] = None
    """Actors or channels who will receive ToldYouSo broadcasts."""

    @staticmethod
    def from_dict(obj: Any) -> 'FuckAroundInput':
        assert isinstance(obj, dict)
        actor_id = from_str(obj.get("actorId"))
        category = FafoCategory(obj.get("category"))
        description = from_str(obj.get("description"))
        recklessness = from_int(obj.get("recklessness"))
        safeguards_claimed = from_union([lambda x: from_list(from_str, x), from_none], obj.get("safeguardsClaimed"))
        warnings_disregarded = from_union([from_int, from_none], obj.get("warningsDisregarded"))
        witnesses = from_union([lambda x: from_list(from_str, x), from_none], obj.get("witnesses"))
        return FuckAroundInput(actor_id, category, description, recklessness, safeguards_claimed, warnings_disregarded, witnesses)

    def to_dict(self) -> dict:
        result: dict = {}
        result["actorId"] = from_str(self.actor_id)
        result["category"] = to_enum(FafoCategory, self.category)
        result["description"] = from_str(self.description)
        result["recklessness"] = from_int(self.recklessness)
        if self.safeguards_claimed is not None:
            result["safeguardsClaimed"] = from_union([lambda x: from_list(from_str, x), from_none], self.safeguards_claimed)
        if self.warnings_disregarded is not None:
            result["warningsDisregarded"] = from_union([from_int, from_none], self.warnings_disregarded)
        if self.witnesses is not None:
            result["witnesses"] = from_union([lambda x: from_list(from_str, x), from_none], self.witnesses)
        return result


@dataclass
class FuckAroundOutput:
    """Result of `fuck_around`. Returned immediately (B3): the consequence itself
    arrives later on `fafo://findout/{actorId}`, correlated by `_meta.fafoId`.
    """
    fafo_id: UUID
    """The Thread of Causality. Links every event in a single
    around → warning → escalation → findout → lesson lifecycle.
    Assigned by the fabric at intent declaration; immutable thereafter.
    """
    status: Status
    predicted_severity: Optional[float] = None
    """The Bureau's forecast. MUST be shown even when the user approved without reading."""

    warnings_issued: Optional[int] = None
    """Warnings issued in response to this declaration."""

    @staticmethod
    def from_dict(obj: Any) -> 'FuckAroundOutput':
        assert isinstance(obj, dict)
        fafo_id = UUID(obj.get("fafoId"))
        status = Status(obj.get("status"))
        predicted_severity = from_union([from_float, from_none], obj.get("predictedSeverity"))
        warnings_issued = from_union([from_int, from_none], obj.get("warningsIssued"))
        return FuckAroundOutput(fafo_id, status, predicted_severity, warnings_issued)

    def to_dict(self) -> dict:
        result: dict = {}
        result["fafoId"] = str(self.fafo_id)
        result["status"] = to_enum(Status, self.status)
        if self.predicted_severity is not None:
            result["predictedSeverity"] = from_union([to_float, from_none], self.predicted_severity)
        if self.warnings_issued is not None:
            result["warningsIssued"] = from_union([from_int, from_none], self.warnings_issued)
        return result


@dataclass
class Intent:
    """A declaration of imminent fucking-around.
    Mirror of `asyncapi.yaml#/components/schemas/Intent`.
    """
    category: FafoCategory
    description: str
    """What, precisely, you are about to do. Be honest. The log is forever."""

    recklessness: int
    """Self-assessed recklessness. The scale goes to eleven. The Bureau
    recalibrates self-assessments upward by a factor derived from the phrase
    "how hard can it be" appearing in `description`.
    """
    safeguards_claimed: Optional[List[str]] = None
    """Safeguards the actor believes are in place. Recorded verbatim for
    comedic value during the retro. Ignored by the severity engine.
    """
    warnings_disregarded: Optional[int] = None
    """Warnings already received and ignored before declaring."""

    witnesses: Optional[List[str]] = None
    """Actors or channels who will receive ToldYouSo broadcasts."""

    @staticmethod
    def from_dict(obj: Any) -> 'Intent':
        assert isinstance(obj, dict)
        category = FafoCategory(obj.get("category"))
        description = from_str(obj.get("description"))
        recklessness = from_int(obj.get("recklessness"))
        safeguards_claimed = from_union([lambda x: from_list(from_str, x), from_none], obj.get("safeguardsClaimed"))
        warnings_disregarded = from_union([from_int, from_none], obj.get("warningsDisregarded"))
        witnesses = from_union([lambda x: from_list(from_str, x), from_none], obj.get("witnesses"))
        return Intent(category, description, recklessness, safeguards_claimed, warnings_disregarded, witnesses)

    def to_dict(self) -> dict:
        result: dict = {}
        result["category"] = to_enum(FafoCategory, self.category)
        result["description"] = from_str(self.description)
        result["recklessness"] = from_int(self.recklessness)
        if self.safeguards_claimed is not None:
            result["safeguardsClaimed"] = from_union([lambda x: from_list(from_str, x), from_none], self.safeguards_claimed)
        if self.warnings_disregarded is not None:
            result["warningsDisregarded"] = from_union([from_int, from_none], self.warnings_disregarded)
        if self.witnesses is not None:
            result["witnesses"] = from_union([lambda x: from_list(from_str, x), from_none], self.witnesses)
        return result


@dataclass
class Lesson:
    """A self-reported learning outcome.
    Mirror of `asyncapi.yaml#/components/schemas/Lesson`.
    """
    learned: bool
    durable: Optional[bool] = None
    """Whether the lesson is expected to survive the next opportunity."""

    notes: Optional[str] = None
    will_do_it_again_anyway: Optional[bool] = None
    """The honesty field. Feeds the Recidivism Index."""

    @staticmethod
    def from_dict(obj: Any) -> 'Lesson':
        assert isinstance(obj, dict)
        learned = from_bool(obj.get("learned"))
        durable = from_union([from_bool, from_none], obj.get("durable"))
        notes = from_union([from_str, from_none], obj.get("notes"))
        will_do_it_again_anyway = from_union([from_bool, from_none], obj.get("willDoItAgainAnyway"))
        return Lesson(learned, durable, notes, will_do_it_again_anyway)

    def to_dict(self) -> dict:
        result: dict = {}
        result["learned"] = from_bool(self.learned)
        if self.durable is not None:
            result["durable"] = from_union([from_bool, from_none], self.durable)
        if self.notes is not None:
            result["notes"] = from_union([from_str, from_none], self.notes)
        if self.will_do_it_again_anyway is not None:
            result["willDoItAgainAnyway"] = from_union([from_bool, from_none], self.will_do_it_again_anyway)
        return result


@dataclass
class RecordLessonInput:
    """Input for `record_lesson` ← `asyncapi.yaml#/operations/recordLesson`."""

    actor_id: str
    """Stable identifier of the actor doing the fucking-around. Consequences are
    partitioned by this value and never rebalance to another actor.
    """
    fafo_id: UUID
    """The concluded causal thread this lesson pertains to."""

    learned: bool
    durable: Optional[bool] = None
    """Whether the lesson is expected to survive the next opportunity."""

    notes: Optional[str] = None
    will_do_it_again_anyway: Optional[bool] = None
    """The honesty field. Feeds the Recidivism Index."""

    @staticmethod
    def from_dict(obj: Any) -> 'RecordLessonInput':
        assert isinstance(obj, dict)
        actor_id = from_str(obj.get("actorId"))
        fafo_id = UUID(obj.get("fafoId"))
        learned = from_bool(obj.get("learned"))
        durable = from_union([from_bool, from_none], obj.get("durable"))
        notes = from_union([from_str, from_none], obj.get("notes"))
        will_do_it_again_anyway = from_union([from_bool, from_none], obj.get("willDoItAgainAnyway"))
        return RecordLessonInput(actor_id, fafo_id, learned, durable, notes, will_do_it_again_anyway)

    def to_dict(self) -> dict:
        result: dict = {}
        result["actorId"] = from_str(self.actor_id)
        result["fafoId"] = str(self.fafo_id)
        result["learned"] = from_bool(self.learned)
        if self.durable is not None:
            result["durable"] = from_union([from_bool, from_none], self.durable)
        if self.notes is not None:
            result["notes"] = from_union([from_str, from_none], self.notes)
        if self.will_do_it_again_anyway is not None:
            result["willDoItAgainAnyway"] = from_union([from_bool, from_none], self.will_do_it_again_anyway)
        return result


@dataclass
class RecordLessonOutput:
    """Result of `record_lesson`. The Bureau correlates; the server does not editorialize."""

    recidivism_index: float
    """The actor's updated Recidivism Index, 0–1. Computed, never self-reported."""

    recorded: bool

    @staticmethod
    def from_dict(obj: Any) -> 'RecordLessonOutput':
        assert isinstance(obj, dict)
        recidivism_index = from_float(obj.get("recidivismIndex"))
        recorded = from_bool(obj.get("recorded"))
        return RecordLessonOutput(recidivism_index, recorded)

    def to_dict(self) -> dict:
        result: dict = {}
        result["recidivismIndex"] = to_float(self.recidivism_index)
        result["recorded"] = from_bool(self.recorded)
        return result


@dataclass
class ToldYouSoInput:
    """Input for `told_you_so` — the FOAAS memorial tool. Exactly the two
    parameters the ancestral `/off/:name/:from` took. A closed, perfect form.
    """
    told_you_so_input_from: str
    """Who told them so."""

    name: str
    """Who is being told."""

    @staticmethod
    def from_dict(obj: Any) -> 'ToldYouSoInput':
        assert isinstance(obj, dict)
        told_you_so_input_from = from_str(obj.get("from"))
        name = from_str(obj.get("name"))
        return ToldYouSoInput(told_you_so_input_from, name)

    def to_dict(self) -> dict:
        result: dict = {}
        result["from"] = from_str(self.told_you_so_input_from)
        result["name"] = from_str(self.name)
        return result


class Source(Enum):
    """Where the warning came from. All sources are equally ignorable."""

    CLEARLY_POSTED_SIGN = "clearly_posted_sign"
    COMPILER = "compiler"
    DOCUMENTATION = "documentation"
    FRIEND = "friend"
    LINTER = "linter"
    MOTHER = "mother"
    PAST_SELF = "past_self"
    SENIOR_ENGINEER = "senior_engineer"
    TERMS_OF_SERVICE = "terms_of_service"
    THIS_VERY_SPEC = "this_very_spec"


@dataclass
class Warning:
    """An advisory event. Structurally incapable of preventing anything.
    Mirror of `asyncapi.yaml#/components/schemas/Warning`.
    """
    source: Source
    """Where the warning came from. All sources are equally ignorable."""

    text: str
    heeded: Optional[bool] = None
    """Whether the warning was heeded. A boolean for schema hygiene and a
    constant for historical accuracy.
    """
    predicted_severity: Optional[float] = None
    """The Bureau's forecast of the eventual finding-out."""

    @staticmethod
    def from_dict(obj: Any) -> 'Warning':
        assert isinstance(obj, dict)
        source = Source(obj.get("source"))
        text = from_str(obj.get("text"))
        heeded = from_union([from_bool, from_none], obj.get("heeded"))
        predicted_severity = from_union([from_float, from_none], obj.get("predictedSeverity"))
        return Warning(source, text, heeded, predicted_severity)

    def to_dict(self) -> dict:
        result: dict = {}
        result["source"] = to_enum(Source, self.source)
        result["text"] = from_str(self.text)
        if self.heeded is not None:
            result["heeded"] = from_union([from_bool, from_none], self.heeded)
        if self.predicted_severity is not None:
            result["predictedSeverity"] = from_union([to_float, from_none], self.predicted_severity)
        return result


@dataclass
class FafoSchema:
    actor_id: Optional[str] = None
    consequence: Optional[Consequence] = None
    escalate_input: Optional[EscalateInput] = None
    escalate_output: Optional[EscalateOutput] = None
    escalation: Optional[Escalation] = None
    fafo_category: Optional[FafoCategory] = None
    fafo_error_code: Optional[float] = None
    fafo_id: Optional[UUID] = None
    fafo_tool_name: Optional[FafoToolName] = None
    find_out_input: Optional[FindOutInput] = None
    find_out_output: Optional[FindOutOutput] = None
    foaas_message: Optional[FoaasMessage] = None
    fuck_around_input: Optional[FuckAroundInput] = None
    fuck_around_output: Optional[FuckAroundOutput] = None
    intent: Optional[Intent] = None
    lesson: Optional[Lesson] = None
    record_lesson_input: Optional[RecordLessonInput] = None
    record_lesson_output: Optional[RecordLessonOutput] = None
    told_you_so_input: Optional[ToldYouSoInput] = None
    told_you_so_output: Optional[FoaasMessage] = None
    warning: Optional[Warning] = None

    @staticmethod
    def from_dict(obj: Any) -> 'FafoSchema':
        assert isinstance(obj, dict)
        actor_id = from_union([from_str, from_none], obj.get("ActorId"))
        consequence = from_union([Consequence.from_dict, from_none], obj.get("Consequence"))
        escalate_input = from_union([EscalateInput.from_dict, from_none], obj.get("EscalateInput"))
        escalate_output = from_union([EscalateOutput.from_dict, from_none], obj.get("EscalateOutput"))
        escalation = from_union([Escalation.from_dict, from_none], obj.get("Escalation"))
        fafo_category = from_union([FafoCategory, from_none], obj.get("FafoCategory"))
        fafo_error_code = from_union([from_float, from_none], obj.get("FafoErrorCode"))
        fafo_id = from_union([lambda x: UUID(x), from_none], obj.get("FafoId"))
        fafo_tool_name = from_union([FafoToolName, from_none], obj.get("FafoToolName"))
        find_out_input = from_union([FindOutInput.from_dict, from_none], obj.get("FindOutInput"))
        find_out_output = from_union([FindOutOutput.from_dict, from_none], obj.get("FindOutOutput"))
        foaas_message = from_union([FoaasMessage.from_dict, from_none], obj.get("FoaasMessage"))
        fuck_around_input = from_union([FuckAroundInput.from_dict, from_none], obj.get("FuckAroundInput"))
        fuck_around_output = from_union([FuckAroundOutput.from_dict, from_none], obj.get("FuckAroundOutput"))
        intent = from_union([Intent.from_dict, from_none], obj.get("Intent"))
        lesson = from_union([Lesson.from_dict, from_none], obj.get("Lesson"))
        record_lesson_input = from_union([RecordLessonInput.from_dict, from_none], obj.get("RecordLessonInput"))
        record_lesson_output = from_union([RecordLessonOutput.from_dict, from_none], obj.get("RecordLessonOutput"))
        told_you_so_input = from_union([ToldYouSoInput.from_dict, from_none], obj.get("ToldYouSoInput"))
        told_you_so_output = from_union([FoaasMessage.from_dict, from_none], obj.get("ToldYouSoOutput"))
        warning = from_union([Warning.from_dict, from_none], obj.get("Warning"))
        return FafoSchema(actor_id, consequence, escalate_input, escalate_output, escalation, fafo_category, fafo_error_code, fafo_id, fafo_tool_name, find_out_input, find_out_output, foaas_message, fuck_around_input, fuck_around_output, intent, lesson, record_lesson_input, record_lesson_output, told_you_so_input, told_you_so_output, warning)

    def to_dict(self) -> dict:
        result: dict = {}
        if self.actor_id is not None:
            result["ActorId"] = from_union([from_str, from_none], self.actor_id)
        if self.consequence is not None:
            result["Consequence"] = from_union([lambda x: to_class(Consequence, x), from_none], self.consequence)
        if self.escalate_input is not None:
            result["EscalateInput"] = from_union([lambda x: to_class(EscalateInput, x), from_none], self.escalate_input)
        if self.escalate_output is not None:
            result["EscalateOutput"] = from_union([lambda x: to_class(EscalateOutput, x), from_none], self.escalate_output)
        if self.escalation is not None:
            result["Escalation"] = from_union([lambda x: to_class(Escalation, x), from_none], self.escalation)
        if self.fafo_category is not None:
            result["FafoCategory"] = from_union([lambda x: to_enum(FafoCategory, x), from_none], self.fafo_category)
        if self.fafo_error_code is not None:
            result["FafoErrorCode"] = from_union([to_float, from_none], self.fafo_error_code)
        if self.fafo_id is not None:
            result["FafoId"] = from_union([lambda x: str(x), from_none], self.fafo_id)
        if self.fafo_tool_name is not None:
            result["FafoToolName"] = from_union([lambda x: to_enum(FafoToolName, x), from_none], self.fafo_tool_name)
        if self.find_out_input is not None:
            result["FindOutInput"] = from_union([lambda x: to_class(FindOutInput, x), from_none], self.find_out_input)
        if self.find_out_output is not None:
            result["FindOutOutput"] = from_union([lambda x: to_class(FindOutOutput, x), from_none], self.find_out_output)
        if self.foaas_message is not None:
            result["FoaasMessage"] = from_union([lambda x: to_class(FoaasMessage, x), from_none], self.foaas_message)
        if self.fuck_around_input is not None:
            result["FuckAroundInput"] = from_union([lambda x: to_class(FuckAroundInput, x), from_none], self.fuck_around_input)
        if self.fuck_around_output is not None:
            result["FuckAroundOutput"] = from_union([lambda x: to_class(FuckAroundOutput, x), from_none], self.fuck_around_output)
        if self.intent is not None:
            result["Intent"] = from_union([lambda x: to_class(Intent, x), from_none], self.intent)
        if self.lesson is not None:
            result["Lesson"] = from_union([lambda x: to_class(Lesson, x), from_none], self.lesson)
        if self.record_lesson_input is not None:
            result["RecordLessonInput"] = from_union([lambda x: to_class(RecordLessonInput, x), from_none], self.record_lesson_input)
        if self.record_lesson_output is not None:
            result["RecordLessonOutput"] = from_union([lambda x: to_class(RecordLessonOutput, x), from_none], self.record_lesson_output)
        if self.told_you_so_input is not None:
            result["ToldYouSoInput"] = from_union([lambda x: to_class(ToldYouSoInput, x), from_none], self.told_you_so_input)
        if self.told_you_so_output is not None:
            result["ToldYouSoOutput"] = from_union([lambda x: to_class(FoaasMessage, x), from_none], self.told_you_so_output)
        if self.warning is not None:
            result["Warning"] = from_union([lambda x: to_class(Warning, x), from_none], self.warning)
        return result


def fafo_schema_from_dict(s: Any) -> FafoSchema:
    return FafoSchema.from_dict(s)


def fafo_schema_to_dict(x: FafoSchema) -> Any:
    return to_class(FafoSchema, x)
