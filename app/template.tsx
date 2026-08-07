"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const MIN_LOADER_MS = 300; // minimum breathing time so it feels intentional
const FADE_OUT_MS = 300;   // must match .loading-screen-fade-out CSS duration
const MAX_WAIT_MS = 2500;  // safety cap — never wait longer than this

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLoader, setShowLoader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevPathRef = useRef(pathname);
  const transitionedRef = useRef(false);

  // Clean up all pending timers/rafs
  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (capTimerRef.current) clearTimeout(capTimerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  // Smoothly hand off from loader to content
  const startTransition = useCallback(() => {
    if (transitionedRef.current) return; // only run once per navigation
    transitionedRef.current = true;
    cleanup();

    setFadeOut(true);

    timerRef.current = setTimeout(() => {
      setShowLoader(false);
      setContentKey((k) => k + 1);
      requestAnimationFrame(() => {
        setAnimateContent(true);
      });
    }, FADE_OUT_MS);
  }, [cleanup]);

  useEffect(() => {
    // On route change, reset everything
    if (prevPathRef.current !== pathname) {
      cleanup();
      transitionedRef.current = false;
      setShowLoader(true);
      setFadeOut(false);
      setAnimateContent(false);
    }
    prevPathRef.current = pathname;

    const mountTime = performance.now();

    // Safety cap — never let the loader hang indefinitely
    capTimerRef.current = setTimeout(startTransition, MAX_WAIT_MS);

    // Wait for React commit + browser paint
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        // Browser has painted. Now check if eagerly-loaded images are ready.
        const el = contentRef.current;
        const images = el
          ? Array.from(el.querySelectorAll<HTMLImageElement>("img")).filter(
              (img) => img.loading !== "lazy" || img.complete
            )
          : [];
        const pending = images.filter((img) => !img.complete);

        // Once all conditions are met, respect the minimum breathing time
        const scheduleTransition = () => {
          const elapsed = performance.now() - mountTime;
          const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
          timerRef.current = setTimeout(startTransition, remaining);
        };

        if (pending.length === 0) {
          // No pending images — schedule transition after min breathing time
          scheduleTransition();
        } else {
          // Wait for pending images, then transition
          let loaded = 0;
          const onImageReady = () => {
            loaded++;
            if (loaded >= pending.length) scheduleTransition();
          };
          pending.forEach((img) => {
            img.addEventListener("load", onImageReady, { once: true });
            img.addEventListener("error", onImageReady, { once: true });
          });
        }
      });
    });

    return cleanup;
  }, [pathname, cleanup, startTransition]);

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
      <div
        ref={contentRef}
        key={`${pathname}-${contentKey}`}
        className={animateContent ? "animate-page-enter" : ""}
        style={animateContent ? undefined : { opacity: 0 }}
      >
        {children}
      </div>
    </>
  );
}
