import type {
  CourseLessonsResponse,
  CourseSubmissionsResponse,
  StudySessionMutationResponse,
  SubjectArea,
  SubmissionMutationResponse,
  SubmissionType
} from "@colonels-academy/contracts";

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API returned malformed JSON (${text.slice(0, 80)})`);
  }
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    credentials: "same-origin",
    ...init
  });

  if (!response.ok) {
    const errorBody = await parseJson<{ message?: string }>(response).catch(
      () => ({}) as { message?: string }
    );
    throw new Error(errorBody.message ?? `Request failed (${response.status})`);
  }

  return parseJson<T>(response);
}

export function getCourseLessonsForClassroom(slug: string) {
  return requestJson<CourseLessonsResponse>(
    `/api/catalog/courses/${encodeURIComponent(slug)}/lessons`
  );
}

export function getCourseSubmissionsForClassroom(slug: string) {
  return requestJson<CourseSubmissionsResponse>(
    `/api/learning/submissions/${encodeURIComponent(slug)}`
  );
}

export function createClassroomSubmission(body: {
  courseSlug: string;
  lessonId?: string;
  phaseNumber?: number;
  subjectArea?: SubjectArea;
  submissionType: SubmissionType;
  title: string;
  body?: string;
  assetUrl?: string;
}) {
  return requestJson<SubmissionMutationResponse>("/api/learning/submissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

export function attemptClassroomQuizQuestion(body: {
  questionId: string;
  selectedOptionIndex: number;
  timeTakenMs?: number;
  sessionId?: string;
}) {
  return requestJson<{
    ok: true;
    isCorrect: boolean;
    explanation: string | null;
    quizSessionId?: string;
    mockExamProgress?: {
      totalQuestions: number;
      attemptedQuestions: number;
      finished: boolean;
    };
  }>("/api/learning/quiz/attempt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

export function updateClassroomLessonProgress(
  lessonId: string,
  status: "IN_PROGRESS" | "COMPLETED"
) {
  return requestJson<{
    ok: true;
    lessonId: string;
    status: "IN_PROGRESS" | "COMPLETED";
  }>(`/api/learning/progress/${encodeURIComponent(lessonId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });
}

export async function uploadClassroomAsset(file: File, folder = "submissions/lecturettes") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = await parseJson<{ error?: string }>(response).catch(
      () => ({}) as { error?: string }
    );
    throw new Error(errorBody.error ?? `Upload failed (${response.status})`);
  }

  return parseJson<{ url: string; path: string }>(response);
}

export function startClassroomStudySession(body: {
  courseSlug: string;
  lessonId?: string;
  deviceSessionId?: string;
}) {
  return requestJson<StudySessionMutationResponse>("/api/learning/study-sessions/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...body,
      source: "WEB"
    })
  });
}

export function heartbeatClassroomStudySession(
  sessionId: string,
  body: { deviceSessionId?: string } = {}
) {
  return requestJson<StudySessionMutationResponse>(
    `/api/learning/study-sessions/${encodeURIComponent(sessionId)}/heartbeat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );
}

export function endClassroomStudySession(
  sessionId: string,
  body: { deviceSessionId?: string } = {},
  options: { keepalive?: boolean } = {}
) {
  return requestJson<StudySessionMutationResponse>(
    `/api/learning/study-sessions/${encodeURIComponent(sessionId)}/end`,
    {
      method: "POST",
      keepalive: options.keepalive ?? false,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );
}
