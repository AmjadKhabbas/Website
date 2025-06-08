import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * 3D Animated Medical Vial Component
 * Replaces the heart icon in the homepage banner with a dropping and spinning vial
 * Features:
 * - Drop-in animation from top
 * - Continuous 3D Y-axis rotation
 * - Hover effects with enhanced rotation
 * - Responsive design for mobile
 * - Performance optimized with CSS transforms
 */

interface AnimatedVialProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedVial({ className = '', size = 'lg' }: AnimatedVialProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 80, height: 80 }
  };

  const { width, height } = sizeConfig[size];

  useEffect(() => {
    // Trigger drop animation after component mounts
    const timer = setTimeout(() => setHasDropped(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width, height }}
    >
      {/* 3D Animated Vial Container */}
      <motion.div
        className="absolute inset-0 cursor-pointer"
        initial={{ 
          y: -200, // Start above viewport
          rotateY: 0,
          scale: 0.8,
          opacity: 0
        }}
        animate={{
          y: hasDropped ? 0 : -200, // Drop down animation
          rotateY: isHovered ? 360 : 180, // Enhanced rotation on hover
          scale: isHovered ? 1.1 : 1, // Slight scale on hover
          opacity: hasDropped ? 1 : 0
        }}
        transition={{
          y: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.8
          },
          rotateY: {
            duration: isHovered ? 1 : 4,
            ease: "linear",
            repeat: Infinity
          },
          scale: {
            duration: 0.2,
            ease: "easeInOut"
          },
          opacity: {
            duration: 0.3
          }
        }}
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d"
        }}
      >
        {/* Medical Vial SVG */}
        <motion.svg
          width={width}
          height={height}
          viewBox="0 0 100 120"
          className="drop-shadow-lg"
          initial={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
          animate={{ 
            filter: isHovered 
              ? "drop-shadow(0 8px 16px rgba(20, 184, 166, 0.3))" 
              : "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Vial Body Gradient */}
          <defs>
            <linearGradient id="vialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="30%" stopColor="#e0f2fe" />
              <stop offset="70%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* Vial Body */}
          <rect
            x="25"
            y="20"
            width="50"
            height="85"
            rx="8"
            ry="8"
            fill="url(#vialGradient)"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Medical Liquid */}
          <motion.rect
            x="30"
            y="35"
            width="40"
            height="65"
            rx="5"
            ry="5"
            fill="url(#liquidGradient)"
            initial={{ height: 0, y: 100 }}
            animate={{ height: 65, y: 35 }}
            transition={{ 
              duration: 1.5, 
              delay: 0.8,
              ease: "easeOut"
            }}
          />

          {/* Liquid Surface Reflection */}
          <motion.ellipse
            cx="50"
            cy="38"
            rx="18"
            ry="3"
            fill="rgba(255,255,255,0.3)"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.6 : 0.3 }}
            transition={{ duration: 0.3 }}
          />

          {/* Vial Cap */}
          <rect
            x="20"
            y="10"
            width="60"
            height="15"
            rx="7"
            ry="7"
            fill="url(#capGradient)"
            stroke="#1e293b"
            strokeWidth="1"
          />

          {/* Cap Highlight */}
          <rect
            x="25"
            y="12"
            width="50"
            height="3"
            rx="1.5"
            ry="1.5"
            fill="rgba(255,255,255,0.2)"
          />

          {/* Medical Cross Symbol */}
          <g transform="translate(45, 55)">
            <rect x="-1.5" y="-8" width="3" height="16" fill="rgba(255,255,255,0.8)" rx="1" />
            <rect x="-8" y="-1.5" width="16" height="3" fill="rgba(255,255,255,0.8)" rx="1" />
          </g>

          {/* Measurement Lines */}
          <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.5">
            <line x1="75" y1="45" x2="80" y2="45" />
            <line x1="75" y1="60" x2="80" y2="60" />
            <line x1="75" y1="75" x2="80" y2="75" />
            <line x1="75" y1="90" x2="80" y2="90" />
          </g>
        </motion.svg>

        {/* Floating Particles Effect */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-teal-300 rounded-full"
                initial={{ 
                  x: width / 2, 
                  y: height / 2,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  x: Math.random() * width,
                  y: Math.random() * height,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-xl opacity-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1.5 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}

export default AnimatedVial;