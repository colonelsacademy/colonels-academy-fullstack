import Link from "next/link";
import { Fragment } from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F9FAFB] text-gray-600 py-10 border-t border-gray-200">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex flex-row items-center justify-between gap-6">
          {/* Brand Section */}
          <div className="flex items-center gap-4 group shrink-0">
            <div className="text-left">
              <h2 className="font-['Rajdhani'] font-bold text-[#0F1C15] text-xl uppercase tracking-wider leading-none">
                The Colonel&apos;s Academy
              </h2>
              <p className="font-['Rajdhani'] text-[10px] text-[#B8860B] uppercase tracking-[0.3em] mt-1.5 font-bold">
                Forging Future Leaders
              </p>
            </div>
          </div>

          {/* Navigation & Legal - Spread across the middle */}
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            <Link
              href="/privacy-policy"
              className="hover:text-[#0F1C15] transition-all duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-[#0F1C15] transition-all duration-300"
            >
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-[#0F1C15] transition-all duration-300">
              Contact Us
            </Link>
          </div>

          {/* Social & Copyright Section - Far Right */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Copyright */}
            <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
              <span>&copy; {currentYear}</span>
            </div>

            <div className="h-4 w-[1px] bg-gray-200 hidden lg:block" />

            {/* Social Icons - Light circular style */}
            <div className="flex items-center gap-3">
              {[
                {
                  label: "Facebook",
                  id: "fb",
                  d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                },
                { label: "Instagram", id: "ig", isStroke: true },
                {
                  label: "TikTok",
                  id: "tt",
                  d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"
                }
              ].map((social) => (
                <Fragment key={social.id}>
                  {/* TODO: Replace placeholder link with actual profile URL */}
                  <a
                    href="#"
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F3F4F6] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:border-blue-100 transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    {social.isStroke ? (
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-[#0F1C15] fill-none stroke-current stroke-2 transition-colors"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-[#0F1C15] fill-current transition-colors"
                        viewBox="0 0 24 24"
                      >
                        <path d={social.d} />
                      </svg>
                    )}
                  </a>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
