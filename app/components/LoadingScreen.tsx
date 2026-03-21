"use client";
import { useEffect, useState } from "react";
import { DotLoader } from "@/components/ui/dot-loader";

// Diagonal sweep animation: top-left → bottom-right → back
const loadingFrames = [
  [0],
  [1, 7],
  [2, 8, 14],
  [3, 9, 15, 21],
  [4, 10, 16, 22, 28],
  [5, 11, 17, 23, 29, 35],
  [6, 12, 18, 24, 30, 36, 42],
  [13, 19, 25, 31, 37, 43],
  [20, 26, 32, 38, 44],
  [27, 33, 39, 45],
  [34, 40, 46],
  [41, 47],
  [48],
  [41, 47],
  [34, 40, 46],
  [27, 33, 39, 45],
  [20, 26, 32, 38, 44],
  [13, 19, 25, 31, 37, 43],
  [6, 12, 18, 24, 30, 36, 42],
  [5, 11, 17, 23, 29, 35],
  [4, 10, 16, 22, 28],
  [3, 9, 15, 21],
  [2, 8, 14],
  [1, 7],
];

export function LoadingScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fade"), 2000);
    const t2 = setTimeout(() => setPhase("gone"), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#04060E",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
        opacity: phase === "fade" ? 0 : 1,
        transition: "opacity 0.7s ease",
        pointerEvents: phase === "show" ? "all" : "none",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "18px",
          color: "#F0F4FF",
          letterSpacing: "0.02em",
        }}
      >
        SOCIAL<span style={{ color: "#008CFF" }}>SCULP</span>
      </div>

      {/* Dot animation */}
      <DotLoader
        frames={loadingFrames}
        duration={80}
        dotClassName="bg-white/8 [&.active]:bg-[#008CFF] size-2 rounded-sm"
        className="gap-1"
      />

      {/* Tagline */}
      <div
        style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(120,160,200,0.6)",
        }}
      >
        Engineering Narratives
      </div>

      {/* Loading bar */}
      <div
        style={{
          width: "120px",
          height: "1px",
          background: "rgba(0,140,255,0.1)",
          borderRadius: "1px",
          overflow: "hidden",
          position: "absolute",
          bottom: "48px",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(to right, #005BB8, #008CFF)",
            borderRadius: "1px",
            animation: "ls-bar 2s ease-out forwards",
          }}
        />
      </div>
    </div>
  );
}
