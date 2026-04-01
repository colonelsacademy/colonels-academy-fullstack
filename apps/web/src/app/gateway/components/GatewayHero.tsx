'use client';

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { ChevronDown, PlayCircle, Target } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveImage from '@/components/ui/ResponsiveImage';

const HERO_WIDTHS = [640, 960, 1280, 1600, 1920];

const MagneticButton = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 };
    x.set((clientX - (left + width / 2)) * 0.3);
    y.set((clientY - (top + height / 2)) * 0.3);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      style={{ x: mouseX, y: mouseY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const GatewayHero = () => {
  const router = useRouter();

  return (
    <div className="w-full pt-2 pb-6">
      <div className="w-[99%] mx-auto bg-white rounded-none min-h-[85vh] md:min-h-[72vh] flex flex-col justify-center p-fluid-section relative overflow-hidden shadow-sm border border-white">

        {/* Hero image layer */}
        <div className="absolute inset-0 z-0">
          <ResponsiveImage
            src="https://ca-assets.b-cdn.net/images/gateway/hero.jpg"
            alt="Defense Academy Cadets"
            loading="eager"
            fetchPriority="high"
            quality={76}
            widths={HERO_WIDTHS}
            fallbackWidth={1600}
            sizes="100vw"
            className="w-full h-full object-cover object-right-top opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent sm:via-white/60" />
        </div>

        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:3rem_3rem] -z-0 opacity-20 mix-blend-multiply pointer-events-none" />

        {/* Animated content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full flex flex-col justify-center min-h-[85vh] md:min-h-[72vh]"
        >
          <div className="max-w-3xl mr-auto flex flex-col items-start text-left">

            {/* Brand pill */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <span className="bg-[#0B1120] text-white text-[11px] sm:text-[12px] font-black tracking-[0.25em] uppercase px-5 py-3 rounded-xl font-['Rajdhani'] shadow-2xl border border-gray-800 flex items-center">
                <span>Nepal&apos;s </span>
                <span className="text-amber-400 mx-1.5 font-black text-[14px]">#1</span>
                <span> Ranked Instructor Team</span>
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="mb-10"
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block text-fluid-hero font-extrabold text-[#0B1120] tracking-tight leading-[1.1] mb-2"
              >
                Army, Police & APF
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="block text-fluid-hero font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-red-600 tracking-tight leading-[1.05] relative"
              >
                Careers
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                  className="absolute -bottom-1.5 left-0 w-full h-1 bg-gradient-to-r from-blue-700 to-red-600 origin-left rounded-full opacity-80"
                />
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-fluid-lg text-gray-600 max-w-xl leading-relaxed mb-8 font-medium"
            >
              Join the premier preparation platform for{' '}
              <span className="text-gray-900 font-bold">Officer Cadet</span>,{' '}
              <span className="text-gray-900 font-bold">Inspector</span>, and{' '}
              <span className="text-gray-900 font-bold">ASI</span> aspirants. Your uniform awaits.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto"
            >
              <MagneticButton
                onClick={() => router.push('/iq-test')}
                className="group w-full sm:w-auto px-8 py-5 bg-[#0B1120] text-white rounded-xl font-bold text-base tracking-wider uppercase shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Target className="w-5 h-5 text-blue-400 group-hover:rotate-180 transition-transform duration-700" />
                <span>Cadet IQ Test</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => router.push('/classroom/military-history')}
                className="group w-full sm:w-auto px-8 py-5 bg-white/50 backdrop-blur-sm text-gray-900 border border-gray-200 rounded-xl font-bold text-base tracking-wider uppercase shadow-sm hover:shadow-md hover:bg-white flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <PlayCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Demo Class</span>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          >
            <span className="text-xs uppercase tracking-widest text-black font-black">Scroll</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4 text-black stroke-[3]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GatewayHero;
