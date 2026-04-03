import type {
  AuthCsrfResponse,
  AuthSessionResponse,
  BunnyPlaybackResponse,
  CatalogCoursesResponse,
  CatalogInstructorsResponse,
  CourseDetail,
  DashboardOverviewResponse,
  LiveSessionsResponse
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
