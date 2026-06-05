import { useEffect, useState, useRef } from 'react';
import { useGravityPointer } from '../context/GravityPointerContext';

interface RollingHeadlineProps {
  text: string;
  as?: 'h1' | 'h2' | 'p' | 'span' | 'div';
  className?: string;
  delay?: number;
  speed?: number; // Milliseconds per glyph transition
  mode?: 'split-flap' | 'decode';
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789—–-/.,:;?!&() ";

export default function RollingHeadline({
  text,
  as: Component = 'h2',
  className = '',
  delay = 80,
  speed = 35,
  mode = 'split-flap'
}: RollingHeadlineProps) {
  const { reducedMotion } = useGravityPointer();
  const [displayText, setDisplayText] = useState<string[]>(text.split(''));
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  // Viewport intersection observer to automate scroll/swipe triggering
  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(text.split(''));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasTriggered(true);
          } else {
            // Permit re-triggers on scroll-back for continuous engagement
            setHasTriggered(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [text, reducedMotion]);

  // Split-flap physics simulation loop
  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(text.split(''));
      return;
    }

    if (!hasTriggered) {
      // When out of view, we default to the completed text so layout measurements are stable
      setDisplayText(text.split(''));
      return;
    }

    const textChars = text.split('');
    const len = textChars.length;
    
    // Seed initial chaotic starting positions
    const seededList = textChars.map((targetChar) => {
      if (targetChar === ' ' || targetChar === '\n') return targetChar;
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    });
    setDisplayText(seededList);

    const timers: NodeJS.Timeout[] = [];

    for (let i = 0; i < len; i++) {
      const targetChar = textChars[i];
      if (targetChar === ' ' || targetChar === '\n') continue;

      // Stagger resolutions based on string position to resolve left-to-right
      const totalCycles = Math.floor(12 + i * 1.8 + Math.random() * 6);
      let currentCycle = 0;

      const runStep = () => {
        if (currentCycle >= totalCycles) {
          setDisplayText((current) => {
            const next = [...current];
            next[i] = targetChar;
            return next;
          });
          return;
        }

        setDisplayText((current) => {
          const next = [...current];
          if (mode === 'split-flap') {
            // Sequential roll emulation
            const currChar = current[i] || 'A';
            const currIdx = GLYPHS.indexOf(currChar);
            const nextIdx = (currIdx + 1) % GLYPHS.length;
            next[i] = GLYPHS[nextIdx];
          } else {
            // Chaotic random decode swap
            next[i] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          return next;
        });

        currentCycle++;
        const t = setTimeout(runStep, speed);
        timers.push(t);
      };

      // Staggered initialization triggers based on character index
      const startTimer = setTimeout(runStep, delay + i * 15);
      timers.push(startTimer);
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [text, hasTriggered, delay, speed, mode, reducedMotion]);

  // Accessibility fallback: keep accessible full text in aria-label
  return (
    <Component
      ref={containerRef as any}
      aria-label={text}
      className={`select-text tracking-tight md:leading-[1.1] ${className}`}
    >
      {displayText.map((char, index) => {
        if (char === '\n') {
          return <br key={index} />;
        }
        if (char === ' ') {
          return <span key={index}>&nbsp;</span>;
        }

        const isResolved = char === text[index];
        // Layout is locked to the FINAL glyph (invisible when unresolved) so the
        // scramble never reflows the line or pushes content below it (CLS = 0).
        // The rolling glyph paints as an absolute overlay on top of that fixed box.
        return (
          <span key={index} className="relative inline-block">
            <span className={isResolved ? 'text-white transition-all duration-150' : 'invisible'}>
              {text[index]}
            </span>
            {!isResolved && (
              <span
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden text-evidence-amber/55 font-mono font-medium animate-pulse motion-reduce:animate-none brightness-125 scale-y-95 border-b border-evidence-amber/20"
              >
                {char}
              </span>
            )}
          </span>
        );
      })}
    </Component>
  );
}
