"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/contexts/CartContext";
import { ArrowRight, PlayCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CourseAddToCartProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  courseThumbnail?: string;
  courseCategory: string;
}

export default function CourseAddToCart({
  courseId,
  courseTitle,
  coursePrice,
  courseThumbnail,
  courseCategory
}: CourseAddToCartProps) {
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const inCart = items.some((i) => i.id === courseId);

  // Check if user is enrolled in this course
  useEffect(() => {
    async function checkEnrollment() {
      if (!user) {
        setIsEnrolled(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/learning/enrollments", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const enrolled = data.items?.some(
            (e: { courseSlug: string }) => e.courseSlug === courseId
          );
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to check enrollment:", error);
      } finally {
        setLoading(false);
      }
    }

    checkEnrollment();
  }, [user, courseId]);

  const handleAdd = () => {
    if (inCart) {
      router.push("/checkout");
      return;
    }
    addItem({
      id: courseId,
      title: courseTitle,
      price: coursePrice,
      ...(courseThumbnail ? { image: courseThumbnail } : {}),
      category: courseCategory,
      type: "course"
    });
  };

  // If user is already enrolled, show "Continue Learning" button
  if (isEnrolled) {
    return (
      <Link
        href="/my-learning"
        className="w-full py-3.5 bg-emerald-600 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-colors shadow-lg flex items-center justify-center gap-2 text-xs mb-4"
      >
        <PlayCircle className="w-4 h-4" />
        Continue Learning
        <ArrowRight className="w-4 h-4" />
      </Link>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="py-3.5 bg-gray-100 rounded-xl animate-pulse" />
        <div className="py-3.5 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Show normal buy buttons
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <button
        type="button"
        onClick={handleAdd}
        className={`py-3.5 font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 text-xs ${
          inCart
            ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600"
            : "border border-[#0F1C15] text-[#0F1C15] hover:bg-gray-50"
        }`}
      >
        <ShoppingBag className="w-4 h-4" />
        {inCart ? "In Cart" : "Add"}
      </button>
      <Link
        href={inCart ? "/checkout" : "#"}
        onClick={(e) => {
          if (!inCart) {
            e.preventDefault();
            handleAdd();
            router.push("/checkout");
          }
        }}
        className="py-3.5 bg-[#D4AF37] text-[#0F1C15] font-bold uppercase tracking-widest rounded-xl hover:bg-[#F4CA30] transition-colors shadow-lg flex items-center justify-center text-xs"
      >
        Buy now
      </Link>
    </div>
  );
}
