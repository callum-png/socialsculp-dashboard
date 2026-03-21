"use client";
import { SparklesCore } from "@/components/ui/sparkles";

export function HeroSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <SparklesCore
        id="hero-sparkles"
        background="transparent"
        minSize={0.4}
        maxSize={1.2}
        particleDensity={50}
        particleColor="#008CFF"
        speed={1.2}
        className="w-full h-full"
      />
    </div>
  );
}
