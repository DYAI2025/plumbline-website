import { useEffect, useRef, useState } from 'react';
import { useGravityPointer, PointerState } from '../context/GravityPointerContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  swaySeed: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { subscribe, reducedMotion, isMobile } = useGravityPointer();
  const [internalReducedMode, setInternalReducedMode] = useState(false);

  // Maintain actual pointer coordinates safely inside a ref to bypass React render thrashing
  const livePointer = useRef<PointerState>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    nvx: 0,
    nvy: 0,
    speed: 0,
    normalizedSpeed: 0,
    normalizedStrength: 0,
    active: false
  });

  useEffect(() => {
    setInternalReducedMode(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId = 0;
    
    // Assign particle budget strictly matching the target device configurations
    const maxParticles = reducedMotion ? 5 : isMobile ? 25 : 85;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const density = maxParticles;
      for (let i = 0; i < density; i++) {
        const baseAlpha = Math.random() * 0.18 + 0.04;
        const baseVx = (Math.random() - 0.5) * 0.12;
        const baseVy = Math.random() * 0.16 + 0.05; // Subtle cold air draft downward drift
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: baseVx,
          vy: baseVy,
          baseVx,
          baseVy,
          size: Math.random() * 1.3 + 0.4,
          alpha: baseAlpha,
          baseAlpha,
          swaySeed: Math.random() * 50
        });
      }
    };

    // Store pointer subscription on every frame tick safely
    const unsubscribe = subscribe((state) => {
      livePointer.current = state;
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const renderLoop = (time: number) => {
      // Clear with obsidian background tone
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const pointer = livePointer.current;

      // Update & render particles with vector math
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        if (!reducedMotion) {
          // 1. Natural slow drift + micro sway
          const sway = Math.sin(time * 0.0008 + p.swaySeed) * 0.07;
          p.x += p.vx + sway;
          p.y += p.vy;

          // 2. Gravitational lens pull & orbital distortion
          if (pointer.active && pointer.normalizedStrength > 0.001) {
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 220; // Gravitational field radius of effect

            if (dist < radius && dist > 12) {
              // Smooth, proximity-attenuated force calculation with increased damping strength to prevent physical clumping near the singularity
              const proximityDamping = Math.min(1.0, (dist - 12) / 45); 
              const force = ((radius - dist) / radius) * pointer.normalizedStrength * proximityDamping;
              
              const attractStrength = 0.05;
              const tangentStrength = 0.16; // tangentStrength > attractStrength ensures graceful orbital spiral motion

              const nx = dx / dist;
              const ny = dy / dist;

              // Compute velocity components relative to the cursor
              // Radial component (pointing directly to the cursor)
              const radialVel = p.vx * nx + p.vy * ny;
              
              // Tangential component (orthogonal to radial vector)
              const tangentVel = -p.vx * ny + p.vy * nx;

              // Apply significantly higher fluid damping on the radial approach velocity
              // to strongly absorb inward kinetic energy near the cursor core.
              const radialDamping = 0.42; 
              const tangentDamping = 0.95; // Retain a soft fluid spin momentum without explosion
              
              // Update velocities in orbital coordinate system
              const newRadialVel = radialVel * radialDamping + force * attractStrength;
              const newTangentVel = tangentVel * tangentDamping + force * tangentStrength;

              // Reconstruct back to Cartesian velocities (vx, vy)
              p.vx = newRadialVel * nx - newTangentVel * ny;
              p.vy = newRadialVel * ny + newTangentVel * nx;

              // Gentle opacity glow transition in gravity region
              p.alpha = Math.min(0.55, p.baseAlpha + force * 0.22);
            } else if (dist <= 12) {
              // Smooth slingshot escape: guide them outward/tangentially with high damping to prevent clumping/explosion
              const nx = dx / Math.max(1, dist);
              const ny = dy / Math.max(1, dist);
              
              // Shift immediately to orbital tangent flight with refined high damping
              const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
              const escapeSpeed = Math.max(0.4, speed * 0.75) * pointer.normalizedStrength;
              
              p.vx = -ny * escapeSpeed;
              p.vy = nx * escapeSpeed;
            } else {
              // Return safely back to standard resting alpha levels
              p.alpha = p.alpha + (p.baseAlpha - p.alpha) * 0.05;
            }
          } else {
            p.alpha = p.alpha + (p.baseAlpha - p.alpha) * 0.05;
          }

          // Complete friction damping to prevent infinite acceleration or clumping, smoothly restoring natural velocities
          const friction = 0.94;
          p.vx = p.vx * friction + p.baseVx * (1 - friction);
          p.vy = p.vy * friction + p.baseVy * (1 - friction);
        }

        // Wrap around boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }
      }

      // 3. Render Connecting Lines (under the particles for crisp overlay layering)
      if (!reducedMotion && !isMobile) {
        // Draw lines from particles to cursor inside the gravity radius
        if (pointer.active && pointer.normalizedStrength > 0.001) {
          const cursorRadius = 220;
          const maxCursorAlpha = 0.14;
          ctx.lineWidth = 0.8;

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < cursorRadius && dist > 10) {
              const alpha = (1 - dist / cursorRadius) * maxCursorAlpha * pointer.normalizedStrength;
              if (alpha > 0.005) {
                ctx.strokeStyle = `rgba(229, 169, 83, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(pointer.x, pointer.y);
                ctx.stroke();
              }
            }
          }
        }

        // Draw inter-particle connection lines
        const nodeRadius = 110;
        const maxNodeAlpha = 0.045;
        ctx.lineWidth = 0.45;

        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;

            // Highly optimized bounding box check prior to direct hypotenuse calculations
            if (Math.abs(dx) < nodeRadius && Math.abs(dy) < nodeRadius) {
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < nodeRadius) {
                const alpha = (1 - dist / nodeRadius) * maxNodeAlpha;
                if (alpha > 0.005) {
                  ctx.strokeStyle = `rgba(229, 169, 83, ${alpha})`;
                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      // 4. Render Particle Embers on top
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 169, 83, ${p.alpha * 1.15})`;
        ctx.fill();
      }

      // Draw subtle bent telemetry lines near custom pointer coordinates
      if (pointer.active && !reducedMotion && !isMobile) {
        ctx.strokeStyle = 'rgba(229, 169, 83, 0.025)';
        ctx.lineWidth = 1;

        // Faint horizontal cross telemetry lines matching gravity lens region
        ctx.beginPath();
        ctx.moveTo(pointer.x - 40, pointer.y);
        ctx.lineTo(pointer.x + 40, pointer.y);
        ctx.moveTo(pointer.x, pointer.y - 40);
        ctx.lineTo(pointer.x, pointer.y + 40);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    animationId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      unsubscribe();
      cancelAnimationFrame(animationId);
    };
  }, [reducedMotion, isMobile, subscribe]);

  return (
    <canvas
      ref={canvasRef}
      id="ambient-dust-canvas"
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
