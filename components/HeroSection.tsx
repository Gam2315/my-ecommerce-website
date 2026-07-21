"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return time;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function HeroSection({ activeDiscount }: { activeDiscount?: any }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [target] = useState(() => activeDiscount?.expiry_date ? new Date(activeDiscount.expiry_date) : new Date());
  const { days, hours, minutes, seconds } = useCountdown(target);

  const hasValidTimer = activeDiscount?.expiry_date && target.getTime() > Date.now();

  return (
    <section
      id="hero"
      className="relative flex min-h-[88vh] w-full items-center overflow-hidden bg-white dark:bg-gray-950 transition-colors"
    >
      <div className="mx-auto flex w-full max-w-[1340px] items-center justify-between px-5 lg:px-8">
        {/* Left content */}
        <div className="relative z-10 max-w-xl py-16 lg:py-24">
          <h1 className="text-[3.2rem] leading-[1.12] tracking-tight text-black dark:text-white lg:text-[4rem]">
            <span className="font-light font-[family-name:var(--font-playfair)]">
              Admire{" "}
            </span>
            <span className="font-light italic text-gray-500 dark:text-gray-400 font-[family-name:var(--font-playfair)]">
              Stylish
            </span>
            <br />
            <span className="font-light font-[family-name:var(--font-playfair)]">
              Dresses &{" "}
            </span>
            <span className="font-black font-[family-name:var(--font-playfair)]">
              Looks
            </span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            If we wanted to build a human-level tool to offer automated outfit
            advice, We need to understand people&apos;s fashion tastes.
          </p>

          {/* Countdown */}
          {hasValidTimer && (
            <div className="mt-7 flex gap-3">
              {[
                { value: isMounted ? pad(days) : "00", label: "Days" },
                { value: isMounted ? pad(hours) : "00", label: "Hours" },
                { value: isMounted ? pad(minutes) : "00", label: "Minutes" },
                { value: isMounted ? pad(seconds) : "00", label: "Seconds" },
              ].map((item) => (
                <div key={item.label} className="countdown-box dark:border-gray-800">
                  <span className="number dark:text-white">{item.value}</span>
                  <span className="label dark:text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#deals"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-wider text-white transition-all hover:brightness-110"
              style={{ background: "#e6193c" }}
            >
              Explore Shop
            </a>
            {activeDiscount && (
              <a
                href="#black-friday"
                className="inline-flex items-center justify-center rounded-full border-2 border-black dark:border-white bg-black dark:bg-white px-7 py-3.5 text-[13px] font-bold uppercase tracking-wider text-white dark:text-black transition-all hover:bg-gray-900 dark:hover:bg-gray-200"
              >
                {activeDiscount.name}
              </a>
            )}
          </div>
        </div>

        {/* Right — Hero image + geometric shape */}
        <div className="relative hidden h-[580px] w-[480px] flex-shrink-0 lg:block">
          {/* Red geometric star shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-[460px] w-[380px]"
              style={{
                background: "#e6193c",
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            />
          </div>

          {/* Model image */}
          <div className="relative z-10 mx-auto h-full w-[340px]">
            <Image
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&h=750&fit=crop&crop=top"
              alt="Stylish woman in elegant outfit"
              fill
              className="object-cover object-top"
              sizes="340px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
