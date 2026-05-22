import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  dark?: boolean;
}

export function Logo({ className = "h-12", showText = true, dark = false }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* Icon */}
      <svg viewBox="0 0 100 100" className="w-auto h-full flex-shrink-0 overflow-visible">
        {/* Central black/white dot */}
        <circle cx="50" cy="50" r="7" fill={dark ? "#ffffff" : "#1f2937"} />
        
        {/* Red Arc (Top Right) */}
        <circle 
          cx="50" cy="50" r="32" 
          fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="42 159" strokeDashoffset="0"
          transform="rotate(-88 50 50)"
        />
        
        {/* Yellow/Orange Arc (Bottom Right) */}
        <circle 
          cx="50" cy="50" r="32" 
          fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="42 159" strokeDashoffset="0"
          transform="rotate(2 50 50)"
        />
        
        {/* Green Arc (Bottom Left) */}
        <circle 
          cx="50" cy="50" r="32" 
          fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="42 159" strokeDashoffset="0"
          transform="rotate(92 50 50)"
        />
        
        {/* Purple Arc (Top Left) */}
        <circle 
          cx="50" cy="50" r="32" 
          fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="42 159" strokeDashoffset="0"
          transform="rotate(182 50 50)"
        />
      </svg>

      {/* Text and Underlines */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="leading-none tracking-tight">
            <span className={`font-black text-2xl tracking-normal ${dark ? 'text-white' : 'text-gray-900'}`}>
              gabinete
            </span>
          </div>
          <div className="leading-none tracking-tight mt-1">
            <span className={`text-xl font-normal tracking-wide ${dark ? 'text-gray-300' : 'text-gray-800'}`}>
              conectado
            </span>
          </div>
          <div className="flex gap-1.5 mt-2.5">
            <span className="w-7 h-1 rounded-full bg-[#ef4444]"></span>
            <span className="w-7 h-1 rounded-full bg-[#f59e0b]"></span>
            <span className="w-7 h-1 rounded-full bg-[#10b981]"></span>
            <span className="w-7 h-1 rounded-full bg-[#8b5cf6]"></span>
          </div>
        </div>
      )}
    </div>
  );
}
