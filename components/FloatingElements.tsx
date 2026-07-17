"use client";

import { ChevronUp } from "lucide-react";

export default function FloatingElements() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>

      {/* Scroll to top */}
      <button
        className="scroll-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp size={18} />
      </button>
    </>
  );
}
