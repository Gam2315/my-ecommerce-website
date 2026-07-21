"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, EyeOff, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [token, setToken] = useState("");

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user?.identities?.length === 0) {
      toast.error("An account with this email already exists.");
      setIsLoading(false);
      return;
    }

    toast.success("Confirmation code sent! Please check your email.");
    setIsVerifying(true);
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Email verified successfully! You are now logged in.");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex font-[family-name:var(--font-inter)] bg-white dark:bg-[#0a0a0a] transition-colors relative">
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-800 dark:text-white lg:text-white lg:bg-white/10 lg:hover:bg-white/20 transition-colors"
        aria-label="Back to home"
      >
        <ArrowLeft size={20} />
      </Link>

      {/* Left Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#e6193c] flex-col justify-center items-center relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at center, #ffffff 0%, transparent 70%)" }}></div>
        
        <div className="z-10 text-center px-12">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 select-none mb-10">
            <span
              className="flex h-16 w-16 items-center justify-center border-4 border-white text-white text-3xl font-black leading-none bg-transparent"
              style={{ borderRadius: 6 }}
            >
              X
            </span>
            <span className="text-4xl font-extrabold tracking-wide text-white">
              TRAFASHION<span className="text-white">.</span>
            </span>
          </Link>

          <h1 className="text-white text-3xl font-medium tracking-wide font-[family-name:var(--font-playfair)]">
            Join the leading fashion <br />
            destination today
          </h1>
        </div>
      </div>

      {/* Right Signup Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50/50 dark:bg-[#0a0a0a] p-6 sm:p-12 transition-colors">
        <div className="bg-white dark:bg-[#111] w-full max-w-md p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none border border-transparent dark:border-gray-800 rounded-xl relative transition-colors">
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isVerifying ? "Check your email" : "Create an Account"}
            </h2>
          </div>

          {!isVerifying ? (
            <form className="space-y-4" onSubmit={handleEmailSignup}>
              <div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" 
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded p-3 text-sm focus:outline-none focus:border-[#e6193c] dark:focus:border-[#e6193c] focus:ring-1 focus:ring-[#e6193c] transition-colors"
                />
              </div>
              
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded p-3 text-sm focus:outline-none focus:border-[#e6193c] dark:focus:border-[#e6193c] focus:ring-1 focus:ring-[#e6193c] transition-colors pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 bg-[#e6193c] text-white font-medium py-3 rounded hover:bg-[#c41432] transition-colors mt-2 disabled:opacity-70"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                SIGN UP
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We sent a 6-digit confirmation code to <br />
                <strong className="text-gray-900 dark:text-white">{email}</strong>
              </p>
              <div>
                <input 
                  type="text" 
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit code" 
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded p-4 text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:border-[#e6193c] dark:focus:border-[#e6193c] focus:ring-1 focus:ring-[#e6193c] transition-colors"
                  maxLength={6}
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading || token.length !== 6}
                className="w-full flex justify-center items-center gap-2 bg-[#e6193c] text-white font-medium py-3 rounded hover:bg-[#c41432] transition-colors mt-2 disabled:opacity-70"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                VERIFY & LOG IN
              </button>
              <button 
                type="button"
                onClick={() => setIsVerifying(false)}
                className="w-full mt-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Change email address
              </button>
            </form>
          )}

          {!isVerifying && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 rounded py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                
                <button 
                  onClick={handleGoogleSignup}
                  className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 rounded py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Google
                </button>
              </div>

              <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                By signing up, you agree to XtraFashion's <a href="#" className="text-[#e6193c] hover:underline">Terms of Service</a> & <a href="#" className="text-[#e6193c] hover:underline">Privacy Policy</a>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account? <Link href="/login" className="text-[#e6193c] font-medium hover:underline">Log In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
