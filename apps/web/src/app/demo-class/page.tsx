"use client";

import VideoPlayer from "@/components/ui/VideoPlayer";
import { CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";

// Set this to your actual Bunny Stream demo video UUID
const DEMO_VIDEO_ID = "49fdfae8-953b-4477-aa41-c3853564d4de";

export default function DemoClassPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white pt-24 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-sm uppercase mb-3 block">
            Free Access
          </span>
          <h1 className="text-5xl font-bold font-['Rajdhani'] mb-4">
            Command Wing: <span className="text-gray-400">Classroom 01</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the intensive training methodology used by Colonel&apos;s Academy. This
            session covers &quot;Tactical Leadership & Decision Making&quot;.
          </p>
        </div>

        {/* Video Player - exact same as old app */}
        <div className="mb-12">
          <VideoPlayer
            videoId={DEMO_VIDEO_ID}
            poster="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600"
            autoplay={false}
          />
        </div>

        {/* Syllabus + CTA */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-6 font-['Rajdhani'] text-white">
              In this Masterclass:
            </h3>
            <ul className="space-y-4">
              {[
                "Situational Reaction Tests (SRT) Solved",
                "Interview Psychology Breakdown",
                "Body Language Hacks for TO/GTO"
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#D4AF37] shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">Full Access Locked</h4>
                <p className="text-xs text-gray-400">Enroll to view remaining 45+ lectures</p>
              </div>
            </div>

            <Link
              href="/courses"
              className="block w-full py-4 bg-[#D4AF37] text-[#0B1120] rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors shadow-lg text-center"
            >
              Unlock Full Course
            </Link>
            <div className="mt-4 text-center text-xs text-gray-500">
              30-Day Money Back Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
