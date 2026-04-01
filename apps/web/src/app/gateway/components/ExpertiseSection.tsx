'use client';

import { motion } from 'framer-motion';
import { Shield, Target, Microscope } from 'lucide-react';

export const ExpertiseSection = () => {
  const protocols = [
    {
      number: '01',
      icon: Shield,
      title: 'Board-Level Intelligence',
      subtitle: 'Veteran-Led Curriculum',
      description: "Go beyond textbook knowledge. Our syllabus is architected by retired Colonels and Selection Board members who have presided over thousands of candidates. We don't just teach the exam—we teach the standard.",
      tags: ['Ex-Selection Officers', 'Insider Insights'],
    },
    {
      number: '02',
      icon: Target,
      title: 'High-Fidelity Simulation',
      subtitle: 'The Pressure Cooker Environment',
      description: 'The biggest failure point in selection is pressure. Our digital and physical simulators replicate the specific stressors of IQ, GTO, and Board Interviews, building the psychological resilience required for officer-grade performance.',
      tags: ['Stress Simulation', 'Digital Mock Exams'],
    },
    {
      number: '03',
      icon: Microscope,
      title: 'Data-Driven Readiness',
      subtitle: '2026 Cycle Standards',
      description: 'The recruitment landscape is evolving. We analyze the latest successful selection patterns to ensure our students are trained on the 2026 service standards for the Army, Police, and APF.',
      tags: ['Predictive Analysis', 'Cycle Alignment'],
    },
  ];

  return (
    <section className="py-32 px-4 bg-[#F9FAFB] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -z-0 -translate-y-1/2 translate-x-1/2 overflow-hidden" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 mb-6">
              <span className="w-12 h-[1px] bg-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Expertise & Standards</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-fluid-5xl font-black font-['Rajdhani'] text-gray-900 leading-[0.9] uppercase tracking-tighter">
              The Colonel&apos;s <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Selection Protocol.</span>
            </motion.h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-gray-500 text-lg max-w-sm leading-relaxed font-medium pb-1">
            Success in the service isn&apos;t about luck. It&apos;s about following a rigorous methodology developed by those who have led from the front.
          </motion.p>
        </div>

        <div className="space-y-4">
          {protocols.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative bg-white border border-gray-100 p-fluid-xl rounded-[3rem] hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col md:flex-row gap-12 items-start"
            >
              <div className="flex flex-col items-start gap-fluid-md">
                <span className="text-5xl md:text-7xl font-black font-['Rajdhani'] text-gray-100 group-hover:text-blue-50 transition-colors duration-500">{p.number}</span>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                  <p.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
              <div className="flex-1">
                <span className="text-blue-600 text-xs font-black uppercase tracking-widest mb-3 block">{p.subtitle}</span>
                <h3 className="text-3xl font-bold text-gray-900 mb-6 font-['Rajdhani'] uppercase tracking-tight">{p.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-2xl font-medium">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 group-hover:bg-white transition-colors">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-20 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {['Army Standards', 'Police Protocols', 'APF Readiness'].map((t) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">{t}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
