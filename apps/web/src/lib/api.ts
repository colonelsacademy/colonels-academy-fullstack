import { createApiClient } from "@colonels-academy/api-client";
import { getAssetUrl, readPublicWebEnv } from "@colonels-academy/config";
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
  EnrolledCourse,
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
        revalidate: process.env.NODE_ENV === "development" ? 0 : (init?.next?.revalidate ?? 60)
      }
    })
});

export async function getCourses(): Promise<CourseDetail[]> {
  try {
    const data: CatalogCoursesResponse = await apiClient.getCourses();
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
    return data.items.map((course) => ({
      ...course,
      ...(course.heroImageUrl ? { heroImageUrl: getAssetUrl(course.heroImageUrl, cdnUrl) } : {})
    }));
  } catch (error) {
    console.error("Failed to fetch courses, using fallback:", error);
    return courseCatalog;
  }
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  try {
    const course = await apiClient.getCourseBySlug(slug);
    if (!course) return null;
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
    return {
      ...course,
      ...(course.heroImageUrl ? { heroImageUrl: getAssetUrl(course.heroImageUrl, cdnUrl) } : {})
    };
  } catch (error) {
    console.error(`Failed to fetch course ${slug}, using fallback:`, error);
    return courseCatalog.find((c) => c.slug === slug) ?? null;
  }
}

export async function getInstructors(): Promise<InstructorProfile[]> {
  try {
    const data: CatalogInstructorsResponse = await apiClient.getInstructors();
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
    return data.items.map((instructor) => ({
      ...instructor,
      ...(instructor.avatarUrl ? { avatarUrl: getAssetUrl(instructor.avatarUrl, cdnUrl) } : {})
    }));
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

export async function getEnrollments(): Promise<EnrolledCourse[]> {
  try {
    const res = await fetch("/api/learning/enrollments", { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
    return (data.items ?? []).map((e: EnrolledCourse) => ({
      ...e,
      ...(e.heroImageUrl ? { heroImageUrl: getAssetUrl(e.heroImageUrl, cdnUrl) } : {})
    }));
  } catch (error) {
    console.error("Failed to fetch enrollments:", error);
    return [];
  }
}
