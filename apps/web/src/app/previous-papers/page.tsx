import { Download, FileText, Trophy } from "lucide-react";

const PAPERS = [
  { title: "Nepal Army Officer Cadet - 2080 Written Exam", year: "2080", category: "Army", type: "PDF" },
  { title: "Nepal Army Officer Cadet - 2079 Written Exam", year: "2079", category: "Army", type: "PDF" },
  { title: "Nepal Police Inspector - 2080 Written Exam", year: "2080", category: "Police", type: "PDF" },
  { title: "Nepal Police Inspector - 2079 Written Exam", year: "2079", category: "Police", type: "PDF" },
  { title: "APF Inspector Cadet - 2080 Written Exam", year: "2080", category: "APF", type: "PDF" },
  { title: "APF Inspector Cadet - 2079 Written Exam", year: "2079", category: "APF", type: "PDF" },
];

export default function PreviousPapersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-6">
          <Trophy className="w-8 h-8 text-amber-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 font-['Rajdhani'] uppercase mb-3">Previous Papers</h1>
        <p className="text-gray-500">Practice with real past exam papers from previous years.</p>
      </div>

      <div className="grid gap-4">
        {PAPERS.map((p) => (
          <div key={p.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{p.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{p.category}</span>
                  <span>Year: {p.year}</span>
                  <span>{p.type}</span>
                </div>
              </div>
            </div>
            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[#0F1C15] text-white text-xs font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
