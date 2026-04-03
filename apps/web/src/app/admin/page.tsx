"use client";

import type { CourseDetail, InstructorProfile } from "@colonels-academy/contracts";
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
  Palette,
  Plus,
  Send,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  Users,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "overview"
  | "analytics"
  | "roster"
  | "training"
  | "staffhq"
  | "courses"
  | "notifications"
  | "cadetiq"
  | "missionlog";

interface FeatureFlag {
  id: string;
  label: string;
  enabled: boolean;
}

interface LiveClass {
  id: string;
  topic: string;
  instructor: string;
  date: string;
  time: string;
  type: string;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
  isAdmin: boolean;
}

interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  sentAt: string;
}

interface IQSubmission {
  id: string;
  cadet: string;
  score: number;
  submittedAt: string;
  status: string;
}

// ─── Mock / seed data ─────────────────────────────────────────────────────────

const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    name: "Arjun Thapa",
    email: "arjun@example.com",
    role: "cadet",
    tier: "premium",
    isAdmin: false
  },
  {
    id: "2",
    name: "Sita Rai",
    email: "sita@example.com",
    role: "cadet",
    tier: "basic",
    isAdmin: false
  },
  {
    id: "3",
    name: "Bikash Gurung",
    email: "bikash@example.com",
    role: "instructor",
    tier: "premium",
    isAdmin: false
  },
  {
    id: "4",
    name: "Priya Shrestha",
    email: "priya@example.com",
    role: "cadet",
    tier: "basic",
    isAdmin: true
  }
];

const MOCK_LIVE_CLASSES: LiveClass[] = [
  {
    id: "1",
    topic: "Physical Fitness Standards",
    instructor: "Col. Sharma",
    date: "2025-07-20",
    time: "09:00",
    type: "Training"
  },
  {
    id: "2",
    topic: "Written Exam Prep",
    instructor: "Maj. Thapa",
    date: "2025-07-22",
    time: "14:00",
    type: "Academic"
  },
  {
    id: "3",
    topic: "Interview Techniques",
    instructor: "Lt. Col. Rai",
    date: "2025-07-25",
    time: "11:00",
    type: "Soft Skills"
  }
];

const MOCK_TODOS: TodoItem[] = [
  { id: "1", task: "Review new cadet applications", completed: false },
  { id: "2", task: "Update course syllabus for Army track", completed: true },
  { id: "3", task: "Schedule next live session", completed: false },
  { id: "4", task: "Send weekly briefing notes", completed: false }
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New Live Class Scheduled",
    message: "Physical Fitness session on July 20",
    type: "info",
    sentAt: "2025-07-15 10:00"
  },
  {
    id: "2",
    title: "System Maintenance",
    message: "Scheduled downtime on Sunday 2am-4am",
    type: "warning",
    sentAt: "2025-07-14 08:00"
  }
];

const MOCK_IQ_SUBMISSIONS: IQSubmission[] = [
  { id: "1", cadet: "Arjun Thapa", score: 87, submittedAt: "2025-07-15", status: "Reviewed" },
  { id: "2", cadet: "Sita Rai", score: 72, submittedAt: "2025-07-14", status: "Pending" },
  { id: "3", cadet: "Bikash Gurung", score: 91, submittedAt: "2025-07-13", status: "Reviewed" },
  { id: "4", cadet: "Priya Shrestha", score: 65, submittedAt: "2025-07-12", status: "Pending" }
];

const INITIAL_FLAGS: FeatureFlag[] = [
  { id: "live_classes", label: "Live Classes", enabled: true },
  { id: "iq_tests", label: "Cadet IQ Tests", enabled: true },
  { id: "notifications", label: "Push Notifications", enabled: false },
  { id: "coming_soon", label: "Coming Soon Mode", enabled: false },
  { id: "maintenance", label: "Maintenance Mode", enabled: false }
];

// ─── Sidebar nav config ───────────────────────────────────────────────────────

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "roster", label: "Cadet Roster", icon: Users },
  { id: "training", label: "Training Modules", icon: BookOpen },
  { id: "staffhq", label: "Staff HQ", icon: Calendar },
  { id: "courses", label: "Courses", icon: BookMarked },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "cadetiq", label: "Cadet IQ", icon: ClipboardList },
  { id: "missionlog", label: "Mission Log", icon: CheckSquare }
];

// ─── Chart helpers ────────────────────────────────────────────────────────────

function AreaChartComponent({
  data,
  dataKey,
  color
}: { data: Record<string, unknown>[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2E1F" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6B7280", fontSize: 11 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "#0F1C15",
            border: "1px solid #D4AF37",
            borderRadius: 8,
            color: "#fff"
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#grad-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function LineChartComponent({
  data,
  dataKey,
  color
}: { data: Record<string, unknown>[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2E1F" />
        <XAxis
          dataKey="test"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6B7280", fontSize: 11 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "#0F1C15",
            border: "1px solid #D4AF37",
            borderRadius: 8,
            color: "#fff"
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          dot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChartComponent({ data }: { data: Record<string, unknown>[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2E1F" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6B7280", fontSize: 11 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "#0F1C15",
            border: "1px solid #D4AF37",
            borderRadius: 8,
            color: "#fff"
          }}
        />
        <Legend wrapperStyle={{ color: "#9CA3AF", fontSize: 12 }} />
        <Bar
          dataKey="hours"
          name="Study Hours"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="quizzes"
          name="Quizzes Done"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl p-5">
      <div className="text-3xl font-bold text-[#D4AF37] font-mono">{value}</div>
      <div className="text-white font-semibold mt-1 text-sm uppercase tracking-wider">{label}</div>
      {sub && <div className="text-gray-400 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
      <span className="w-4 h-px bg-[#D4AF37]" />
      {children}
      <span className="flex-1 h-px bg-[#D4AF37]/20" />
    </h2>
  );
}

function ComingSoonBadge() {
  return (
    <span className="ml-2 text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
      Coming Soon
    </span>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({
  courses,
  flags,
  setFlags
}: {
  courses: CourseDetail[];
  flags: FeatureFlag[];
  setFlags: React.Dispatch<React.SetStateAction<FeatureFlag[]>>;
}) {
  const toggle = (id: string) =>
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div>
        <SectionTitle>Command Stats</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Personnel" value="—" sub="Firebase — Coming Soon" />
          <StatCard label="Active Courses" value={courses.length} sub="Live in catalog" />
          <StatCard label="Scheduled Classes" value={MOCK_LIVE_CLASSES.length} sub="This week" />
          <StatCard
            label="Pending Missions"
            value={MOCK_TODOS.filter((t) => !t.completed).length}
            sub="Open tasks"
          />
        </div>
      </div>

      {/* Feature flags */}
      <div>
        <SectionTitle>Feature Flags</SectionTitle>
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl divide-y divide-[#D4AF37]/10">
          {flags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between px-5 py-3">
              <span className="text-white text-sm font-medium">{flag.label}</span>
              <button type="button" onClick={() => toggle(flag.id)} className="focus:outline-none">
                {flag.enabled ? (
                  <ToggleRight className="w-7 h-7 text-[#D4AF37]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-gray-500" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live classes */}
      <div>
        <SectionTitle>Live Classes</SectionTitle>
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Topic</th>
                <th className="text-left px-5 py-3">Instructor</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Time</th>
                <th className="text-left px-5 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LIVE_CLASSES.map((cls) => (
                <tr
                  key={cls.id}
                  className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors"
                >
                  <td className="px-5 py-3 text-white font-medium">{cls.topic}</td>
                  <td className="px-5 py-3 text-gray-300">{cls.instructor}</td>
                  <td className="px-5 py-3 text-gray-300">{cls.date}</td>
                  <td className="px-5 py-3 text-gray-300">{cls.time}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded font-bold">
                      {cls.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Analytics ───────────────────────────────────────────────────────────

function AnalyticsTab({ courses }: { courses: CourseDetail[] }) {
  const trackCounts = courses.reduce<Record<string, number>>((acc, c) => {
    acc[c.track] = (acc[c.track] ?? 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(trackCounts), 1);

  const cumulativeData = [
    { month: "Jan", hours: 100 },
    { month: "Feb", hours: 250 },
    { month: "Mar", hours: 450 },
    { month: "Apr", hours: 700 },
    { month: "May", hours: 1000 }
  ];
  const iqTrend = [
    { test: "Test 1", avg: 100 },
    { test: "Test 2", avg: 102 },
    { test: "Test 3", avg: 105 },
    { test: "Test 4", avg: 108 },
    { test: "Test 5", avg: 112 }
  ];
  const studentData = [
    { name: "Alice", hours: 45, quizzes: 12 },
    { name: "Bob", hours: 30, quizzes: 8 },
    { name: "Charlie", hours: 60, quizzes: 15 },
    { name: "Diana", hours: 55, quizzes: 14 }
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Avg Study Hours" value="42.5 hrs" />
        <StatCard label="Avg IQ Score" value="48 / 60" />
        <StatCard label="IQ Pass Rate" value="75%" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4 text-sm">Total Cumulative Study Hours</h3>
          <div className="h-48">
            <AreaChartComponent data={cumulativeData} dataKey="hours" color="#3b82f6" />
          </div>
        </div>
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4 text-sm">IQ Trend Analysis</h3>
          <div className="h-48">
            <LineChartComponent data={iqTrend} dataKey="avg" color="#8b5cf6" />
          </div>
        </div>
      </div>

      {/* Student progress */}
      <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4 text-sm">Active Students Progress</h3>
        <div className="h-56">
          <BarChartComponent data={studentData} />
        </div>
      </div>

      {/* Courses by track */}
      <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl p-6 space-y-4">
        <SectionTitle>Courses by Track</SectionTitle>
        {Object.entries(trackCounts).map(([track, count]) => (
          <div key={track}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white uppercase font-semibold tracking-wider">{track}</span>
              <span className="text-[#D4AF37] font-bold">{count}</span>
            </div>
            <div className="h-2 bg-[#0F1C15] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] rounded-full"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Cadet Roster ────────────────────────────────────────────────────────

function RosterTab() {
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [editing, setEditing] = useState<MockUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "cadet",
    tier: "basic",
    isAdmin: false
  });

  const openEdit = (u: MockUser) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, tier: u.tier, isAdmin: u.isAdmin });
  };
  const save = () => {
    if (editing) {
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...form } : u)));
      setEditing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SectionTitle>Cadet Roster</SectionTitle>
        <ComingSoonBadge />
      </div>
      <p className="text-gray-400 text-sm -mt-4">
        User management is Firebase-based. Showing mock data.
      </p>

      <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3">Tier</th>
              <th className="text-left px-5 py-3">Admin</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors"
              >
                <td className="px-5 py-3 text-white font-medium">{u.name}</td>
                <td className="px-5 py-3 text-gray-300">{u.email}</td>
                <td className="px-5 py-3 text-gray-300 capitalize">{u.role}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${u.tier === "premium" ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-gray-700 text-gray-300"}`}
                  >
                    {u.tier}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-300">{u.isAdmin ? "✓" : "—"}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => openEdit(u)}
                    className="text-xs text-[#D4AF37] hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#D4AF37] font-bold uppercase tracking-wider text-sm">
              Edit Cadet
            </h3>
            <button type="button" onClick={() => setEditing(null)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(["name", "email"] as const).map((field) => (
              <div key={field}>
                <label
                  className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                  htmlFor="field"
                >
                  {field}
                </label>
                <input
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            ))}
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="cadet">Cadet</option>
                <option value="instructor">Instructor</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Tier
              </label>
              <select
                value={form.tier}
                onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))}
                className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAdmin}
              onChange={(e) => setForm((p) => ({ ...p, isAdmin: e.target.checked }))}
              className="accent-[#D4AF37]"
            />
            <span className="text-white text-sm">Admin Access</span>
          </label>
          <button
            type="button"
            onClick={save}
            className="px-5 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227] transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Training Modules ────────────────────────────────────────────────────

function TrainingTab({ courses }: { courses: CourseDetail[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    track: "army",
    price: "",
    description: "",
    thumbnail: "",
    comingSoon: false
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Max 5MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "images/courses");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((p) => ({ ...p, thumbnail: data.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1" htmlFor="field">
        {label}
      </label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle>Training Modules</SectionTitle>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 px-4 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-xs hover:bg-[#c9a227] transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Course
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/30 rounded-xl p-6 space-y-4">
          <h3 className="text-[#D4AF37] font-bold uppercase tracking-wider text-sm mb-2">
            New Training Module
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {field("title", "Title")}
            {field("price", "Price (NPR)", "number")}
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Wing / Category
              </label>
              <select
                value={form.track}
                onChange={(e) => setForm((p) => ({ ...p, track: e.target.value }))}
                className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                {["army", "police", "apf", "staff", "mission"].map((t) => (
                  <option key={t} value={t}>
                    {t.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Course Image
              </label>
              <label
                className={`flex items-center justify-center gap-2 w-full border border-dashed border-[#D4AF37]/40 rounded-lg px-3 py-3 cursor-pointer hover:border-[#D4AF37] transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  <span className="text-emerald-400 text-xs truncate">
                    ✓ {form.thumbnail.split("/").pop()}
                  </span>
                ) : (
                  <span className="text-gray-500 text-xs">Click to upload image → Bunny CDN</span>
                )}
              </label>
              {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
              {form.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.thumbnail}
                  alt="preview"
                  className="mt-2 h-20 w-full object-cover rounded-lg"
                />
              )}
            </div>
          </div>
          <div>
            <label
              className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
              htmlFor="field"
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.comingSoon}
              onChange={(e) => setForm((p) => ({ ...p, comingSoon: e.target.checked }))}
              className="accent-[#D4AF37]"
            />
            <span className="text-white text-sm">Mark as Coming Soon</span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-5 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227] transition-colors"
            >
              Save Module
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-[#0F1C15] text-gray-300 font-bold rounded-lg text-sm hover:bg-[#1A2E1F] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3">Title</th>
              <th className="text-left px-5 py-3">Track</th>
              <th className="text-left px-5 py-3">Price</th>
              <th className="text-left px-5 py-3">Format</th>
              <th className="text-left px-5 py-3">Featured</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr
                key={c.slug}
                className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors"
              >
                <td className="px-5 py-3 text-white font-medium">{c.title}</td>
                <td className="px-5 py-3">
                  <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded font-bold uppercase">
                    {c.track}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-300">NPR {c.priceNpr.toLocaleString()}</td>
                <td className="px-5 py-3 text-gray-300 capitalize">{c.format}</td>
                <td className="px-5 py-3 text-gray-300">{c.featured ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Staff HQ ────────────────────────────────────────────────────────────

function StaffHQTab({ instructors }: { instructors: InstructorProfile[] }) {
  const [form, setForm] = useState({
    day: "",
    date: "",
    time: "",
    topic: "",
    instructor: "",
    type: "Training",
    meetLink: "",
    category: "army"
  });
  const [notes, setNotes] = useState(
    "Weekly briefing: Focus on physical fitness standards this week. All instructors to submit lesson plans by Friday."
  );

  const textField = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1" htmlFor="field">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Schedule Live Class</SectionTitle>
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {textField("day", "Day (e.g. Monday")}
            {textField("date", "Date", "date")}
            {textField("time", "Time", "time")}
            {textField("topic", "Topic")}
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Instructor
              </label>
              <select
                value={form.instructor}
                onChange={(e) => setForm((p) => ({ ...p, instructor: e.target.value }))}
                className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">Select instructor</option>
                {instructors.map((i) => (
                  <option key={i.slug} value={i.name}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                {["Training", "Academic", "Soft Skills", "Mock Test", "Orientation"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            {textField("meetLink", "Meet Link (URL)")}
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                {["army", "police", "apf", "staff", "mission"].map((t) => (
                  <option key={t} value={t}>
                    {t.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="px-5 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227] transition-colors"
          >
            Schedule Class
          </button>
        </div>
      </div>

      <div>
        <SectionTitle>Briefing Notes</SectionTitle>
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl p-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37] resize-none"
          />
          <button
            type="button"
            className="mt-3 px-5 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227] transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Courses (CoursesTab) ────────────────────────────────────────────────

function CoursesTab({ courses }: { courses: CourseDetail[] }) {
  const [filter, setFilter] = useState("all");
  const tracks = ["all", ...Array.from(new Set(courses.map((c) => c.track)))];
  const filtered = filter === "all" ? courses : courses.filter((c) => c.track === filter);

  return (
    <div className="space-y-6">
      <SectionTitle>Course Catalog</SectionTitle>
      <div className="flex gap-2 flex-wrap">
        {tracks.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${filter === t ? "bg-[#D4AF37] text-[#0F1C15]" : "bg-[#1A2E1F] text-gray-400 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div
            key={c.slug}
            className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-colors"
          >
            {c.heroImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.heroImageUrl} alt={c.title} className="w-full h-32 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-bold text-sm leading-tight">{c.title}</h3>
                {c.featured && (
                  <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded font-bold uppercase shrink-0">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs mb-3 line-clamp-2">{c.summary}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded font-bold uppercase">
                  {c.track}
                </span>
                <span className="text-[#D4AF37] font-bold text-sm">
                  NPR {c.priceNpr.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

function NotificationsTab() {
  const [history, setHistory] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [form, setForm] = useState({ title: "", message: "", type: "info" });

  const send = () => {
    if (!form.title || !form.message) return;
    setHistory((prev) => [
      { id: String(Date.now()), ...form, sentAt: new Date().toLocaleString() },
      ...prev
    ]);
    setForm({ title: "", message: "", type: "info" });
  };

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Send Notification</SectionTitle>
        <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label
                className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
                htmlFor="field"
              >
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="alert">Alert</option>
              </select>
            </div>
          </div>
          <div>
            <label
              className="text-gray-400 text-xs uppercase tracking-wider block mb-1"
              htmlFor="field"
            >
              Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={3}
              className="w-full bg-[#0F1C15] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <button
            type="button"
            onClick={send}
            className="flex items-center gap-2 px-5 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227] transition-colors"
          >
            <Send className="w-3 h-3" /> Send Notification
          </button>
        </div>
      </div>

      <div>
        <SectionTitle>Notification History</SectionTitle>
        <div className="space-y-3">
          {history.map((n) => (
            <div
              key={n.id}
              className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl px-5 py-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-sm">{n.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${n.type === "warning" ? "bg-amber-500/20 text-amber-400" : n.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}
                >
                  {n.type}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{n.message}</p>
              <p className="text-gray-600 text-xs mt-1">{n.sentAt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Cadet IQ ────────────────────────────────────────────────────────────

function CadetIQTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SectionTitle>Cadet IQ Submissions</SectionTitle>
        <ComingSoonBadge />
      </div>
      <p className="text-gray-400 text-sm -mt-4">
        IQ test system is Firebase-based. Showing mock data.
      </p>
      <div className="bg-[#1A2E1F] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3">Cadet</th>
              <th className="text-left px-5 py-3">Score</th>
              <th className="text-left px-5 py-3">Submitted</th>
              <th className="text-left px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_IQ_SUBMISSIONS.map((s) => (
              <tr
                key={s.id}
                className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors"
              >
                <td className="px-5 py-3 text-white font-medium">{s.cadet}</td>
                <td className="px-5 py-3">
                  <span
                    className={`font-bold ${s.score >= 80 ? "text-emerald-400" : s.score >= 65 ? "text-[#D4AF37]" : "text-red-400"}`}
                  >
                    {s.score}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-300">{s.submittedAt}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${s.status === "Reviewed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Mission Log ─────────────────────────────────────────────────────────

function MissionLogTab() {
  const [todos, setTodos] = useState<TodoItem[]>(MOCK_TODOS);
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
          className="flex-1 bg-[#1A2E1F] border border-[#D4AF37]/30 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37] placeholder-gray-600"
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 px-4 py-2 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-lg text-sm hover:bg-[#c9a227] transition-colors"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {todos.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 bg-[#1A2E1F] border rounded-xl px-5 py-3 transition-colors ${t.completed ? "border-emerald-500/20 opacity-60" : "border-[#D4AF37]/20"}`}
          >
            <button
              type="button"
              onClick={() => toggle(t.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${t.completed ? "bg-emerald-500 border-emerald-500" : "border-[#D4AF37]/50 hover:border-[#D4AF37]"}`}
            >
              {t.completed && <span className="text-white text-xs">✓</span>}
            </button>
            <span
              className={`flex-1 text-sm ${t.completed ? "line-through text-gray-500" : "text-white"}`}
            >
              {t.task}
            </span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-gray-600 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="text-gray-500 text-xs">
        {todos.filter((t) => t.completed).length} / {todos.length} missions complete
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);

  useEffect(() => {
    async function load() {
      try {
        const [{ getCourses, getInstructors }] = await Promise.all([import("@/lib/api")]);
        const [c, i] = await Promise.all([getCourses(), getInstructors()]);
        setCourses(c);
        setInstructors(i);
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const renderTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-[#D4AF37] animate-pulse text-sm uppercase tracking-widest">
            Loading...
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case "overview":
        return <OverviewTab courses={courses} flags={flags} setFlags={setFlags} />;
      case "analytics":
        return <AnalyticsTab courses={courses} />;
      case "roster":
        return <RosterTab />;
      case "training":
        return <TrainingTab courses={courses} />;
      case "staffhq":
        return <StaffHQTab instructors={instructors} />;
      case "courses":
        return <CoursesTab courses={courses} />;
      case "notifications":
        return <NotificationsTab />;
      case "cadetiq":
        return <CadetIQTab />;
      case "missionlog":
        return <MissionLogTab />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A1510] text-white">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0F1C15] border-r border-[#D4AF37]/20 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#0F1C15]" />
            </div>
            <div>
              <div className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest leading-none">
                Command
              </div>
              <div className="text-white font-bold text-xs uppercase tracking-widest leading-none mt-0.5">
                HQ
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                type="button"
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  active
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#D4AF37]" : ""}`} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3 h-3 text-[#D4AF37]" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D4AF37]/20 space-y-3">
          <a
            href="/brandbook"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>Brand Book</span>
          </a>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              System Online
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#0F1C15] border-b border-[#D4AF37]/20 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg uppercase tracking-widest">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Colonel&apos;s Academy — Admin Dashboard</p>
          </div>
          <div className="text-gray-500 text-xs">
            {courses.length} courses · {instructors.length} instructors
          </div>
        </header>

        {/* Tab content */}
        <div className="flex-1 p-8 overflow-y-auto">{renderTab()}</div>
      </main>
    </div>
  );
}
