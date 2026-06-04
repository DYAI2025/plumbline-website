import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Real mouse position
  const mouseRef = useRef({ x: 0, y: 0 });
  // Interpolated position for cursor outer ring
  const cursorOuterRef = useRef({ x: 0, y: 0 });
  // DOM element refs
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check screen size & user preference
    const mediaTouch = window.matchMedia('(max-width: 767px)');
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (mediaTouch.matches) return;
    if (mediaReduced.matches) {
      setReducedMotion(true);
    }

    setVisible(true);
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      
      // Instantly position the center crosshair dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    // Interpolate outer ring for elegant trailing physics
    let animationId = 0;
    const lerpRing = () => {
      const rx = cursorOuterRef.current.x;
      const ry = cursorOuterRef.current.y;
      const tx = mouseRef.current.x;
      const ty = mouseRef.current.y;
      
      // Interpolate 15% towards target position per frame
      const speed = 0.16;
      const nextX = rx + (tx - rx) * speed;
      const nextY = ry + (ty - ry) * speed;
      
      cursorOuterRef.current.x = nextX;
      cursorOuterRef.current.y = nextY;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) translate(-50%, -50%)`;
      }

      animationId = requestAnimationFrame(lerpRing);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationId = requestAnimationFrame(lerpRing);

    // Watch hoverable items
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
      
      if (isInteractive) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    const handleMouseLeaveWindow = () => {
      setVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setVisible(true);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
      cancelAnimationFrame(animationId);
    };
  }, []);

  if (!visible || reducedMotion) return null;

  return (
    <>
      {/* Precision Crosshair Center Point */}
      <div
        ref={dotRef}
        id="cursor-dot"
        className="fixed top-0 left-0 w-2 h-2 pointer-events-none z-[99999] mix-blend-difference hidden md:block"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div className="absolute inset-0 bg-white rounded-full"></div>
        {/* Tiny Hairlines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-4 bg-white/40"></div>
      </div>

      {/* Trailing Measuring Ring */}
      <div
        ref={ringRef}
        id="cursor-ring"
        className="fixed top-0 left-0 pointer-events-none z-[99998] hidden md:block transition-all duration-300 ease-out"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div className={`rounded-full border transition-all duration-300 ${
          hovered 
            ? 'w-10 h-10 border-evidence-amber bg-evidence-amber/5 scale-110 shadow-[0_0_12px_rgba(229,169,83,0.35)]' 
            : 'w-6 h-6 border-white/20 bg-transparent'
        }`}>
          {/* Inner ring overlay */}
          {hovered && (
            <div className="absolute inset-0.5 border border-dashed border-evidence-amber/30 rounded-full animate-spin [animation-duration:8s]"></div>
          )}
        </div>
      </div>
    </>
  );
}
