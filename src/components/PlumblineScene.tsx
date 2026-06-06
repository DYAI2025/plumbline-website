import { useEffect, useState, useRef, PointerEvent } from 'react';
import { useGravityPointer } from '../context/GravityPointerContext';
import EvidenceTag from './EvidenceTag';

export default function PlumblineScene() {
  const { pointerRef, isMobile, reducedMotion } = useGravityPointer();
  const [activated, setActivated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Live coordinate state for dynamic rendering
  const [shifts, setShifts] = useState({ shiftX: 0, shiftY: 0, tilt: 0, speed: 0 });

  // Interpolation variables held in refs to prevent React state churn during rendering ticks
  const currentShiftX = useRef(0);
  const currentShiftY = useRef(0);
  const currentTilt = useRef(0);

  const targetShiftX = useRef(0);
  const targetShiftY = useRef(0);

  // Velocity vectors for the stateful second-order spring system
  const velX = useRef(0);
  const velY = useRef(0);
  const velTilt = useRef(0);

  // Dragging state machines
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Caching references for client rect to bypass dynamic layout thrashing
  const rectRef = useRef<DOMRect | null>(null);
  const frameCountRef = useRef(0);

  // Monitor document theme for custom high-contrast graphic variables
  useEffect(() => {
    const checkTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(currentTheme as 'dark' | 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivated(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Utility to map pointer events relative to the bounding box
  const getRelativeCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 150, y: 30 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e: PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;

    // Get cursor relative coordinates inside the parent container to calculate grab offset
    const coords = getRelativeCoords(e.clientX, e.clientY);
    const bobX = 150 + currentShiftX.current;
    const bobY = 220 + currentShiftY.current;

    dragOffset.current = {
      x: coords.x - bobX,
      y: coords.y - bobY,
    };

    targetShiftX.current = currentShiftX.current;
    targetShiftY.current = currentShiftY.current;
  };

  const handlePointerMove = (e: PointerEvent<SVGGElement>) => {
    if (!isDragging.current) return;
    const coords = getRelativeCoords(e.clientX, e.clientY);

    // Compute direct shifts relative to anchor points
    const targetX = coords.x - 150 - dragOffset.current.x;
    const targetY = coords.y - 220 - dragOffset.current.y;

    // Boundary constraints to avoid stretching cables out of physical limits
    targetShiftX.current = Math.max(-125, Math.min(125, targetX));
    targetShiftY.current = Math.max(-120, Math.min(85, targetY));
  };

  const handlePointerUp = (e: PointerEvent<SVGGElement>) => {
    if (!isDragging.current) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    isDragging.current = false;
  };

  useEffect(() => {
    if (isMobile || reducedMotion) {
      setShifts({ shiftX: 0, shiftY: 0, tilt: 0, speed: 0 });
      currentShiftX.current = 0;
      currentShiftY.current = 0;
      currentTilt.current = 0;
      velX.current = 0;
      velY.current = 0;
      velTilt.current = 0;
      return;
    }

    // Set dynamic drop spring simulation state on mount
    currentShiftY.current = -55;
    currentShiftX.current = -30;
    currentTilt.current = -14;
    velY.current = 0;
    velX.current = 0;
    velTilt.current = 0;

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
      const dt = Math.min((now - lastTime) / 1000, 0.03); // avoid sudden lag spikes
      lastTime = now;

      frameCountRef.current++;

      if (!rectRef.current || frameCountRef.current % 15 === 0) {
        updateRect();
      }

      const pointer = pointerRef.current;
      const rect = rectRef.current;

      // Handle custom dragging state injection
      if (isDragging.current) {
        const dx = targetShiftX.current - currentShiftX.current;
        const dy = targetShiftY.current - currentShiftY.current;

        // Directly update velocities to hand-off momentum properly on click-release
        const rawVx = dx / dt;
        const rawVy = dy / dt;
        velX.current = velX.current * 0.4 + Math.max(-650, Math.min(650, rawVx)) * 0.6;
        velY.current = velY.current * 0.4 + Math.max(-650, Math.min(650, rawVy)) * 0.6;

        currentShiftX.current = targetShiftX.current;
        currentShiftY.current = targetShiftY.current;

        // Tilt dragging matches the horizontal drag speed smoothly
        const targetTiltVal = Math.max(-15, Math.min(15, velX.current * 0.06));
        currentTilt.current += (targetTiltVal - currentTilt.current) * 0.18;
      } else {
        // Standard interactive gravity force calculus
        let extForceX = 0;
        let extForceY = 0;
        let extTargetTilt = 0;

        if (pointer && rect && pointer.normalizedStrength > 0.001) {
          const anchorX = rect.left + rect.width / 2;
          const anchorY = rect.top + 30; // 30px offset matches SVG offset

          const dx = pointer.x - anchorX;
          const dy = pointer.y - anchorY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const radius = 350; // Attraction shell
          if (dist < radius && dist > 10) {
            const strength = Math.pow(1 - dist / radius, 1.8) * pointer.normalizedStrength;
            const maxPullForce = 220;
            extForceX = (dx / dist) * strength * maxPullForce;
            extForceY = (dy / dist) * strength * maxPullForce * 0.45;
            extTargetTilt = (dx / dist) * strength * 15;
          }
        }

        // Pendulum calculations (second order integration)
        const k_pendulum = 9.0;
        const c_pendulum = 1.35;
        let forceX = -k_pendulum * currentShiftX.current - c_pendulum * velX.current + extForceX;

        const L = 210;
        const dx_anchor = currentShiftX.current;
        const dy_anchor = 210 + currentShiftY.current;
        const len = Math.sqrt(dx_anchor * dx_anchor + dy_anchor * dy_anchor);

        const gravity = 620;
        let forceY = gravity + extForceY;

        if (len > L) {
          const stretch = len - L;
          const k_cable = 620; // High stiffness
          const c_cable = 24;  // Excellent high-frequency dampening

          const projVel = (velX.current * dx_anchor + velY.current * dy_anchor) / len;
          const tension = k_cable * stretch + c_cable * projVel;

          if (tension > 0) {
            forceX -= tension * (dx_anchor / len);
            forceY -= tension * (dy_anchor / len);
          }
        } else {
          forceX -= 0.65 * velX.current;
          forceY -= 0.65 * velY.current;
        }

        // Euler integration parameters
        velX.current += forceX * dt;
        currentShiftX.current += velX.current * dt;

        velY.current += forceY * dt;
        currentShiftY.current += velY.current * dt;

        // Angle tilt calculations
        const kTilt = 16.0;
        const cTilt = 3.0;
        const inertialDrag = -velX.current * 0.15;
        const forceTilt = -kTilt * (currentTilt.current - extTargetTilt) - cTilt * velTilt.current + inertialDrag;
        velTilt.current += forceTilt * dt;
        currentTilt.current += velTilt.current * dt;

        // Micro-snapping thresholding to guarantee eventual visual quietude
        if (!pointer || pointer.normalizedStrength <= 0.001) {
          if (Math.abs(currentShiftX.current) < 0.02 && Math.abs(velX.current) < 0.02) {
            currentShiftX.current = 0;
            velX.current = 0;
          }
          if (Math.abs(currentShiftY.current) < 0.02 && Math.abs(velY.current) < 0.02) {
            currentShiftY.current = 0;
            velY.current = 0;
          }
          if (Math.abs(currentTilt.current) < 0.02 && Math.abs(velTilt.current) < 0.02) {
            currentTilt.current = 0;
            velTilt.current = 0;
          }
        }
      }

      const clampedTilt = Math.max(-15, Math.min(15, currentTilt.current));
      const currentSpeed = Math.sqrt(velX.current * velX.current + velY.current * velY.current);

      setShifts({
        shiftX: currentShiftX.current,
        shiftY: currentShiftY.current,
        tilt: clampedTilt,
        speed: currentSpeed
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

  const { shiftX, shiftY, tilt, speed } = shifts;

  // Real-time calculation of visual feedback properties
  const heightAboveFloor = 20 - shiftY;
  const shadowOpacity = Math.max(0.06, Math.min(0.85, 0.75 - heightAboveFloor * 0.009));
  const shadowRadiusX = Math.max(8, Math.min(50, 24 + heightAboveFloor * 0.16));
  const shadowRadiusY = Math.max(1.5, Math.min(9, 4 + heightAboveFloor * 0.02));
  const shadowBlur = Math.max(1, Math.min(11, 2 + heightAboveFloor * 0.13));

  // Lock calibration stability metric
  const isStabilized = Math.abs(shiftX) < 1.0 && Math.abs(shiftY) < 1.0 && speed < 5;

  // Custom theme variables to guarantee flawless contrasting view in light/dark modes
  const isDark = theme === 'dark';
  const laserColor = isStabilized 
    ? (isDark ? '#00ffd2' : '#059669') 
    : (isDark ? '#ff513c' : '#dc2626');

  const laserLineOpacity = isDragging.current ? 0.35 : Math.max(0.12, Math.min(0.8, 0.2 + speed * 0.015));

  // Mathematically calculate the tip absolute coordinate via rotation transformation
  const angleRad = (tilt * Math.PI) / 180;
  const rotX = 150 + shiftX;
  const rotY = 220 + shiftY;
  const tipX = rotX - 112 * Math.sin(angleRad);
  const tipY = rotY + 112 * Math.cos(angleRad);

  // Focus beam sweep projection target point at the measuring plane
  const floorY = 346;
  const laserSweepX = tipX + Math.tan(angleRad) * (floorY - tipY);

  // Generate dynamic vibration graph path
  const generateOscilloscopePath = () => {
    let path = "M 20 280";
    const points = 32;
    const baseAmp = Math.min(30, speed * 2.2 + Math.abs(tilt) * 1.8);
    for (let i = 0; i <= points; i++) {
      const x = 20 + (i / points) * 260;
      // Synthesize noise, frequencies, and decay envelopes
      const decay = Math.sin((i * Math.PI) / points);
      const sineWave = Math.sin(i * 0.95 + frameCountRef.current * 0.16) * baseAmp * decay;
      path += ` L ${x} ${280 + sineWave}`;
    }
    return path;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[550px] flex flex-col items-center justify-center select-none overflow-visible"
    >
      {/* Background Ambience: Focus Cone and Calibration lines */}
      <div className={`absolute top-0 w-[1px] h-full ${
        isDark ? 'bg-gradient-to-b from-evidence-amber/15 via-evidence-amber/[0.03]' : 'bg-gradient-to-b from-evidence-amber/25 via-evidence-amber/[0.05]'
      } to-transparent pointer-events-none z-0`} />
      
      <div className={`absolute -top-30 w-[240px] h-[650px] ${
        isDark ? 'bg-evidence-amber/[0.025]' : 'bg-evidence-amber/[0.035]'
      } rounded-full blur-[110px] pointer-events-none transform -rotate-12`} />

      {/* Forensic Circular Concentric calibration targets */}
      <div className={`absolute w-80 h-80 border ${
        isDark ? 'border-evidence-amber/[0.025]' : 'border-evidence-amber/10'
      } rounded-full flex items-center justify-center pointer-events-none z-0`}>
        <div className={`w-[250px] h-[250px] border border-dashed ${
          isDark ? 'border-evidence-amber/[0.015]' : 'border-evidence-amber/5'
        } rounded-full animate-spin [animation-duration:110s]`} />
        
        <div className={`w-36 h-36 border ${
          isDark ? 'border-evidence-amber/[0.01]' : 'border-evidence-amber/5'
        } rounded-full`} />
      </div>

      {/* Realistic Real-Time Telemetry Interface HUD with contrasting slate texts */}
      <div className="absolute inset-0 pointer-events-none font-mono text-[9px] z-0">
        <div className={`absolute top-[16%] left-[6%] md:left-[16%] flex items-center gap-2 ${
          isDark ? 'text-muted/30' : 'text-[#1a3a30]/60'
        }`}>
          <span>PLATFORM: PLUMBLINE_V_1.04</span>
          <span className="w-1.5 h-1.5 bg-evidence-amber/30 rounded-full animate-ping" />
        </div>
        
        <div className={`absolute top-[46%] right-[6%] md:right-[18%] flex flex-col gap-1 items-end ${
          isDark ? 'text-muted/30' : 'text-[#1a3a30]/60'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isStabilized ? 'bg-evidence-green' : 'bg-evidence-red'} animate-pulse`} />
            <span>ACCELEROMETER DISPLACEMENT</span>
          </div>
          <span className={`text-[10px] font-bold ${isDark ? 'text-text' : 'text-text'}`}>
            X: {shiftX !== 0 ? `${shiftX.toFixed(4)} px` : '0.0000 REST_NIL'}
          </span>
          <span className={`text-[10px] font-bold ${isDark ? 'text-text' : 'text-text'}`}>
            Y: {shiftY !== 0 ? `${shiftY.toFixed(4)} px` : '0.0000 REST_NIL'}
          </span>
        </div>

        <div className={`absolute bottom-[22%] left-[8%] md:left-[18%] flex flex-col gap-0.5 ${
          isDark ? 'text-muted/30' : 'text-[#1a3a30]/60'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={isStabilized ? "text-evidence-green font-bold animate-pulse" : "text-evidence-amber"}>
              ● {isStabilized ? "TRUE VERTICAL SECURED" : "PENDULUM ACTIVE SHIFT"}
            </span>
          </div>
          <span>TILT ACCURACY: {(90 - Math.abs(tilt)).toFixed(2)}° // ERR {Math.abs(tilt).toFixed(2)}°</span>
          <span>SYSTEM CALIBRATION STABLE: {isStabilized ? "TRUE (100%)" : "FALSE (PENDULUM_SWING)"}</span>
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
            {/* Highly customized multi-stop metallic linear gradients for cylinder chrome texture */}
            <linearGradient id="anisotropic-steel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e2124" />
              <stop offset="18%" stopColor="#414750" />
              <stop offset="38%" stopColor="#a3acb9" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="65%" stopColor="#8d97a5" />
              <stop offset="85%" stopColor="#30353c" />
              <stop offset="100%" stopColor="#111315" />
            </linearGradient>

            {/* Bronze/Knurling collar material */}
            <linearGradient id="copper-brass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3e1b0c" />
              <stop offset="15%" stopColor="#854823" />
              <stop offset="42%" stopColor="#ed975b" />
              <stop offset="55%" stopColor="#f9d3b5" />
              <stop offset="72%" stopColor="#d2783f" />
              <stop offset="90%" stopColor="#6e371a" />
              <stop offset="100%" stopColor="#250f05" />
            </linearGradient>

            {/* Gold highlights ring */}
            <linearGradient id="gold-stripes" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#432c02" />
              <stop offset="30%" stopColor="#cca141" />
              <stop offset="50%" stopColor="#fff6df" />
              <stop offset="70%" stopColor="#aa8228" />
              <stop offset="100%" stopColor="#251700" />
            </linearGradient>

            {/* Braided steel wire pattern */}
            <linearGradient id="steel-cord" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#151719" />
              <stop offset="45%" stopColor="#cad1db" />
              <stop offset="60%" stopColor="#f3f5f8" />
              <stop offset="75%" stopColor="#9bafc4" />
              <stop offset="100%" stopColor="#0b0d0e" />
            </linearGradient>

            {/* Knurled diagonal grip pattern */}
            <pattern id="knurl-pattern" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 0 5 L 5 0 M 0 0 L 5 5" stroke="rgba(0,0,0,0.48)" strokeWidth="0.75" />
              <path d="M 0 5 L 5 0 M 0 0 L 5 5" stroke="rgba(255,255,255,0.22)" strokeWidth="0.45" />
            </pattern>

            <filter id="laser-glow-filter" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="shadow-blur-premium" x="-70%" y="-70%" width="240%" height="240%">
              <feDropShadow dx="0" dy="25" stdDeviation="18" floodColor="#000000" floodOpacity={isDark ? "0.95" : "0.35"} />
            </filter>
          </defs>

          {/* BACKGROUND Telemetry vibration display */}
          <path
            d={generateOscilloscopePath()}
            fill="none"
            stroke={isStabilized ? (isDark ? "rgba(13,242,201,0.06)" : "rgba(16,185,129,0.09)") : (isDark ? "rgba(239,68,68,0.05)" : "rgba(220,38,38,0.07)")}
            strokeWidth="1.5"
            strokeDasharray={isStabilized ? "none" : "3,2"}
            className="transition-all duration-300 pointer-events-none"
            id="vibrationGraph"
          />

          {/* 1. Anchored Girder/Base with details */}
          <rect x="138" y="0" width="24" height="4" fill="#1b1c1e" rx="1.5" />
          <rect x="144" y="4" width="12" height="4" fill="url(#anisotropic-steel)" rx="0.5" />
          <line x1="150" y1="8" x2="150" y2="12" stroke="#7e8490" strokeWidth="2.5" />

          {/* 2. Braided Cable/Cord */}
          {(() => {
            const L = 210;
            const dx_anchor = shiftX;
            const dy_anchor = 210 + shiftY;
            const distanceLen = Math.sqrt(dx_anchor * dx_anchor + dy_anchor * dy_anchor);
            const slack = L - distanceLen;

            if (slack > 0.5) {
              // Sagging curved cable path under slack spring values
              const controlX = 150 + shiftX / 2 + slack * 0.16;
              const controlY = 110 + shiftY / 2 + slack * 0.44;
              return (
                <g>
                  {/* Outer shade */}
                  <path
                    d={`M 150 12 Q ${controlX} ${controlY} ${150 + shiftX} ${220 + shiftY}`}
                    stroke="#000000"
                    strokeWidth="3.2"
                    fill="none"
                    strokeOpacity="0.45"
                  />
                  {/* Metallic core */}
                  <path
                    d={`M 150 12 Q ${controlX} ${controlY} ${150 + shiftX} ${220 + shiftY}`}
                    stroke="url(#steel-cord)"
                    strokeWidth="2.0"
                    fill="none"
                    strokeOpacity={activated ? 0.9 : 0}
                    className="transition-opacity duration-300"
                  />
                  {/* Helical light highlights */}
                  <path
                    d={`M 150 12 Q ${controlX} ${controlY} ${150 + shiftX} ${220 + shiftY}`}
                    stroke="#ffffff"
                    strokeWidth="1.0"
                    strokeDasharray="2,3"
                    fill="none"
                    strokeOpacity="0.4"
                  />
                </g>
              );
            } else {
              // Straight highly tense steel cable wire lines
              return (
                <g>
                  <line
                    x1="150"
                    y1="12"
                    x2={150 + shiftX}
                    y2={220 + shiftY}
                    stroke="#101112"
                    strokeWidth="2.8"
                    strokeOpacity="0.35"
                  />
                  <line
                    x1="150"
                    y1="12"
                    x2={150 + shiftX}
                    y2={220 + shiftY}
                    stroke="url(#steel-cord)"
                    strokeWidth="1.8"
                    strokeOpacity={activated ? 1 : 0}
                    className="transition-opacity duration-300"
                  />
                  <line
                    x1="150"
                    y1="12"
                    x2={150 + shiftX}
                    y2={220 + shiftY}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeDasharray="2.5,2.5"
                    strokeOpacity="0.55"
                  />
                </g>
              );
            }
          })()}

          {/* 3. Sweeping Optical Alignment Guided Laser Sight (Dynamic trigonometry projection) */}
          <line
            x1={tipX}
            y1={tipY}
            x2={laserSweepX}
            y2={floorY}
            stroke={laserColor}
            strokeWidth="1.2"
            opacity={laserLineOpacity}
            filter="url(#laser-glow-filter)"
            className="transition-all duration-200 pointer-events-none"
            strokeDasharray={isStabilized ? "none" : "5,3"}
          />

          <line
            x1={tipX}
            y1={tipY}
            x2={laserSweepX}
            y2={floorY}
            stroke="#ffffff"
            strokeWidth="0.5"
            opacity={laserLineOpacity * 1.5}
            className="transition-all duration-200 pointer-events-none"
          />

          {/* 4. The Solid Heavy Plumb Bob Group */}
          <g
            transform={`translate(${150 + shiftX - 30}, ${220 + shiftY}) rotate(${tilt}, 30, 0)`}
            filter="url(#shadow-blur-premium)"
            opacity={activated ? 1 : 0}
            className="transition-opacity duration-300 cursor-grab active:cursor-grabbing pointer-events-auto"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Grab hit trigger area bubble (invisible but facilitates easy control selection) */}
            <circle cx="30" cy="50" r="45" fill="transparent" className="cursor-grab active:cursor-grabbing" />

            {/* Top hanging coupling loop */}
            <circle cx="30" cy="-2" r="4" stroke="url(#anisotropic-steel)" strokeWidth="1.5" fill="none" />
            <rect x="27" y="0" width="6" height="6" fill="#141517" rx="1.2" />

            {/* Solid Knurled Collar Ring Adapter */}
            <rect x="18" y="6" width="24" height="16" fill="url(#copper-brass)" rx="1.5" />
            
            {/* Detailed Knurling Patterns Overlays */}
            <rect x="18" y="6" width="24" height="16" fill="url(#knurl-pattern)" rx="1.5" />

            {/* Decorative Gold metallic stripes */}
            <rect x="18" y="22" width="24" height="4" fill="url(#gold-stripes)" />
            <line x1="18" y1="22" x2="42" y2="22" stroke="#2a1602" strokeWidth="0.5" />
            <line x1="18" y1="26" x2="42" y2="26" stroke="#2a1602" strokeWidth="0.5" />

            {/* Heavy solid conical titanium weights with double metal contrast curves */}
            <path
              d="M 11 26 L 49 26 Q 49 31 46 38 L 30 102 L 14 38 Q 11 31 11 26 Z"
              fill="url(#anisotropic-steel)"
              stroke="#070809"
              strokeWidth="0.8"
            />

            {/* Laser lens emitter trim bands */}
            <line x1="14.3" y1="36" x2="45.7" y2="36" stroke="#1d2024" strokeWidth="1.2" />
            <line x1="18.9" y1="52" x2="41.1" y2="52" stroke="url(#gold-stripes)" strokeWidth="0.8" />
            <line x1="22.5" y1="68" x2="37.5" y2="68" stroke="#121315" strokeWidth="1.5" />

            {/* Optical Emission laser core indicator led inside the middle */}
            <circle cx="30" cy="44" r="3.5" fill="#111" />
            <circle cx="30" cy="44" r="2.0" fill={laserColor} className="animate-pulse" />

            {/* Sharp needle calibration tip with specular highlight glow */}
            <path d="M 30 102 L 31.8 106 L 30 112 L 28.2 106 Z" fill="#ebedef" stroke="#2f3238" strokeWidth="0.3" />
            
            {/* Laser core diode gleam dot directly over the tip */}
            <circle cx="30" cy="112" r="1.5" fill={laserColor} filter="url(#laser-glow-filter)" />
            <circle cx="30" cy="112" r="0.65" fill="#ffffff" />
          </g>

          {/* 5. Interactive Calibrated Target Surface (Laser hit detection ripples) */}
          <ellipse
            cx={laserSweepX}
            cy={floorY}
            rx={shadowRadiusX}
            ry={shadowRadiusY}
            fill={isDark ? "rgba(0,0,0,0.65)" : "rgba(10,30,25,0.18)"}
            style={{ filter: `blur(${shadowBlur}px)` }}
          />

          {/* Emissive glow targets underneath the swept laser point */}
          <g filter="url(#laser-glow-filter)" opacity={isDragging.current ? 0.4 : 0.82}>
            {/* Direct laser hot spot */}
            <ellipse
              cx={laserSweepX}
              cy={floorY}
              rx={6 + speed * 0.1}
              ry={1.5 + speed * 0.02}
              fill="none"
              stroke={laserColor}
              strokeWidth="1.0"
            />
            <ellipse
              cx={laserSweepX}
              cy={floorY}
              rx="1.5"
              ry="0.4"
              fill="#ffffff"
            />
            {/* Dynamic expanding ripple pulses based on oscillation power speed */}
            <ellipse
              cx={laserSweepX}
              cy={floorY}
              rx={Math.max(2, (frameCountRef.current % 45) * 0.8 * (1 + speed * 0.1))}
              ry={Math.max(0.5, (frameCountRef.current % 45) * 0.2 * (1 + speed * 0.1))}
              fill="none"
              stroke={laserColor}
              strokeWidth="0.5"
              opacity={Math.max(0, 1 - (frameCountRef.current % 45) / 45)}
            />
          </g>

          {/* Calibrated metric scales with contrasting high-visibility tick lines */}
          <line
            x1="50"
            y1={floorY}
            x2="250"
            y2={floorY}
            stroke={isDark ? "var(--line)" : "rgba(14,83,74,0.45)"}
            strokeWidth="1.0"
            strokeDasharray="1,4"
          />

          {/* Center alignment vertical reference marks */}
          <line
            x1="150"
            y1={floorY - 6}
            x2="150"
            y2={floorY + 6}
            stroke="var(--evidence-amber)"
            strokeWidth="1.5"
          />

          {/* Reference numbers */}
          <text x="156" y={floorY + 12} fill={isDark ? "rgba(255,255,255,0.25)" : "rgba(14,83,74,0.55)"} fontSize="7" fontFamily="monospace">0.00mm</text>
          <text x="90" y={floorY + 12} fill={isDark ? "rgba(255,255,255,0.15)" : "rgba(14,83,74,0.35)"} fontSize="6" fontFamily="monospace">-50μ</text>
          <text x="210" y={floorY + 12} fill={isDark ? "rgba(255,255,255,0.15)" : "rgba(14,83,74,0.35)"} fontSize="6" fontFamily="monospace">+50μ</text>
        </svg>
      </div>

      {/* Verification Evidence Class Badges (Labeled as illustrative checks with high contrast) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 flex-wrap max-w-lg px-4 pointer-events-auto z-10">
        <EvidenceTag status="fake-only" label="illustrative fake check" />
        <EvidenceTag status="real-boundary-smoke" label="illustrative sandbox smoke" />
        <EvidenceTag status="user-confirmed" label="illustrative manual confirmation" />
        <EvidenceTag status="contradiction" label="illustrative fallback tag" />
      </div>

    </div>
  );
}
