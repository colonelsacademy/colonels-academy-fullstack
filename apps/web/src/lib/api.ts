import { createApiClient } from "@colonels-academy/api-client";
import {
  type CatalogCoursesResponse,
  type CatalogInstructorsResponse,
  type DashboardOverviewResponse,
  type CourseDetail,
  type InstructorProfile,
} from "@colonels-academy/contracts";
import { readPublicWebEnv } from "@colonels-academy/config";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  readPublicWebEnv().NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  fetcher: (input, init) =>
    fetch(input, {
      ...init,
      next: {
        revalidate: init?.next?.revalidate ?? 60,
      },
    }),
});

export async function getCourses(): Promise<CourseDetail[]> {
  const data: CatalogCoursesResponse = await apiClient.getCourses();
  return data.items;
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  return apiClient.getCourseBySlug(slug);
}

export async function getInstructors(): Promise<InstructorProfile[]> {
  const data: CatalogInstructorsResponse = await apiClient.getInstructors();
  return data.items;
}

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  return apiClient.getDashboardOverview();
}
