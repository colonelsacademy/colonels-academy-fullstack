"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  Activity,
  BarChart2,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Edit,
  Loader2,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Send,
  ShieldAlert,
  Trash2,
  Users,
  Wifi,
  X
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "overview"
  | "analytics"
  | "users"
  | "courses"
  | "staffhq"
  | "courselist"
  | "enrollments"
  | "notifications"
  | "cadetiq"
  | "missionlog";

interface DBUser {
  id: string;
  firebaseUid: string;
  email: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
  _count: { enrollments: number; orders: number };
}

interface DBCourse {
  id: string;
  slug: string;
  title: string;
  track: string;
  priceNpr: number;
  isFeatured: boolean;
  isComingSoon: boolean;
  heroImageUrl: string | null;
  summary: string;
  _count: { enrollments: number; lessons: number };
}

interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  deliveryMode: string;
  meetingUrl: string | null;
}

interface Stats {
  userCount: number;
  courseCount: number;
  enrollmentCount: number;
  orderCount: number;
}
const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "users", label: "Cadet Roster", icon: Users },
  { id: "courses", label: "Training Modules", icon: BookOpen },
  { id: "staffhq", label: "Staff HQ", icon: Calendar },
  { id: "courselist", label: "Courses", icon: BookMarked },
  { id: "enrollments", label: "Enrollments", icon: CheckSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "cadetiq", label: "Cadet IQ", icon: ClipboardList },
  { id: "missionlog", label: "Mission Log", icon: CheckSquare }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color
}: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    gold: "bg-[#D4AF37]/10 text-[#D4AF37]"
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div
        className={`w-10 h-10 rounded-xl ${colors[color] ?? colors.blue} flex items-center justify-center mb-3`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold text-gray-900 font-['Rajdhani']">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1 font-bold">{label}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
      <span className="w-4 h-px bg-[#D4AF37]" />
      {children}
      <span className="flex-1 h-px bg-gray-200" />
    </h2>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  stats,
  liveSessions,
  onRefresh
}: {
  stats: Stats;
  liveSessions: LiveSession[];
  onRefresh: () => void;
}) {
  const upcoming = liveSessions.filter((s) => new Date(s.startsAt) > new Date());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Personnel" value={stats.userCount} icon={Users} color="blue" />
        <StatCard label="Active Courses" value={stats.courseCount} icon={BookOpen} color="green" />
        <StatCard label="Scheduled Classes" value={upcoming.length} icon={Calendar} color="red" />
        <StatCard label="Paid Orders" value={stats.orderCount} icon={CheckSquare} color="orange" />
      </div>

      {/* Live Classes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${upcoming.length > 0 ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
            />
            <span className="text-sm font-bold uppercase tracking-wider text-gray-700">
              Scheduled Live Classes
            </span>
          </div>
          <button type="button" onClick={onRefresh} className="p-1 hover:bg-gray-100 rounded">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No live classes scheduled</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcoming.slice(0, 5).map((s) => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{s.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.deliveryMode}</div>
                  {s.meetingUrl && (
                    <a
                      href={s.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Join →
                    </a>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div className="font-bold text-gray-700">
                    {new Date(s.startsAt).toLocaleDateString()}
                  </div>
                  <div>
                    {new Date(s.startsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ onRefresh }: { onRefresh: () => void }) {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("STUDENT");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveRole = async (id: string) => {
    await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editRole })
    });
    setEditingId(null);
    load();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <SectionTitle>Authenticated Personnel ({users.length})</SectionTitle>
      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Name / Email</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Enrollments</th>
                  <th className="text-left px-5 py-3">Orders</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{u.displayName || "—"}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      {editingId === u.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        >
                          {["STUDENT", "INSTRUCTOR", "DS", "ADMIN"].map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${u.role === "ADMIN" ? "bg-red-100 text-red-700" : u.role === "INSTRUCTOR" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{u._count.enrollments}</td>
                    <td className="px-5 py-3 text-gray-600">{u._count.orders}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {editingId === u.id ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveRole(u.id)}
                            className="p-1.5 bg-[#D4AF37] text-[#0F1C15] rounded hover:bg-[#c9a227]"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(u.id);
                            setEditRole(u.role);
                          }}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
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

// ─── Lesson Manager (inline in Training Modules) ─────────────────────────────

interface Lesson {
  id: string;
  title: string;
  synopsis: string;
  position: number;
  durationMinutes: number | null;
  contentType: string;
  learningMode: string;
  accessKind: string;
  bunnyVideoId: string | null;
  moduleId: string | null;
}

interface BunnyVideo {
  guid: string;
  title: string;
  status: number;
  lengthSeconds: number;
  thumbnail: string | null;
}

function BunnyVideoPicker({
  value,
  onChange
}: { value: string; onChange: (id: string, title: string, duration: number) => void }) {
  const [videos, setVideos] = useState<BunnyVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    if (videos.length > 0) {
      setOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bunny-videos");
      const data = await res.json();
      if (data.items) setVideos(data.items.filter((v: BunnyVideo) => v.status === 4));
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  const filtered = videos.filter((v) => v.title.toLowerCase().includes(search.toLowerCase()));
  const selected = videos.find((v) => v.guid === value);

  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
        Bunny Video
      </label>
      <button
        type="button"
        onClick={load}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg text-sm hover:border-[#D4AF37] transition-colors text-left"
      >
        {selected ? (
          <span className="text-emerald-600 font-medium truncate">✓ {selected.title}</span>
        ) : value ? (
          <span className="text-gray-500 font-mono text-xs truncate">{value}</span>
        ) : (
          <span className="text-gray-400">Click to pick from Bunny Stream...</span>
        )}
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
        ) : (
          <Plus className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 space-y-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
            <div className="text-xs text-gray-500">Or paste video ID manually:</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Bunny video ID..."
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const id = e.currentTarget.value.trim();
                    if (id) {
                      onChange(id, '', 0);
                      setOpen(false);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const id = input.value.trim();
                  console.log('Manual video ID input:', id);
                  if (id) {
                    console.log('Calling onChange with:', { id, title: '', duration: 0 });
                    onChange(id, '', 0);
                    setOpen(false);
                    input.value = '';
                  }
                }}
                className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1C15] text-xs font-bold rounded hover:bg-[#c9a227]"
              >
                Add
              </button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 p-3 text-center">No videos found</p>
            ) : (
              filtered.map((v) => (
                <button
                  key={v.guid}
                  type="button"
                  onClick={() => {
                    onChange(v.guid, v.title, Math.round(v.lengthSeconds / 60));
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors ${v.guid === value ? "bg-[#D4AF37]/10" : ""}`}
                >
                  {v.thumbnail ? (
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-12 h-8 object-cover rounded shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-8 bg-gray-200 rounded shrink-0 flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{v.title}</p>
                    <p className="text-xs text-gray-400">{Math.round(v.lengthSeconds / 60)} min</p>
                  </div>
                  {v.guid === value && (
                    <span className="text-[#D4AF37] text-xs font-bold shrink-0">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonManager({ courseSlug, onClose }: { courseSlug: string; onClose: () => void }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    synopsis: "",
    bunnyVideoId: "",
    durationMinutes: "",
    accessKind: "STANDARD",
    contentType: "VIDEO",
    learningMode: "LESSON"
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseSlug}/lessons`);
      const data = await res.json();
      if (data.lessons) setLessons(data.lessons);
    } finally {
      setLoading(false);
    }
  }, [courseSlug]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({
      title: "",
      synopsis: "",
      bunnyVideoId: "",
      durationMinutes: "",
      accessKind: "STANDARD",
      contentType: "VIDEO",
      learningMode: "LESSON"
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (l: Lesson) => {
    setEditingId(l.id);
    setForm({
      title: l.title,
      synopsis: l.synopsis,
      bunnyVideoId: l.bunnyVideoId ?? "",
      durationMinutes: l.durationMinutes ? String(l.durationMinutes) : "",
      accessKind: l.accessKind,
      contentType: l.contentType,
      learningMode: l.learningMode ?? "LESSON"
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      synopsis: form.synopsis,
      bunnyVideoId: form.bunnyVideoId || undefined,
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
      accessKind: form.accessKind,
      contentType: form.contentType,
      learningMode: form.learningMode
    };

    // Debug: Log what we're sending
    console.log('Submitting lesson update:', { editingId, payload });

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/lessons/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('Update response:', data);
        if (!res.ok) throw new Error(data.message);
      } else {
        const res = await fetch(`/api/admin/courses/${courseSlug}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error((await res.json()).message);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Lessons ({lessons.length})
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm((v) => !v);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-[#0F1C15] font-bold rounded text-xs hover:bg-[#c9a227]"
          >
            <Plus className="w-3 h-3" /> Add Lesson
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 text-gray-600 font-bold rounded text-xs hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            {editingId ? "Edit Lesson" : "New Lesson"}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <InputField
                label="Title"
                value={form.title}
                onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                placeholder="e.g. Introduction to Command Writing"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Synopsis
              </label>
              <textarea
                value={form.synopsis}
                onChange={(e) => setForm((p) => ({ ...p, synopsis: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm resize-none"
                placeholder="Brief description of this lesson"
              />
            </div>
            <div className="col-span-2">
              <BunnyVideoPicker
                value={form.bunnyVideoId}
                onChange={(id, title, duration) => {
                  console.log('BunnyVideoPicker onChange called:', { id, title, duration });
                  setForm((p) => {
                    const newForm = {
                      ...p,
                      bunnyVideoId: id,
                      title: p.title || title || 'Untitled Lesson',
                      durationMinutes: duration > 0 ? String(duration) : p.durationMinutes
                    };
                    console.log('Updated form state:', newForm);
                    return newForm;
                  });
                }}
              />
            </div>
            <InputField
              label="Duration (minutes)"
              value={form.durationMinutes}
              onChange={(v) => setForm((p) => ({ ...p, durationMinutes: v }))}
              type="number"
              placeholder="e.g. 25"
            />{" "}
            <SelectField
              label="Content Type"
              value={form.contentType}
              onChange={(v) => setForm((p) => ({ ...p, contentType: v }))}
              options={[
                { value: "VIDEO", label: "Video" },
                { value: "PDF", label: "PDF" },
                { value: "LIVE", label: "Live Class" },
                { value: "QUIZ", label: "Quiz" },
                { value: "TEXT", label: "Text" }
              ]}
            />
            <SelectField
              label="Learning Mode"
              value={form.learningMode}
              onChange={(v) => setForm((p) => ({ ...p, learningMode: v }))}
              options={[
                { value: "LESSON", label: "Lesson" },
                { value: "PRACTICE", label: "Practice" },
                { value: "QUIZ", label: "Quiz/Test" },
                { value: "LIVE", label: "Live" },
                { value: "FEEDBACK", label: "Feedback" },
                { value: "RESOURCE", label: "Resource" }
              ]}
            />
            <SelectField
              label="Access"
              value={form.accessKind}
              onChange={(v) => setForm((p) => ({ ...p, accessKind: v }))}
              options={[
                { value: "STANDARD", label: "Enrolled Only" },
                { value: "PREVIEW", label: "Free Preview" }
              ]}
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded text-xs hover:bg-[#c9a227] disabled:opacity-50 flex items-center gap-1"
            >
              <Save className="w-3 h-3" />{" "}
              {saving ? "Saving..." : editingId ? "Update" : "Add Lesson"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading lessons...
        </div>
      ) : lessons.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">No lessons yet. Add your first lesson above.</p>
      ) : (
        <div className="space-y-1">
          {lessons.map((l, i) => (
            <div
              key={l.id}
              className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-3 py-2.5"
            >
              <span className="text-xs font-mono text-gray-400 w-5 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{l.title}</span>
                  {l.accessKind === "PREVIEW" && (
                    <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      Preview
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                  <span className="uppercase">{l.contentType}</span>
                  <span className="uppercase">{l.learningMode ?? "LESSON"}</span>
                  {l.durationMinutes && <span>{l.durationMinutes} min</span>}
                  {l.bunnyVideoId ? (
                    <span className="text-emerald-600 font-medium">
                      ✓ Video: {l.bunnyVideoId.slice(0, 8)}...
                    </span>
                  ) : (
                    <span className="text-amber-500">No video</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(l)}
                  className="p-1.5 hover:bg-blue-50 text-blue-500 rounded"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteLesson(l.id)}
                  className="p-1.5 hover:bg-red-50 text-red-400 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Training Modules Tab (Add/Edit Courses) ──────────────────────────────────

function TrainingModulesTab({ onRefresh }: { onRefresh: () => void }) {
  const [courses, setCourses] = useState<DBCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    track: "army",
    price: "",
    description: "",
    thumbnail: "",
    comingSoon: false,
    featured: false
  });
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "images/courses");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((p) => ({ ...p, thumbnail: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (c: DBCourse) => {
    setEditingSlug(c.slug);
    setForm({
      title: c.title,
      track: c.track,
      price: String(c.priceNpr),
      description: c.summary,
      thumbnail: c.heroImageUrl ?? "",
      comingSoon: c.isComingSoon ?? false,
      featured: c.isFeatured
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingSlug(null);
    setForm({
      title: "",
      track: "army",
      price: "",
      description: "",
      thumbnail: "",
      comingSoon: false,
      featured: false
    });
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.price) {
      setError("Title and price are required.");
      return;
    }
    setSaving(true);
    setError("");
    const accentMap: Record<string, string> = {
      army: "#5E6B3C",
      police: "#224785",
      apf: "#B6762C",
      staff: "#5E6B3C",
      mission: "#8C4136"
    };
    try {
      if (editingSlug) {
        const res = await fetch(`/api/admin/courses/${editingSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            track: form.track,
            priceNpr: Number(form.price),
            summary: form.description,
            description: form.description,
            heroImageUrl: form.thumbnail || null,
            isFeatured: form.featured,
            isComingSoon: form.comingSoon,
            accentColor: accentMap[form.track] ?? "#D4AF37"
          })
        });
        if (!res.ok) throw new Error((await res.json()).message);
      } else {
        const slug = form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            title: form.title,
            track: form.track,
            summary: form.description || form.title,
            description: form.description || form.title,
            level: "Intermediate",
            durationLabel: "20+ Hours",
            lessonCount: 0,
            priceNpr: Number(form.price),
            accentColor: accentMap[form.track] ?? "#D4AF37",
            heroImageUrl: form.thumbnail || undefined,
            isFeatured: form.featured,
            isComingSoon: form.comingSoon
          })
        });
        if (!res.ok) throw new Error((await res.json()).message);
      }
      resetForm();
      load();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/courses/${slug}`, { method: "DELETE" });
    load();
    onRefresh();
  };

  const deleteSelected = async () => {
    if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} course(s)?`)) return;
    await Promise.all(
      selectedIds.map((slug) => fetch(`/api/admin/courses/${slug}`, { method: "DELETE" }))
    );
    setSelectedIds([]);
    load();
    onRefresh();
  };

  const toggleSelect = (slug: string) =>
    setSelectedIds((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  const toggleAll = () =>
    setSelectedIds(selectedIds.length === courses.length ? [] : courses.map((c) => c.slug));

  const TRACK_OPTIONS = [
    { value: "army", label: "Nepal Army" },
    { value: "police", label: "Nepal Police" },
    { value: "apf", label: "APF Nepal" },
    { value: "staff", label: "Staff College" },
    { value: "mission", label: "Mission Prep" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle>Training Modules ({courses.length})</SectionTitle>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={deleteSelected}
              className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 border border-red-200 font-bold rounded-lg text-xs hover:bg-red-100"
            >
              <Trash2 className="w-3 h-3" /> Delete ({selectedIds.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm((v) => !v);
            }}
            className="flex items-center gap-1 px-4 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-xs hover:bg-[#c9a227]"
          >
            <Plus className="w-3 h-3" /> {editingSlug ? "Edit Course" : "Add Course"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
              {editingSlug ? `Edit: ${editingSlug}` : "New Training Module"}
            </h3>
            <button type="button" onClick={resetForm}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Title"
              value={form.title}
              onChange={(v) => setForm((p) => ({ ...p, title: v }))}
              placeholder="Course title"
            />
            <InputField
              label="Price (NPR)"
              value={form.price}
              onChange={(v) => setForm((p) => ({ ...p, price: v }))}
              type="number"
              placeholder="4500"
            />
            <SelectField
              label="Wing / Track"
              value={form.track}
              onChange={(v) => setForm((p) => ({ ...p, track: v }))}
              options={TRACK_OPTIONS}
            />
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Course Image
              </label>
              <label
                className={`flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-lg px-3 py-3 cursor-pointer hover:border-[#D4AF37] transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <span className="text-[#D4AF37] text-xs">Uploading to Bunny CDN...</span>
                ) : form.thumbnail ? (
                  <span className="text-emerald-600 text-xs truncate">
                    ✓ {form.thumbnail.split("/").pop()}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">Click to upload → Bunny CDN</span>
                )}
              </label>
              {form.thumbnail && (
                <img
                  src={form.thumbnail}
                  alt="preview"
                  className="mt-2 h-20 w-full object-cover rounded-lg"
                />
              )}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              Description / Summary
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm resize-none"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="accent-[#D4AF37]"
              />
              Featured Course
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.comingSoon}
                onChange={(e) => setForm((p) => ({ ...p, comingSoon: e.target.checked }))}
                className="accent-[#D4AF37]"
              />
              Coming Soon
            </label>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227] disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />{" "}
              {saving ? "Saving..." : editingSlug ? "Update Course" : "Deploy Course"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === courses.length && courses.length > 0}
                    onChange={toggleAll}
                    className="accent-[#D4AF37]"
                  />
                </th>
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Track</th>
                <th className="text-left px-5 py-3">Price</th>
                <th className="text-left px-5 py-3">Enrollments</th>
                <th className="text-left px-5 py-3">Lessons</th>
                <th className="text-left px-5 py-3">Featured</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <React.Fragment key={c.slug}>
                  <tr className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.slug)}
                        onChange={() => toggleSelect(c.slug)}
                        className="accent-[#D4AF37]"
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{c.title}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded font-bold uppercase">
                        {c.track}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">NPR {c.priceNpr.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-600">{c._count.enrollments}</td>
                    <td className="px-5 py-3 text-gray-600">{c._count.lessons}</td>
                    <td className="px-5 py-3 text-gray-600">{c.isFeatured ? "✓" : "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCourse(c.slug)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedSlug(expandedSlug === c.slug ? null : c.slug)}
                          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${expandedSlug === c.slug ? "bg-[#D4AF37] text-[#0F1C15]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          Lessons
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedSlug === c.slug && (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <LessonManager courseSlug={c.slug} onClose={() => setExpandedSlug(null)} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Staff HQ Tab ─────────────────────────────────────────────────────────────

function StaffHQTab() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [_editingId, setEditingId] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ slug: string; title: string }[]>([]);
  const [form, setForm] = useState({
    courseSlug: "",
    title: "",
    date: "",
    time: "",
    deliveryMode: "zoom",
    meetingUrl: "",
    type: "Live Class",
    instructor: "",
    category: "army"
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sessRes, cRes] = await Promise.all([
        fetch("/api/learning/live-sessions"),
        fetch("/api/admin/courses")
      ]);
      const sessData = await sessRes.json();
      const cData = await cRes.json();
      if (sessData.items) setSessions(sessData.items);
      if (cData.courses)
        setCourses(cData.courses.map((c: DBCourse) => ({ slug: c.slug, title: c.title })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({
      courseSlug: "",
      title: "",
      date: "",
      time: "",
      deliveryMode: "zoom",
      meetingUrl: "",
      type: "Live Class",
      instructor: "",
      category: "army"
    });
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.courseSlug || !form.title || !form.date || !form.time) {
      setError("Course, title, date and time are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // Convert date + time to ISO datetime
      const startsAt = new Date(`${form.date}T${form.time}`).toISOString();
      const endsAt = new Date(new Date(startsAt).getTime() + 90 * 60000).toISOString(); // 1.5h default

      const res = await fetch("/api/admin/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: form.courseSlug,
          title: form.title,
          startsAt,
          endsAt,
          deliveryMode: form.deliveryMode,
          meetingUrl: form.meetingUrl || undefined
        })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm("Remove this session?")) return;
    await fetch(`/api/admin/live-sessions/${id}`, { method: "DELETE" });
    load();
  };

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.endsAt) > now);
  const past = sessions.filter((s) => new Date(s.endsAt) <= now);

  const isLive = (s: LiveSession) => {
    const start = new Date(s.startsAt);
    const end = new Date(s.endsAt);
    return now >= start && now <= end;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0F1C15] via-[#1a2e23] to-[#0F1C15] rounded-2xl shadow-xl border border-gray-800 p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)"
          }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#c19a2e] rounded-2xl flex items-center justify-center shadow-xl">
              <ShieldAlert className="w-8 h-8 text-[#0F1C15]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white font-['Rajdhani'] tracking-wider mb-1">
                Staff HQ Command Center
              </h2>
              <p className="text-sm text-gray-400 uppercase tracking-widest">
                Live Training Operations & Weekly Briefings
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#D4AF37]">{upcoming.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Upcoming Sessions</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Schedule Form */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Schedule New Session
                  </h3>
                  <p className="text-xs text-gray-500">Add live training events to calendar</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                  Session Topic
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#D4AF37] focus:bg-white transition-all outline-none"
                  placeholder="e.g., Strategic Command & Leadership"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                  Course
                </label>
                <select
                  value={form.courseSlug}
                  onChange={(e) => setForm((p) => ({ ...p, courseSlug: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#D4AF37] focus:bg-white transition-all outline-none"
                >
                  <option value="">Select course...</option>
                  {courses.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-purple-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-orange-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#D4AF37] focus:bg-white transition-all outline-none"
                  >
                    {["Live Class", "Workshop", "Seminar", "Q&A", "Mock Test"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                    Mode
                  </label>
                  <select
                    value={form.deliveryMode}
                    onChange={(e) => setForm((p) => ({ ...p, deliveryMode: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#D4AF37] focus:bg-white transition-all outline-none"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="in-app">In-App</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                  Meet Link (optional)
                </label>
                <input
                  value={form.meetingUrl}
                  onChange={(e) => setForm((p) => ({ ...p, meetingUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#D4AF37] focus:bg-white transition-all outline-none"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-3 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-xl hover:bg-[#c9a227] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> {saving ? "Scheduling..." : "Schedule Session"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Session List */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading sessions...
            </div>
          ) : upcoming.length === 0 && past.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No sessions scheduled</p>
              <p className="text-xs text-gray-400 mt-1">
                Use the form to schedule your first live session
              </p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">
                        Upcoming Sessions ({upcoming.length})
                      </span>
                    </div>
                    <button type="button" onClick={load} className="p-1 hover:bg-gray-200 rounded">
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {upcoming.map((s) => (
                      <div key={s.id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {isLive(s) && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                                  🔴 LIVE
                                </span>
                              )}
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                                {s.deliveryMode}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-base mb-1">{s.title}</h4>
                            {s.meetingUrl && (
                              <a
                                href={s.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1 font-medium"
                              >
                                Join Meeting →
                              </a>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-gray-900">
                              {new Date(s.startsAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(s.startsAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteSession(s.id)}
                              className="mt-2 p-1.5 hover:bg-red-50 text-red-400 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden opacity-70">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-500">
                      Past Sessions ({past.length})
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {past.slice(0, 5).map((s) => (
                      <div key={s.id} className="px-6 py-3 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-600">{s.title}</span>
                          <span className="ml-2 text-xs text-gray-400">
                            {new Date(s.startsAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteSession(s.id)}
                          className="p-1 hover:bg-red-50 text-red-300 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Courses List Tab ─────────────────────────────────────────────────────────

function CourseListTab() {
  const [courses, setCourses] = useState<DBCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => {
        if (d.courses) setCourses(d.courses);
      })
      .finally(() => setLoading(false));
  }, []);

  const tracks = ["all", ...Array.from(new Set(courses.map((c) => c.track)))];
  const filtered = filter === "all" ? courses : courses.filter((c) => c.track === filter);

  return (
    <div className="space-y-6">
      <SectionTitle>Course Catalog ({courses.length})</SectionTitle>
      <div className="flex gap-2 flex-wrap">
        {tracks.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${filter === t ? "bg-[#D4AF37] text-[#0F1C15]" : "bg-white text-gray-500 border border-gray-200 hover:border-[#D4AF37]"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.slug}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {c.heroImageUrl && (
                <img src={c.heroImageUrl} alt={c.title} className="w-full h-32 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{c.title}</h3>
                  {c.isFeatured && (
                    <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded font-bold uppercase shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{c.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">
                    {c.track}
                  </span>
                  <span className="text-gray-900 font-bold text-sm">
                    NPR {c.priceNpr.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>{c._count.enrollments} enrolled</span>
                  <span>{c._count.lessons} lessons</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [form, setForm] = useState({ title: "", message: "", type: "announcement" });
  const [history, setHistory] = useState<
    { id: string; title: string; message: string; type: string; sentAt: string }[]
  >([]);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!form.title || !form.message) return;
    setSending(true);
    try {
      // Store in history (in-memory for now — can be wired to DB later)
      setHistory((prev) => [
        { id: String(Date.now()), ...form, sentAt: new Date().toLocaleString() },
        ...prev
      ]);
      setForm({ title: "", message: "", type: "announcement" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <SectionTitle>Send Notification</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Title"
            value={form.title}
            onChange={(v) => setForm((p) => ({ ...p, title: v }))}
            placeholder="Notification title"
          />
          <SelectField
            label="Type"
            value={form.type}
            onChange={(v) => setForm((p) => ({ ...p, type: v }))}
            options={[
              { value: "announcement", label: "Announcement" },
              { value: "class-cancel", label: "Class Cancelled" },
              { value: "reminder", label: "Reminder" },
              { value: "urgent", label: "Urgent" }
            ]}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
            Message
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm resize-none"
          />
        </div>
        <button
          type="button"
          onClick={send}
          disabled={sending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227] disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send to All Users"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="space-y-3">
          <SectionTitle>Notification History</SectionTitle>
          {history.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900 text-sm">{n.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${n.type === "urgent" ? "bg-red-100 text-red-600" : n.type === "reminder" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                >
                  {n.type}
                </span>
              </div>
              <p className="text-gray-500 text-xs">{n.message}</p>
              <p className="text-gray-400 text-xs mt-1">{n.sentAt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mission Log Tab ──────────────────────────────────────────────────────────

function MissionLogTab() {
  const [todos, setTodos] = useState([
    { id: "1", task: "Review new cadet applications", completed: false },
    { id: "2", task: "Update course syllabus for Army track", completed: true },
    { id: "3", task: "Schedule next live session", completed: false }
  ]);
  const [newTask, setNewTask] = useState("");

  const add = () => {
    if (!newTask.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: String(Date.now()), task: newTask.trim(), completed: false }
    ]);
    setNewTask("");
  };
  const toggle = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const remove = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="space-y-6">
      <SectionTitle>Mission Log</SectionTitle>
      <div className="flex gap-3">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add new mission task..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 px-4 py-2.5 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227]"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {todos.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 bg-white border rounded-xl px-5 py-3 ${t.completed ? "border-emerald-200 opacity-70" : "border-gray-200"}`}
          >
            <button
              type="button"
              onClick={() => toggle(t.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${t.completed ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-[#D4AF37]"}`}
            >
              {t.completed && <span className="text-white text-xs">✓</span>}
            </button>
            <span
              className={`flex-1 text-sm ${t.completed ? "line-through text-gray-400" : "text-gray-800"}`}
            >
              {t.task}
            </span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        {todos.filter((t) => t.completed).length} / {todos.length} missions complete
      </p>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.userCount} icon={Users} color="blue" />
        <StatCard label="Total Courses" value={stats.courseCount} icon={BookOpen} color="green" />
        <StatCard
          label="Active Enrollments"
          value={stats.enrollmentCount}
          icon={CheckSquare}
          color="orange"
        />
        <StatCard label="Paid Orders" value={stats.orderCount} icon={Activity} color="gold" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <BarChart2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium">Detailed analytics charts coming soon</p>
        <p className="text-xs mt-1">Revenue, enrollment trends, and course performance</p>
      </div>
    </div>
  );
}

// ─── Cadet IQ Tab ─────────────────────────────────────────────────────────────

function CadetIQTab() {
  return (
    <div className="space-y-4">
      <SectionTitle>Cadet IQ Submissions</SectionTitle>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium">IQ test system coming soon</p>
        <p className="text-xs mt-1">Mock test results and performance tracking will appear here</p>
      </div>
    </div>
  );
}

// ─── Enrollments Tab ─────────────────────────────────────────────────────────

function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<
    {
      id: string;
      status: string;
      progressPercent: number;
      purchasedAt: string;
      user: { email: string | null; displayName: string | null };
      course: { title: string; slug: string };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/enrollments")
      .then((r) => r.json())
      .then((d) => {
        if (d.enrollments) setEnrollments(d.enrollments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <SectionTitle>Enrollments ({enrollments.length})</SectionTitle>
      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          No enrollments yet
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">Course</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Progress</th>
                  <th className="text-left px-5 py-3">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{e.user.displayName || "—"}</div>
                      <div className="text-xs text-gray-500">{e.user.email}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{e.course.title}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${e.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                          <div
                            className="h-full bg-[#D4AF37] rounded-full"
                            style={{ width: `${e.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{e.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(e.purchasedAt).toLocaleDateString()}
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

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, authenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats>({
    userCount: 0,
    courseCount: 0,
    enrollmentCount: 0,
    orderCount: 0
  });
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, sessRes] = await Promise.all([
        fetch("/api/admin/stats")
          .then((r) => r.json())
          .catch(() => ({})),
        fetch("/api/learning/live-sessions")
          .then((r) => r.json())
          .catch(() => ({ items: [] }))
      ]);
      if (statsRes.userCount !== undefined) setStats(statsRes);
      if (sessRes.items) setLiveSessions(sessRes.items);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadData();
    } else if (!authLoading) {
      setDataLoading(false);
    }
  }, [authenticated, authLoading, loadData]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 gap-2 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
        <span className="font-bold uppercase tracking-widest text-xs">Establishing Uplink...</span>
      </div>
    );
  }

  if (!authenticated || (user?.role && user.role.toLowerCase() !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <p className="font-bold uppercase tracking-widest text-sm text-gray-500">
          Access Denied — Admin Only
        </p>
        <p className="text-xs text-gray-400">
          Your role: {user?.role ?? "none"} | Authenticated: {String(authenticated)}
        </p>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab stats={stats} liveSessions={liveSessions} onRefresh={loadData} />;
      case "analytics":
        return <AnalyticsTab stats={stats} />;
      case "users":
        return <UsersTab onRefresh={loadData} />;
      case "courses":
        return <TrainingModulesTab onRefresh={loadData} />;
      case "staffhq":
        return <StaffHQTab />;
      case "courselist":
        return <CourseListTab />;
      case "enrollments":
        return <EnrollmentsTab />;
      case "notifications":
        return <NotificationsTab />;
      case "cadetiq":
        return <CadetIQTab />;
      case "missionlog":
        return <MissionLogTab />;
    }
  };

  const tabLabel: Record<Tab, string> = {
    overview: "System Overview",
    analytics: "Analytics",
    users: "Personnel",
    courses: "Training Modules",
    staffhq: "Staff HQ Command",
    courselist: "Courses Management",
    enrollments: "Enrollments",
    notifications: "Notification Center",
    cadetiq: "Cadet IQ Assessment",
    missionlog: "Mission Log"
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-[#0F1C15] text-white flex-col flex-shrink-0 min-h-screen">
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <ShieldAlert className="w-8 h-8 text-[#D4AF37]" />
          <span className="ml-3 font-bold font-['Rajdhani'] tracking-widest text-lg">
            COMMAND HQ
          </span>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-2 flex-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeTab === id ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${activeTab === id ? "text-[#D4AF37]" : ""}`} />
              <span className="flex-1">{label}</span>
              {activeTab === id && <ChevronRight className="w-3 h-3 text-[#D4AF37]" />}
            </button>
          ))}
          <a
            href="/brandbook"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all mt-1"
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>Brand Book</span>
          </a>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-green-500">
            <Wifi className="w-3 h-3" /> System Online
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-gray-900 font-bold text-lg uppercase tracking-wide">
              {tabLabel[activeTab]}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Colonel&apos;s Academy — Admin Dashboard</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">{renderTab()}</div>
      </div>
    </div>
  );
}
