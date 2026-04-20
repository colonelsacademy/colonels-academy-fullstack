"use client";

import { ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { useState } from "react";

interface Section {
  title: string;
  lectures: { title: string; duration: string; isPreview?: boolean }[];
}

export const CourseContentAccordion = ({ syllabusTitleList }: { syllabusTitleList: string[] }) => {
  // Generate realistic nested mock lectures for each syllabus title to match the Udemy-style design
  const sections: Section[] = (
    syllabusTitleList.length > 0
      ? syllabusTitleList
      : ["Phase 1: Tactical Operations", "Phase 2: Combat Strategy", "Phase 3: Command Ethics"]
  ).map((title, i) => ({
    title,
    lectures: [
      { title: `${title} - Introduction and Overview`, duration: "3:27", isPreview: i === 0 },
      { title: "Key Concepts & Frameworks", duration: "12:15" },
      { title: "Deep Dive: Real-world Case Studies", duration: "8:42" },
      { title: "Summary and Quiz", duration: "2:30" }
    ]
  }));

  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections[0] ? [sections[0].title] : []
  );

  const toggleSection = (sectionTitle: string) => {
    if (expandedSections.includes(sectionTitle)) {
      setExpandedSections(expandedSections.filter((title) => title !== sectionTitle));
    } else {
      setExpandedSections([...expandedSections, sectionTitle]);
    }
  };

  const expandAll = () => {
    if (expandedSections.length === sections.length) {
      setExpandedSections([]);
    } else {
      setExpandedSections(sections.map((section) => section.title));
    }
  };

  const isAllExpanded = expandedSections.length === sections.length;

  return (
    <div id="course-syllabus">
      <h3 className="text-2xl font-bold text-[#0F1C15] mb-6 font-['Rajdhani']">Course content</h3>

      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium mb-4">
        <span>
          {sections.length} sections • {sections.length * 4} lectures • 24h 15m total length
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
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.title);
          return (
            <div key={section.title} className="border-b border-gray-300">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
                  )}
                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                    {section.title}
                  </span>
                </div>
                <span className="text-xs text-gray-600 hidden sm:block">
                  {section.lectures.length} lectures • 26min
                </span>
              </button>

              {isExpanded && (
                <div className="bg-white">
                  {section.lectures.map((lecture, lIdx) => (
                    <div
                      key={`${section.title}-${lecture.title}-${lIdx}`}
                      className="flex items-start sm:items-center justify-between py-3 px-4 sm:px-8 hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <PlayCircle
                          className="w-4 h-4 text-gray-600 mt-1 sm:mt-0 shrink-0"
                          strokeWidth={1.5}
                        />
                        <span
                          className={`text-sm ${lecture.isPreview ? "text-blue-700 underline hover:text-blue-800" : "text-gray-700"}`}
                        >
                          {lecture.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0 mt-1 sm:mt-0">
                        {lecture.isPreview && (
                          <span className="text-blue-700 underline hover:text-blue-800 hidden sm:block">
                            Preview
                          </span>
                        )}
                        <span>{lecture.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sections.length > 5 && (
        <button
          type="button"
          className="w-full py-3 mt-4 border border-gray-300 text-gray-900 font-bold text-sm bg-white hover:bg-gray-50 transition-colors"
        >
          {sections.length - 5} more sections
        </button>
      )}
    </div>
  );
};
