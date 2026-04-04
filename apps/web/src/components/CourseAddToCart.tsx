"use client";

import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  courseCategory,
}: CourseAddToCartProps) {
  const { addItem, items } = useCart();
  const router = useRouter();
  const inCart = items.some((i) => i.id === courseId);

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
      type: "course",
    });
  };

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
        onClick={!inCart ? (e) => { e.preventDefault(); handleAdd(); router.push("/checkout"); } : undefined}
        className="py-3.5 bg-[#D4AF37] text-[#0F1C15] font-bold uppercase tracking-widest rounded-xl hover:bg-[#F4CA30] transition-colors shadow-lg flex items-center justify-center text-xs"
      >
        Buy now
      </Link>
    </div>
  );
}
