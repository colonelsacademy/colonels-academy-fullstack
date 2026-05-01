import { BookMarked, BookOpen, Shield, Target, Users } from "lucide-react";

export type Category = "all" | "army" | "police" | "apf" | "staff" | "mission";

export const ICON_MAP = {
  BookOpen: BookOpen,
  Shield: Shield,
  Users: Users,
  Target: Target,
  BookMarked: BookMarked
};

export type IconKey = keyof typeof ICON_MAP;

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  rating: number;
  ratingCount: number;
  students: number;
  duration: string;
  lessons: number;
  iconId: IconKey;
  thumbnail?: string;
  price: number;
  memberPrice?: number;
  originalPrice: number;
  color: string;
  lightColor: string;
  tag: string;
  level?: string;
  isBestseller?: boolean;
  isPremium?: boolean;
  published?: boolean;
  comingSoon?: boolean;
  meetingUrl?: string;
}

export const CATEGORIES = [
  { id: "all", label: "All Forces", iconId: "BookOpen" as IconKey },
  { id: "army", label: "Nepal Army", iconId: "Shield" as IconKey },
  { id: "police", label: "Nepal Police", iconId: "Users" as IconKey },
  { id: "apf", label: "APF", iconId: "Target" as IconKey },
  { id: "staff", label: "Staff College", iconId: "BookMarked" as IconKey },
  { id: "mission", label: "Mission Prep", iconId: "Target" as IconKey }
];
