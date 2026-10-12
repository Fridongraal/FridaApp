import React, { useState } from "react";
import { playFridaBarkSound } from "../services/audio";

interface FridaMascotProps {
  mood?: "happy" | "studying" | "celebrating" | "sleepy";
  className?: string;
  size?: number;
  interactive?: boolean;
}

export const FridaMascot: React.FC<FridaMascotProps> = ({
  mood = "happy",
  className = "",
  size = 120, // Increased default size
  interactive = true,
}) => {
  const [isReacting, setIsReacting] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    playFridaBarkSound();
    setIsReacting(true);
    const phrases = [
      "¡Guau! 🐾",
      "¡Tú puedes! ✨",
      "¡A estudiar! 📚",
      "¡Vamos bien! 🌟",
      "🐾 *Wiggle*",
      "¡Genial! 💖",
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setBubbleText(phrase);
    setTimeout(() => setIsReacting(false), 500);
    setTimeout(() => setBubbleText(null), 1400);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? "cursor-pointer active:scale-95 transition-transform" : ""
      } ${isReacting ? "animate-bounce" : ""} ${className}`}
      style={{ width: size, height: size }}
      title={interactive ? "¡Haz clic en Frida! 🐾" : undefined}
    >
      {bubbleText && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-white text-purple-700 text-[11px] font-extrabold rounded-full shadow-md border border-purple-200 whitespace-nowrap animate-in fade-in zoom-in-75 duration-150 z-20 pointer-events-none">
          {bubbleText}
        </div>
      )}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-[1.04]"
      >
        <defs>
          <linearGradient
            id="fridaHead"
            x1="20"
            y1="20"
            x2="100"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E9D8FD" /> {/* Light lavender */}
            <stop offset="1" stopColor="#D6BCFA" />{" "}
            {/* Slightly darker lavender */}
          </linearGradient>
          <linearGradient
            id="fridaSnout"
            x1="40"
            y1="60"
            x2="80"
            y2="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F3E8FF" />
            <stop offset="1" stopColor="#E9D8FD" />
          </linearGradient>
          <linearGradient
            id="fridaEarDark"
            x1="20"
            y1="10"
            x2="40"
            y2="50"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9F7AEA" />
            <stop offset="1" stopColor="#805AD5" />
          </linearGradient>
          <linearGradient
            id="fridaEarLight"
            x1="80"
            y1="10"
            x2="100"
            y2="50"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9F7AEA" />
            <stop offset="1" stopColor="#805AD5" />
          </linearGradient>
          <linearGradient
            id="fridaCollar"
            x1="40"
            y1="95"
            x2="80"
            y2="105"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F6AD55" /> {/* Orange collar */}
            <stop offset="1" stopColor="#ED8936" />
          </linearGradient>
        </defs>

        {/* Left Ear - Blocky but rounded */}
        <path
          d="M 28 50 L 22 25 Q 20 15 30 15 L 40 18 Q 45 20 42 30 L 38 50 Z"
          fill="url(#fridaEarDark)"
        />
        <path
          d="M 30 45 L 26 26 Q 25 18 31 18 L 36 20 Q 39 21 37 27 L 35 45 Z"
          fill="#E9D8FD"
          opacity="0.6"
        />

        {/* Right Ear - Flopped over slightly */}
        <path
          d="M 92 50 L 98 25 Q 100 15 90 15 L 80 18 Q 75 20 78 30 L 82 50 Z"
          fill="url(#fridaEarLight)"
        />
        <path
          d="M 90 45 L 94 26 Q 95 18 89 18 L 84 20 Q 81 21 83 27 L 85 45 Z"
          fill="#E9D8FD"
          opacity="0.6"
        />

        {/* Head - Blocky, rounded rectangle (Bluey inspired) */}
        <rect
          x="25"
          y="30"
          width="70"
          height="70"
          rx="28"
          fill="url(#fridaHead)"
        />

        {/* Eyebrow Spots */}
        <ellipse
          cx="42"
          cy="40"
          rx="6"
          ry="10"
          fill="#F3E8FF"
          opacity="0.8"
          transform="rotate(-15 42 40)"
        />
        <ellipse
          cx="78"
          cy="40"
          rx="6"
          ry="10"
          fill="#F3E8FF"
          opacity="0.8"
          transform="rotate(15 78 40)"
        />

        {/* Snout - Blockier shape extending outwards */}
        <path
          d="M 35 65 Q 35 55 60 55 Q 85 55 85 65 L 82 82 Q 80 92 60 92 Q 40 92 38 82 Z"
          fill="url(#fridaSnout)"
        />

        {/* Nose - Big and rounded */}
        <rect x="50" y="55" width="20" height="14" rx="7" fill="#2D3748" />
        {/* Nose shine */}
        <ellipse
          cx="55"
          cy="59"
          rx="3"
          ry="1.5"
          fill="#FFFFFF"
          opacity="0.5"
          transform="rotate(-10 55 59)"
        />

        {/* Eyes based on mood */}
        {mood === "sleepy" ? (
          <>
            <path
              d="M 36 48 Q 42 53 48 48"
              stroke="#2D3748"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 72 48 Q 78 53 84 48"
              stroke="#2D3748"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Zzz */}
            <path
              d="M 85 25 L 95 25 L 85 35 L 95 35"
              stroke="#805AD5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.6"
            />
          </>
        ) : mood === "studying" ? (
          <>
            {/* Studying Glasses */}
            <rect
              x="32"
              y="42"
              width="22"
              height="16"
              rx="4"
              stroke="#805AD5"
              strokeWidth="3"
              fill="rgba(255, 255, 255, 0.5)"
            />
            <rect
              x="66"
              y="42"
              width="22"
              height="16"
              rx="4"
              stroke="#805AD5"
              strokeWidth="3"
              fill="rgba(255, 255, 255, 0.5)"
            />
            <line
              x1="54"
              y1="50"
              x2="66"
              y2="50"
              stroke="#805AD5"
              strokeWidth="3"
            />

            {/* Focused Eyes */}
            <circle cx="43" cy="50" r="4" fill="#2D3748" />
            <circle cx="77" cy="50" r="4" fill="#2D3748" />
          </>
        ) : (
          <>
            {/* Happy / Default Eyes - Big friendly circles */}
            <circle cx="42" cy="48" r="7" fill="#2D3748" />
            <circle cx="40" cy="46" r="2.5" fill="#FFFFFF" />

            <circle cx="78" cy="48" r="7" fill="#2D3748" />
            <circle cx="76" cy="46" r="2.5" fill="#FFFFFF" />
          </>
        )}

        {/* Cheeks */}
        <ellipse cx="32" cy="65" rx="5" ry="3" fill="#F687B3" opacity="0.4" />
        <ellipse cx="88" cy="65" rx="5" ry="3" fill="#F687B3" opacity="0.4" />

        {/* Mouth */}
        {mood === "celebrating" ? (
          <path
            d="M 52 75 Q 60 85 68 75 Z"
            fill="#F687B3"
            stroke="#2D3748"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ) : mood === "sleepy" ? (
          <path
            d="M 55 78 Q 60 80 65 78"
            stroke="#2D3748"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 54 75 Q 60 82 66 75"
            stroke="#2D3748"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Celebrating Party Elements */}
        {mood === "celebrating" && (
          <g>
            {/* Star 1 */}
            <path
              d="M 20 20 L 22 26 L 28 28 L 22 30 L 20 36 L 18 30 L 12 28 L 18 26 Z"
              fill="#F6E05E"
            />
            {/* Star 2 */}
            <path
              d="M 100 30 L 101 34 L 105 35 L 101 36 L 100 40 L 99 36 L 95 35 L 99 34 Z"
              fill="#F6E05E"
            />
          </g>
        )}

        {/* Collar */}
        <path
          d="M 35 96 Q 60 102 85 96"
          stroke="url(#fridaCollar)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Name Tag / Bone Tag */}
        <path
          d="M 55 102 C 55 98, 65 98, 65 102 C 67 102, 67 108, 65 108 C 65 112, 55 112, 55 108 C 53 108, 53 102, 55 102 Z"
          fill="#F6E05E"
          stroke="#D69E2E"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};
