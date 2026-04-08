import {
  resolveAssessmentComponent,
  courseAssessmentWeightingSchema,
  staffCollegeCommandAssessmentWeighting,
  type AnalyticsWeightingMode,
  type CourseAssessmentWeighting,
  type SubjectArea,
  type SubjectPerformanceDetail,
  type WeightedComponentPerformanceDetail
} from "@colonels-academy/contracts";

export const SUBJECT_LABELS: Record<SubjectArea, string> = {
  TACTICS_ADMIN: "Tactics & Administration",
  CURRENT_AFFAIRS: "Contemporary Affairs",
  MILITARY_HISTORY_STRATEGY: "Military History & Strategic Thoughts",
  APPRECIATION_PLANS: "Military Appreciation & Plans",
  LECTURETTE: "Lecturette / Oral Presentation"
};

export type WeightedAttemptSnapshot = {
  questionId: string;
  isCorrect: boolean;
  difficulty: number;
  attemptedAt: Date;
  lessonTitle?: string | null;
  subjectArea?: SubjectArea | null;
  componentCode?: string | null;
  componentLabel?: string | null;
};

type AccuracySnapshot = {
  latestAccuracyPercent: number;
  weightedAccuracyPercent: number;
  latestAttemptCount: number;
  weightedQuestionVolume: number;
  latestAttemptedAt?: string;
};

export type WeightedCoursePerformance = {
  assessmentWeighting?: CourseAssessmentWeighting;
  subjects: SubjectPerformanceDetail[];
  weightingMode: AnalyticsWeightingMode;
  weightingLabel?: string;
  overallWeightedReadinessPercent?: number;
  rawScorePercent: number;
  rawCorrectCount: number;
  rawQuestionCount: number;
};

function getDefaultAssessmentWeighting(courseSlug: string) {
  if (courseSlug === "staff-college-command") {
    return staffCollegeCommandAssessmentWeighting;
  }

  return undefined;
}

export function parseAssessmentWeighting(
  courseSlug: string,
  value: unknown
): CourseAssessmentWeighting | undefined {
  const parsed = courseAssessmentWeightingSchema.safeParse(value);

  if (parsed.success) {
    return {
      label: parsed.data.label,
      subjects: parsed.data.subjects.map((subjectWeight) => ({
        subjectArea: subjectWeight.subjectArea,
        label: subjectWeight.label,
        weightPercent: subjectWeight.weightPercent,
        ...(subjectWeight.components
          ? {
              components: subjectWeight.components.map((componentWeight) => ({
                code: componentWeight.code,
                label: componentWeight.label,
                weightPercent: componentWeight.weightPercent
              }))
            }
          : {})
      }))
    };
  }

  return getDefaultAssessmentWeighting(courseSlug);
}

function summarizeAttempts(attempts: WeightedAttemptSnapshot[]): AccuracySnapshot {
  const latestAttemptCount = attempts.length;
  const correctCount = attempts.filter((attempt) => attempt.isCorrect).length;
  const weightedQuestionVolume = attempts.reduce((sum, attempt) => sum + attempt.difficulty, 0);
  const weightedCorrect = attempts.reduce(
    (sum, attempt) => sum + (attempt.isCorrect ? attempt.difficulty : 0),
    0
  );
  const latestAttemptedAt = attempts.reduce<Date | undefined>((latest, attempt) => {
    if (!latest || attempt.attemptedAt > latest) {
      return attempt.attemptedAt;
    }

    return latest;
  }, undefined);

  return {
    latestAccuracyPercent:
      latestAttemptCount > 0 ? Math.round((correctCount / latestAttemptCount) * 100) : 0,
    weightedAccuracyPercent:
      weightedQuestionVolume > 0 ? Math.round((weightedCorrect / weightedQuestionVolume) * 100) : 0,
    latestAttemptCount,
    weightedQuestionVolume,
    ...(latestAttemptedAt ? { latestAttemptedAt: latestAttemptedAt.toISOString() } : {})
  };
}

export function computeWeightedCoursePerformance(input: {
  courseSlug: string;
  assessmentWeighting: unknown;
  attempts: WeightedAttemptSnapshot[];
}): WeightedCoursePerformance {
  const latestAttemptByQuestion = new Map<string, WeightedAttemptSnapshot>();

  for (const attempt of input.attempts) {
    if (!attempt.subjectArea) {
      continue;
    }

    const resolvedComponent = resolveAssessmentComponent({
      courseSlug: input.courseSlug,
      subjectArea: attempt.subjectArea,
      title: attempt.lessonTitle,
      componentCode: attempt.componentCode,
      componentLabel: attempt.componentLabel
    });

    const dedupeKey = `${attempt.subjectArea}:${attempt.questionId}`;
    const existing = latestAttemptByQuestion.get(dedupeKey);

    const normalizedAttempt: WeightedAttemptSnapshot = {
      ...attempt,
      ...(resolvedComponent
        ? {
            componentCode: resolvedComponent.componentCode,
            componentLabel: resolvedComponent.componentLabel
          }
        : {})
    };

    if (!existing || normalizedAttempt.attemptedAt > existing.attemptedAt) {
      latestAttemptByQuestion.set(dedupeKey, normalizedAttempt);
    }
  }

  const latestAttempts = Array.from(latestAttemptByQuestion.values());
  const rawQuestionCount = latestAttempts.length;
  const rawCorrectCount = latestAttempts.filter((attempt) => attempt.isCorrect).length;
  const rawScorePercent =
    rawQuestionCount > 0 ? Math.round((rawCorrectCount / rawQuestionCount) * 100) : 0;

  const attemptsBySubject = new Map<SubjectArea, WeightedAttemptSnapshot[]>();

  for (const attempt of latestAttempts) {
    const subjectArea = attempt.subjectArea;

    if (!subjectArea) {
      continue;
    }

    const bucket = attemptsBySubject.get(subjectArea) ?? [];
    bucket.push(attempt);
    attemptsBySubject.set(subjectArea, bucket);
  }

  const assessmentWeighting = parseAssessmentWeighting(input.courseSlug, input.assessmentWeighting);
  const subjectWeightByArea = new Map(
    (assessmentWeighting?.subjects ?? []).map((subjectWeight) => [
      subjectWeight.subjectArea,
      subjectWeight
    ])
  );

  let usedComponentWeighting = false;

  const subjects: SubjectPerformanceDetail[] = Object.entries(SUBJECT_LABELS).map(
    ([subjectArea, label]) => {
      const subjectAttempts = attemptsBySubject.get(subjectArea as SubjectArea) ?? [];
      const baseSummary = summarizeAttempts(subjectAttempts);
      const configuredWeight = subjectWeightByArea.get(subjectArea as SubjectArea);
      let examWeightedReadinessPercent = baseSummary.weightedAccuracyPercent;
      let components: WeightedComponentPerformanceDetail[] | undefined;

      if (configuredWeight?.components?.length) {
        const attemptsByComponent = new Map<string, WeightedAttemptSnapshot[]>();

        for (const attempt of subjectAttempts) {
          if (!attempt.componentCode) {
            continue;
          }

          const componentAttempts = attemptsByComponent.get(attempt.componentCode) ?? [];
          componentAttempts.push(attempt);
          attemptsByComponent.set(attempt.componentCode, componentAttempts);
        }

        const hasConfiguredComponentAttempts = configuredWeight.components.some(
          (componentWeight) => (attemptsByComponent.get(componentWeight.code)?.length ?? 0) > 0
        );

        if (hasConfiguredComponentAttempts) {
          usedComponentWeighting = true;
          components = configuredWeight.components.map((componentWeight) => {
            const componentSummary = summarizeAttempts(
              attemptsByComponent.get(componentWeight.code) ?? []
            );

            return {
              code: componentWeight.code,
              label:
                subjectAttempts.find((attempt) => attempt.componentCode === componentWeight.code)
                  ?.componentLabel ?? componentWeight.label,
              weightPercent: componentWeight.weightPercent,
              latestAccuracyPercent: componentSummary.latestAccuracyPercent,
              weightedAccuracyPercent: componentSummary.weightedAccuracyPercent,
              latestAttemptCount: componentSummary.latestAttemptCount,
              weightedQuestionVolume: componentSummary.weightedQuestionVolume,
              ...(componentSummary.latestAttemptedAt
                ? { latestAttemptedAt: componentSummary.latestAttemptedAt }
                : {})
            };
          });

          const totalComponentWeight = configuredWeight.components.reduce(
            (sum, componentWeight) => sum + componentWeight.weightPercent,
            0
          );

          if (totalComponentWeight > 0) {
            examWeightedReadinessPercent = Math.round(
              components.reduce(
                (sum, component) =>
                  sum + component.weightedAccuracyPercent * component.weightPercent,
                0
              ) / totalComponentWeight
            );
          }
        }
      }

      return {
        subjectArea: subjectArea as SubjectArea,
        label,
        ...(configuredWeight ? { configuredWeightPercent: configuredWeight.weightPercent } : {}),
        latestAccuracyPercent: baseSummary.latestAccuracyPercent,
        weightedAccuracyPercent: baseSummary.weightedAccuracyPercent,
        examWeightedReadinessPercent,
        latestAttemptCount: baseSummary.latestAttemptCount,
        weightedQuestionVolume: baseSummary.weightedQuestionVolume,
        ...(baseSummary.latestAttemptedAt
          ? { latestAttemptedAt: baseSummary.latestAttemptedAt }
          : {}),
        ...(components ? { components } : {})
      };
    }
  );

  let weightingMode: AnalyticsWeightingMode = "none";
  let overallWeightedReadinessPercent: number | undefined;
  let weightingLabel: string | undefined;

  if (assessmentWeighting) {
    const totalSubjectWeight = assessmentWeighting.subjects.reduce(
      (sum, subjectWeight) => sum + subjectWeight.weightPercent,
      0
    );

    if (totalSubjectWeight > 0) {
      weightingMode = usedComponentWeighting ? "subject-component" : "subject";
      overallWeightedReadinessPercent = Math.round(
        subjects.reduce((sum, subject) => {
          const weight = subjectWeightByArea.get(subject.subjectArea)?.weightPercent ?? 0;

          return sum + subject.examWeightedReadinessPercent * weight;
        }, 0) / totalSubjectWeight
      );
      weightingLabel = assessmentWeighting.label;
    }
  }

  return {
    ...(assessmentWeighting ? { assessmentWeighting } : {}),
    subjects,
    weightingMode,
    ...(weightingLabel ? { weightingLabel } : {}),
    ...(overallWeightedReadinessPercent !== undefined ? { overallWeightedReadinessPercent } : {}),
    rawScorePercent,
    rawCorrectCount,
    rawQuestionCount
  };
}
