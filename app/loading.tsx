import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        {/* Logo Icon */}
        <span
          className="flex h-12 w-12 items-center justify-center border-4 border-black dark:border-white text-lg font-black leading-none text-black dark:text-white"
          style={{ borderRadius: 6 }}
        >
          X
        </span>
        {/* Logo Text */}
        <span className="text-xl font-extrabold tracking-widest text-black dark:text-white mt-2">
          TRAFASHION<span className="text-[#e6193c]">.</span>
        </span>
      </div>
    </div>
  );
}
