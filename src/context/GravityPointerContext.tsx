import { createContext, useContext, useEffect, useRef, useState, ReactNode, RefObject } from 'react';

export interface PointerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

interface GravityPointerContextType {
  pointerRef: RefObject<PointerState>;
  subscribe: (callback: (state: PointerState) => void) => () => void;
  reducedMotion: boolean;
  isMobile: boolean;
}

const GravityPointerContext = createContext<GravityPointerContextType | null>(null);

export function GravityPointerProvider({ children }: { children: ReactNode }) {
  const pointerRef = useRef<PointerState>({ x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0, active: false });
  const listenersRef = useRef<Set<(state: PointerState) => void>>(new Set());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaTouch = window.matchMedia('(max-width: 767px)');
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsMobile(mediaTouch.matches);
    setReducedMotion(mediaReduced.matches);

    const handleTouchChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleReducedChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    if (mediaTouch.addEventListener) {
      mediaTouch.addEventListener('change', handleTouchChange);
    } else {
      mediaTouch.addListener(handleTouchChange); // fallback
    }

    if (mediaReduced.addEventListener) {
      mediaReduced.addEventListener('change', handleReducedChange);
    } else {
      mediaReduced.addListener(handleReducedChange); // fallback
    }

    let lastTime = performance.now();
    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (mediaTouch.matches) return;
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      lastTime = now;

      const curr = pointerRef.current;
      const dx = e.clientX - curr.x;
      const dy = e.clientY - curr.y;

      // Smooth velocity tracking
      curr.vx = curr.vx * 0.8 + (dx / dt) * 0.2;
      curr.vy = curr.vy * 0.8 + (dy / dt) * 0.2;
      curr.x = e.clientX;
      curr.y = e.clientY;
      curr.active = true;
    };

    const handleMouseLeave = () => {
      pointerRef.current.active = false;
    };

    const handleMouseEnter = () => {
      pointerRef.current.active = true;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Continuous event-loop stream to keep canvas/bob calculations synchronous with V-Sync
    const tick = () => {
      if (listenersRef.current.size > 0 && !mediaTouch.matches) {
        listenersRef.current.forEach((cb) => cb(pointerRef.current));
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      if (mediaTouch.removeEventListener) {
        mediaTouch.removeEventListener('change', handleTouchChange);
      } else {
        mediaTouch.removeListener(handleTouchChange);
      }

      if (mediaReduced.removeEventListener) {
        mediaReduced.removeEventListener('change', handleReducedChange);
      } else {
        mediaReduced.removeListener(handleReducedChange);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const subscribe = (callback: (state: PointerState) => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  };

  return (
    <GravityPointerContext.Provider value={{ pointerRef, subscribe, reducedMotion, isMobile }}>
      {children}
    </GravityPointerContext.Provider>
  );
}

export function useGravityPointer() {
  const context = useContext(GravityPointerContext);
  if (!context) {
    throw new Error('useGravityPointer must be used within a GravityPointerProvider');
  }
  return context;
}
