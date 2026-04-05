export interface MockTestSubmitPayload {
  phone?: string
  score: number
  totalMarks: number
  timeTaken: number
  answers: Record<number, string>
  userId?: string | null
}

export interface MockTestSavedResult {
  _id: string
  phone: string
  score: number | null
  totalMarks: number | null
  timeTaken: number | null
  passed: boolean | null
  answers: Record<string, string>
  userId: string | null
  isGuest: boolean
  isCleared: boolean
  createdAt: string
}

interface ApiSavedShape {
  id: string
  phone?: string
  score: number | null
  totalMarks: number | null
  timeTaken: number | null
  passed: boolean | null
  answers?: Record<string, string>
  userId?: string | null
  isGuest?: boolean
  isCleared?: boolean
  createdAt: string
}

function toSavedResult(data: ApiSavedShape): MockTestSavedResult {
  return {
    _id: data.id,
    phone: data.phone ?? "",
    score: data.score ?? null,
    totalMarks: data.totalMarks ?? null,
    timeTaken: data.timeTaken ?? null,
    passed: data.passed ?? null,
    answers: data.answers ?? {},
    userId: data.userId ?? null,
    isGuest: data.isGuest ?? false,
    isCleared: data.isCleared ?? false,
    createdAt: data.createdAt,
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function submitMockResult(
  payload: MockTestSubmitPayload
): Promise<MockTestSavedResult> {
  const { score, totalMarks, timeTaken, answers } = payload

  const stringAnswers = Object.fromEntries(
    Object.entries(answers).map(([k, v]) => [String(k), v])
  ) as Record<string, string>

  const res = await fetch("/api/mock-test/results", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      score,
      totalMarks,
      timeTaken,
      answers: stringAnswers,
    }),
  })

  if (!res.ok) {
    const errBody = (await parseJson<{ message?: string }>(res).catch(() => ({}))) as {
      message?: string;
    };
    const message = typeof errBody.message === "string" ? errBody.message : undefined;
    throw new Error(message ?? `Save failed (${res.status})`);
  }

  const json = await parseJson<{ result: ApiSavedShape }>(res);
  if (!json?.result?.id) {
    throw new Error("Invalid response from server.");
  }

  return toSavedResult(json.result);
}

export async function getMyLatestMockResult(
  _uid: string
): Promise<MockTestSavedResult | null> {
  try {
    const res = await fetch("/api/mock-test/latest", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await parseJson<{ result: ApiSavedShape | null }>(res);
    const row = json?.result;
    if (!row?.id || row.score === null || row.score === undefined) {
      return null;
    }

    return toSavedResult(row);
  } catch (err) {
    console.error("getMyLatestMockResult failed:", err);
    return null;
  }
}

export async function clearMyMockScore(resultId: string): Promise<void> {
  const res = await fetch(`/api/mock-test/results/${encodeURIComponent(resultId)}/clear`, {
    method: "PATCH",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!res.ok && res.status !== 204) {
    const errBody = (await parseJson<{ message?: string }>(res).catch(() => ({}))) as {
      message?: string;
    };
    const message = typeof errBody.message === "string" ? errBody.message : undefined;
    throw new Error(message ?? `Clear failed (${res.status})`);
  }
}

/** @deprecated Guest linking is handled via session login; kept for API compatibility. */
export async function linkResultToUser(
  _resultId: string,
  _uid: string
): Promise<void> {
  // No-op: results are created for the authenticated user only.
}
