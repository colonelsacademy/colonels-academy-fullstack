"use client";

import { CheckCircle, Edit, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface MockTest {
  id: string;
  title: string;
  description: string | null;
  position: string;
  subject: { id: string; name: string };
  timeLimitMinutes: number;
  totalQuestions: number;
  passingScore: number;
  status: string;
  accessType: string;
  priceNpr: number | null;
  freePreviewCount: number;
  _count?: { questions: number };
}

interface Subject {
  id: string;
  name: string;
  position: string;
}

export function MockTestManager() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("ASI");
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    timeLimitMinutes: "25",
    totalQuestions: "50",
    passingScore: "60",
    accessType: "FREE",
    priceNpr: ""
  });

  const loadData = useCallback(async (position: string = selectedPosition) => {
    setLoading(true);
    try {
      // Get subjects for the selected position
      const subjectsRes = await fetch(`/api/admin/mock-tests/subjects?position=${position}`);
      const subjectsData = await subjectsRes.json();
      if (Array.isArray(subjectsData)) {
        setSubjects(subjectsData);

        // Get tests for all subjects of this position
        if (subjectsData.length > 0) {
          const subjectIds = subjectsData.map((s) => s.id).join(",");
          const testsRes = await fetch(`/api/admin/mock-tests?subjectIds=${subjectIds}`);
          const testsData = await testsRes.json();
          if (Array.isArray(testsData)) {
            setTests(testsData);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPosition]);

  const handlePositionChange = (position: string) => {
    setSelectedPosition(position);
    loadData(position);
  };

  useEffect(() => {
    loadData(selectedPosition);
  }, [selectedPosition, loadData]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      subjectId: "",
      timeLimitMinutes: "25",
      totalQuestions: "50",
      passingScore: "60",
      accessType: "FREE",
      priceNpr: ""
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (test: MockTest) => {
    setEditingId(test.id);
    setForm({
      title: test.title,
      description: test.description || "",
      subjectId: test.subject.id,
      timeLimitMinutes: String(test.timeLimitMinutes),
      totalQuestions: String(test.totalQuestions),
      passingScore: String(test.passingScore),
      accessType: test.accessType,
      priceNpr: test.priceNpr ? String(test.priceNpr) : ""
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.subjectId) {
      setError("Subject is required");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      subjectId: form.subjectId,
      timeLimitMinutes: Number(form.timeLimitMinutes),
      totalQuestions: Number(form.totalQuestions),
      passingScore: Number(form.passingScore),
      accessType: form.accessType,
      priceNpr: form.accessType === "PAID" ? Number(form.priceNpr) : null
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/mock-tests/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to update test");
      } else {
        const res = await fetch("/api/admin/mock-tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to create test");
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (id: string) => {
    if (!confirm("Delete this mock test?")) return;
    try {
      await fetch(`/api/admin/mock-tests/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const toggleAccessType = async (test: MockTest) => {
    const newAccessType = test.accessType === "FREE" ? "PAID" : "FREE";
    const newPrice = newAccessType === "PAID" ? 500 : null;

    try {
      const res = await fetch(`/api/admin/mock-tests/${test.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessType: newAccessType,
          priceNpr: newPrice
        })
      });
      if (!res.ok) throw new Error("Failed to update access type");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
          Mock Test Management
        </h2>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm((v) => !v);
          }}
          className="flex items-center gap-1 px-4 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227]"
        >
          <Plus className="w-4 h-4" /> New Test
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handlePositionChange("ASI")}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
            selectedPosition === "ASI"
              ? "bg-[#D4AF37] text-[#0F1C15]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ASI
        </button>
        <button
          type="button"
          onClick={() => handlePositionChange("Officer Cadet")}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
            selectedPosition === "Officer Cadet"
              ? "bg-[#D4AF37] text-[#0F1C15]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Officer Cadet
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {editingId ? "Edit Mock Test" : "Create New Mock Test"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. ASI GK Test"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of the test"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Subject
              </label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={form.timeLimitMinutes}
                onChange={(e) => setForm((p) => ({ ...p, timeLimitMinutes: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Total Questions
              </label>
              <input
                type="number"
                value={form.totalQuestions}
                onChange={(e) => setForm((p) => ({ ...p, totalQuestions: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={form.passingScore}
                onChange={(e) => setForm((p) => ({ ...p, passingScore: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Access Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="FREE"
                    checked={form.accessType === "FREE"}
                    onChange={(e) => setForm((p) => ({ ...p, accessType: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="PAID"
                    checked={form.accessType === "PAID"}
                    onChange={(e) => setForm((p) => ({ ...p, accessType: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Paid</span>
                </label>
              </div>
            </div>

            {form.accessType === "PAID" && (
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                  Price (NPR)
                </label>
                <input
                  type="number"
                  value={form.priceNpr}
                  onChange={(e) => setForm((p) => ({ ...p, priceNpr: e.target.value }))}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
                />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg hover:bg-[#c9a227] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : editingId ? "Update Test" : "Create Test"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading tests...
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
          No mock tests yet. Create your first test above.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Title</th>
                  <th className="text-left px-5 py-3">Subject</th>
                  <th className="text-left px-5 py-3">Questions</th>
                  <th className="text-left px-5 py-3">Time</th>
                  <th className="text-left px-5 py-3">Access</th>
                  <th className="text-left px-5 py-3">Price</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{test.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{test.description}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{test.subject.name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {test._count?.questions || test.totalQuestions}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{test.timeLimitMinutes} min</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleAccessType(test)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                          test.accessType === "FREE"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        {test.accessType}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {test.accessType === "PAID" ? `₹${test.priceNpr}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          test.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {test.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(test)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTest(test.id)}
                          className="p-1.5 hover:bg-red-50 text-red-400 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
