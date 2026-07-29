"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    // Only show the loading overlay on the very first page load
    if (hasLoadedOnce.current) {
      setShowLoader(false);
      return;
    }

    hasLoadedOnce.current = true;

    // Start the fade-out animation after a brief moment
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 100);

    // Remove loader from DOM after fade-out animation completes
    const removeTimer = setTimeout(() => {
      setShowLoader(false);
    }, 700); // 100ms delay + 600ms fade-out

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {showLoader && (
        <div
          className={`loading-screen-overlay ${fadeOut ? "loading-screen-fade-out" : ""}`}
        >
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <span
              className="flex h-12 w-12 items-center justify-center border-4 border-black dark:border-white text-lg font-black leading-none text-black dark:text-white"
              style={{ borderRadius: 6 }}
            >
              X
            </span>
            <span className="text-xl font-extrabold tracking-widest text-black dark:text-white mt-2">
              TRAFASHION<span className="text-[#e6193c]">.</span>
            </span>
          </div>
        </div>
      )}
      <div className="animate-page-enter">
        {children}
      </div>
    </>
  );
}
