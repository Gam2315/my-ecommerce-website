"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CheckCircle2, ShoppingBag, User, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function EmailConfirmedPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors flex flex-col font-[family-name:var(--font-inter)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-5 py-16 relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#e6193c]/15 to-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Card Container */}
        <div className="max-w-lg w-full bg-white dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center relative z-10 animate-fade-in-up">
          
          {/* Celebrating Badge Icon */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.15)] animate-bounce-subtle">
              <CheckCircle2 size={48} strokeWidth={2.2} />
            </div>
            <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-[#e6193c]">
              <Sparkles size={18} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 font-[family-name:var(--font-playfair)]">
            Email Confirmed!
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            Welcome to <span className="font-bold text-gray-900 dark:text-white">XtraFashion</span>. Your account has been successfully verified and you are now logged in.
          </p>

          {/* User Email Badge (if loaded) */}
          {!loading && userEmail && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-full border border-gray-200/80 dark:border-gray-700/80 text-sm font-medium text-gray-700 dark:text-gray-300 mb-8">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Verified Account: <strong className="text-gray-900 dark:text-white">{userEmail}</strong></span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#e6193c] hover:bg-[#d01735] text-white font-semibold text-sm tracking-wide transition-all duration-300 shadow-[0_6px_20px_rgba(230,25,60,0.3)] hover:shadow-[0_8px_25px_rgba(230,25,60,0.45)] hover:-translate-y-0.5"
            >
              <ShoppingBag size={18} />
              <span>Start Shopping</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm tracking-wide transition-all duration-200"
            >
              <User size={18} />
              <span>My Account</span>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-8 border-t border-gray-100 dark:border-gray-800/80 pt-6">
            Thank you for joining our fashion community. Enjoy exclusive collections and member rewards.
          </p>
        </div>
      </main>
    </div>
  );
}
