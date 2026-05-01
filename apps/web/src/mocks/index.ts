/**
 * Mock data for local development and CI builds when the API is unavailable.
 *
 * RULES:
 * 1. All mock data MUST satisfy the Zod schemas in @colonels-academy/contracts.
 * 2. When the real API endpoint is ready, delete the corresponding mock file
 *    and swap the import in the component — in the SAME pull request.
 * 3. Do NOT import from this directory in production server components.
 *    Mocks are for apps/web page stubs during Phase 3 parallel development only.
 */

export { mockCourses } from "./courses.mock";
export { mockInstructors } from "./instructors.mock";
export { mockLessons, mockModules } from "./lessons.mock";
