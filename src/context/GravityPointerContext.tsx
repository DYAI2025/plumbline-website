import { createContext, useContext, useEffect, useRef, useState, ReactNode, RefObject } from 'react';

export interface PointerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  nvx: number; // Normalized direction X
  nvy: number; // Normalized direction Y
  speed: number;
  normalizedSpeed: number; // Speed mapped to 0..1 using a reference limit
  normalizedStrength: number; // Smoothly lerped shared interaction budget (0..1)
  active: boolean;
}

interface GravityPointerContextType {
  pointerRef: RefObject<PointerState>;
  subscribe: (callback: (state: PointerState) => void) => () => void;
  reducedMotion: boolean;
  isMobile: boolean;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const GravityPointerContext = createContext<GravityPointerContextType | null>(null);

export function GravityPointerProvider({ children }: { children: ReactNode }) {
  const pointerRef = useRef<PointerState>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
    nvx: 0,
    nvy: 0,
    speed: 0,
    normalizedSpeed: 0,
    normalizedStrength: 0,
    active: false
  });
  const listenersRef = useRef<Set<(state: PointerState) => void>>(new Set());

  const [animationsEnabled, setAnimationsEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('plumbline-animations-enabled');
      if (stored !== null) {
        return stored === 'true';
      }
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const stored = localStorage.getItem('plumbline-animations-enabled');
      const userEnabled = stored !== null ? (stored === 'true') : true;
      return mediaReduced || !userEnabled;
    }
    return false;
  });

  const [isMobile, setIsMobile] = useState(false);

  const setAnimationsEnabled = (enabled: boolean) => {
    setAnimationsEnabledState(enabled);
    localStorage.setItem('plumbline-animations-enabled', String(enabled));
    if (typeof window !== 'undefined') {
      const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(mediaReduced || !enabled);
    } else {
      setReducedMotion(!enabled);
    }
  };

  useEffect(() => {
    const mediaTouch = window.matchMedia('(max-width: 767px)');
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsMobile(mediaTouch.matches);
    setReducedMotion(mediaReduced.matches || !animationsEnabled);

    const handleTouchChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleReducedChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches || !animationsEnabled);

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
      curr.vx = curr.vx * 0.82 + (dx / dt) * 0.18;
      curr.vy = curr.vy * 0.82 + (dy / dt) * 0.18;
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
      const curr = pointerRef.current;

      if (curr.active) {
        // Smoothly decay velocities over successive frames if static
        curr.vx *= 0.94;
        curr.vy *= 0.94;
      } else {
        curr.vx = 0;
        curr.vy = 0;
      }

      const speed = Math.sqrt(curr.vx * curr.vx + curr.vy * curr.vy);
      curr.speed = speed;
      curr.normalizedSpeed = Math.min(1.0, speed / 3.5); // reference 3.5 px/ms limit

      if (speed > 0.0001) {
        curr.nvx = curr.vx / speed;
        curr.nvy = curr.vy / speed;
      } else {
        curr.nvx = 0;
        curr.nvy = 0;
      }

      // Interaction budget lerped parameter: automatically driven to 0 if reducedMotion is active
      const targetStrength = (curr.active && !mediaReduced.matches && !mediaTouch.matches) ? 1.0 : 0.0;
      curr.normalizedStrength += (targetStrength - curr.normalizedStrength) * 0.14;

      if (listenersRef.current.size > 0 && !mediaTouch.matches) {
        listenersRef.current.forEach((cb) => cb(curr));
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
  }, [animationsEnabled]);

  const subscribe = (callback: (state: PointerState) => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  };

  return (
    <GravityPointerContext.Provider value={{ pointerRef, subscribe, reducedMotion, isMobile, animationsEnabled, setAnimationsEnabled }}>
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
