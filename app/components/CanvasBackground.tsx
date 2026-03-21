"use client";
import { useEffect } from "react";
import { renderCanvas } from "@/components/ui/canvas";

export function CanvasBackground() {
  useEffect(() => {
    // Only initialize on cursor-based (non-touch) devices
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      renderCanvas();
    }
  }, []);

  return (
    <canvas
      className="pointer-events-none absolute inset-0 mx-auto canvas-desktop-only"
      id="canvas"
      style={{ zIndex: -1 }}
    />
  );
}
