"use client";

import dynamic from "next/dynamic";
import Toolbar from "@/components/Toolbar";

// Konva requires window, so we must load the canvas client-side only
const InfiniteCanvas = dynamic(() => import("@/components/InfiniteCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-screen bg-white text-gray-400">
      Loading canvas...
    </div>
  ),
});

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Toolbar />
      <div className="pt-12 w-full h-full">
        <InfiniteCanvas />
      </div>
    </div>
  );
}
