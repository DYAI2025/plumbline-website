import { useEffect, useState, useRef } from 'react';
import { useGravityPointer } from '../context/GravityPointerContext';

export default function GravityCursor() {
  const { subscribe, reducedMotion, isMobile } = useGravityPointer();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Position interpolation state
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lensPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ringPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    if (isMobile || reducedMotion) return;

    setVisible(true);
    document.body.classList.add('custom-cursor-active');

    const unsubscribe = subscribe((state) => {
      targetPos.current.x = state.x;
      targetPos.current.y = state.y;

      // Center dot follows exact pointer instantly for pure crisp feedback
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      }
    });

    let animationId = 0;
    const updateInterpolation = () => {
      const tx = targetPos.current.x;
      const ty = targetPos.current.y;

      // Heavy black-hole lens interpolation (viscous trail, simulating solid density)
      const lensSpeed = 0.08;
      lensPos.current.x += (tx - lensPos.current.x) * lensSpeed;
      lensPos.current.y += (ty - lensPos.current.y) * lensSpeed;

      // Outer delicate alignment ring (faster response)
      const ringSpeed = 0.16;
      ringPos.current.x += (tx - ringPos.current.x) * ringSpeed;
      ringPos.current.y += (ty - ringPos.current.y) * ringSpeed;

      if (lensRef.current) {
        lensRef.current.style.transform = `translate3d(${lensPos.current.x}px, ${lensPos.current.y}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animationId = requestAnimationFrame(updateInterpolation);
    };

    animationId = requestAnimationFrame(updateInterpolation);

    // Dynamic hover monitoring across interactive bounds
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') || 
        target.closest('[role="button"]') ||
        target.hasAttribute('data-cursor-hover') ||
        target.closest('[data-cursor-hover]');
      
      setHovered(!!isInteractive);
    };

    document.addEventListener('mouseover', handleMouseOver);

    const handleMouseLeaveWindow = () => setVisible(false);
    const handleMouseEnterWindow = () => setVisible(true);

    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      unsubscribe();
      cancelAnimationFrame(animationId);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [subscribe, isMobile, reducedMotion]);

  if (!visible || isMobile || reducedMotion) return null;

  return (
    <>
      {/* 1. Exact Center Precision Crosshair */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-4 h-4 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 select-none mix-blend-difference hidden md:block"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
        {/* Fine crosshairs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[1.5px] bg-white/60"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1.5px] h-4 bg-white/60"></div>
      </div>

      {/* 2. Trailing Gravitational Matte Lens */}
      <div
        ref={lensRef}
        className="fixed top-0 left-0 pointer-events-none z-[99997] -translate-x-1/2 -translate-y-1/2 select-none hidden md:block"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div 
          className={`rounded-full flex items-center justify-center backdrop-blur-[2.5px] transition-all duration-300 ${
            hovered 
              ? 'w-16 h-16 border-white/15' 
              : 'w-12 h-12 border-white/5'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(11,12,16,0.92) 0%, rgba(3,4,5,0.98) 100%)',
            borderStyle: 'solid',
            borderWidth: '1px'
          }}
        >
          {/* Internal shadow concentric contour */}
          <div className="w-[85%] h-[85%] rounded-full border border-white/[0.02] flex items-center justify-center">
            {/* Dense dark core */}
            <div className="w-[35%] h-[35%] rounded-full bg-black/95 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-white/[0.01]"></div>
          </div>
        </div>
      </div>

      {/* 3. Outer Calibration / Event Horizon Frame */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[99998] -translate-x-1/2 -translate-y-1/2 select-none hidden md:block"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div 
          className={`relative rounded-full border transition-all duration-300 flex items-center justify-center ${
            hovered 
              ? 'w-24 h-24 border-evidence-amber/50 scale-105 bg-evidence-amber/[0.008]' 
              : 'w-20 h-20 border-white/10 bg-transparent'
          }`}
        >
          {/* Four cardinal telemetry ticks */}
          <div className="absolute top-0 w-[1px] h-2 bg-white/30"></div>
          <div className="absolute bottom-0 w-[1px] h-2 bg-white/30"></div>
          <div className="absolute left-0 h-[1px] w-2 bg-white/30"></div>
          <div className="absolute right-0 h-[1px] w-2 bg-white/30"></div>

          {/* Circular coordinate ticks on hover */}
          {hovered && (
            <div className="absolute inset-1.5 border border-dashed border-evidence-amber/25 rounded-full animate-spin [animation-duration:15s]" />
          )}

          {/* Micro telemetry label on hover */}
          {hovered && (
            <div className="absolute -bottom-8 bg-black/90 text-[8px] font-mono border border-evidence-amber/35 text-evidence-amber tracking-[0.2em] px-1.5 py-0.5 rounded-sm whitespace-nowrap font-bold">
              SYS::CALIBRATING
            </div>
          )}
        </div>
      </div>
    </>
  );
}
