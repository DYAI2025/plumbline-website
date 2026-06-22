import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { useGravityPointer } from '../context/GravityPointerContext';

/**
 * HeroVideo — the prime brand hero visual for THE DROP.
 *
 * Renders the branded Plumbline pipeline animation as a premium, FRAMED,
 * cinematic element (rounded, evidence-amber/green glow border, dark mat) — not a
 * noisy full-bleed background, so the video's own on-frame text stays legible.
 *
 * Reduced-motion contract: when motion is disabled (the user's Motion toggle OR the
 * OS `prefers-reduced-motion`), the video does NOT autoplay. Instead it shows the
 * poster with an explicit play affordance the user can trigger by choice.
 */
export default function HeroVideo() {
  const { reducedMotion } = useGravityPointer();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Until the user opts in (or motion is allowed), we treat the surface as "not playing".
  const [isPlaying, setIsPlaying] = useState(false);

  // Drive autoplay/pause from the reduced-motion preference. We never rely on the
  // `autoPlay` attribute alone, because the preference can change at runtime (toggle).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      // Honour the preference: stop and reset to the poster frame, with a play affordance.
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    // Motion allowed: attempt autoplay (muted autoplay is permitted by browsers).
    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay was blocked (e.g. power-saving) — fall back to the poster + affordance.
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(true);
    }
  }, [reducedMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.then === 'function') {
        playAttempt.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <figure className="w-full max-w-3xl mx-auto pointer-events-auto select-none m-0">
      {/* Framed, cinematic surface: dark mat + evidence-toned glow border */}
      <div className="relative group rounded-xl p-[1.5px] bg-gradient-to-br from-evidence-amber/45 via-evidence-green/25 to-evidence-amber/25 shadow-[0_30px_90px_-30px_rgba(242,169,59,0.28)]">
        <div className="relative rounded-[10px] overflow-hidden bg-[#04110f] border border-panel-border/60">
          {/* Forensic corner ticks to match the GlassPanel language */}
          <div className="pointer-events-none absolute top-2 left-2 z-20 w-3 h-3 border-t border-l border-evidence-amber/50" />
          <div className="pointer-events-none absolute top-2 right-2 z-20 w-3 h-3 border-t border-r border-evidence-amber/50" />
          <div className="pointer-events-none absolute bottom-2 left-2 z-20 w-3 h-3 border-b border-l border-evidence-amber/50" />
          <div className="pointer-events-none absolute bottom-2 right-2 z-20 w-3 h-3 border-b border-r border-evidence-amber/50" />

          <video
            ref={videoRef}
            className="block w-full h-auto aspect-video object-cover"
            poster="/plumbline-hero-poster.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            // autoPlay only when motion is allowed; the effect above is the source of truth.
            autoPlay={!reducedMotion}
            aria-label="Plumbline pipeline animation: Plan, Code, Test, a paused human gate, then Deploy."
          >
            <source src="/plumbline-hero.mp4" type="video/mp4" />
          </video>

          {/* Play / pause affordance. Always reachable; prominent overlay when paused
              (the reduced-motion / autoplay-blocked state). */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlayback}
              data-cursor-hover
              aria-label="Play Plumbline hero animation"
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#04110f]/35 backdrop-blur-[1px] transition-colors hover:bg-[#04110f]/20 cursor-pointer"
            >
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-evidence-amber/90 text-black shadow-[0_8px_32px_rgba(242,169,59,0.45)] transition-transform group-hover:scale-105 active:scale-95">
                <Play className="w-6 h-6 translate-x-[2px]" fill="currentColor" />
              </span>
            </button>
          )}

          {isPlaying && (
            <button
              type="button"
              onClick={togglePlayback}
              data-cursor-hover
              aria-label="Pause Plumbline hero animation"
              className="absolute bottom-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full border border-panel-border/70 bg-[#04110f]/70 text-evidence-amber opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#04110f]/90 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" fill="currentColor" />
            </button>
          )}
        </div>
      </div>

      {/* Caption — the tagline, for context under the framed video */}
      <figcaption className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        Plumbline catches the gap before shipping —{' '}
        <span className="text-evidence-amber">tests passed, value unclear.</span>
      </figcaption>
    </figure>
  );
}
