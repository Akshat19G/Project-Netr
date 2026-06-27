import { motion } from "framer-motion";

type Mode = "idle" | "thinking" | "wave" | "celebrate";

/**
 * Netr AI mascot — friendly, minimal robot in Ashoka Blue + saffron + green.
 * Pure inline SVG so it scales crisply and themes via currentColor-adjacent tokens.
 */
export function NetrBot({
  size = 64,
  mode = "idle",
  className = "",
  ariaLabel = "Netr AI",
}: {
  size?: number;
  mode?: Mode;
  className?: string;
  ariaLabel?: string;
}) {
  const float =
    mode === "thinking"
      ? { y: [0, -3, 0] }
      : mode === "wave" || mode === "celebrate"
        ? { y: [0, -5, 0], rotate: [-2, 2, -2] }
        : { y: [0, -2, 0] };

  const floatDur = mode === "thinking" ? 1.6 : mode === "celebrate" ? 0.9 : 3.4;

  // Eye glow pulses faster while thinking.
  const eyeOpacity = mode === "thinking" ? [1, 0.55, 1] : [1, 0.85, 1];
  const eyeDur = mode === "thinking" ? 1.1 : 2.6;

  // Occasional blink (scaleY) — every cycle for thinking, sparing otherwise.
  const blinkTimes = mode === "thinking" ? [0, 0.4, 0.45, 0.5, 1] : [0, 0.92, 0.95, 0.98, 1];
  const blinkValues = [1, 1, 0.08, 1, 1];
  const blinkDur = mode === "thinking" ? 2.2 : 5;

  return (
    <motion.div
      role="img"
      aria-label={ariaLabel}
      className={className}
      animate={float}
      transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size, display: "inline-block" }}
    >
      <svg viewBox="0 0 128 128" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="netrbot-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EEF4FF" />
          </linearGradient>
          <linearGradient id="netrbot-visor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A2A66" />
            <stop offset="100%" stopColor="#0B3A8C" />
          </linearGradient>
          <radialGradient id="netrbot-eye" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0%" stopColor="#E8F1FF" />
            <stop offset="55%" stopColor="#7FB0FF" />
            <stop offset="100%" stopColor="#1F5BD6" />
          </radialGradient>
          <radialGradient id="netrbot-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#0A2A66" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0A2A66" stopOpacity="0" />
          </radialGradient>
          <filter id="netrbot-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Soft ground shadow */}
        <ellipse cx="64" cy="118" rx="28" ry="4" fill="url(#netrbot-shadow)" />

        {/* Antenna */}
        <line
          x1="64"
          y1="14"
          x2="64"
          y2="24"
          stroke="#0B3A8C"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <motion.circle
          cx="64"
          cy="12"
          r="3.4"
          fill="#FF9933"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Head */}
        <rect
          x="22"
          y="24"
          width="84"
          height="64"
          rx="22"
          fill="url(#netrbot-body)"
          stroke="#D7E2F4"
          strokeWidth="1.5"
        />

        {/* Side ears */}
        <rect x="14" y="46" width="10" height="20" rx="4" fill="#0B3A8C" />
        <rect x="104" y="46" width="10" height="20" rx="4" fill="#0B3A8C" />
        <circle cx="19" cy="56" r="2" fill="#138808" />
        <circle cx="109" cy="56" r="2" fill="#138808" />

        {/* Visor / face plate */}
        <rect x="32" y="36" width="64" height="36" rx="16" fill="url(#netrbot-visor)" />

        {/* Visor highlight */}
        <rect x="36" y="40" width="20" height="6" rx="3" fill="#FFFFFF" opacity="0.18" />

        {/* Eyes — glowing */}
        <g>
          <motion.g
            animate={{ scaleY: blinkValues }}
            transition={{
              duration: blinkDur,
              times: blinkTimes,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "50px 54px", transformBox: "fill-box" as never }}
          >
            <circle cx="50" cy="54" r="8" fill="url(#netrbot-eye)" filter="url(#netrbot-soft)" />
            <motion.circle
              cx="50"
              cy="54"
              r="3.4"
              fill="#FFFFFF"
              animate={{ opacity: eyeOpacity }}
              transition={{ duration: eyeDur, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.g>
          <motion.g
            animate={{ scaleY: blinkValues }}
            transition={{
              duration: blinkDur,
              times: blinkTimes,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.05,
            }}
            style={{ transformOrigin: "78px 54px", transformBox: "fill-box" as never }}
          >
            <circle cx="78" cy="54" r="8" fill="url(#netrbot-eye)" filter="url(#netrbot-soft)" />
            <motion.circle
              cx="78"
              cy="54"
              r="3.4"
              fill="#FFFFFF"
              animate={{ opacity: eyeOpacity }}
              transition={{ duration: eyeDur, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            />
          </motion.g>
        </g>

        {/* Smile */}
        <path
          d="M54 64 Q64 70 74 64"
          fill="none"
          stroke="#9DB9E8"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Cheek blush — saffron + green dots for trust accents */}
        <circle cx="38" cy="62" r="2" fill="#FF9933" opacity="0.75" />
        <circle cx="90" cy="62" r="2" fill="#138808" opacity="0.75" />

        {/* Body / collar */}
        <rect
          x="36"
          y="86"
          width="56"
          height="22"
          rx="11"
          fill="#FFFFFF"
          stroke="#D7E2F4"
          strokeWidth="1.5"
        />
        <circle cx="56" cy="97" r="2.4" fill="#FF9933" />
        <circle cx="64" cy="97" r="2.4" fill="#0B3A8C" />
        <circle cx="72" cy="97" r="2.4" fill="#138808" />

        {/* Thinking dots */}
        {mode === "thinking" && (
          <g transform="translate(96 28)">
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={i * 6}
                cy={0}
                r={2.2}
                fill="#0B3A8C"
                animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.18,
                }}
              />
            ))}
          </g>
        )}
      </svg>
    </motion.div>
  );
}

export default NetrBot;
