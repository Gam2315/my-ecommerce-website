"use client";

import { useEffect } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      // Decode JWT to get user info without a library
      try {
        const payload = credentialResponse.credential.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        onLoginSuccess(decodedPayload);
        onClose();
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="p-8 pb-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
            <span className="font-black text-xl">X</span>
          </div>
          <h2 className="text-2xl font-bold text-[#111] mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm mb-8">
            Please log in with your Google account to continue to XtraFashion.
          </p>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
