"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
  onClick={scrollToTop}
  className="fixed bottom-6 right-6 flex items-center justify-center h-12 w-12 
             rounded-full bg-primary text-white shadow-lg hover:scale-110 
             hover:shadow-xl transition-all duration-200 cursor-pointer"
  aria-label="Scroll to top"
>
  <ArrowUp className="h-5 w-5" />
</button>

  );
}
