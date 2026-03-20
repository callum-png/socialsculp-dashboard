"use client";
import { useEffect } from "react";
import { renderCanvas } from "@/components/ui/canvas";

export function CanvasBackground() {
  useEffect(() => {
    renderCanvas();
  }, []);

  return (
    <canvas
      className="pointer-events-none absolute inset-0 mx-auto"
      id="canvas"
    />
  );
}
