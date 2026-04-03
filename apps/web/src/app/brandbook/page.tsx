"use client";

import { motion } from "framer-motion";
import {
  Award, ChevronRight, Compass, Layout,
  Shield, ShieldCheck, Users, Zap
} from "lucide-react";

export default function BrandBook() {
  return (
    <div className="bg-white min-h-screen">

      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-[#1C1D1F]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2d2e30_1px,transparent_1px),linear-gradient(to_bottom,#2d2e30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Brand Identity & Design System
            </span>
            <h1 className="text-[clamp(3rem,10vw,8rem)] font-black text-white tracking-tighter mb-8 font-['Rajdhani'] leading-none">
              FORGING <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4CA30]">FUTURE</span><br />
              LEADERS
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg font-medium leading-relaxed mb-12">
              The definitive guide to the visual and verbal soul of Colonel&apos;s Academy.
              A system built for elite performance and prestige.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] uppercase tracking-widest text-white font-bold">Scroll to Explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ChevronRight className="w-5 h-5 text-white rotate-90" />
          </motion.div>
        </div>
      </section>

      {/* LOGO SYSTEM */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <span className="text-[#D4AF37] font-black text-[11px] uppercase tracking-[0.25em] mb-4 block">Section 01</span>
              <h2 className="text-5xl font-bold text-[#0B1120] mb-8 font-['Rajdhani'] uppercase tracking-tight">The Core Mark</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-10">
                Our logo is a symbol of authority, resilience, and growth. It blends modern geometric
                precision with traditional military honor. The shield represents protection, while
                the internal insignia denotes specialized expertise.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-sm text-[#0B1120] mb-2">Safe Zone</h4>
                  <p className="text-xs text-gray-500">Minimum 40px clear space around all sides of the mark.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-sm text-[#0B1120] mb-2">Contrast</h4>
                  <p className="text-xs text-gray-500">Must maintain 4.5:1 ratio on any background.</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full aspect-square bg-gray-50 rounded-[3rem] flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#0B1120] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="relative z-10 text-center transition-transform duration-700 group-hover:scale-110">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center p-6 shadow-2xl mx-auto mb-8 border border-white/20">
                  <Shield className="w-full h-full text-white drop-shadow-lg" />
                </div>
                <p className="text-[#0B1120] group-hover:text-white font-black uppercase tracking-[0.2em] text-xs transition-colors">Primary Brand Mark</p>
              </div>
              <div className="absolute top-10 left-10 w-4 h-4 border-t-2 border-l-2 border-gray-300" />
              <div className="absolute bottom-10 right-10 w-4 h-4 border-b-2 border-r-2 border-gray-300" />
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-[2rem] border border-gray-100 p-8">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Logo Variants</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#0B1120] flex items-center justify-center mb-3">
                    <Shield className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Primary</p>
                </div>
                <div className="p-6 bg-[#0B1120] rounded-2xl border border-gray-900 text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#D4AF37] flex items-center justify-center mb-3">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Reverse</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Do / Don&apos;t</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-5 py-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-green-700">Do</span>
                  <span className="text-sm text-green-700">Use primary or reverse mark only.</span>
                </div>
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-700">Don&apos;t</span>
                  <span className="text-sm text-red-700">Stretch, recolor, or add effects.</span>
                </div>
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-700">Don&apos;t</span>
                  <span className="text-sm text-red-700">Place on busy photos without contrast.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COLOR SYSTEM */}
      <section className="py-24 bg-[#F8F9FB]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#D4AF37] font-black text-[11px] uppercase tracking-[0.25em] mb-4 block">Section 02</span>
            <h2 className="text-5xl font-bold text-[#0B1120] mb-6 font-['Rajdhani'] uppercase tracking-tight">Spectral Authority</h2>
            <p className="text-gray-600 text-lg">Our palette is curated to evoke discipline, prestige, and tactical clarity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
              <div className="h-48 w-full bg-[#0B1120] rounded-2xl mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
              </div>
              <h4 className="text-xl font-bold text-[#0B1120] mb-2 font-['Rajdhani']">MAINSTAY NAVY</h4>
              <p className="text-sm text-gray-500 mb-6">#0B1120 | The foundation of our digital trust.</p>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-[#0B1120]" />
                <div className="w-4 h-4 rounded-full bg-[#1e293b]" />
                <div className="w-4 h-4 rounded-full bg-[#334155]" />
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
              <div className="h-48 w-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl mb-8 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-black/10 backdrop-blur-md flex items-center justify-center">
                  <span className="text-[10px] text-white font-black tracking-widest uppercase">Metallic Finish</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-[#0B1120] mb-2 font-['Rajdhani']">ELITE GOLD</h4>
              <p className="text-sm text-gray-500 mb-6">#D4AF37 | Excellence and achievement.</p>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-[#D4AF37]" />
                <div className="w-4 h-4 rounded-full bg-[#F4CA30]" />
                <div className="w-4 h-4 rounded-full bg-[#B8860B]" />
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
              <div className="h-48 w-full bg-[#dc2626] rounded-2xl mb-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-[#1D4ED8] -skew-x-[30deg] translate-x-12" />
                <Zap className="w-12 h-12 relative z-10 drop-shadow-2xl" />
              </div>
              <h4 className="text-xl font-bold text-[#0B1120] mb-2 font-['Rajdhani']">TACTICAL SIGNALS</h4>
              <p className="text-sm text-gray-500 mb-6">High intensity status and action colors.</p>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-[#dc2626]" />
                <div className="w-4 h-4 rounded-full bg-[#1D4ED8]" />
                <div className="w-4 h-4 rounded-full bg-[#10b981]" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
              <span className="text-[#D4AF37] font-black text-[11px] uppercase tracking-[0.25em] mb-4 block">Section 03</span>
              <h2 className="text-4xl font-bold text-[#0B1120] mb-8 font-['Rajdhani'] uppercase tracking-tight">The Typeface</h2>
              <p className="text-gray-600 leading-relaxed mb-8">Typography is as important as the words themselves. We use a combination of technical precision and readable elegance.</p>
            </div>
            <div className="lg:w-2/3 space-y-12">
              <div className="p-12 bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden relative">
                <div className="absolute right-[-5%] top-[-10%] text-[15rem] font-black text-[#0B1120]/[0.03] pointer-events-none select-none">Aa</div>
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6">Display Font: Rajdhani</h3>
                <div className="space-y-4 font-['Rajdhani']">
                  <p className="text-[clamp(3rem,8vw,6rem)] font-bold text-[#0B1120] leading-none tracking-tighter">ABCDEFG</p>
                  <p className="text-[clamp(3rem,8vw,6rem)] font-light text-[#0B1120] leading-none tracking-tighter">hijklmnop</p>
                  <p className="text-2xl font-medium text-gray-500 mt-8 tracking-[0.1em]">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
                </div>
              </div>
              <div className="p-12 bg-[#0B1120] rounded-[2rem] text-white overflow-hidden relative">
                <div className="absolute right-[-5%] top-[-10%] text-[15rem] font-black text-white/[0.03] pointer-events-none select-none">Bb</div>
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-6">Body Font: Sans-Serif / Inter</h3>
                <div className="space-y-6">
                  <p className="text-3xl font-bold leading-tight">Elite preparation for the nation&apos;s most prestigious careers.</p>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-xl text-justify">
                    Designed for readability and professional tone. Whether it&apos;s a course description or an IQ training manual,
                    the choice of font ensures our cadets focus on what matters most: excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPONENT LIBRARY */}
      <section className="py-32 bg-[#F8F9FB] border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#D4AF37] font-black text-[11px] uppercase tracking-[0.25em] mb-4 block">Section 04</span>
            <h2 className="text-5xl font-bold text-[#0B1120] mb-6 font-['Rajdhani'] uppercase tracking-tight">Component Library</h2>
            <p className="text-gray-600 text-lg">Core UI building blocks with consistent shape, tone, and behavior.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-10 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Buttons</h4>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-[#0B1120] text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl">Primary</button>
                <button className="px-6 py-3 bg-white border border-gray-200 text-[#0B1120] text-xs font-black uppercase tracking-[0.2em] rounded-xl">Secondary</button>
                <button className="px-6 py-3 bg-transparent text-[#0B1120] text-xs font-black uppercase tracking-[0.2em] rounded-xl">Ghost</button>
                <button className="px-6 py-3 bg-gray-200 text-gray-400 text-xs font-black uppercase tracking-[0.2em] rounded-xl cursor-not-allowed">Disabled</button>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-gray-100 p-10 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Cards</h4>
              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <div className="aspect-video bg-[#0B1120] flex items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-[#D4AF37]" />
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Bestseller</div>
                  <div className="text-lg font-bold text-[#0B1120] mb-2 font-['Rajdhani']">Cadet Officer Prep</div>
                  <div className="text-sm text-gray-500 mb-4">60 hours • 75 modules</div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-[#0B1120]">NPR 8,500</div>
                    <button className="px-4 py-2 bg-[#0B1120] text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Enroll</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-gray-100 p-10 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Badges & Tags</h4>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-[#eceb98] text-[#3d3c0a] text-[10px] font-black uppercase tracking-widest rounded-full">Bestseller</span>
                <span className="px-3 py-1 bg-[#f3ca8c] text-[#593d00] text-[10px] font-black uppercase tracking-widest rounded-full">Premium</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">New</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full">All Levels</span>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-gray-100 p-10 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Alerts & Toasts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                  <span>Enrollment confirmed</span><span className="text-[10px] uppercase tracking-widest">Success</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
                  <span>Payment pending</span><span className="text-[10px] uppercase tracking-widest">Warning</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold">
                  <span>Verification failed</span><span className="text-[10px] uppercase tracking-widest">Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISUAL CANVAS */}
      <section className="py-32 bg-[#F8F9FB] overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#D4AF37] font-black text-[11px] uppercase tracking-[0.25em] mb-4 block">Section 05</span>
            <h2 className="text-5xl font-bold text-[#0B1120] mb-6 font-['Rajdhani'] uppercase tracking-tight">The Visual Canvas</h2>
            <p className="text-gray-600 text-lg">Applied design samples demonstrating the brand in action.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 px-4">Sample: Tactical Course Card</h4>
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 group">
                <div className="aspect-video bg-[#0B1120] relative overflow-hidden flex items-center justify-center p-12">
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                  <ShieldCheck className="w-24 h-24 text-[#D4AF37] relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-10">
                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded">Army</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded">Bestseller</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0B1120] mb-3 font-['Rajdhani']">Officer Cadet Excellence</h3>
                  <p className="text-gray-500 text-sm mb-8 line-clamp-2">Complete tactical and psychological preparation for the Nepal Army selection process.</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                    <div className="font-bold text-xl text-[#0B1120]">NPR 12,500</div>
                    <button className="bg-[#0B1120] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">Enroll Now</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 px-4">Core Principles</h4>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: Compass, title: "Tactical Precision", text: "Every detail of our platform is designed with mathematical and tactical accuracy." },
                  { icon: Award, title: "Absolute Quality", text: "Only the top 1% of instructors make it to our directing staff." },
                  { icon: Users, title: "Cadet First", text: "Our success is measured solely by the rank of our graduates." }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg flex gap-6 items-start hover:shadow-xl transition-shadow">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <item.icon className="w-6 h-6 text-[#0B1120]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#0B1120] text-lg mb-1 font-['Rajdhani'] uppercase tracking-wide">{item.title}</h5>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0B1120] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-black mb-8 font-['Rajdhani'] tracking-tight">READY TO DEPLOY THE BRAND?</h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto">
            This design system is a living document. It evolves with our mission.
            Always refer to these guidelines for any creative output.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="px-12 py-4 bg-white text-[#0B1120] font-black uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3">
              <Layout className="w-4 h-4" />
              <span>Download Assets</span>
            </button>
            <button className="px-12 py-4 bg-white/5 border border-white/20 text-white font-black uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-white/10 transition-all">
              Request Support
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
