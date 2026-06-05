import { useEffect, useState, useRef } from 'react';
import { useGravityPointer } from '../context/GravityPointerContext';
import EvidenceTag from './EvidenceTag';

export default function PlumblineScene() {
  const { pointerRef, isMobile, reducedMotion } = useGravityPointer();
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

  // Velocity vectors for the stateful second-order spring system
  const velX = useRef(0);
  const velY = useRef(0);
  const velTilt = useRef(0);

  // Caching references for client rect to bypass dynamic layout thrashing
  const rectRef = useRef<DOMRect | null>(null);
  const frameCountRef = useRef(0);

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
      currentShiftX.current = 0;
      currentShiftY.current = 0;
      currentTilt.current = 0;
      velX.current = 0;
      velY.current = 0;
      velTilt.current = 0;
      return;
    }

    // Set initial off-rest coordinates to simulate a drop on mount
    currentShiftY.current = -55; // dropped from 55px above (loose/slack cord)
    currentShiftX.current = -20; // with an lateral off-center offset
    currentTilt.current = -12;   // and slightly angled state
    velY.current = 0;
    velX.current = 0;
    velTilt.current = 0;

    // Initialize or recalculate rect
    const updateRect = () => {
      if (containerRef.current) {
        rectRef.current = containerRef.current.getBoundingClientRect();
      }
    };
    updateRect();

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });

    let lastTime = performance.now();
    let animationId = 0;

    const tickPhysics = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.03); // Cap dt to avoid spikes during tab shifts
      lastTime = now;

      frameCountRef.current++;

      // Periodically update rect in case of dynamic DOM adjustments, but keep it sparse to prevent layout reflows
      if (!rectRef.current || frameCountRef.current % 15 === 0) {
        updateRect();
      }

      const pointer = pointerRef.current;
      const rect = rectRef.current;

      // 1. Calculate Cursor Gravity Force
      let extForceX = 0;
      let extForceY = 0;
      let targetTilt = 0;

      if (pointer && rect && pointer.normalizedStrength > 0.001) {
        // Center coordinates of the hanging attachment in container viewport space
        const anchorX = rect.left + rect.width / 2;
        const anchorY = rect.top + 30; // attachment height matches the top anchor offset

        const dx = pointer.x - anchorX;
        const dy = pointer.y - anchorY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const radius = 350; // Radius of gravitational attraction
        if (dist < radius && dist > 10) {
          // Soft-edge cubic falloff, scaled by the unified normalized strength budget
          const strength = Math.pow(1 - dist / radius, 1.8) * pointer.normalizedStrength;
          
          const maxPullForce = 210; // Max pull force in pixels/s^2
          extForceX = (dx / dist) * strength * maxPullForce;
          extForceY = (dy / dist) * strength * maxPullForce * 0.45;
          targetTilt = (dx / dist) * strength * 15; // Max 15 degrees tilt
        }
      }

      // 2. Pendulum and Tension Physics
      // Horizontal restoring force towards center (the standard gravitational swing)
      const k_pendulum = 9.0;
      const c_pendulum = 1.3;
      let forceX = -k_pendulum * currentShiftX.current - c_pendulum * velX.current + extForceX;

      // Rest length of physical cord
      const L = 210;
      const dx_anchor = currentShiftX.current;
      const dy_anchor = 210 + currentShiftY.current;
      const len = Math.sqrt(dx_anchor * dx_anchor + dy_anchor * dy_anchor);

      const gravity = 620; // downward gravitational pull in pixels/s^2
      let forceY = gravity + extForceY;

      if (len > L) {
        // Tight, tense state: Cable behaves like an elastic hard wire pulling along the anchor line
        const stretch = len - L;
        
        // High stiffness and decent damping generates beautiful high frequency tensing vibration
        const k_cable = 580;
        const c_cable = 22;

        const projVel = (velX.current * dx_anchor + velY.current * dy_anchor) / len;
        const tension = k_cable * stretch + c_cable * projVel;

        if (tension > 0) {
          forceX -= tension * (dx_anchor / len);
          forceY -= tension * (dy_anchor / len);
        }
      } else {
        // Slack state: Cord has no tension, simple soft air friction to dampen chaotic drifting
        forceX -= 0.5 * velX.current;
        forceY -= 0.5 * velY.current;
      }

      // Integrate equations of motion (Euler-Cromer integration)
      velX.current += forceX * dt;
      currentShiftX.current += velX.current * dt;

      velY.current += forceY * dt;
      currentShiftY.current += velY.current * dt;

      // Solve Angular Tilt (Using custom inertial drag effect)
      const kTilt = 15.0;
      const cTilt = 2.8;
      const inertialDrag = -velX.current * 0.14; // Angular tilt lag response to horizontal swing speed
      const forceTilt = -kTilt * (currentTilt.current - targetTilt) - cTilt * velTilt.current + inertialDrag;
      velTilt.current += forceTilt * dt;
      currentTilt.current += velTilt.current * dt;

      // Precision threshold snapping to ensure absolute vertical stillness when resting
      if (!pointer || pointer.normalizedStrength <= 0.001) {
        if (Math.abs(currentShiftX.current) < 0.03 && Math.abs(velX.current) < 0.03) {
          currentShiftX.current = 0;
          velX.current = 0;
        }
        if (Math.abs(currentShiftY.current) < 0.03 && Math.abs(velY.current) < 0.03) {
          currentShiftY.current = 0;
          velY.current = 0;
        }
        if (Math.abs(currentTilt.current) < 0.03 && Math.abs(velTilt.current) < 0.03) {
          currentTilt.current = 0;
          velTilt.current = 0;
        }
      }

      // Keep tilt angle strictly clamped within requested 15-degree budget
      const clampedTilt = Math.max(-15, Math.min(15, currentTilt.current));

      setShifts({
        shiftX: currentShiftX.current,
        shiftY: currentShiftY.current,
        tilt: clampedTilt
      });

      animationId = requestAnimationFrame(tickPhysics);
    };

    animationId = requestAnimationFrame(tickPhysics);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      cancelAnimationFrame(animationId);
    };
  }, [pointerRef, isMobile, reducedMotion]);

  // Visual layout
  const { shiftX, shiftY, tilt } = shifts;

  // Real-time calculation of height above floor and dynamic shadow mapping
  const heightAboveFloor = 20 - shiftY;
  const shadowOpacity = Math.max(0.08, Math.min(0.85, 0.72 - heightAboveFloor * 0.008));
  const shadowRadiusX = Math.max(8, Math.min(48, 28 + heightAboveFloor * 0.15));
  const shadowRadiusY = Math.max(1.5, Math.min(8, 4 + heightAboveFloor * 0.02));
  const shadowBlur = Math.max(1, Math.min(10, 2 + heightAboveFloor * 0.12));

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
      <div className="absolute inset-0 pointer-events-none font-mono text-[9px] text-muted/25">
        <div className="absolute top-[18%] left-[6%] md:left-[22%] flex items-center gap-2">
          <span>X-REF: 0.000_TRUE</span>
          <span className="w-1.5 h-1.5 bg-evidence-amber/15 rounded-full animate-pulse" />
        </div>
        <div className="absolute top-[44%] right-[6%] md:right-[24%] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-evidence-red/15 rounded-full animate-pulse" />
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

          {/* 2. Plumb Line Cable/Cord (Curved path for slack/loose drapes, linear line when tense) */}
          {(() => {
            const L = 210;
            const dx_anchor = shiftX;
            const dy_anchor = 210 + shiftY;
            const len = Math.sqrt(dx_anchor * dx_anchor + dy_anchor * dy_anchor);
            const slack = L - len;

            if (slack > 0.5) {
              // Draw slack cable as a beautiful quadratic Bézier bowing downward under local gravity
              const controlX = 150 + shiftX / 2 + slack * 0.14;
              const controlY = 115 + shiftY / 2 + slack * 0.45;
              return (
                <path
                  d={`M 150 10 Q ${controlX} ${controlY} ${150 + shiftX} ${220 + shiftY}`}
                  stroke="url(#metal-cap-grad)"
                  strokeWidth="1"
                  fill="none"
                  strokeOpacity={activated ? 0.45 : 0}
                  className="transition-opacity duration-300"
                />
              );
            } else {
              // Straight tense cable
              return (
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
              );
            }
          })()}

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

          {/* 4. Dynamic Elliptic Ambient Shadow mapping directly below bob bottom tip */}
          <ellipse
            cx={150 + shiftX * 0.42}
            cy="352"
            rx={shadowRadiusX}
            ry={shadowRadiusY}
            fill={`rgba(0, 0, 0, ${shadowOpacity})`}
            style={{ filter: `blur(${shadowBlur}px)` }}
          />

          {/* Dynamic calibration tick line aligned center */}
          <line
            x1="150"
            y1="345"
            x2="150"
            y2="360"
            stroke="var(--line)"
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
