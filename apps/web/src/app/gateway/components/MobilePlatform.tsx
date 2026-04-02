'use client';

import { motion } from 'framer-motion';
import { 
  WifiOff, 
  Bell, 
  Moon, 
  Smartphone, 
  CheckCircle, 
  Play, 
  Download, 
  Search, 
  Home, 
  Book, 
  User, 
  Battery, 
  Wifi, 
  Signal 
} from 'lucide-react';
import { getOptimizedAssetUrl } from '@/utils/assetUtils';

export const MobilePlatform = () => {
  const previewImageUrl = getOptimizedAssetUrl("/images/gateway/mobile-app-preview.jpg", { width: 560, quality: 78 });

  return (
    <section className="py-12 max-w-[1400px] mx-auto px-4">
      <div className="bg-[#1C1C1E] rounded-[3rem] p-fluid-xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-fluid-lg shadow-2xl">

        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Text Content */}
        <div className="flex-1 relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/90 text-sm font-bold uppercase tracking-wider mb-6">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Mobile First Learning</span>
          </div>

          <h2 className="text-fluid-4xl font-bold font-['Rajdhani'] text-white mb-4 leading-none">
            Your Academy <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">In Your Pocket</span>
          </h2>

          <p className="text-gray-400 text-fluid-base font-medium leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
            Experience seamless learning. Download lessons for offline access, get instant notifications, and track your progress—all from our dedicated mobile app.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
            {[
              { icon: WifiOff, title: "Offline Mode", desc: "Download & watch anywhere" },
              { icon: Bell, title: "Instant Alerts", desc: "Exam dates & class reminders" },
              { icon: Moon, title: "Dark Mode", desc: "Comfortable night reading" },
              { icon: CheckCircle, title: "Progress Sync", desc: "Pick up where you left off" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default group">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/30 transition-colors">
                  <item.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <h4 className="text-white font-bold text-sm">{item.title}</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HIGH FIDELITY CSS MOCKUP - TODO: Replace sample static data with real dynamic tracking data */}
        <div className="hidden lg:flex flex-1 relative z-10 justify-end overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative w-[280px] h-[550px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10"
          >
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-10 z-30 flex items-end justify-between px-6 pb-2 text-white/90">
              <span className="text-[10px] font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30"></div>

            {/* APP INTERFACE */}
            <div className="w-full h-full bg-white overflow-hidden relative flex flex-col pt-0">

              {/* Video Player Header */}
              <div className="h-56 bg-black relative shrink-0 group/video cursor-pointer">
                <img
                  src={previewImageUrl}
                  alt="Video Thumbnail"
                  loading="lazy"
                  className="w-full h-full object-cover opacity-60"
                />
                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center pl-1 group-hover/video:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>
                {/* Controls */}
                <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex justify-between text-[10px] text-white/80 font-medium mb-1.5">
                    <span>12:45</span>
                    <span>45:00</span>
                  </div>
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">

                {/* Info Header */}
                <div className="bg-white p-5 pb-0 shadow-sm z-10">
                  <h4 className="text-gray-900 font-bold text-xl leading-tight mb-1 font-['Rajdhani']">Strategic Defense & Tactics</h4>
                  <p className="text-gray-500 text-xs mb-4">By Col. (Retd.) Rajesh Thapa</p>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-100">
                    <div className="px-1 py-3 text-blue-600 border-b-2 border-blue-600 text-xs font-bold uppercase tracking-wider mr-6 cursor-pointer">Lectures</div>
                    <div className="px-1 py-3 text-gray-400 text-xs font-bold uppercase tracking-wider mr-6 cursor-pointer hover:text-gray-600">Q&A</div>
                    <div className="px-1 py-3 text-gray-400 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-gray-600">Notes</div>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                  {/* Section Header */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Section 1: Fundamentals</span>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">3/5 Done</span>
                  </div>

                  {[
                    { title: "1. Introduction to Command", time: "12 mins", playing: false, done: true },
                    { title: "2. Historical Context of War", time: "45 mins", playing: false, done: true },
                    { title: "3. Strategic Assessment", time: "25 mins", playing: true, done: false },
                    { title: "4. Resource Management", time: "30 mins", playing: false, done: false },
                    { title: "5. Risk Analysis", time: "60 mins", playing: false, done: false },
                    { title: "6. Modern Warfare Tech", time: "40 mins", playing: false, done: false },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${item.playing ? 'bg-white border-2 border-blue-100 shadow-sm' : 'bg-white border border-gray-100'}`}>
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${item.done ? 'bg-green-100 text-green-600' : item.playing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {item.playing ? <Play className="w-2.5 h-2.5 fill-current" /> : item.done ? <CheckCircle className="w-3.5 h-3.5" /> : (i + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold mb-0.5 truncate ${item.playing ? 'text-blue-900' : 'text-gray-700'}`}>{item.title}</div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                          <span>Video</span>
                          <span>•</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400">
                        <Download className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-[64px] px-6 pb-2 flex items-center justify-between z-20">
                <div className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors">
                  <Home className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors">
                  <Search className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Search</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-blue-600 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center -mt-4 shadow-lg shadow-blue-200">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="text-[10px] font-bold">Learn</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors">
                  <Book className="w-5 h-5" />
                  <span className="text-[10px] font-bold">My Courses</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Account</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ambient Background Glow */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[700px] rounded-[4rem] -z-10 bg-gradient-to-tr from-blue-500/5 to-purple-500/5"></div>
        </div>

      </div>
    </section>
  );
};
