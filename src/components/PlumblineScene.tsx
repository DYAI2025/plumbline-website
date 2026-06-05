import { useEffect, useState, useRef } from 'react';
import { useGravityPointer } from '../context/GravityPointerContext';
import EvidenceTag from './EvidenceTag';

export default function PlumblineScene() {
  const { subscribe, isMobile, reducedMotion } = useGravityPointer();
  const [activated, setActivated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live coordinate state for dynamic rendering
  const [shifts, setShifts] = useState({ shiftX: 0, shiftY: 0, tilt: 0 });

  // Interpolation variables held in refs to prevent React state churn during rendering ticks
  const currentShiftX = useRef(0);
  const currentShiftY = useRef(0);
  const currentTilt = useRef(0);

  const targetShiftX = useRef(0);
  const targetShiftY = useRef(0);
  const targetTilt = useRef(0);

  useEffect(() => {
    // Elegant entrance delay trigger
    const timer = setTimeout(() => {
      setActivated(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMobile || reducedMotion) {
      setShifts({ shiftX: 0, shiftY: 0, tilt: 0 });
      return;
    }

    const unsubscribe = subscribe((pointer) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      // Center coordinates of the hanging attachment in container viewport space
      const anchorX = rect.left + rect.width / 2;
      const anchorY = rect.top + 30; // attachment height matches the top anchor offset

      if (pointer.active) {
        const dx = pointer.x - anchorX;
        const dy = pointer.y - anchorY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const radius = 350; // Radius of gravitational attraction
        if (dist < radius && dist > 10) {
          // Soft-edge cubic falloff to keep motion viscous and deliberate
          const strength = Math.pow(1 - dist / radius, 1.8);
          
          const maxShift = 28; // Max translational pull in pixels
          const maxTilt = 15;  // Max swing angle in degrees

          targetShiftX.current = (dx / dist) * strength * maxShift;
          targetShiftY.current = (dy / dist) * strength * maxShift * 0.35; // Vertical pull is shorter
          targetTilt.current = (dx / dist) * strength * maxTilt;
        } else {
          // Decay towards baseline anchor resting point
          targetShiftX.current = 0;
          targetShiftY.current = 0;
          targetTilt.current = 0;
        }
      } else {
        targetShiftX.current = 0;
        targetShiftY.current = 0;
        targetTilt.current = 0;
      }
    });

    let animationId = 0;
    const tickPhysics = () => {
      // Tungsten inertia: damp at 5% per frame for an elegant heavy mechanical swing
      const dampingForce = 0.05;
      
      currentShiftX.current += (targetShiftX.current - currentShiftX.current) * dampingForce;
      currentShiftY.current += (targetShiftY.current - currentShiftY.current) * dampingForce;
      currentTilt.current += (targetTilt.current - currentTilt.current) * dampingForce;

      setShifts({
        shiftX: currentShiftX.current,
        shiftY: currentShiftY.current,
        tilt: currentTilt.current
      });

      animationId = requestAnimationFrame(tickPhysics);
    };

    animationId = requestAnimationFrame(tickPhysics);

    return () => {
      unsubscribe();
      cancelAnimationFrame(animationId);
    };
  }, [subscribe, isMobile, reducedMotion]);

  // Visual layout
  const { shiftX, shiftY, tilt } = shifts;

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[520px] flex flex-col items-center justify-center select-none overflow-visible"
    >
      {/* Background Ambience: Laser wire shadow light cone and calibration lines */}
      <div className="absolute top-0 w-[1px] h-full bg-gradient-to-b from-evidence-amber/15 via-evidence-amber/[0.03] to-transparent pointer-events-none z-0" />
      <div className="absolute -top-30 w-[240px] h-[650px] bg-evidence-amber/[0.02] rounded-full blur-[110px] pointer-events-none transform -rotate-6" />

      {/* Forensic Circular Concentric calibration targets */}
      <div className="absolute w-80 h-80 border border-evidence-amber/[0.025] rounded-full flex items-center justify-center pointer-events-none">
        <div className="w-60 h-60 border border-dashed border-evidence-amber/[0.015] rounded-full animate-spin [animation-duration:90s]" />
        <div className="w-36 h-36 border border-evidence-amber/[0.01] rounded-full" />
      </div>

      {/* Floating Coordinate Labels */}
      <div className="absolute inset-0 pointer-events-none font-mono text-[9px] text-[#a6a39e]/25">
        <div className="absolute top-[18%] left-[6%] md:left-[22%] flex items-center gap-2">
          <span>X-REF: 0.000_TRUE</span>
          <span className="w-1.5 h-1.5 bg-evidence-amber/25 rounded-full animate-pulse" />
        </div>
        <div className="absolute top-[44%] right-[6%] md:right-[24%] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-evidence-red/25 rounded-full animate-pulse" />
          <span>DEVIATION: {shiftX !== 0 ? `${shiftX.toFixed(4)}px` : 'RESTING_MODE'}</span>
        </div>
        <div className="absolute bottom-[22%] left-[8%] md:left-[26%] flex items-center gap-1.5">
          <span className="text-evidence-green">●</span>
          <span>ORACLE WEIGHT: BRUSHED_STEEL_V.98</span>
        </div>
      </div>

      {/* Interactive swing container */}
      <div className="relative z-10 w-[300px] h-[370px] flex justify-center overflow-visible">
        <svg
          width="300"
          height="370"
          viewBox="0 0 300 370"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Fine definitions for metal reflections */}
            <linearGradient id="metal-cap-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#313336" />
              <stop offset="30%" stopColor="#80858e" />
              <stop offset="50%" stopColor="#ebedef" />
              <stop offset="70%" stopColor="#80858e" />
              <stop offset="100%" stopColor="#25272a" />
            </linearGradient>

            <linearGradient id="metal-cone-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#151618" />
              <stop offset="20%" stopColor="#505459" />
              <stop offset="40%" stopColor="#bdc3cc" />
              <stop offset="60%" stopColor="#eceef2" />
              <stop offset="80%" stopColor="#505459" />
              <stop offset="100%" stopColor="#101112" />
            </linearGradient>
            
            <filter id="shadow-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="16" stdDeviation="15" floodColor="#000000" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* 1. Anchored Girder/Base loop */}
          <rect x="144" y="0" width="12" height="4" fill="#60646c" rx="1" />
          <line x1="150" y1="4" x2="150" y2="10" stroke="#7e8490" strokeWidth="1.5" />

          {/* 2. Plumb Line Cable/Cord (Extends from anchor dynamically inside vector space) */}
          <line
            x1="150"
            y1="10"
            x2={150 + shiftX}
            y2={220 + shiftY}
            stroke="url(#metal-cap-grad)"
            strokeWidth="1"
            strokeOpacity={activated ? 0.45 : 0}
            className="transition-opacity duration-300"
          />

          {/* 3. The Solid Heavy Plumb Bob Group */}
          <g
            transform={`translate(${150 + shiftX - 30}, ${220 + shiftY}) rotate(${tilt}, 30, 0)`}
            filter="url(#shadow-blur)"
            opacity={activated ? 1 : 0}
            className="transition-opacity duration-300"
          >
            {/* Cap anchor joint */}
            <rect x="27" y="0" width="6" height="6" fill="#3a3c40" rx="1" />

            {/* Cylinder Collar Cap with horizontal detailing grooves */}
            <rect x="18" y="6" width="24" height="15" fill="url(#metal-cap-grad)" rx="1.5" />
            <line x1="18" y1="11" x2="42" y2="11" stroke="#1c1d1f" strokeWidth="0.5" />
            <line x1="18" y1="16" x2="42" y2="16" stroke="#1c1d1f" strokeWidth="0.5" />

            {/* Solid Conical matte steel weights */}
            <path
              d="M 12 21 L 48 21 Q 48 24 45 28 L 30 102 L 15 28 Q 12 24 12 21 Z"
              fill="url(#metal-cone-grad)"
              stroke="#0a0a0c"
              strokeWidth="0.75"
            />

            {/* Inner highlights to simulate cold reflections */}
            <path
              d="M 16 26 L 44 26 M 19 36 L 41 36 M 22 46 L 38 46"
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="1"
            />

            {/* Needle Sharp Calibration Tip */}
            <path d="M 30 102 L 31.5 106 L 30 112 L 28.5 106 Z" fill="#eff2f5" />
          </g>

          {/* 4. Elliptic Ambient Shadow mapping directly below bob bottom tip */}
          <ellipse
            cx={150 + shiftX * 0.42}
            cy="352"
            rx={Math.max(12, 28 - shiftY * 0.1)}
            ry="4"
            fill="rgba(0, 0, 0, 0.75)"
            filter="blur(2px)"
          />

          {/* Dynamic calibration tick line aligned center */}
          <line
            x1="150"
            y1="345"
            x2="150"
            y2="360"
            stroke="rgba(229, 169, 83, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        </svg>
      </div>

      {/* Verification Evidence Class Badges (Labeled as illustrative checks) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 flex-wrap max-w-lg px-4 pointer-events-auto">
        <EvidenceTag status="fake-only" label="illustrative fake check" />
        <EvidenceTag status="real-boundary-smoke" label="illustrative sandbox smoke" />
        <EvidenceTag status="user-confirmed" label="illustrative manual confirmation" />
        <EvidenceTag status="contradiction" label="illustrative fallback tag" />
      </div>

    </div>
  );
}
