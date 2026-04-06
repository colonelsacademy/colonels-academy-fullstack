import { BookOpen, Download, FileText } from "lucide-react";

const MATERIALS = [
  {
    title: "Nepal Army Officer Cadet Syllabus 2081",
    type: "PDF",
    size: "2.4 MB",
    category: "Army"
  },
  {
    title: "Nepal Police Inspector Syllabus 2081",
    type: "PDF",
    size: "1.8 MB",
    category: "Police"
  },
  { title: "APF Inspector Cadet Syllabus 2081", type: "PDF", size: "1.6 MB", category: "APF" },
  { title: "General Knowledge Handbook", type: "PDF", size: "5.2 MB", category: "General" },
  { title: "Nepal Constitution Summary", type: "PDF", size: "3.1 MB", category: "General" },
  { title: "Physical Fitness Standards Guide", type: "PDF", size: "1.2 MB", category: "Physical" }
];

export default function StudyMaterialsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
          <BookOpen className="w-8 h-8 text-blue-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 font-['Rajdhani'] uppercase mb-3">
          Study Materials
        </h1>
        <p className="text-gray-500">
          Download official syllabi, guides, and preparation materials.
        </p>
      </div>

      <div className="grid gap-4">
        {MATERIALS.map((m) => (
          <div
            key={m.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{m.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{m.category}</span>
                  <span>{m.type}</span>
                  <span>{m.size}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-[#0F1C15] text-white text-xs font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
