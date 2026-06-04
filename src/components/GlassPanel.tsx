import React, { useState } from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  metaID?: string;
  title?: string;
}

export default function GlassPanel({ children, className = '', metaID = 'REF-00X', title }: GlassPanelProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative satin-panel ${
        hovered 
          ? 'border-evidence-amber/40 shadow-[0_12px_40px_rgba(18,20,27,0.85)]' 
          : 'border-white/5'
      } p-6 transition-all duration-300 rounded-md group overflow-hidden ${className}`}
    >
      {/* Decorative coordinate corners with warm bronze status */}
      <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l transition-colors duration-300 ${hovered ? 'border-evidence-amber/70' : 'border-white/10'}`} />
      <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r transition-colors duration-300 ${hovered ? 'border-evidence-amber/70' : 'border-white/10'}`} />
      <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l transition-colors duration-300 ${hovered ? 'border-evidence-amber/70' : 'border-white/10'}`} />
      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r transition-colors duration-300 ${hovered ? 'border-evidence-amber/70' : 'border-white/10'}`} />

      {/* Decorative top micro rail with forensic ID */}
      <div className="flex items-center justify-between font-mono text-[9px] text-muted uppercase tracking-widest mb-4 select-none pb-2 border-b border-white/5">
        <span className="flex items-center gap-1.5">
          <span className={`w-1 h-1 rounded-sm ${hovered ? 'bg-[#3cdca2] animate-pulse glow-green' : 'bg-dim'}`} />
          {title || 'SYSTEM STATUS LOGS'}
        </span>
        <span className={`transition-colors duration-300 ${hovered ? 'text-white' : ''}`}>{metaID}</span>
      </div>

      {/* Main Content */}
      <div className="relative z-10">{children}</div>

      {/* Subliminal grid indicator when hovered */}
      {hovered && (
        <div className="absolute inset-0 bg-white/[0.005] pointer-events-none transition-opacity duration-300"></div>
      )}
    </div>
  );
}
