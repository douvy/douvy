import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface StripedFrameProps {
  /** Must be unique per instance - duplicate SVG pattern ids are invalid HTML. */
  patternId: string;
  /** Extra layout classes for the outer frame. */
  className?: string;
  children: React.ReactNode;
}

/**
 * Bordered frame with the diagonal-stripe pattern peeking through the
 * padding, used around the profile picture and every project slider.
 */
export default function StripedFrame({
  patternId,
  className = "",
  children,
}: StripedFrameProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <div
      className={`relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out ${
        theme === "dark"
          ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
          : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
      } ${className}`}
    >
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={patternId}
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="4"
                stroke="#3B82F6"
                strokeWidth="1.5"
                opacity="0.35"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>
      {children}
    </div>
  );
}
