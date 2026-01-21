"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmoothLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  minLoadTime?: number; // Minimum time to show loader (ms)
  className?: string;
}

export function SmoothLoader({
  isLoading,
  children,
  minLoadTime = 300,
  className,
}: SmoothLoaderProps) {
  const [showContent, setShowContent] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Wait for minimum load time before showing content
      const timer = setTimeout(() => {
        setShowContent(true);
        // Hide loader after content fades in
        setTimeout(() => setShowLoader(false), 300);
      }, minLoadTime);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setShowLoader(true);
    }
  }, [isLoading, minLoadTime]);

  return (
    <div className={cn("relative", className)}>
      {/* Content with smooth fade-in */}
      <div
        className={cn(
          "transition-opacity duration-500 ease-in-out",
          showContent && !isLoading ? "opacity-100" : "opacity-0"
        )}
      >
        {children}
      </div>

      {/* Loading overlay with smooth fade-out */}
      {showLoader && (
        <div
          className={cn(
            "absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300",
            isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Loader2 className="h-8 w-8 animate-spin text-iherb-green" />
        </div>
      )}
    </div>
  );
}
