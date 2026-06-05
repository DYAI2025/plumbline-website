import { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface TerminalBlockProps {
  command: string;
  outputLines?: string[];
  className?: string;
}

export default function TerminalBlock({ command, outputLines = [], className = '' }: TerminalBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className={`w-full bg-bg-soft border border-panel-border rounded-md overflow-hidden text-left shadow-[0_4px_24px_rgba(0,0,0,0.15)] ${className}`}>
      {/* Tab/Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-smoke border-b border-panel-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-evidence-red/30 border border-evidence-red/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-evidence-amber/30 border border-evidence-amber/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-evidence-green/30 border border-evidence-green/50" />
          <span className="text-[10px] font-mono text-muted tracking-wider uppercase ml-2">
            plumbline@terminal ~ secure-session
          </span>
        </div>
        
        {/* Copy Trigger */}
        <button
          onClick={handleCopy}
          aria-label="Copy command line"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-smoke active:bg-smoke text-muted hover:text-text transition-all font-mono text-[10px] uppercase tracking-wider"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-evidence-green" />
              <span className="text-evidence-green uppercase tracking-wide">line copied</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3 h-3 text-evidence-amber" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Content Panel */}
      <div className="p-4 md:p-5 font-mono text-xs md:text-sm text-text leading-relaxed overflow-x-auto selection:bg-evidence-green/20">
        {/* Command Line */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <span className="text-dim select-none">$</span>
          <code className="text-text font-medium tracking-tight break-all md:break-normal">
            {command}
          </code>
        </div>

        {/* Console outputs if specified */}
        {outputLines && outputLines.length > 0 && (
          <div className="mt-3 pt-3 border-t border-panel-border space-y-1 text-muted">
            {outputLines.map((line, idx) => {
              // Highlight warning/info blocks for realistic logs
              let lineClass = '';
              if (line.includes('[ERR]') || line.includes('RED') || line.includes('FAILED')) {
                lineClass = 'text-evidence-red font-bold';
              } else if (line.includes('[OK]') || line.includes('SUCCESS') || line.includes('VERIFIED')) {
                lineClass = 'text-evidence-green font-bold';
              } else if (line.includes('PLUMBLINE') || line.includes('LINE')) {
                lineClass = 'text-evidence-amber/80 font-bold';
              } else if (line.startsWith('  ->')) {
                lineClass = 'text-dim pl-2';
              }

              return (
                <div key={idx} className={`font-mono text-[11px] leading-relaxed break-all ${lineClass}`}>
                  {line}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
