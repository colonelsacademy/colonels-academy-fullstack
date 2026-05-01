import { Shield, BookOpen, Users, Target, BookMarked } from 'lucide-react';
import { getAssetUrl } from '@/utils/assetUtils';

export type Category = 'all' | 'army' | 'police' | 'apf' | 'staff';

export const ICON_MAP = {
  'BookOpen': BookOpen,
  'Shield': Shield,
  'Users': Users,
  'Target': Target,
  'BookMarked': BookMarked,
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

export interface Mentor {
  name: string;
  rank: string;
  experience: string;
  specialization: string;
  image: string;
  category: Category;
  rating?: number;
  reviews?: number;
  students?: number;
  courses?: number;
  bio?: string;
}

export const CATEGORIES = [
  { id: 'all', label: 'All Forces', iconId: 'BookOpen' as IconKey },
  { id: 'army', label: 'Nepal Army', iconId: 'Shield' as IconKey },
  { id: 'police', label: 'Nepal Police', iconId: 'Users' as IconKey },
  { id: 'apf', label: 'APF', iconId: 'Target' as IconKey },
];

export const MENTORS: Mentor[] = [
  {
    name: 'Col. (Retd.) Rajesh Thapa',
    rank: 'Nepal Army',
    experience: '25+ Years',
    specialization: 'Strategy & Command',
    image: getAssetUrl('/images/instructors/Rajesh Thapa.jpg'),
    category: 'army',
    rating: 4.9,
    reviews: 12450,
    students: 5000,
    courses: 12,
    bio: 'Col. (Retd.) R. Thapa is a decorated veteran with over 25 years of service. He served as Directing Staff at the Staff College and was a key member of the Officer Cadet Selection Board for three consecutive years.',
  },
  {
    name: 'DIG (Retd.) K. P. Sharma',
    rank: 'Nepal Police',
    experience: '30+ Years',
    specialization: 'Criminal Law & Investigation',
    image: getAssetUrl('/images/instructors/KP Sharma.jpg'),
    category: 'police',
    rating: 4.8,
    reviews: 8200,
    students: 3200,
    courses: 8,
    bio: 'DIG (Retd.) Sharma brings 30 years of law enforcement experience, specializing in criminal investigation and forensic psychology. He now trains the next generation of police officers in modern investigative techniques.',
  },
  {
    name: 'AIG (Retd.) S. B. Basnet',
    rank: 'APF Nepal',
    experience: '28+ Years',
    specialization: 'Border Security & Ops',
    image: getAssetUrl('/images/instructors/SB Basnet.jpg'),
    category: 'apf',
    rating: 4.9,
    reviews: 9150,
    students: 2800,
    courses: 10,
    bio: 'AIG (Retd.) Basnet is a leading expert in border security and counter-terrorism operations. With a distinguished career in the Armed Police Force, he focuses on tactical training and operational readiness.',
  },
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'military-history',
    title: 'Nepal Army Staff College - Course [2026]',
    category: 'staff',
    description: 'Elite strategic preparation for Staff College entrance exams, focusing on military history, tactical analysis, and command-level strategy.',
    instructor: 'Col. (Retd.) R. Thapa & Brig. Gen. (retd.) S. Jung',
    rating: 4.9,
    ratingCount: 4250,
    students: 2450,
    duration: '60 Hours',
    lessons: 75,
    iconId: 'BookMarked',
    thumbnail: getAssetUrl('/images/courses/nepal-army-staff-college.jpg'),
    price: 8500,
    originalPrice: 12000,
    color: '#00693E',
    lightColor: '#E6F2ED',
    tag: 'Nepal Army Staff College',
    level: 'Advanced',
    isBestseller: true,
    isPremium: true,
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'police-inspector-law',
    title: 'Nepal Police Inspector Cadet - Course [2026]',
    category: 'police',
    description: 'Master the legal frameworks, criminal investigation techniques, and police administrative procedures required for the Inspector Cadet examination.',
    instructor: 'DSP (Retd.) K. Adhikari & DIG (Retd.) P. Thapa',
    rating: 4.8,
    ratingCount: 8420,
    students: 1800,
    duration: '50 Hours',
    lessons: 65,
    iconId: 'Shield',
    thumbnail: getAssetUrl('/images/courses/nepal-police-inspector-cadet.jpg'),
    price: 4500,
    originalPrice: 7500,
    color: '#1E3A8A',
    lightColor: '#EFF6FF',
    tag: 'Nepal Police Inspector',
    level: 'Intermediate',
    isBestseller: true,
  },
  {
    id: 'apf-border-security',
    title: 'APF Inspector Cadet - Course [2026]',
    category: 'apf',
    description: 'Comprehensive preparation for APF Inspector entry, covering border management, internal security, and tactical operations.',
    instructor: 'SP (Retd.) S. Lama & AIG (retd.) B. Shrestha',
    rating: 4.7,
    ratingCount: 6120,
    students: 1200,
    duration: '45 Hours',
    lessons: 55,
    iconId: 'Target',
    thumbnail: getAssetUrl('/images/courses/apf-inspector-cadet.jpg'),
    price: 4500,
    originalPrice: 7000,
    color: '#D97706',
    lightColor: '#FEF3C7',
    tag: 'APF Nepal Inspector',
    level: 'Intermediate',
    isPremium: true,
    isBestseller: true,
  },
  {
    id: 'cadet-iq',
    title: 'Nepal Army Officer Cadet - Course [2026]',
    category: 'army',
    description: 'Elite officer prep bootcamp for the Nepal Army Officer Cadet selection process.',
    instructor: 'Capt. (Retd.) B. Lama & Gen. (retd.) Prabal Sumsher',
    rating: 4.9,
    ratingCount: 9728,
    students: 3200,
    duration: '45 Hours',
    lessons: 50,
    iconId: 'Target',
    thumbnail: getAssetUrl('/images/courses/nepal-army-officer-cadet.jpg'),
    price: 4500,
    originalPrice: 7000,
    color: '#D4AF37',
    lightColor: '#FEFCE8',
    tag: 'Nepal Army Officer Cadet',
    level: 'Beginner',
    isPremium: true,
    isBestseller: true,
  },
];
