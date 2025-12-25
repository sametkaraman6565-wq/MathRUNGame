import React from "react";

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ className, style }) => {
  return (
    <svg
      width="300"
      height="80"
      viewBox="0 0 300 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* --- TANIMLAMALAR (GRADYANLAR) --- */}
      <defs>
        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>

      {/* --- ARKA PLAN HIZ ÇİZGİLERİ --- */}
      <path d="M20 50 L280 50" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="10 10" />
      <path d="M40 65 L260 65" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="5 5" />

      {/* --- SÜSLEMELER (MATEMATİK SEMBOLLERİ) --- */}
      <text x="10" y="30" fill="#22c55e" fontSize="24" fontWeight="bold" opacity="0.6">+</text>
      <text x="270" y="30" fill="#f59e0b" fontSize="24" fontWeight="bold" opacity="0.6">÷</text>
      
      {/* --- ANA METİN: MATH --- */}
      <text
        x="35"
        y="55"
        fontFamily="system-ui, sans-serif"
        fontWeight="900"
        fontSize="48"
        fill="url(#blueGrad)"
        style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
      >
        MATH
      </text>

      {/* --- ANA METİN: RUN (İtalik) --- */}
      <text
        x="185"
        y="55"
        fontFamily="system-ui, sans-serif"
        fontWeight="900"
        fontSize="48"
        fontStyle="italic"
        fill="url(#redGrad)"
        style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
      >
        RUN
      </text>

      {/* --- ALT ÇİZGİ EFEKTİ --- */}
      <path 
        d="M40 70 Q 150 85, 260 60" 
        stroke="url(#blueGrad)" 
        strokeWidth="4" 
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
};

export default Logo;