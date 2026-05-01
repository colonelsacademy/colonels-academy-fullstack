"use client";

import VideoPlayer from "@/components/ui/VideoPlayer";
import type { CourseDetail } from "@colonels-academy/contracts";
import { Award, ChevronDown, ChevronUp, Lock, PlayCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  contentType: string;
  durationMinutes: number | null;
  accessKind: string;
  position: number;
  lessonContent?: {
    videoId?: string;
  };
}

interface CourseContentAccordionProps {
  course: CourseDetail;
}

export const CourseContentAccordion = ({ course }: CourseContentAccordionProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    // Fetch real course curriculum
    fetch(`/api/catalog/courses/${course.slug}/curriculum`)
      .then((res) => res.json())
      .then((data) => {
        if (data.modules) {
          setModules(data.modules);
          // Expand first module by default
          if (data.modules.length > 0) {
            setExpandedSections([data.modules[0].id]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch curriculum:", err);
        setLoading(false);
      });
  }, [course.slug]);

  const toggleSection = (moduleId: string) => {
    if (expandedSections.includes(moduleId)) {
      setExpandedSections(expandedSections.filter((id) => id !== moduleId));
    } else {
      setExpandedSections([...expandedSections, moduleId]);
    }
  };

  const expandAll = () => {
    if (expandedSections.length === modules.length) {
      setExpandedSections([]);
    } else {
      setExpandedSections(modules.map((m) => m.id));
    }
  };

  const handleLessonClick = async (lesson: Lesson) => {
    if (lesson.accessKind === "PREVIEW") {
      // Fetch full lesson details including video ID
      try {
        const res = await fetch(`/api/catalog/courses/${course.slug}/lessons/${lesson.id}`);
        const lessonData = await res.json();
        setPreviewLesson(lessonData);
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
        // Fallback to basic lesson data
        setPreviewLesson(lesson);
      }
    }
  };

  const closePreview = () => {
    setPreviewLesson(null);
  };

  const isAllExpanded = expandedSections.length === modules.length;

  // Calculate total stats
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalMinutes = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationMinutes || 0), 0),
    0
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "TBD";
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const getModuleDuration = (module: Module) => {
    const totalMin = module.lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    return formatDuration(totalMin);
  };

  if (loading) {
    return (
      <div id="course-syllabus">
        <h3 className="text-2xl font-bold text-[#0F1C15] mb-6 font-['Rajdhani']">Course content</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="course-syllabus">
        <h3 className="text-2xl font-bold text-[#0F1C15] mb-6 font-['Rajdhani']">Course content</h3>

        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium mb-4">
          <span>
            {modules.length} sections • {totalLessons} lectures •{" "}
            {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${remainingMinutes}m`} total
            length
          </span>
          <button
            type="button"
            onClick={expandAll}
            className="text-blue-700 font-bold hover:text-blue-800 transition-colors"
          >
            {isAllExpanded ? "Collapse all sections" : "Expand all sections"}
          </button>
        </div>

        <div className="border border-gray-300 overflow-hidden border-b-0 shadow-sm">
          {modules.map((module) => {
            const isExpanded = expandedSections.includes(module.id);
            return (
              <div key={module.id} className="border-b border-gray-300">
                <button
                  type="button"
                  onClick={() => toggleSection(module.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
                    )}
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      {module.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 hidden sm:block">
                    {module.lessons.length} lectures • {getModuleDuration(module)}
                  </span>
                </button>

                {isExpanded && (
                  <div className="bg-white">
                    {module.lessons.map((lesson) => {
                      const isPreview = lesson.accessKind === "PREVIEW";
                      const isLocked = !isPreview;

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => handleLessonClick(lesson)}
                          disabled={isLocked}
                          className={`w-full flex items-start sm:items-center justify-between py-3 px-4 sm:px-8 transition-colors text-left ${
                            isPreview ? "hover:bg-blue-50 cursor-pointer" : "cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-4 flex-1">
                            {isLocked ? (
                              <Lock
                                className="w-4 h-4 text-gray-400 mt-1 sm:mt-0 shrink-0"
                                strokeWidth={1.5}
                              />
                            ) : (
                              <PlayCircle
                                className="w-4 h-4 text-blue-600 mt-1 sm:mt-0 shrink-0"
                                strokeWidth={1.5}
                              />
                            )}
                            <span
                              className={`text-sm ${
                                isPreview ? "text-blue-700 font-medium" : "text-gray-700"
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0 mt-1 sm:mt-0">
                            {isPreview && (
                              <span className="text-blue-700 font-bold hidden sm:block">
                                Preview
                              </span>
                            )}
                            <span>{formatDuration(lesson.durationMinutes)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {modules.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>Course curriculum will be available soon.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Course Preview
                </h3>
                <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Video Player */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{previewLesson.title}</h3>
                <p className="text-sm text-gray-600">
                  {formatDuration(previewLesson.durationMinutes)} • Free Preview
                </p>
              </div>

              {previewLesson.lessonContent?.videoId ? (
                <VideoPlayer videoId={previewLesson.lessonContent.videoId} autoplay={true} />
              ) : (
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <p className="text-white">Video preview not available</p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  This is a free preview. Enroll to access all {totalLessons} lectures and unlock
                  the full course.
                </p>
                <button
                  type="button"
                  onClick={closePreview}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#0B1120] to-[#1a2838] text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 text-base uppercase tracking-wider group shadow-lg"
                >
                  <Award className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Enroll Now</span>
                </button>
                <p className="text-center text-xs text-gray-500 mt-3 font-medium">
                  NPR {course.priceNpr.toLocaleString()} • Full Course Access
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
