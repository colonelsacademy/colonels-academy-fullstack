import type { SubjectArea } from "./types";

export interface AssessmentComponentResolution {
  componentCode: string;
  componentLabel: string;
}

type ComponentRule = {
  code: string;
  label: string;
  patterns: string[];
};

const TACTICS_ADMIN_RULES: ComponentRule[] = [
  {
    code: "MILITARY_LAW",
    label: "Military Law",
    patterns: ["military act", "military law", " laws ", " law ", "regulation", "legal"]
  },
  {
    code: "ADMINISTRATION",
    label: "Administration",
    patterns: [
      "admin",
      "administration",
      "leadership",
      "man management",
      "organization of nepali army",
      "organisation of nepali army",
      "logistic",
      "logistics",
      "training",
      "war and peace"
    ]
  },
  {
    code: "TACTICS",
    label: "Tactics",
    patterns: [
      "tactics",
      "tactic",
      "operation of war",
      "patrol",
      "patrolling",
      "raid",
      "ambush",
      "basic arms",
      "infantry",
      "armor",
      "armour",
      "artillery",
      "air defence",
      "air defense",
      "engineer",
      "signal",
      "special forces",
      "mountain",
      "jungle",
      "counter insurgency",
      "counterinsurgency",
      "built up area",
      "peacekeeping",
      "rules of engagement",
      "intelligence",
      "security",
      "tactical",
      "scenario"
    ]
  }
];

const CURRENT_AFFAIRS_RULES: ComponentRule[] = [
  {
    code: "MILITARY_TECH",
    label: "Military Technology",
    patterns: [
      "military technology",
      "technology",
      " tech ",
      "cyber",
      "drone",
      "artificial intelligence",
      "ai "
    ]
  },
  {
    code: "REGIONAL",
    label: "Regional",
    patterns: ["regional", "south asia", "india", "china", "neighbor", "neighbour"]
  },
  {
    code: "INTERNATIONAL",
    label: "International",
    patterns: [
      "international",
      "global",
      " united nations ",
      " un ",
      "nato",
      "world",
      "conflict",
      "geopolit"
    ]
  },
  {
    code: "NATIONAL",
    label: "National",
    patterns: ["national", "nepal", "domestic", "defence", "defense", "national security"]
  }
];

function normalize(input?: string | null) {
  return ` ${String(input ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function scoreRule(normalizedTitle: string, rule: ComponentRule) {
  return rule.patterns.reduce(
    (score, pattern) => (normalizedTitle.includes(normalize(pattern)) ? score + 1 : score),
    0
  );
}

function deriveByRules(title: string | null | undefined, rules: ComponentRule[]) {
  const normalizedTitle = normalize(title);
  const scored = rules
    .map((rule) => ({
      rule,
      score: scoreRule(normalizedTitle, rule)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) {
    return undefined;
  }

  if (scored.length > 1 && scored[0]?.score === scored[1]?.score) {
    return undefined;
  }

  const bestMatch = scored[0]?.rule;

  return bestMatch
    ? {
        componentCode: bestMatch.code,
        componentLabel: bestMatch.label
      }
    : undefined;
}

export function resolveAssessmentComponent(input: {
  courseSlug: string;
  subjectArea?: SubjectArea | null | undefined;
  title?: string | null | undefined;
  componentCode?: string | null | undefined;
  componentLabel?: string | null | undefined;
}): AssessmentComponentResolution | undefined {
  if (input.componentCode && input.componentLabel) {
    return {
      componentCode: input.componentCode,
      componentLabel: input.componentLabel
    };
  }

  if (input.courseSlug !== "staff-college-command" || !input.subjectArea) {
    return undefined;
  }

  switch (input.subjectArea) {
    case "TACTICS_ADMIN":
      return deriveByRules(input.title, TACTICS_ADMIN_RULES);
    case "CURRENT_AFFAIRS":
      return deriveByRules(input.title, CURRENT_AFFAIRS_RULES);
    default:
      return undefined;
  }
}
