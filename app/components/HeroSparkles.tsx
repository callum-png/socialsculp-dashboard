"use client";
import { SparklesCore } from "@/components/ui/sparkles";

// Renamed conceptually to SiteSparkles — fixed overlay covering the entire page
export function HeroSparkles() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5, // above bg layers (z:1-2), below page content (z:10)
      }}
      aria-hidden="true"
    >
      <SparklesCore
        id="site-sparkles"
        background="transparent"
        minSize={0.3}
        maxSize={1.0}
        particleDensity={30}
        particleColor="#008CFF"
        speed={1.0}
        className="w-full h-full"
      />
    </div>
  );
}
