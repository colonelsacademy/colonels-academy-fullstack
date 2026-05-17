"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CadetIQRoutePage() {
  const router = useRouter();

  useEffect(() => {
    // Fetch the actual IQ bundle ID from the API, then redirect to mocktest preview
    // This mirrors how ElitePracticalTests handles the "5 Free Questions" button
    const fetchAndRedirect = async () => {
      try {
        const res = await fetch("/api/mock-test-bundles");
        if (res.ok) {
          const bundles = await res.json();
          const iqBundle = bundles.find(
            (b: { position: string; id: string }) => b.position === "IQ"
          );
          if (iqBundle?.id) {
            router.replace(`/mocktest?preview=${encodeURIComponent(iqBundle.id)}`);
            return;
          }
        }
      } catch {
        // fall through to hardcoded fallback
      }
      // Fallback: use hardcoded string (MockTest.tsx handles this via position check)
      router.replace("/mocktest?preview=cadet-iq");
    };

    fetchAndRedirect();
  }, [router]);

  return null;
}
