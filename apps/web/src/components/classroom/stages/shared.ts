import type { LessonDetail, SubmissionType } from "@colonels-academy/contracts";

export type StageLesson = {
  id: string;
  title: string;
  synopsis: string;
  durationLabel: string;
  contentType: LessonDetail["contentType"];
  learningMode?: LessonDetail["learningMode"];
  progressStatus: LessonDetail["progressStatus"];
  isLocked: boolean;
  unlockRequirement?: string;
  phaseNumber?: number;
  subjectArea?: LessonDetail["subjectArea"];
  videoId?: string;
  meetingUrl?: string;
  pdfUrl?: string;
  lessonContent?: LessonDetail["lessonContent"];
  quizQuestions?: LessonDetail["quizQuestions"];
};

export function extractLessonContentLines(content?: LessonDetail["lessonContent"]) {
  if (!content) {
    return [];
  }

  if (content.mode === "cue") {
    return content.segments.map((segment) => segment.text);
  }

  return content.blocks.flatMap((block) => {
    switch (block.type) {
      case "heading":
      case "paragraph":
        return [block.text];
      case "bulletList":
        return block.items;
      default:
        return [];
    }
  });
}

export function getSubmissionBlueprint(lesson: StageLesson): {
  submissionType: SubmissionType;
  title: string;
  description: string;
  accept: string;
  ctaLabel: string;
} | null {
  if (lesson.learningMode !== "PRACTICE" && lesson.learningMode !== "FEEDBACK") {
    return null;
  }

  if (lesson.subjectArea === "LECTURETTE") {
    return {
      submissionType: "LECTURETTE",
      title: "Recorded Presentation",
      description:
        "Upload your lecturette recording and notes so the instructor can review structure, confidence, and delivery.",
      accept: "video/*,audio/*,.pdf,.doc,.docx",
      ctaLabel: "Submit Presentation"
    };
  }

  if (lesson.subjectArea === "APPRECIATION_PLANS") {
    return {
      submissionType: "APPRECIATION_PLAN",
      title: "Appreciation / Plan Submission",
      description:
        "Write your appreciation, plan, or map-based answer here and attach any supporting file for faculty review.",
      accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg",
      ctaLabel: "Submit Plan"
    };
  }

  return {
    submissionType: "ESSAY",
    title: "Written Response",
    description:
      "Draft your answer, analysis, or notes here so instructors can review written clarity, argument flow, and exam structure.",
    accept: ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg",
    ctaLabel: "Submit Response"
  };
}

export function formatSubject(subjectArea?: LessonDetail["subjectArea"]) {
  if (!subjectArea) {
    return null;
  }

  return subjectArea
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
