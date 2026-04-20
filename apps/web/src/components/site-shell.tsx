import type { ReactNode } from "react";
import Navbar from "./Navbar";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
