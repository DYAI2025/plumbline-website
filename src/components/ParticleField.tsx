import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  swaySeed: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(isReduced);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId = 0;
    
    // Set appropriate particle density
    const isMobile = window.innerWidth < 768;
    const maxParticles = isReduced ? 5 : isMobile ? 30 : 70;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        const baseAlpha = Math.random() * 0.25 + 0.05;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: Math.random() * 0.18 + 0.05, // Downward drift
          size: Math.random() * 1.5 + 0.5,
          alpha: baseAlpha,
          baseAlpha,
          swaySeed: Math.random() * 100
        });
      }
    };

    const setupListeners = () => {
      window.addEventListener('resize', resizeCanvas);
      
      const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseRef.current.active = true;
      };

      const handleMouseLeave = () => {
        mouseRef.current.active = false;
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    };

    const cleanupListeners = setupListeners();
    resizeCanvas();

    // Main animation loop
    const render = (time: number) => {
      // Clear with very slight fade for dynamic trails in the new base Obsidian color
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint technical scanlines or grid coordinates with a warm bronze tint
      ctx.strokeStyle = 'rgba(229, 169, 83, 0.012)';
      ctx.lineWidth = 1;
      
      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        if (!isReduced) {
          // Downward drift + slight horizontal sway based on time
          const sway = Math.sin(time * 0.001 + p.swaySeed) * 0.08;
          p.x += p.vx + sway;
          p.y += p.vy;

          // React to mouse movement (dust gets pushed slightly)
          if (mouseRef.current.active) {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 180) {
              const force = (180 - dist) / 180;
              // Push outwards
              p.x += (dx / dist) * force * 1.2;
              p.y += (dy / dist) * force * 1.2;
              // Dim slightly under mouse or brighten with amber glow
              p.alpha = Math.min(0.65, p.baseAlpha + force * 0.2);
            } else {
              // Fade back to normal
              p.alpha = p.alpha + (p.baseAlpha - p.alpha) * 0.05;
            }
          } else {
            p.alpha = p.alpha + (p.baseAlpha - p.alpha) * 0.05;
          }
        }

        // Screen wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }

        // Draw particle - updated to gold/bronze amber tone
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 169, 83, ${p.alpha * 1.2})`;
        ctx.fill();
      }

      // Draw forensic visual markers occasionally - faint crosshairs in the corners with warm bronze tint
      ctx.strokeStyle = 'rgba(229, 169, 83, 0.02)';
      ctx.lineWidth = 1;
      
      // Crosshair 1 (top left area)
      const cx1_x = 100, cx1_y = 120;
      ctx.beginPath();
      ctx.moveTo(cx1_x - 10, cx1_y); ctx.lineTo(cx1_x + 10, cx1_y);
      ctx.moveTo(cx1_x, cx1_y - 10); ctx.lineTo(cx1_x, cx1_y + 10);
      ctx.stroke();

      // Crosshair 2 (bottom right area)
      if (canvas.width > 1000) {
        const cx2_x = canvas.width - 250, cx2_y = canvas.height - 250;
        ctx.beginPath();
        ctx.moveTo(cx2_x - 10, cx2_y); ctx.lineTo(cx2_x + 10, cx2_y);
        ctx.moveTo(cx2_x, cx2_y - 10); ctx.lineTo(cx2_x, cx2_y + 10);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cleanupListeners();
      cancelAnimationFrame(animationId);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      id="ambient-dust-canvas"
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
