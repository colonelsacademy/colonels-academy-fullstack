"use client";

import { CheckCircle, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

type FormState = "idle" | "submitting" | "success";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [formState, setFormState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setFormState("submitting");
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:support@thecolonelsacademy.com?subject=${encodeURIComponent(form.subject)}&body=${body}`;
    setTimeout(() => setFormState("success"), 600);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof form]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0F1C15]/5 mb-6">
          <Mail className="w-8 h-8 text-[#0F1C15]" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 font-['Rajdhani'] uppercase tracking-wide mb-3">Contact Us</h1>
        <p className="text-gray-500 max-w-md mx-auto">Have a question or need help? Fill out the form and our team will get back to you within 24 hours.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
          {formState === "success" ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Message Sent!</h3>
              <p className="text-gray-500 max-w-xs">Thanks for reaching out. We&apos;ll get back to you at <span className="font-semibold text-gray-700">{form.email}</span> within 24 hours.</p>
              <button type="button" onClick={() => { setForm({ name: "", email: "", subject: "", message: "" }); setFormState("idle"); }} className="mt-4 text-sm font-bold text-[#0F1C15] underline underline-offset-4 hover:text-[#D4AF37] transition-colors">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Full Name</label>
                  <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Arjun Sharma" className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#0F1C15]/10 focus:border-[#0F1C15] ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email Address</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#0F1C15]/10 focus:border-[#0F1C15] ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Subject</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#0F1C15]/10 focus:border-[#0F1C15] ${errors.subject ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                  <option value="">Select a topic…</option>
                  <option>Course Enrollment</option>
                  <option>Payment & Billing</option>
                  <option>Technical Support</option>
                  <option>Exam Dates & Schedule</option>
                  <option>Other</option>
                </select>
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Message</label>
                <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Describe your question or issue in detail…" className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all resize-none focus:ring-2 focus:ring-[#0F1C15]/10 focus:border-[#0F1C15] ${errors.message ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`} />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>
              <button type="submit" disabled={formState === "submitting"} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0F1C15] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-all disabled:opacity-60">
                <Send className="w-4 h-4" />
                {formState === "submitting" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {[
            { icon: Mail, label: "Email", content: <a href="mailto:support@thecolonelsacademy.com" className="text-sm font-semibold text-gray-900 hover:text-[#D4AF37] transition-colors break-all">support@thecolonelsacademy.com</a> },
            { icon: Phone, label: "Phone", content: <a href="tel:+9779851347306" className="text-sm font-semibold text-gray-900 hover:text-[#D4AF37] transition-colors">+977-9851347306</a> },
            { icon: Clock, label: "Support Hours", content: <><p className="text-sm font-semibold text-gray-900">Sun – Fri: 9:00 AM – 6:00 PM</p><p className="text-xs text-gray-400 mt-0.5">Nepal Standard Time (NST)</p></> },
            { icon: MapPin, label: "Location", content: <p className="text-sm font-semibold text-gray-900">Kathmandu, Nepal</p> },
          ].map(({ icon: Icon, label, content }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F1C15]/5 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#0F1C15]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                  {content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
