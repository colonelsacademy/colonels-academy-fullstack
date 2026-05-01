"use client";

import VideoPlayer from "@/components/ui/VideoPlayer";
import { ArrowRight, BookOpen, CheckCircle2, Clock, PlayCircle, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Demo videos for different courses
const DEMO_COURSES = [
  {
    id: "staff-college",
    title: "Staff College Command",
    slug: "staff-college-command",
    description: "Complete preparation for Officer Cadet selection",
    videoId: "49fdfae8-953b-4477-aa41-c3853564d4de",
    poster:
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600",
    duration: "12 weeks",
    lessons: 45,
    students: 1200,
    rating: 4.9,
    highlights: [
      "Situational Reaction Tests (SRT) Solved",
      "Interview Psychology Breakdown",
      "Body Language Hacks for TO/GTO"
    ]
  },
  {
    id: "inspector-prep",
    title: "Inspector Preparation",
    slug: "inspector-preparation",
    description: "Comprehensive training for Police Inspector exam",
    videoId: "49fdfae8-953b-4477-aa41-c3853564d4de", // Replace with actual video ID
    poster:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600",
    duration: "10 weeks",
    lessons: 38,
    students: 850,
    rating: 4.8,
    highlights: ["Written Exam Strategy", "Physical Test Preparation", "Interview Techniques"]
  },
  {
    id: "asi-training",
    title: "ASI Training Program",
    slug: "asi-training",
    description: "Focused preparation for Assistant Sub-Inspector",
    videoId: "49fdfae8-953b-4477-aa41-c3853564d4de", // Replace with actual video ID
    poster:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600",
    duration: "8 weeks",
    lessons: 32,
    students: 650,
    rating: 4.7,
    highlights: ["Exam Pattern Analysis", "Time Management Skills", "Mock Test Series"]
  }
];

export default function DemoClassPage() {
  const [selectedCourse, setSelectedCourse] = useState(DEMO_COURSES[0]);

  if (!selectedCourse) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1120] to-[#1a2332] text-white pt-24 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-sm uppercase mb-3 block">
            Free Preview
          </span>
          <h1 className="text-5xl md:text-6xl font-bold font-['Rajdhani'] mb-4">
            Experience Our <span className="text-[#D4AF37]">Training</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Watch free demo classes from our top-rated courses. See why thousands of aspirants trust
            Colonel&apos;s Academy.
          </p>
        </div>

        {/* Course Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {DEMO_COURSES.map((course) => (
            <button
              type="button"
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                selectedCourse.id === course.id
                  ? "bg-[#D4AF37] text-[#0B1120]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {course.title}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
              <VideoPlayer
                videoId={selectedCourse.videoId}
                poster={selectedCourse.poster}
                autoplay={false}
              />

              {/* Video Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 font-['Rajdhani']">
                  {selectedCourse.title}
                </h2>
                <p className="text-gray-400 mb-4">{selectedCourse.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <span>{selectedCourse.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                    <span>{selectedCourse.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <span>{selectedCourse.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    <span>{selectedCourse.rating} rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="mt-8 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6 font-['Rajdhani'] text-white">
                In this Demo Class:
              </h3>
              <ul className="space-y-4">
                {selectedCourse.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar - CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm sticky top-24">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h4 className="font-bold text-xl text-white mb-2">Ready to Start?</h4>
                <p className="text-sm text-gray-400">
                  Get full access to all {selectedCourse.lessons}+ lectures and resources
                </p>
              </div>

              <Link
                href={`/courses/${selectedCourse.slug}`}
                className="block w-full py-4 bg-[#D4AF37] text-[#0B1120] rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors shadow-lg text-center mb-4 flex items-center justify-center gap-2"
              >
                View Full Course
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/courses"
                className="block w-full py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors text-center"
              >
                Browse All Courses
              </Link>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>30-Day Money Back Guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>Lifetime Access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>Certificate of Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Courses Preview */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold font-['Rajdhani'] mb-8 text-center">
            Explore All Our Courses
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {DEMO_COURSES.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37] transition-all group"
              >
                <div className="relative h-48">
                  <Image
                    src={course.poster}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-300">{course.description}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                      {course.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
