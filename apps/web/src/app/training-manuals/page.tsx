import { BookMarked, Download, FileText } from "lucide-react";

const MANUALS = [
  { title: "Physical Training Manual - Army Standard", category: "Physical", pages: "48 pages" },
  { title: "Interview Preparation Guide", category: "Interview", pages: "32 pages" },
  { title: "Written Exam Strategy Manual", category: "Written", pages: "56 pages" },
  { title: "Leadership & Command Principles", category: "Leadership", pages: "40 pages" },
  { title: "Nepal Constitution & Law Handbook", category: "Legal", pages: "72 pages" },
  { title: "Current Affairs Monthly Digest", category: "GK", pages: "24 pages" }
];

export default function TrainingManualsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6">
          <BookMarked className="w-8 h-8 text-emerald-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 font-['Rajdhani'] uppercase mb-3">
          Training Manuals
        </h1>
        <p className="text-gray-500">
          Comprehensive guides and manuals for your preparation journey.
        </p>
      </div>

      <div className="grid gap-4">
        {MANUALS.map((m) => (
          <div
            key={m.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{m.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{m.category}</span>
                  <span>{m.pages}</span>
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
