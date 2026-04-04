"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/contexts/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  CreditCard,
  FileText,
  Lock,
  LogOut,
  Menu,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingCart,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type DropdownKey = "programs" | "resources" | null;

const defaultPrograms = [
  { name: "Nepal Army Programs", path: "/courses?category=army", icon: Shield },
  { name: "Nepal Police Programs", path: "/courses?category=police", icon: Shield },
  { name: "APF Programs", path: "/courses?category=apf", icon: Shield }
];

const academyResources = [
  { name: "Study Materials", path: "/study-materials", icon: BookOpen },
  { name: "Previous Papers", path: "/previous-papers", icon: FileText },
  { name: "Training Manuals", path: "/training-manuals", icon: BookMarked }
];

const AcademyLogo = () => (
  <div className="flex items-center gap-4 select-none">
    <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#C9A227] to-[#B8860B] flex items-center justify-center shadow-lg border border-[#F4CA30]/50">
      <Shield className="w-6 h-6 text-[#0F1C15]" />
    </div>
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

const Dropdown = ({
  label,
  items,
  width,
  id,
  activeId,
  setActiveId
}: {
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
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveId(isOpen ? null : id);
        }}
        className={`group flex items-center gap-1.5 px-3 py-2 focus:outline-none rounded-lg transition-all ${isOpen ? "bg-white/10" : "hover:bg-white/5"}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span
          className={`font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] transition-colors duration-300 ${isOpen ? "text-[#D4AF37]" : "text-white/90 group-hover:text-[#D4AF37]"}`}
        >
          {label}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-all duration-300 ${isOpen ? "rotate-180 text-[#D4AF37]" : "text-white/50 group-hover:text-[#D4AF37]"}`}
        />
      </button>

      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={{
          closed: { opacity: 0, y: 10, pointerEvents: "none" as const, scale: 0.95 },
          open: { opacity: 1, y: 0, pointerEvents: "auto" as const, scale: 1 }
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 pt-2 ${width}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100 transform -translate-y-1/2" />
        <div className="bg-white border border-gray-100 rounded-xl shadow-2xl py-3 relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#F4CA30]" />
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 group transition-all border-b border-gray-50 last:border-0"
              >
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#D4AF37]/10 transition-colors">
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <span className="block font-['Rajdhani'] font-bold uppercase tracking-wider text-sm text-gray-800 group-hover:text-[#0F1C15]">
                  {item.name}
                </span>
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
  const router = useRouter();
  const { user, authenticated, logout } = useAuth();
  const { itemCount, items, removeItem, total } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setActiveDropdown(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setState setters are stable
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setIsCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen || isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen, isMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 w-full z-50 bg-[#0F1C15] border-b border-[#D4AF37]/30 shadow-xl">
        <div className="container mx-auto px-6 flex justify-between items-center h-20">
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
            <Link
              href="/#mentors"
              className="font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] text-white/90 hover:text-[#D4AF37] transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              Directing Staff
            </Link>
            <Link
              href="/courses"
              className="font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] text-white/90 hover:text-[#D4AF37] transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              Courses
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
            {/* Cart button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center justify-center relative p-2.5 text-white/80 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="h-6 w-[1px] bg-white/20 hidden md:block" />

            {authenticated && user ? (
              <div className="hidden md:flex items-center relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0F1C15]" />
                  </div>
                  <span className="font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.15em] text-white/90 max-w-[120px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-white/50 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 bg-[#0F1C15] border border-[#D4AF37]/30 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                      <p className="text-sm font-bold text-white">
                        {user.displayName ?? user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <div className="py-2">
                      {user.role === "admin" && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors">
                          <ShieldAlert className="w-4 h-4" /> HQ Command
                        </Link>
                      )}
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-400 hover:bg-white/5 transition-colors">
                        <BookOpen className="w-4 h-4" /> My Courses
                      </Link>
                      {user.role === "admin" && (
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                          <User className="w-4 h-4" /> Dashboard
                        </Link>
                      )}
                      <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                        <Settings className="w-4 h-4" /> Account Settings
                      </Link>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0F1C15] font-['Rajdhani'] font-bold text-xs uppercase tracking-[0.2em] rounded hover:bg-white transition-all shadow-md"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>HQ Login</span>
              </button>
            )}

            {/* Hamburger */}
            <button
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0F1C15] border-b border-white/10 px-6 py-4 flex flex-col gap-4 sticky top-20 z-40 overflow-hidden"
          >
            <Link href="/courses" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[#D4AF37] font-bold py-2 border-b border-white/5">
              Course Catalog
            </Link>
            <Link href="/#mentors" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[#D4AF37] font-bold py-2 border-b border-white/5">
              Directing Staff
            </Link>
            <Link href="/study-materials" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[#D4AF37] font-bold py-2 border-b border-white/5">
              Study Materials
            </Link>
            <Link href="/previous-papers" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[#D4AF37] font-bold py-2 border-b border-white/5">
              Previous Papers
            </Link>
            {authenticated && user ? (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-3 border border-white/20 text-white font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] rounded flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {user.email?.split("@")[0]}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-3 border border-red-500/30 text-red-400 font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] rounded flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full mt-2 py-3 bg-[#D4AF37] text-[#0F1C15] font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] rounded flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                HQ Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      {mounted && (
      <AnimatePresence>
        {isCartOpen && (
          <div className="relative z-[70]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.dialog
              open
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col m-0 p-0 border-0"
              aria-label="Shopping cart"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#0F1C15] text-white">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-['Rajdhani'] font-bold text-lg uppercase tracking-wider">
                    Your Cart ({itemCount})
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close cart"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {itemCount === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="font-bold text-gray-400 text-lg">Your cart is empty</p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="text-[#0F1C15] underline font-bold text-sm mt-2"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 line-clamp-2">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {item.type ?? "course"}
                        </p>
                        <p className="font-bold text-[#0F1C15] mt-1">
                          NPR {item.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-6 border-t border-gray-100">
                {itemCount > 0 && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 font-bold text-sm">Subtotal</span>
                    <span className="text-xl font-bold text-[#0F1C15]">
                      NPR {total.toLocaleString()}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full py-4 bg-[#0F1C15] text-white font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] rounded-xl hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Proceed to Checkout
                </button>
                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Secure Encrypted Payment
                </p>
              </div>
            </motion.dialog>
          </div>
        )}
      </AnimatePresence>
      )}
    </>
  );
};

export default Navbar;
