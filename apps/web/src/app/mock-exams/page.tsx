import { Suspense } from "react";
import MockExamsContent from "./content";

function MockExamsSpinner() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16
      }}
    >
      <style>{"@keyframes sp { to { transform: rotate(360deg); } }"}</style>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid rgba(212,175,55,0.15)",
          borderTopColor: "#D4AF37",
          animation: "sp 0.8s linear infinite"
        }}
      />
      <p
        style={{
          fontSize: 11,
          color: "#9ca3af",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase"
        }}
      >
        Loading…
      </p>
    </div>
  );
}

export default function MockExamsPage() {
  return (
    <Suspense fallback={<MockExamsSpinner />}>
      <MockExamsContent />
    </Suspense>
  );
}
