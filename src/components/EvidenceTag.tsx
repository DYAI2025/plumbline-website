import { useState } from 'react';
import { EvidenceStatus } from '../types';

interface EvidenceTagProps {
  status: EvidenceStatus | string;
  label?: string;
  className?: string;
}

export default function EvidenceTag({ status, label, className = '' }: EvidenceTagProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine styles and precise explanations
  let textClass = 'text-white/40 border-white/10 bg-white/5';
  let indicatorColor = 'bg-[#62625d]';
  let description = 'Unclassified evidence category.';
  const displayLabel = label || status;

  switch (status) {
    case 'fake':
    case 'fake-only':
      textClass = 'text-evidence-red border-evidence-red/20 bg-evidence-red/5 hover:border-evidence-red/40';
      indicatorColor = 'bg-evidence-red glow-red';
      description = 'Fake: Code execution runs entirely against mock or stubbed memory with zero verified runtime.';
      break;
    case 'unit-fake':
      textClass = 'text-evidence-red border-evidence-red/20 bg-evidence-red/5 hover:border-evidence-red/40';
      indicatorColor = 'bg-evidence-red glow-red';
      description = 'Unit-Fake: Automated testing passed, but external state uses pre-computed mock responses.';
      break;
    case 'insufficient':
    case 'integration-fake':
      textClass = 'text-evidence-amber border-evidence-amber/20 bg-evidence-amber/5 hover:border-evidence-amber/45';
      indicatorColor = 'bg-evidence-amber glow-amber';
      description = status === 'insufficient'
        ? 'Insufficient: Claimed assertions lack complete empirical verification logs.'
        : 'Integration-Fake: Components link, but API endpoints and network requests are simulated.';
      break;
    case 'boundary':
    case 'real-boundary-smoke':
      textClass = 'text-blue-300 border-blue-950/40 bg-blue-950/10 hover:border-blue-800/60';
      indicatorColor = 'bg-[#9ebce6]';
      description = status === 'boundary'
        ? 'Boundary: System tests successfully trace through local I/O, filesystems, and verified sandboxes.'
        : 'Real-Boundary-Smoke: Touches I/O, local filesystems, or live sandbox endpoints.';
      break;
    case 'verified':
    case 'production-verified':
      textClass = 'text-evidence-green border-evidence-green/20 bg-evidence-green/5 hover:border-evidence-green/45';
      indicatorColor = 'bg-evidence-green glow-green';
      description = status === 'verified'
        ? 'Verified: System is empirically validated against production environments and live third-party APIs.'
        : 'Production-Verified: Validated against running environment configurations, databases, and third-party APIs.';
      break;
    case 'user-confirmed':
      textClass = 'text-evidence-green border-evidence-green/20 bg-evidence-green/5 hover:border-evidence-green/45';
      indicatorColor = 'bg-evidence-green glow-green';
      description = 'User-Confirmed: Explicitly accepted through manual human feedback or authenticated product sign-off.';
      break;
    case 'contradiction':
      textClass = 'text-evidence-red border-evidence-red/30 bg-evidence-red/5';
      indicatorColor = 'bg-evidence-red';
      description = 'Contradiction: Conflicting evidence structures found. Claim fails verification matrix.';
      break;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <div
        data-cursor-hover
        tabIndex={0}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border cursor-help text-xs font-mono select-none transition-all duration-200 ${textClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`}></span>
        <span className="uppercase tracking-widest">{displayLabel}</span>
      </div>

      {showTooltip && (
        <div className="absolute z-50 left-0 mt-2 w-72 p-3 bg-[#0b0c10]/95 border border-evidence-amber/20 rounded-md shadow-[0_12px_24px_rgba(0,0,0,0.8)] pointer-events-none backdrop-blur-md transition-all duration-200">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Forensic Index</span>
            <span className="text-[10px] font-mono text-white/30">PLA-EVID-04</span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed font-sans">{description}</p>
          <div className="mt-2 text-[9px] font-mono text-evidence-green font-bold uppercase tracking-widest">
            STATUS: ACTIVE VERIFY
          </div>
        </div>
      )}
    </div>
  );
}
