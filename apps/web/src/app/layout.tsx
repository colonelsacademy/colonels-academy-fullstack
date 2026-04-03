import { AuthProvider } from "@/components/auth/AuthProvider";
import { SiteShell } from "@/components/site-shell";
import { CartProvider } from "@/contexts/CartContext";
import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-rajdhani"
});

export const metadata: Metadata = {
  title: "Colonels Academy Platform",
  description: "A fresh Next.js + Fastify learning platform scaffold for Colonels Academy."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${rajdhani.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <SiteShell>{children}</SiteShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
