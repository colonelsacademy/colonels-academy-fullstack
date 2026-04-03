"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Tab {
  id: string;
  label: string;
}

interface InstructorTabsProps {
  activeTab: string;
  tabs: Tab[];
}

export default function InstructorTabs({ activeTab, tabs }: InstructorTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("mentorCategory");
    else params.set("mentorCategory", id);
    router.push(`/?${params.toString()}#mentors`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 p-1.5 bg-white rounded-full border border-gray-200 shadow-sm overflow-x-auto max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => handleTab(tab.id)}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-[#0F1C15] text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
