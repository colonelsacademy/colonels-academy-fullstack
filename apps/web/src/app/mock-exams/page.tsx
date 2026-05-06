"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Clock, Target } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  position: string;
  description?: string;
  _count?: { mockTests: number };
}

interface MockTest {
  id: string;
  title: string;
  description?: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScore: number;
  accessType: string;
  priceNpr?: number;
  bestScore?: number;
  attemptCount?: number;
  hasPurchased?: boolean;
}

type Page = "position" | "subjects" | "tests" | "loading";

export default function MockExamsPage() {
  const router = useRouter();
  const [page, setPage] = useState<Page>("position");
  const [position, setPosition] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subjects
  const fetchSubjects = async (pos: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/mock-tests/subjects?position=${encodeURIComponent(pos)}`);
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
      setPage("subjects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tests for subject
  const fetchTests = async (subjectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/mock-tests/list?subjectId=${encodeURIComponent(subjectId)}`);
      if (!response.ok) throw new Error("Failed to fetch tests");
      const data = await response.json();
      setTests(data);
      setPage("tests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  const handlePositionSelect = (pos: string) => {
    setPosition(pos);
    fetchSubjects(pos);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    fetchTests(subject.id);
  };

  const handleStartTest = (testId: string) => {
    router.push(`/mock-exams/${testId}/attempt`);
  };

  const handleBack = () => {
    if (page === "subjects") {
      setPage("position");
      setPosition("");
      setSubjects([]);
    } else if (page === "tests") {
      setPage("subjects");
      setSelectedSubject(null);
      setTests([]);
    }
  };

  // ── POSITION SELECTION ──
  if (page === "position") {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#0F1C15] font-['Rajdhani'] mb-2">
              Mock Exams
            </h1>
            <p className="text-gray-600">Select your position to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            {["Officer Cadet", "ASI"].map((pos) => (
              <button
                key={pos}
                onClick={() => handlePositionSelect(pos)}
                className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg hover:border-[#D4AF37] transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0F1C15] flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1C15] font-['Rajdhani'] mb-2">
                  {pos}
                </h3>
                <p className="text-sm text-gray-600">
                  {pos === "Officer Cadet"
                    ? "Prepare for Officer Cadet examination"
                    : "Prepare for ASI examination"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── SUBJECTS SELECTION ──
  if (page === "subjects") {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#0F1C15] font-bold mb-8 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#0F1C15] font-['Rajdhani'] mb-2">
              {position} - Select Subject
            </h1>
            <p className="text-gray-600">Choose a subject to view available tests</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#D4AF37] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F1C15] font-['Rajdhani'] mb-1">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{subject.description}</p>
                  <div className="text-xs text-gray-500">
                    {subject._count?.mockTests || 0} test{subject._count?.mockTests !== 1 ? "s" : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TESTS SELECTION ──
  if (page === "tests") {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#0F1C15] font-bold mb-8 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#0F1C15] font-['Rajdhani'] mb-2">
              {selectedSubject?.name} Tests
            </h1>
            <p className="text-gray-600">{selectedSubject?.description}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No tests available for this subject yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#0F1C15] font-['Rajdhani']">
                        {test.title}
                      </h3>
                      {test.description && (
                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                      )}
                    </div>
                    {test.accessType === "PAID" && test.priceNpr && (
                      <div className="bg-[#D4AF37] text-[#0F1C15] px-4 py-2 rounded-lg font-bold text-sm">
                        Rs. {test.priceNpr}
                      </div>
                    )}
                    {test.accessType === "FREE" && (
                      <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm">
                        FREE
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>{test.totalQuestions} Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{test.timeLimitMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>Pass: {test.passingScore}%</span>
                    </div>
                  </div>

                  {test.attemptCount !== undefined && test.attemptCount > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                      Attempts: {test.attemptCount} | Best Score: {test.bestScore}%
                    </div>
                  )}

                  <button
                    onClick={() => handleStartTest(test.id)}
                    className="w-full px-6 py-3 bg-[#0F1C15] text-white font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors uppercase tracking-wider text-sm"
                  >
                    Start Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
