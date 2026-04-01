'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BookOpen, FileText, BookMarked, ChevronDown, ShoppingCart, Target, Lock, Menu, X } from 'lucide-react';

// Inline brand mark — gold gradient icon + text, matches the official brand assets
const AcademyLogo = () => (
  <div className="flex items-center gap-4 select-none">
    {/* Gold gradient rounded-square with shield — matches the icon variant */}
    <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#C9A227] to-[#B8860B] flex items-center justify-center shadow-lg border border-[#F4CA30]/50">
      <Shield className="w-6 h-6 text-[#0F1C15]" />
    </div>
    {/* Text lockup */}
    <div className="text-left hidden md:block whitespace-nowrap">
      <div className="font-['Rajdhani'] font-bold text-fluid-sm uppercase tracking-wider leading-none text-white">
        The Colonel&apos;s Academy
      </div>
      <div className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-[0.3em] mt-1 font-bold">
        Forging Future Leaders
      </div>
    </div>
  </div>
);

type DropdownKey = 'programs' | 'resources' | null;

const academyResources = [
  { name: 'Study Materials', path: '/study-materials', icon: BookOpen },
  { name: 'Previous Papers', path: '/previous-papers', icon: FileText },
  { name: 'Training Manuals', path: '/training-manuals', icon: BookMarked },
];

const defaultPrograms = [
  { name: 'Nepal Army Programs', path: '/courses?category=army', icon: Shield },
  { name: 'Nepal Police Programs', path: '/courses?category=police', icon: Shield },
  { name: 'APF Programs', path: '/courses?category=apf', icon: Shield },
];

const Dropdown = ({ label, items, width, id, activeId, setActiveId }: {
  label: string;
  items: { name: string; path: string; icon: React.ElementType }[];
  width: string;
  id: DropdownKey;
  activeId: DropdownKey;
  setActiveId: (id: DropdownKey) => void;
}) => {
  const isOpen = activeId === id;

  return (
    <div className="relative flex items-center h-full">
      <button
        onClick={(e) => { e.stopPropagation(); setActiveId(isOpen ? null : id); }}
        className={`group flex items-center gap-1.5 px-3 py-2 focus:outline-none rounded-lg transition-all ${isOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
        aria-expanded={isOpen}
      >
        <span className={`font-['Rajdhani'] font-bold text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${isOpen ? 'text-[#D4AF37]' : 'text-white/90 group-hover:text-[#D4AF37]'}`}>
          {label}
        </span>
        <ChevronDown className={`w-3 h-3 transition-all duration-300 ${isOpen ? 'rotate-180 text-[#D4AF37]' : 'text-white/50 group-hover:text-[#D4AF37]'}`} />
      </button>

      <motion.div
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={{ closed: { opacity: 0, y: 10, pointerEvents: 'none' as const, scale: 0.95 }, open: { opacity: 1, y: 0, pointerEvents: 'auto' as const, scale: 1 } }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 pt-2 ${width}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100 transform -translate-y-1/2" />
        <div className="bg-white border border-gray-100 rounded-xl shadow-2xl py-3 relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#F4CA30]" />
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.path} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 group transition-all border-b border-gray-50 last:border-0">
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#D4AF37]/10 transition-colors">
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <span className="block font-['Rajdhani'] font-bold uppercase tracking-wider text-sm text-gray-800 group-hover:text-[#0F1C15]">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);

  useEffect(() => {
    const handleClick = () => setActiveDropdown(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 w-full z-50 bg-[#0F1C15] border-b border-[#D4AF37]/30 shadow-xl">
        <div className="container mx-auto px-5 flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" aria-label="The Colonel's Academy — home">
            <AcademyLogo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 h-full">
            <Dropdown
              id="programs"
              label="Officer Programs"
              items={defaultPrograms}
              width="w-80"
              activeId={activeDropdown}
              setActiveId={setActiveDropdown}
            />
            <Link href="/#mentors" className="font-['Rajdhani'] font-bold text-xs uppercase tracking-[0.2em] text-white/90 hover:text-[#D4AF37] transition-colors px-3 py-2 cursor-pointer rounded-lg hover:bg-white/5">
              Directing Staff
            </Link>
            <Dropdown
              id="resources"
              label="Resources"
              items={academyResources}
              width="w-72"
              activeId={activeDropdown}
              setActiveId={setActiveDropdown}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 md:gap-4">
            <button className="hidden md:flex items-center justify-center relative p-2.5 text-white/80 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
            </button>

            <div className="h-6 w-[1px] bg-white/20 hidden md:block" />

            <button className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0F1C15] font-['Rajdhani'] font-bold text-[9px] uppercase tracking-[0.2em] rounded hover:bg-white transition-all shadow-md">
              <Lock className="w-3.5 h-3.5" />
              <span>HQ Login</span>
            </button>

            <button
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="md:hidden text-white ml-1 p-2.5 rounded-lg hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0F1C15] border-b border-white/10 px-6 py-4 flex flex-col gap-4 sticky top-20 z-40 overflow-hidden"
          >
            <Link href="/courses" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[#D4AF37] font-bold py-2 border-b border-white/5">Course Catalog</Link>
            <Link href="/#mentors" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[#D4AF37] font-bold py-2 border-b border-white/5">Directing Staff</Link>
            <button className="w-full mt-2 py-3 bg-[#D4AF37] text-[#0F1C15] font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] rounded flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              HQ Login / Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
