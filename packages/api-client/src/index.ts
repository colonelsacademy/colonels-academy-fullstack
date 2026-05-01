import type {
  AuthCsrfResponse,
  AuthSessionResponse,
  BunnyPlaybackResponse,
  CatalogCoursesResponse,
  CatalogInstructorsResponse,
  CourseDetail,
  CourseLessonsResponse,
  CoursePhasesResponse,
  CourseSubmissionsResponse,
  DashboardOverviewResponse,
  EnrollmentsApiResponse,
  LearningAnalyticsResponse,
  LearningMilestonesResponse,
  LiveSessionsResponse,
  PendingSubmissionReviewsResponse,
  StudySessionMutationResponse,
  SubmissionMutationResponse
} from "@colonels-academy/contracts";

export interface ApiFetcherInit extends RequestInit {
  next?: {
    revalidate?: number;
  };
}

export type ApiFetcher = (input: string, init?: ApiFetcherInit) => Promise<Response>;

export interface CreateApiClientOptions {
  baseUrl: string;
  fetcher?: ApiFetcher;
}

export interface ApiRequestOptions extends Omit<ApiFetcherInit, "headers"> {
  accessToken?: string;
  headers?: HeadersInit;
}

function mergeHeaders(headers?: HeadersInit) {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("accept")) {
    requestHeaders.set("accept", "application/json");
  }

  return requestHeaders;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function createApiClient(options: CreateApiClientOptions) {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const fetcher = options.fetcher ?? (fetch as ApiFetcher);

  async function requestJson<T>(path: string, requestOptions: ApiRequestOptions = {}): Promise<T> {
    const headers = mergeHeaders(requestOptions.headers);

    if (requestOptions.accessToken) {
      headers.set("authorization", `Bearer ${requestOptions.accessToken}`);
    }

    const response = await fetcher(`${baseUrl}${path}`, {
      ...requestOptions,
      headers
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status} for ${path}`);
    }

    return parseJson<T>(response);
  }

  async function getCourseBySlug(slug: string, requestOptions: ApiRequestOptions = {}) {
    try {
      return await requestJson<CourseDetail | null>(`/v1/catalog/courses/${slug}`, requestOptions);
    } catch (error) {
      if (error instanceof Error && error.message.includes("status 404")) {
        return null;
      }

      throw error;
    }
  }

  return {
    getCourses(requestOptions?: ApiRequestOptions) {
      return requestJson<CatalogCoursesResponse>("/v1/catalog/courses", requestOptions);
    },
    getCourseBySlug,
    getCourseLessons(slug: string, requestOptions?: ApiRequestOptions) {
      return requestJson<CourseLessonsResponse>(
        `/v1/catalog/courses/${slug}/lessons`,
        requestOptions
      );
    },
    getCoursePhases(slug: string, requestOptions?: ApiRequestOptions) {
      return requestJson<CoursePhasesResponse>(
        `/v1/catalog/courses/${slug}/phases`,
        requestOptions
      );
    },
    getInstructors(requestOptions?: ApiRequestOptions) {
      return requestJson<CatalogInstructorsResponse>("/v1/catalog/instructors", requestOptions);
    },
    getDashboardOverview(requestOptions?: ApiRequestOptions) {
      return requestJson<DashboardOverviewResponse>(
        "/v1/learning/dashboard/overview",
        requestOptions
      );
    },
    getLiveSessions(requestOptions?: ApiRequestOptions) {
      return requestJson<LiveSessionsResponse>("/v1/learning/live-sessions", requestOptions);
    },
    getEnrollments(requestOptions: ApiRequestOptions = {}) {
      return requestJson<EnrollmentsApiResponse>("/v1/learning/enrollments", {
        ...requestOptions,
        credentials: "include"
      });
    },
    getLearningMilestones(courseSlug: string, requestOptions?: ApiRequestOptions) {
      return requestJson<LearningMilestonesResponse>(
        `/v1/learning/milestones/${courseSlug}`,
        requestOptions
      );
    },
    getLearningAnalytics(courseSlug: string, requestOptions?: ApiRequestOptions) {
      return requestJson<LearningAnalyticsResponse>(
        `/v1/learning/analytics/${courseSlug}`,
        requestOptions
      );
    },
    getCourseSubmissions(courseSlug: string, requestOptions?: ApiRequestOptions) {
      return requestJson<CourseSubmissionsResponse>(
        `/v1/learning/submissions/${courseSlug}`,
        requestOptions
      );
    },
    createSubmission(
      body: {
        courseSlug: string;
        lessonId?: string;
        phaseNumber?: number;
        subjectArea?:
          | "TACTICS_ADMIN"
          | "CURRENT_AFFAIRS"
          | "MILITARY_HISTORY_STRATEGY"
          | "APPRECIATION_PLANS"
          | "LECTURETTE";
        submissionType: "LECTURETTE" | "ESSAY" | "APPRECIATION_PLAN";
        title: string;
        body?: string;
        assetUrl?: string;
      },
      requestOptions: ApiRequestOptions = {}
    ) {
      const headers = new Headers(requestOptions.headers);
      headers.set("content-type", "application/json");

      return requestJson<SubmissionMutationResponse>("/v1/learning/submissions", {
        ...requestOptions,
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
    },
    startStudySession(
      body: {
        courseSlug: string;
        lessonId?: string;
        source?: "WEB" | "MOBILE" | "MANUAL";
        deviceSessionId?: string;
      },
      requestOptions: ApiRequestOptions = {}
    ) {
      const headers = new Headers(requestOptions.headers);
      headers.set("content-type", "application/json");

      return requestJson<StudySessionMutationResponse>("/v1/learning/study-sessions/start", {
        ...requestOptions,
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
    },
    heartbeatStudySession(
      sessionId: string,
      body: {
        deviceSessionId?: string;
      } = {},
      requestOptions: ApiRequestOptions = {}
    ) {
      const headers = new Headers(requestOptions.headers);
      headers.set("content-type", "application/json");

      return requestJson<StudySessionMutationResponse>(
        `/v1/learning/study-sessions/${sessionId}/heartbeat`,
        {
          ...requestOptions,
          method: "POST",
          headers,
          body: JSON.stringify(body)
        }
      );
    },
    endStudySession(
      sessionId: string,
      body: {
        deviceSessionId?: string;
      } = {},
      requestOptions: ApiRequestOptions = {}
    ) {
      const headers = new Headers(requestOptions.headers);
      headers.set("content-type", "application/json");

      return requestJson<StudySessionMutationResponse>(
        `/v1/learning/study-sessions/${sessionId}/end`,
        {
          ...requestOptions,
          method: "POST",
          headers,
          body: JSON.stringify(body)
        }
      );
    },
    getPendingSubmissionReviews(courseSlug: string, requestOptions?: ApiRequestOptions) {
      return requestJson<PendingSubmissionReviewsResponse>(
        `/v1/ds/submissions/${courseSlug}/pending`,
        requestOptions
      );
    },
    reviewSubmission(
      submissionId: string,
      body: {
        status: "REVIEWED" | "REVISION_REQUESTED";
        score?: number;
        maxScore?: number;
        reviewNotes?: string;
        rubricScores?: Array<{ criterion: string; score: number; maxScore: number }>;
      },
      requestOptions: ApiRequestOptions = {}
    ) {
      const headers = new Headers(requestOptions.headers);
      headers.set("content-type", "application/json");

      return requestJson<SubmissionMutationResponse>(`/v1/ds/submissions/${submissionId}/review`, {
        ...requestOptions,
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
    },
    getAuthSession(requestOptions?: ApiRequestOptions) {
      return requestJson<AuthSessionResponse>("/v1/auth/session", requestOptions);
    },
    getCsrfToken(requestOptions?: ApiRequestOptions) {
      return requestJson<AuthCsrfResponse>("/v1/auth/csrf", requestOptions);
    },
    loginWithIdToken(idToken: string, csrfToken: string, requestOptions: ApiRequestOptions = {}) {
      const headers = new Headers(requestOptions.headers);
      headers.set("content-type", "application/json");
      headers.set("x-csrf-token", csrfToken);

      return requestJson<AuthSessionResponse>("/v1/auth/session-login", {
        ...requestOptions,
        method: "POST",
        headers,
        body: JSON.stringify({
          idToken
        })
      });
    },
    getVideoPlayback(bunnyVideoId: string, requestOptions?: ApiRequestOptions) {
      return requestJson<BunnyPlaybackResponse>(
        `/v1/media/video-assets/${bunnyVideoId}/playback`,
        requestOptions
      );
    },
    logoutSession(csrfToken: string, requestOptions: ApiRequestOptions = {}) {
      const headers = new Headers(requestOptions.headers);
      headers.set("x-csrf-token", csrfToken);

      return requestJson<AuthSessionResponse>("/v1/auth/session-logout", {
        ...requestOptions,
        method: "POST",
        headers
      });
    }
  };
}
