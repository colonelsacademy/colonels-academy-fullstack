import { createApiClient } from "@colonels-academy/api-client";
import { readPublicWebEnv } from "@colonels-academy/config";
import {
  courseCatalog,
  dashboardSnapshot,
  instructors as fallbackInstructors
} from "@colonels-academy/contracts";
import type {
  CatalogCoursesResponse,
  CatalogInstructorsResponse,
  CourseDetail,
  DashboardOverviewResponse,
  InstructorProfile
} from "@colonels-academy/contracts";

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
        revalidate: init?.next?.revalidate ?? 60
      }
    })
});

export async function getCourses(): Promise<CourseDetail[]> {
  try {
    const data: CatalogCoursesResponse = await apiClient.getCourses();
    return data.items;
  } catch (error) {
    console.error("Failed to fetch courses, using fallback:", error);
    return courseCatalog;
  }
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  try {
    return await apiClient.getCourseBySlug(slug);
  } catch (error) {
    console.error(`Failed to fetch course ${slug}, using fallback:`, error);
    return courseCatalog.find((c) => c.slug === slug) ?? null;
  }
}

export async function getInstructors(): Promise<InstructorProfile[]> {
  try {
    const data: CatalogInstructorsResponse = await apiClient.getInstructors();
    return data.items;
  } catch (error) {
    console.error("Failed to fetch instructors, using fallback:", error);
    return fallbackInstructors;
  }
}

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  try {
    return await apiClient.getDashboardOverview();
  } catch (error) {
    console.error("Failed to fetch dashboard overview, using fallback:", error);
    return {
      authenticated: false,
      user: null,
      overview: {
        progressPercent: dashboardSnapshot.progressPercent,
        enrolledCourses: dashboardSnapshot.enrolledCourses,
        upcomingSessionCount: dashboardSnapshot.upcomingSessionCount,
        pendingTasks: dashboardSnapshot.pendingTasks,
        completionTarget: dashboardSnapshot.completionTarget
      },
      note: "Data is currently served from the local starter snapshot (API unreachable)."
    };
  }
}
