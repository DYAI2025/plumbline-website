import { useEffect, useState } from 'react';
import EvidenceTag from './EvidenceTag';

export default function PlumblineScene() {
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    // Mount-triggered physical drop
    const timer = setTimeout(() => {
      setActivated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center select-none overflow-visible">
      
      {/* Laser Light Column & Angular Lens Reflection */}
      <div className="absolute top-0 w-[1px] h-full bg-gradient-to-b from-evidence-amber/20 via-evidence-amber/5 to-transparent pointer-events-none z-0" />
      <div className="absolute -top-40 w-[220px] h-[600px] bg-evidence-amber/[0.025] rounded-full blur-[100px] pointer-events-none transform -rotate-12" />
      
      {/* Technical Forensic Circular Rings behind */}
      <div className="absolute w-72 h-72 border border-evidence-amber/[0.03] rounded-full flex items-center justify-center pointer-events-none">
        <div className="w-56 h-56 border border-dashed border-evidence-amber/[0.02] rounded-full" />
        <div className="w-36 h-36 border border-evidence-amber/[0.01] rounded-full" />
      </div>

      {/* Floating Coordinate Labels around the plumbline */}
      <div className="absolute inset-0 pointer-events-none font-mono text-[9px] text-[#a6a39e]/30">
        <div className="absolute top-[15%] left-[6%] md:left-[20%] flex items-center gap-2">
          <span>X-AXIS: 0.0000_TRUE</span>
          <span className="w-1.5 h-1.5 bg-evidence-amber/30 rounded-full animate-pulse" />
        </div>
        <div className="absolute top-[45%] right-[6%] md:right-[22%] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-evidence-red/30 rounded-full animate-pulse" />
          <span>DEVIATION: +/- 0.0000m</span>
        </div>
        <div className="absolute bottom-[20%] left-[8%] md:left-[24%]">
          <span>GRAVITATIONAL INDEX: 9.80665_CGS</span>
        </div>
      </div>

      {/* Primary SVG Hanging Plumb Bob assembly */}
      <div className="relative flex flex-col items-center pointer-events-auto z-10">
        
        {/* The Thin Cord (Wire) */}
        <div className={`w-[1px] bg-gradient-to-b from-white/40 via-white/20 to-white/40 transition-all ${
          activated 
            ? 'h-[240px] opacity-100 animate-wire-drop' 
            : 'h-[100px] opacity-0'
        }`} />

        {/* The Plumb Bob Metallic Body */}
        <div className={`relative flex flex-col items-center origin-top ${
          activated 
            ? 'animate-wire-drop animate-plumb-vibrate opacity-100' 
            : 'opacity-0'
        }`}
        style={{ marginTop: '-2px' }}>
          
          <svg
            width="60"
            height="110"
            viewBox="0 0 60 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
          >
            <defs>
              {// Steel brushed gradients with hard key shadows & metallic sheen
              }
              <linearGradient id="metal-cap-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#404347" />
                <stop offset="35%" stopColor="#8c9199" />
                <stop offset="50%" stopColor="#eff2f7" />
                <stop offset="65%" stopColor="#8c9199" />
                <stop offset="100%" stopColor="#303235" />
              </linearGradient>

              <linearGradient id="metal-cone-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e2022" />
                <stop offset="25%" stopColor="#5d6066" />
                <stop offset="42%" stopColor="#c5cbd6" />
                <stop offset="58%" stopColor="#eff2f7" />
                <stop offset="78%" stopColor="#5d6066" />
                <stop offset="100%" stopColor="#1a1c1d" />
              </linearGradient>
            </defs>

            {/* Small top cap thread joint */}
            <rect x="27" y="0" width="6" height="6" fill="#4a4c50" rx="1" />

            {/* Cylinder Metal Cap - Brushed Steel with subtle grooves */}
            <rect x="20" y="6" width="20" height="14" fill="url(#metal-cap-grad)" rx="1" />
            <line x1="20" y1="11" x2="40" y2="11" stroke="#25272a" strokeWidth="0.5" />
            <line x1="20" y1="16" x2="40" y2="16" stroke="#25272a" strokeWidth="0.5" />

            {/* Heavy Conical Metallic Cone Body */}
            <path
              d="M 12 20 L 48 20 Q 48 23 45 27 L 30 102 L 15 27 Q 12 23 12 20 Z"
              fill="url(#metal-cone-grad)"
              stroke="#000000"
              strokeWidth="0.5"
            />

            {/* Mirror highlights and physical details on the brass/steel cone */}
            <path
              d="M 15 25 L 45 25 M 18 35 L 42 35 M 21 45 L 39 45"
              stroke="white"
              strokeOpacity="0.06"
              strokeWidth="1"
            />

            {/* Sharp Centered Tip - Ultimate weight target point */}
            <path d="M 30 102 L 31 106 L 30 110 L 29 106 Z" fill="#ebedef" />
          </svg>

          {/* Under-plumb shadow overlay on imaginary grid plane */}
          <div className="absolute -bottom-1 w-[40px] h-[8px] bg-evidence-amber/5 blur-[2px] border border-evidence-amber/20 rounded-full z-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-evidence-amber/80 rounded-full animate-ping [animation-duration:3s]" />
          </div>
        </div>
      </div>

      {/* Floating Evidence Labels for product relevance (Floating labels layout) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 flex-wrap max-w-lg px-4 pointer-events-auto">
        <EvidenceTag status="fake-only" label="fake-only" />
        <EvidenceTag status="real-boundary-smoke" label="real-boundary-smoke" />
        <EvidenceTag status="user-confirmed" label="user-confirmed" />
        <EvidenceTag status="contradiction" label="contradiction" />
      </div>

    </div>
  );
}
