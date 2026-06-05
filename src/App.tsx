import { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Terminal, 
  ShieldAlert, 
  CheckCircle, 
  Layers, 
  Cpu, 
  ArrowRight, 
  Search, 
  Users, 
  Activity, 
  X,
  Compass,
  FileCode,
  Github,
  DollarSign,
  Heart,
  Sun,
  Moon
} from 'lucide-react';

import { SectionInfo, AgentFeature, SponsorTier } from './types';
import GravityCursor from './components/GravityCursor';
import RollingHeadline from './components/RollingHeadline';
import ParticleField from './components/ParticleField';
import PlumblineScene from './components/PlumblineScene';
import EvidenceTag from './components/EvidenceTag';
import GlassPanel from './components/GlassPanel';
import TerminalBlock from './components/TerminalBlock';
import VerticalSectionNav from './components/VerticalSectionNav';

export default function App() {
  // Theme state with localStorage recovery
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('plumbline-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('plumbline-theme', theme);
  }, [theme]);

  // Navigation Sections list for sidebar intersection observer - consolidated into 6 crisp sections to prevent clutter
  const sections: SectionInfo[] = [
    { id: 'drop', label: 'THE DROP', num: '00' },
    { id: 'claim', label: 'THE LAW', num: '01' },
    { id: 'ledger', label: 'THE LEDGER', num: '02' },
    { id: 'machine', label: 'THE CONSOLE', num: '03' },
    { id: 'bench', label: 'BENCHMARKS', num: '04' },
    { id: 'nexus', label: 'THE NEXUS', num: '05' }
  ];

  // CLAIM IS NOT THE VALUE toggling state
  const [activeClaimIdx, setActiveClaimIdx] = useState<number | null>(null);

  // Agent Explorer simulation state
  const [explorerQuery, setExplorerQuery] = useState('');
  const [explorerCategory, setExplorerCategory] = useState('all');

  // Interactive feedback
  const [sponsorDialog, setSponsorDialog] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const claimLabels = [
    { word: 'tested', result: 'unit-fake', explanation: 'Isolated unit tests passed with fabricated network endpoints. Zero absolute connectivity was asserted.', severity: 'amber' },
    { word: 'reviewed', result: 'not wired', explanation: 'An approving code review was submitted, but the logical subsystem remains disconnected from production pathways.', severity: 'red' },
    { word: 'merged', result: 'no boundary proof', explanation: 'PR approved and merged, but no contract testing verified boundary telemetry.', severity: 'amber' },
    { word: 'approved', result: 'no user confirmation', explanation: 'Management approved the milestone, but no authenticated human session confirmed real value creation.', severity: 'red' },
    { word: 'done', result: 'value-risk', explanation: 'The ticket status reads complete. The actual feature fails first-run with remote database configurations.', severity: 'red' }
  ];

  const agentExplorerSubmotes = [
    { name: '/agileteam', cat: 'core', desc: 'Sinks requirements into testable and inspectable product blueprints.' },
    { name: '/concilium', cat: 'process', desc: 'Assembles adversarial models to review API design and payload constraints.' },
    { name: '/ledgertrace', cat: 'boundary', desc: 'Aggregates runtime execution traces directly into evidence classes.' },
    { name: '/honeststatus', cat: 'governance', desc: 'Exposes precise gaps between local code state and illustrative integration boundaries.' },
    { name: '/secops', cat: 'governance', desc: 'Examines dependency graph updates and flags unauthorized state mutations.' },
    { name: '/smokecheck', cat: 'boundary', desc: 'Bypasses standard mocks and asserts true end-to-end telemetry paths.' }
  ];

  const filteredExplorer = agentExplorerSubmotes.filter(m => {
    if (explorerCategory !== 'all' && m.cat !== explorerCategory) return false;
    return m.name.toLowerCase().includes(explorerQuery.toLowerCase()) || m.desc.toLowerCase().includes(explorerQuery.toLowerCase());
  });

  return (
    <div className="relative min-h-screen selection:bg-evidence-amber/30 selection:text-white overflow-x-hidden measuring-grid diagonal-lines font-sans">
      
      {/* Background canvas effects */}
      <ParticleField />
      <GravityCursor />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] bg-[#0c0d12]/95 border border-evidence-amber/30 text-[#f7f5f2] px-4 py-3 text-xs font-mono tracking-wider rounded-md shadow-[0_12px_40px_rgba(0,0,0,0.65)] animate-slide-up flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-evidence-amber animate-ping" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:text-[#f7f5f2]/80" aria-label="Dismiss">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Header element */}
      <header className="fixed top-0 inset-x-0 h-16 bg-bg-soft/85 backdrop-blur-md border-b border-panel-border z-50 flex items-center justify-between px-6 lg:px-12 select-none">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-evidence-amber" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Minimal plumb vector */}
            <line x1="15" y1="0" x2="15" y2="18" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 11 18 L 19 18 L 15 27 Z" fill="currentColor" />
          </svg>
          <span 
            className="font-mono text-sm tracking-[0.3em] font-medium text-white uppercase cursor-default"
            aria-label="Plumbline project brand"
          >
            Plumbline
          </span>
        </div>

        {/* Desktop Nav bar - Simplified to prevent text overload and guide cleanly */}
        <nav className="hidden lg:flex items-center gap-8 font-mono text-[11px] tracking-wider text-muted uppercase">
          <a href="#claim" className="hover:text-evidence-amber transition-colors py-1">Philosophy</a>
          <a href="#ledger" className="hover:text-evidence-amber transition-colors py-1">Ledger</a>
          <a href="#machine" className="hover:text-evidence-amber transition-colors py-1">Console</a>
          <a href="#nexus" className="hover:text-evidence-amber transition-colors py-1">Nexus</a>
          
          <a 
            href="https://github.com/DYAI2025/Plumbline" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition-colors py-1 flex items-center gap-1.5 border border-panel-border hover:border-evidence-amber/55 px-3 py-1 rounded-md bg-white/5"
            data-cursor-hover
          >
            <Github className="w-3.5 h-3.5 text-evidence-amber" />
            <span>GitHub</span>
          </a>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:text-white transition-colors py-1 flex items-center gap-1.5 border border-panel-border hover:border-evidence-amber/55 px-3 py-1 rounded-md bg-white/5 cursor-pointer font-mono text-[10px] uppercase tracking-wider"
            title="Toggle Theme"
            aria-label="Toggle Theme"
            data-cursor-hover
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-evidence-amber animate-spin [animation-duration:12s]" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-evidence-amber" />
                <span>Dark</span>
              </>
            )}
          </button>
        </nav>

        {/* Access link for mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="font-mono text-[10px] tracking-widest border border-panel-border px-3 py-1.5 uppercase hover:bg-white/5 transition-colors rounded-md text-white flex items-center justify-center animate-fade-in"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-evidence-amber" /> : <Moon className="w-4 h-4 text-evidence-amber" />}
          </button>
          <a 
            href="#nexus" 
            className="font-mono text-[10px] tracking-widest border border-panel-border px-3.5 py-1.5 uppercase hover:bg-white/5 transition-colors rounded-md text-white"
          >
            Nexus
          </a>
        </div>
      </header>

      {/* Central continuous plumb reference guide line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-16 bottom-0 w-[1px] border-r border-dashed border-white/[0.04] pointer-events-none z-0" />

      {/* Vertical tracking layout */}
      <VerticalSectionNav sections={sections} />

      {/* Content wrapper layout */}
      <main className="relative z-10 select-text max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-32">
        
        {/* ======================================= */}
        {/* SECTION 00 — Opening / The Drop */}
        {/* ======================================= */}
        <section 
          id="drop" 
          className="min-h-screen flex flex-col items-center justify-center py-20 text-center relative pointer-events-none"
        >
          {/* Header identifier copy */}
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 select-none">
            00 // THE DROP
          </div>

          <RollingHeadline
            as="h1"
            text="Does it hang true?"
            className="hero-clamp font-serif font-light text-white mb-6 select-none leading-none"
          />

          {/* Subline container */}
          <p className="font-sans text-base md:text-xl text-[#f7f5f2]/90 max-w-2xl leading-relaxed tracking-tight mb-5 pointer-events-auto">
            An evidence-first agent framework for Claude Code — <br />
            built to separate <span className="text-white font-medium underline decoration-white/20 underline-offset-4">“looks done”</span> from <span className="text-evidence-green font-medium underline decoration-evidence-green/30 underline-offset-4">“is done”</span>.
          </p>

          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted max-w-lg leading-relaxed mb-8 pointer-events-auto">
            Gravity is not a question. <br />
            Value is not a claim. <br />
            <span className="text-evidence-amber">Plumbline reveals what holds.</span>
          </p>

          {/* Core Visual Scene: The heavy mechanical metal plumb bob */}
          <div className="w-full max-w-lg mb-12 pointer-events-auto">
            <PlumblineScene />
          </div>

          {/* CTA blocks - Streamlined to prevent button overload */}
          <div className="flex flex-wrap gap-4 items-center justify-center max-w-xl mx-auto pointer-events-auto">
            <a
              href="#machine"
              data-cursor-hover
              className="px-6 py-3 bg-evidence-amber text-black text-xs font-mono uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all font-bold rounded-md inline-flex items-center gap-2 shadow-[0_8px_32px_rgba(242,169,59,0.15)]"
            >
              <span>Explore Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="#nexus"
              data-cursor-hover
              className="px-6 py-3 border border-panel-border hover:border-evidence-amber text-xs font-mono uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all rounded-md text-white"
            >
              Get Started
            </a>
          </div>

          {/* Metadata details line */}
          <div className="mt-16 border-t border-white/5 pt-6 w-full max-w-2xl pointer-events-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="font-mono text-xs text-white/40 uppercase tracking-widest">Library</div>
                <div className="font-sans text-sm text-white/90 font-medium mt-1">86 Subagents</div>
              </div>
              <div>
                <div className="font-mono text-xs text-white/40 uppercase tracking-widest">Extensibility</div>
                <div className="font-sans text-sm text-white/90 font-medium mt-1">16 Vendored Skills</div>
              </div>
              <div>
                <div className="font-mono text-xs text-white/40 uppercase tracking-widest">Audit Engine</div>
                <div className="font-sans text-sm text-white/90 font-medium mt-1">Reality Ledger QA</div>
              </div>
              <div>
                <div className="font-mono text-xs text-white/40 uppercase tracking-widest">Methodology</div>
                <div className="font-sans text-sm text-white/90 font-medium mt-1">Empirical Benchmark</div>
              </div>
            </div>
          </div>
        </section>


        {/* ======================================= */}
        {/* SECTION 01 — Philosophy / The Law of the Plumb */}
        {/* ======================================= */}
        <section 
          id="claim" 
          className="min-h-screen flex flex-col justify-center py-20 border-t border-panel-border relative z-10 animate-fade-in"
        >
          {/* Header identifier copy */}
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/80 mb-6 text-center lg:text-left select-none">
            01 // THE LAW OF THE PLUMB
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Focused Editorial Content with Perfect Forensic Contrast */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div>
                <RollingHeadline
                  text="Green is not true."
                  className="text-4xl md:text-5xl font-serif font-light tracking-tight text-white mb-4 leading-tight"
                />
                
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#99ad82] mt-2 mb-3">// THE TRUTH-MANDATE PRINCIPLE</h3>
                
                <div className="font-sans text-base text-muted space-y-4 max-w-lg leading-relaxed">
                  <p>
                    A test suite can render green, code reviews can sign off, and issues can be closed — and yet, no real production value has actually crossed into physical host environments.
                  </p>
                  <p>
                    Plumbline exists for the moment when <span className="text-white italic">“done” looks convincing</span>, but simulated boundaries conceal untestable execution paths.
                  </p>
                </div>
              </div>

              <div className="p-6 border-l-2 border-evidence-amber bg-bg-soft/50 rounded-r-md max-w-lg space-y-3 shadow-inner">
                <div className="font-mono text-xs text-evidence-amber uppercase tracking-widest font-bold">
                  A PLUMB LINE DOES NOT NEGOTIATE
                </div>
                <p className="text-sm font-sans text-white/95 leading-relaxed">
                  The plumb line follows gravity's absolute pull. It does not argue with the stonemason, nor does it care how straight the wall looks to the eye. By following an anchor, deviation is instantly exposed.
                </p>
                <p className="text-xs font-sans text-white/60 pt-1">
                  Plumbline applies this exact physical law to agentic code workflows: we assert absolute truth over comfortable mock claims.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono text-white/50 leading-relaxed max-w-lg">
                <p className="text-white/60 font-semibold uppercase">// THE EMPIRICAL STANDARD:</p>
                <p>1. Mocks are not production paths.</p>
                <p>2. Simulated databases are not verified host schemas.</p>
                <p>3. Telemetry data maps reality, not structural intent.</p>
              </div>
            </div>

            {/* Right Column: Interactive Calibration Console */}
            <div className="lg:col-span-6 satin-panel p-6 rounded-md relative shadow-2xl border border-panel-border">
              <div className="absolute top-3.5 right-4 font-mono text-[9px] text-muted uppercase tracking-widest">
                Interactive Calibration Console
              </div>
              
              <h3 className="font-mono text-[10.5px] uppercase tracking-wider text-evidence-amber/95 mb-4 border-b border-panel-border pb-2">
                Simulate claim assertions to analyze hidden logical gaps:
              </h3>

              <div className="space-y-3.5">
                {claimLabels.map((lbl, idx) => {
                  const isActive = activeClaimIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveClaimIdx(isActive ? null : idx)}
                      data-cursor-hover
                      className={`w-full p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left border ${
                        isActive 
                          ? 'bg-evidence-red/10 border-evidence-red/40 shadow-[0_0_15px_rgba(224,122,47,0.12)]' 
                          : 'bg-bg-soft/40 border-panel-border hover:border-evidence-amber/35'
                      } rounded-md transition-all focus:outline-none`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted/50 font-bold">CLAIM:</span>
                        <span className={`font-mono text-sm capitalize font-bold tracking-wider ${isActive ? 'text-evidence-red' : 'text-white'}`}>
                          {lbl.word}
                        </span>
                      </div>

                      {/* Diagnostic Reveal state */}
                      <div className="flex items-center gap-3">
                        {isActive ? (
                          <div className="flex items-center gap-2 animate-fade-in">
                            <span className="font-mono text-[10px] text-evidence-red uppercase tracking-widest font-bold">GAP FOUND:</span>
                            <EvidenceTag status={lbl.result} />
                          </div>
                        ) : (
                          <span className="font-mono text-[10px] text-muted group-hover:text-evidence-amber tracking-wider font-bold">
                            TAP TO REVEAL DEVIATION
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanatory Drawer for active item */}
              <div className="mt-4 pt-4 border-t border-panel-border min-h-[90px] flex items-center justify-center">
                {activeClaimIdx !== null ? (
                  <div className="text-left w-full space-y-1.5 animate-fade-in">
                    <div className="font-mono text-[10px] text-muted uppercase tracking-widest">
                      Forensic Audit Findings
                    </div>
                    <p className="text-xs text-white font-sans leading-relaxed">
                      {claimLabels[activeClaimIdx].explanation}
                    </p>
                    <div className="font-mono text-[9px] text-[#e07a2f] uppercase tracking-wider font-bold">
                      CRITICAL RISK EXPOSURE: ACTIVE VERIFICATION INCOMPLETE
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#99ad82]/80 font-mono uppercase tracking-widest flex items-center gap-2 animate-pulse">
                    <span>* Awaiting command. Tap an assertion button above to inspect.</span>
                  </p>
                )}
              </div>

            </div>

          </div>
        </section>


        {/* SECTION 02 Decommissioned — Unified inside Section 01 */}
        <section 
          id="line" 
          className="hidden"
        >
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 text-center md:text-left">
            02 // THE LINE
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <RollingHeadline
                text="A plumb line does not argue. It shows."
                className="text-4xl md:text-6xl font-serif font-light tracking-tight text-white leading-tight mb-6"
              />

              <div className="font-sans text-base text-[#f7f5f2]/85 space-y-4 max-w-xl leading-relaxed">
                <p>
                  A plumb line is one of the oldest instruments for truth in construction. 
                  It does not negotiate with the builder. It does not care how straight the wall appears.
                </p>
                <p>
                  It follows gravity — and by following it, reveals deviation.
                </p>
              </div>

              <div className="p-5 border-l border-evidence-amber/20 bg-white/[0.01] rounded-md max-w-xl space-y-3">
                <div className="font-mono text-[11px] text-evidence-amber uppercase tracking-widest font-bold">
                  Logical Alignment
                </div>
                <p className="text-sm font-sans text-[#f7f5f2]/80 leading-relaxed">
                  Plumbline applies the same physical principle to agentic software work. We do not ask: 
                  <span className="text-evidence-red font-mono text-xs block my-1">“Did the agent finish its recursive cycle?”</span>
                  Instead, we ask:
                  <span className="text-evidence-green font-mono text-xs block my-1">“Does the result still hang true against confirmed human value?”</span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-[#080a0c]/80 border border-white/5 rounded-sm relative">
              {/* Graphic Alignment Overlay */}
              <div className="absolute top-4 left-4 font-mono text-[9px] text-white/20">
                REF: DE_DE_TRANSLATION
              </div>
              
              <div className="w-full text-center py-6 space-y-4">
                <div className="font-mono text-xs uppercase tracking-widest text-[#9b9b96]">
                  The Reference Is Value
                </div>
                
                <hr className="w-16 border-white/10 mx-auto" />

                <div className="p-4 bg-white/[0.01] rounded-sm inline-block">
                  <div className="text-lg md:text-xl font-sans text-white font-medium tracking-tight">
                    "The reference is not the process. <br />
                    The reference is value."
                  </div>
                </div>

                <div className="p-4 bg-black/40 rounded-sm inline-block">
                  <div className="text-sm md:text-base font-sans italic text-white/60">
                    "Der Prozess ist nicht die Referenz. <br />
                    Der Wert ist die Referenz."
                  </div>
                </div>
                
                <div className="text-[10px] font-mono text-[#62625d] uppercase tracking-widest pt-2">
                  // AGENTIC EQUILIBRIUM MANDATE
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* SECTION 03 Decommissioned — Unified inside Section 01 bottom row */}
        <section 
          id="gap" 
          className="hidden"
        >
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 text-center md:text-left">
            03 // THE GAP
          </div>

          <div className="text-center md:text-left max-w-3xl mb-12">
            <RollingHeadline
              text="Where value is absent, Plumbline does not decorate the gap. It shows it."
              className="text-4xl md:text-6xl font-serif font-light tracking-tight text-white mb-6 leading-tight"
            />

            <p className="font-sans text-base md:text-lg text-white/70 leading-relaxed mb-6">
              Plumbline does not add another layer of confidence theater. 
              It does not turn mock evidence into product truth. 
              It does not let a fake boundary pass as reality. If value is missing, the gap remains visible.
            </p>
          </div>

          {/* Visual: The Broken Line & Floating Warning Annotations */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch pt-6">
            
            {/* Split graphical display of the continuous broken wire */}
            <div className="lg:col-span-5 satin-panel rounded-md p-8 flex flex-col justify-between relative min-h-[350px]">
              <div className="absolute top-3 left-3 font-mono text-[9px] text-[#62625d] uppercase tracking-wider">
                Visualizing Gap Deviation
              </div>

              {/* Top part of wire */}
              <div className="flex flex-col items-center">
                <div className="w-[1px] h-24 bg-gradient-to-b from-white to-white/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-evidence-red glow-red my-1" />
                <span className="font-mono text-[9px] text-evidence-red uppercase tracking-widest font-bold">Local Exec Ends</span>
              </div>

              {/* Broken Gap */}
              <div className="my-6 border border-dashed border-evidence-red/30 bg-evidence-red/5 p-4 text-center rounded-md">
                <span className="font-mono text-[10px] text-evidence-red tracking-widest uppercase block mb-1 font-bold">
                  [!] VERIFICATION BREAK POINT
                </span>
                <span className="text-stone-500 font-mono text-[9px] uppercase tracking-wide">
                  No operational metrics crossing boundary
                </span>
              </div>

              {/* Bottom part of wire */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Real Composition</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10 my-1" />
                <div className="w-[1px] h-16 bg-gradient-to-b from-white/10 to-transparent" />
              </div>
            </div>

            {/* Evidence classes panel */}
            <div className="lg:col-span-7 satin-panel rounded-md p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-sans text-lg font-semibold text-white mb-2">
                  The Operational Boundary Paradigm
                </h3>
                <p className="text-xs text-[#9b9b96] font-sans leading-relaxed mb-6">
                  A feature touching I/O, API schemas, UI configurations, remotes or live production 
                  assemblies cannot be called real just because isolated unit mocks passed. 
                  The line holds only when evidence physically reaches the production contract.
                </p>

                <div className="space-y-4">
                  <div className="font-mono text-[10px] text-white/40 tracking-wider uppercase border-b border-white/5 pb-1">
                    Taxonomy of Evidence Levels
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2 border border-white/5 bg-white/[0.01] rounded-sm space-y-1">
                      <EvidenceTag status="fake-only" />
                      <p className="text-[10px] text-white/50 font-sans">Zero external IO check.</p>
                    </div>
                    <div className="p-2 border border-white/5 bg-white/[0.01] rounded-sm space-y-1">
                      <EvidenceTag status="unit-fake" />
                      <p className="text-[10px] text-white/50 font-sans">Mocks replace network response.</p>
                    </div>
                    <div className="p-2 border border-white/5 bg-white/[0.01] rounded-sm space-y-1">
                      <EvidenceTag status="integration-fake" />
                      <p className="text-[10px] text-white/50 font-sans">System wires with static simulations.</p>
                    </div>
                    <div className="p-2 border border-white/5 bg-white/[0.01] rounded-sm space-y-1">
                      <EvidenceTag status="real-boundary-smoke" />
                      <p className="text-[10px] text-white/50 font-sans">Touches system sandbox files and TCP.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#62625d] uppercase tracking-wider">
                  Verification Matrix // V_04
                </span>
                <span className="font-mono text-[9px] text-evidence-amber uppercase tracking-wider font-bold">
                  illustrative evidence card // requires repository validation
                </span>
              </div>
            </div>

          </div>
        </section>


        {/* ======================================= */}
        {/* SECTION 04 — The Ledger */}
        {/* ======================================= */}
        <section 
          id="ledger" 
          className="min-h-screen flex flex-col justify-center py-28 border-t border-white/5 relative z-10"
        >
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 text-center md:text-left">
            04 // THE LEDGER
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-5 space-y-6">
              <RollingHeadline
                text="Every requirement carries evidence."
                className="text-4xl md:text-6xl font-serif font-light tracking-tight text-white leading-tight mb-6"
              />

              <p className="font-sans text-base text-white/70 leading-relaxed max-w-md">
                Plumbline turns product work into a transparent ledger of claims and proofs. 
                Instead of trust, each requirement must declare exactly where its boundaries end.
              </p>

              <div className="space-y-2 border-l border-white/10 pl-4 py-2 font-mono text-xs text-[#9b9b96]">
                <p className="text-white">// The 5 Inquiries:</p>
                <p>1. What value does this serve?</p>
                <p>2. Where is it wired?</p>
                <p>3. Which boundary did it cross?</p>
                <p>4. What evidence supports it?</p>
                <p>5. Who accepted it?</p>
              </div>

              <p className="text-xs font-mono text-evidence-red uppercase tracking-widest bg-evidence-red/5 px-3 py-2.5 rounded-md border border-evidence-red/20 font-bold">
                 A green test is a signal. Not a verdict.
              </p>
            </div>

            {/* Ledger Card Layout */}
            <div className="lg:col-span-7 w-full">
              <GlassPanel metaID="REQ-017" title="Active Claim Blueprint" className="p-8">
                
                {/* Stamp overlay */}
                <div className="absolute top-4 right-4 rotate-6 border-2 border-evidence-red/35 px-2.5 py-1 font-mono text-[10px] text-evidence-red font-bold uppercase tracking-widest bg-evidence-red/5 rounded-md select-none">
                  INSUFFICIENT PROOF
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block mb-1">Requirement Token</span>
                    <h3 className="font-mono text-lg font-bold text-white tracking-tight leading-none uppercase">
                      OAuth Refresh-token Rotation
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="font-mono text-[9px] text-[#62625d] uppercase tracking-wider block mb-1">CLAIM VALUE</span>
                      <p className="font-sans text-xs text-white/80 leading-relaxed">
                        Users stay securely authenticated across sessions without token spoof hazards.
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-[#62625d] uppercase tracking-wider block mb-1">WIRED PATH</span>
                      <p className="font-mono text-xs text-stone-400 break-all">
                        /src/auth/rotation.ts [LINE 405-482]
                      </p>
                    </div>
                  </div>

                  {/* Core Evidence statuses */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block">
                      Evidence Diagnostics Status
                    </span>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-sm border border-white/5">
                        <EvidenceTag status="integration-fake" />
                        <span className="font-mono text-[10px] text-evidence-amber uppercase tracking-widest font-bold">INSUFFICIENT</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-sm border border-white/5">
                        <EvidenceTag status="real-boundary-smoke" />
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">REQUIRED PROOF</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="font-mono text-[9px] text-[#62625d] uppercase tracking-wider block mb-1">VERIFICATION LOG</span>
                    <p className="text-xs text-white/60 font-sans">
                      Failed audit: Integration is fake. Refusing to claim feature completeness until real system composition handles live encryption handshakes on local network loops.
                    </p>
                  </div>

                  {/* Red Status indicator */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-evidence-red animate-pulse glow-red" />
                      <span className="font-mono text-xs uppercase text-evidence-red font-bold tracking-widest">
                        LEDGER STATUS: BLOCKED (RED)
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-[#62625d]">
                      COMPILE: SECURE_REFUSE
                    </span>
                  </div>

                </div>
              </GlassPanel>
            </div>

          </div>
        </section>


        {/* ======================================= */}
        {/* SECTION 05 — The Machine Room */}
        {/* ======================================= */}
        <section 
          id="machine" 
          className="min-h-screen flex flex-col justify-center py-28 border-t border-white/5 relative z-10"
        >
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 text-center md:text-left">
            05 // THE MACHINE ROOM
          </div>

          <div className="mb-12 text-center md:text-left max-w-3xl">
            <RollingHeadline
              text="Welcome to the machine room."
              className="text-4xl md:text-6xl font-serif font-light tracking-tight text-white mb-6 leading-tight"
            />
            
            <p className="font-sans text-base md:text-lg text-white/70 leading-relaxed">
              Plumbline is not just a manifesto. It ships an agentic delivery system for Claude Code – 
              incorporating automated Blueprints, independent review loops, secure boundaries, and strict human acceptance keys.
            </p>
          </div>

          {/* Cards Bento Grid Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <GlassPanel metaID="CMD-01" title="Autonomous Pipeline">
              <h3 className="font-mono text-base font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                <Terminal className="w-4 h-4 text-evidence-green" />
                <span>/agileteam</span>
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed mb-4">
                Execute an integrated, recursive product delivery cycle directly inside Claude Code:
              </p>
              <div className="font-mono text-[10px] uppercase text-evidence-green/80 space-y-1 bg-black/50 p-3 rounded-md border border-white/5">
                <span className="block font-bold">reqs → PRD → TDD</span>
                <span className="block">→ review → cyber-security</span>
                <span className="block">→ validation → signoff</span>
              </div>
            </GlassPanel>

            {/* Feature 2 */}
            <GlassPanel metaID="CMD-02" title="Four-Body Stress Test">
              <h3 className="font-mono text-base font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-evidence-amber" />
                <span>/concilium</span>
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed mb-4">
                Instantiate a diverse, multi-part council before consuming precious model tokens:
              </p>
              <div className="font-mono text-[10px] uppercase text-evidence-amber/80 space-y-1 bg-black/50 p-3 rounded-md border border-white/5">
                <span className="block font-bold">1. Market Fit Stress</span>
                <span className="block">2. Structural Architecture</span>
                <span className="block">3. Cynic / Adversary Loop</span>
                <span className="block">4. Distribution Blueprint</span>
              </div>
            </GlassPanel>

            {/* Feature 3 */}
            <GlassPanel metaID="RE-03" title="Contract Tracking">
              <h3 className="font-mono text-base font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9ebce6]" />
                <span>Reality Ledger</span>
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed mb-4">
                Each system instruction and requirement is evaluated against rigorous evidence categories.
              </p>
              <p className="text-xs text-white/50 font-sans leading-relaxed">
                Mocks are treated as fake. Pure mathematical verification requirements stay strictly separated from subjective assertions.
              </p>
            </GlassPanel>

            {/* Feature 4 */}
            <GlassPanel metaID="CMD-04" title="Absolute Completeness">
              <h3 className="font-mono text-base font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-evidence-red" />
                <span>Honest Status</span>
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed mb-4">
                A command built exclusively for separating logical assertions from physical confirmation levels.
              </p>
              <p className="text-xs text-white/50 font-sans leading-relaxed">
                Generates instant telemetry reports marking exactly what code layers have verified network proofs and what remain unconfirmed.
              </p>
            </GlassPanel>

            {/* Feature 5 (Bigger block covering explorer) */}
            <div className="md:col-span-2 satin-panel rounded-md p-6 flex flex-col justify-between relative shadow-lg">
              <div className="absolute top-3 right-3 font-mono text-[9px] text-white/30 tracking-widest uppercase">
                Interactive Subagent Explorer
              </div>

              <div>
                <h3 className="font-mono text-base font-bold text-white mb-2 tracking-tight flex items-center gap-2 block-title">
                  <Compass className="w-4 h-4 text-evidence-amber animate-spin [animation-duration:12s]" />
                  <span>Agent Explorer Console</span>
                </h3>
                <p className="text-xs text-stone-400 font-sans leading-relaxed mb-4">
                  Zero-install interface for searching and inspecting subagent library dependencies, filters and triggers:
                </p>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button 
                    onClick={() => setExplorerCategory('all')} 
                    className={`font-mono text-[10px] px-2.5 py-1 rounded-md border uppercase transition-all ${
                      explorerCategory === 'all' ? 'bg-evidence-amber/15 text-evidence-amber border-evidence-amber/40 font-bold' : 'bg-transparent text-white/50 border-white/10 hover:border-white/25'
                    }`}
                  >
                    All Types
                  </button>
                  <button 
                    onClick={() => setExplorerCategory('core')} 
                    className={`font-mono text-[10px] px-2.5 py-1 rounded-md border uppercase transition-all ${
                      explorerCategory === 'core' ? 'bg-evidence-amber/15 text-evidence-amber border-evidence-amber/40 font-bold' : 'bg-transparent text-white/50 border-white/10 hover:border-white/25'
                    }`}
                  >
                    Core Pipeline
                  </button>
                  <button 
                    onClick={() => setExplorerCategory('boundary')} 
                    className={`font-mono text-[10px] px-2.5 py-1 rounded-md border uppercase transition-all ${
                      explorerCategory === 'boundary' ? 'bg-evidence-amber/15 text-evidence-amber border-evidence-amber/40 font-bold' : 'bg-transparent text-white/50 border-white/10 hover:border-white/25'
                    }`}
                  >
                    Boundary checks
                  </button>
                  <button 
                    onClick={() => setExplorerCategory('governance')} 
                    className={`font-mono text-[10px] px-2.5 py-1 rounded-md border uppercase transition-all ${
                      explorerCategory === 'governance' ? 'bg-evidence-amber/15 text-evidence-amber border-evidence-amber/40 font-bold' : 'bg-transparent text-white/50 border-white/10 hover:border-white/25'
                    }`}
                  >
                    Governance
                  </button>
                </div>

                {/* Search query tag */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text/40" />
                  <input
                    type="text"
                    placeholder="Search subagents, triggers, commands..."
                    value={explorerQuery}
                    onChange={(e) => setExplorerQuery(e.target.value)}
                    className="w-full bg-bg-soft/70 border border-panel-border rounded-md py-2 pl-9 pr-4 text-xs font-mono text-text placeholder-dim focus:outline-none focus:border-evidence-amber/50"
                  />
                </div>

                {/* Simulated list layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredExplorer.map((m, idx) => (
                    <div key={idx} className="p-2 border border-evidence-amber/10 bg-bg-soft/45 rounded-md flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-white font-medium">{m.name}</span>
                        <span className="font-mono text-[8.5px] text-evidence-amber/70 uppercase font-bold">{m.cat}</span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-sans mt-1">{m.desc}</p>
                    </div>
                  ))}
                  {filteredExplorer.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-xs font-mono text-[#62625d] uppercase">
                      No agents found matching query.
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-4">
                * Built exclusively for auditable multi-agent setups.
              </div>
            </div>

          </div>
        </section>


        {/* ======================================= */}
        {/* SECTION 06 — The Benchmark */}
        {/* ======================================= */}
        <section 
          id="bench" 
          className="min-h-screen flex flex-col justify-center py-28 border-t border-white/5 relative z-10"
        >
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 text-center md:text-left">
            06 // THE BENCHMARK
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-5 space-y-6">
              <RollingHeadline
                text="We measured the idea we wanted to believe. It did not fully survive."
                className="text-4xl md:text-6xl font-serif font-light tracking-tight text-white leading-tight mb-6"
              />

              <div className="font-sans text-base text-[#f7f5f2]/80 space-y-4 max-w-sm leading-relaxed">
                <p>
                  Plumbline benchmarked its own agent framework. The result was not a clean marketing win.
                </p>
                <p>
                  Prompt discipline helped on focused routes. It did not magically fix weaker models. 
                  Some library boundary failures were caught only by stronger model level judgment.
                </p>
                <p className="border-l-2 border-evidence-amber pl-4 font-sans font-medium text-evidence-amber bg-evidence-amber/5 py-2.5 rounded-r-md">
                  So the precise results remained untouched in the main repository.
                </p>
              </div>

              <div className="text-sm font-semibold font-mono text-white">
                The benchmark did not make Plumbline smaller. <span className="text-evidence-green block mt-1 uppercase tracking-wider font-bold">It made it honest.</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 w-full">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <GlassPanel metaID="EVAL-A" title="Mutation-Oracle Harness" className="p-5">
                  <div className="font-mono text-xs text-[#9b9b96] uppercase mb-1">MEASUREMENT</div>
                  <h4 className="font-sans text-sm font-bold text-white mb-2 leading-tight">
                    Mutation testing assertions
                  </h4>
                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    Evaluated code mutators directly against standard requirements to test recall boundaries of assertions.
                  </p>
                </GlassPanel>

                <GlassPanel metaID="EVAL-B" title="Recall Metrics Output" className="p-5">
                  <div className="font-mono text-xs text-[#9b9b96] uppercase mb-1">OUTCOME</div>
                  <h4 className="font-sans text-sm font-bold text-white mb-2 leading-tight">
                    Prompt discipline limitations
                  </h4>
                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    Disciplined parameters showed minor improvements on repetitive endpoints but failed to patch base structural flaws without human intervention.
                  </p>
                </GlassPanel>

                <GlassPanel metaID="EVAL-C" title="Infrastructure Scale" className="p-5">
                  <div className="font-mono text-xs text-[#9b9b96] uppercase mb-1">BOUNDARY FAILURES</div>
                  <h4 className="font-sans text-sm font-bold text-white mb-2 leading-tight">
                    Model capability boundaries
                  </h4>
                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    Only Opus successfully identified missing state checks and unauthenticated I/O loops across mock-to-real boundaries.
                  </p>
                </GlassPanel>

                <GlassPanel metaID="EVAL-D" title="Open Publication" className="p-5">
                  <div className="font-mono text-xs text-[#9b9b96] uppercase mb-1">TRANSPARENCY</div>
                  <h4 className="font-sans text-sm font-bold text-white mb-2 leading-tight">
                    Full disclosure ledger
                  </h4>
                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    Published explicit failure trade-offs, model limitations and cost ratios rather than high-performance graphs.
                  </p>
                </GlassPanel>

              </div>

              {/* Hard physical alignment quote banner */}
              <div className="p-5 satin-panel border border-evidence-amber/15 text-left rounded-md relative overflow-hidden shadow-md">
                <span className="absolute -right-2 -bottom-2 text-7xl font-mono text-white/[0.015] uppercase pointer-events-none font-extrabold select-none">
                  TRUTH
                </span>
                <p className="font-mono text-xs text-[#f7f5f2]/80 leading-relaxed">
                  “The DNA is strictly better” would be a marketing lie. <br />
                  <span className="text-evidence-green font-bold">“Net-positive on Opus, trade-off on sub-Opus”</span> is closer to real software engineering truth.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ======================================= */}
        {/* SECTION 05 — The Nexus */}
        {/* ======================================= */}
        <section 
          id="nexus" 
          className="min-h-screen flex flex-col justify-center py-28 border-t border-white/5 relative z-10"
        >
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 text-center md:text-left">
            05 // THE NEXUS
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <RollingHeadline
                text="Install the line."
                className="text-4xl md:text-6xl font-serif font-light tracking-tight text-white leading-tight mb-6"
              />

              <p className="font-sans text-base text-white/70 leading-relaxed max-w-sm">
                Plumbline runs natively inside Claude Code. No complicated server setups are necessary for the default install. 
                Mounts the core governing agents and Reality Ledger commands seamlessly.
              </p>

              <div className="border-l-2 border-evidence-green pl-4 py-2.5 bg-evidence-green/5 text-xs text-[#f7f5f2]/85 space-y-1.5 font-sans rounded-r-md">
                <span className="font-bold text-white block">Execution Recommendation:</span>
                For ultimate truth-checking validation levels, configure Opus on judgment evaluation gates.
              </div>

              {/* Install CTAs */}
              <div className="flex flex-col gap-3 max-w-xs pt-2">
                <button
                  onClick={() => showToast('Redirecting to the manual configuration guides... (In a real setup, this links to the docs)')}
                  data-cursor-hover
                  className="px-5 py-2.5 bg-evidence-amber text-black text-xs font-mono font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all rounded-md flex items-center justify-between shadow-[0_4px_15px_rgba(229,169,83,0.15)]"
                >
                  <span>Read Setup Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href="https://github.com/DYAI2025/Plumbline"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-hover
                  className="px-5 py-2.5 border border-evidence-amber/20 hover:border-evidence-amber/14 bg-white/5 text-white/80 text-xs font-mono uppercase tracking-widest rounded-md flex items-center justify-between"
                >
                  <span>Open GitHub Repo</span>
                  <Github className="w-3.5 h-3.5 text-evidence-amber" />
                </a>
                <button
                  onClick={() => {
                    const el = document.getElementById('machine');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    showToast('Focused Agent Explorer panel');
                  }}
                  data-cursor-hover
                  className="px-5 py-2.5 border border-evidence-amber/20 hover:border-evidence-amber/14 bg-white/5 text-white/80 text-xs font-mono uppercase tracking-widest rounded-md flex items-center justify-between"
                >
                  <span>Launch Agent Explorer</span>
                  <Compass className="w-3.5 h-3.5 text-evidence-amber" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block">
                  Installation CLI Commands
                </span>
                <TerminalBlock 
                  command="git clone https://github.com/DYAI2025/Plumbline plumbline && cd plumbline && ./config/claude/install.sh" 
                  outputLines={[
                    'PLUMBLINE SETUP // INIT v1.0.4',
                    '  -> Creating local repository reference',
                    '  -> Resolving Claude Code workspace config',
                    '  -> Registering custom system tools...',
                    '  -> [OK] Core governance agents mounted.'
                  ]}
                />
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block">
                  Running local requirement validations
                </span>
                <TerminalBlock 
                  command="/agileteam &quot;add OAuth2 login with refresh-token rotation&quot;" 
                  outputLines={[
                    'PLUMBLINE PIPELINE CHRONICLE // AGILITY-LOOP_01',
                    '  [REQ-INIT] parsing: add OAuth2 login with refresh-token rotation',
                    '  [CONCILIUM] Council summoned. Skeptic panel asserts 4 token risks.',
                    '  [STATUS] Completed blueprint generation in /spec/REQ-017.md',
                    '  [WARNING] Evidence status initialized to unit-fake (Awaiting verified state).'
                  ]}
                />
              </div>

            </div>

          </div>
        </section>


        {/* ======================================= */}
        {/* SECTION 08 — The Patronage */}
        {/* ======================================= */}
        <section 
          id="support" 
          className="min-h-screen flex flex-col justify-center py-28 border-t border-white/5 relative z-10"
        >
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 text-center md:text-left">
            08 // THE PATRONAGE
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <RollingHeadline
                text="Fund the measurement. Not the theater."
                className="text-4xl md:text-6xl font-serif font-light tracking-tight text-evidence-amber leading-tight mb-6 animate-pulse"
              />

              <p className="font-sans text-base text-[#f7f5f2]/80 leading-relaxed max-w-sm">
                Plumbline’s central assertions are measured, not simulated. This requires representative runs of model evaluation tokens (labeled as example logs for local evaluation). 
                Sponsorship strictly funds live benchmark runs, oracle datasets, continuous boundary traps, and cross-model evaluations.
              </p>

              <p className="text-xs font-mono text-stone-500 uppercase tracking-wider italic">
                * Transparency Disclaimer: Sponsorship keeps this open-source effort alive. It is a patronage of logic, not an SLA or a paid SaaS guarantee.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-4">
              
              {/* Tier 1 */}
              <div 
                className="satin-panel border border-[#e5a953]/25 hover:border-evidence-amber/50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-md transition-all shadow-[0_4px_24px_rgba(229,169,83,0.03)]"
                data-cursor-hover
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs uppercase font-bold text-white tracking-widest">
                      Haiku Supporter
                    </span>
                    <span className="font-mono text-[9px] text-evidence-amber border border-evidence-amber/30 bg-evidence-amber/5 px-1.5 uppercase rounded-md font-bold">
                      Level 01
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-sans">
                    Keeps daily validation checks and automated smoke checking scripts alive.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-bold text-white">$12/mo</span>
                  <button 
                    onClick={() => {
                      showToast('Patronage active trigger: Thank you for keeping daily checks alive.');
                      setSponsorDialog('Haiku Supporter');
                    }}
                    className="px-4 py-2 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-md hover:bg-stone-200 transition-all font-bold"
                  >
                    Select
                  </button>
                </div>
              </div>

              {/* Tier 2 */}
              <div 
                className="satin-panel border border-[#e5a953]/35 hover:border-evidence-amber/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-md transition-all shadow-[0_4px_24px_rgba(229,169,83,0.05)]"
                data-cursor-hover
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs uppercase font-bold text-evidence-amber tracking-widest flex items-center gap-1.5 font-bold">
                      <Heart className="w-3.5 h-3.5 fill-evidence-amber/20 text-evidence-amber" />
                      Opus Validator
                    </span>
                    <span className="font-mono text-[9px] text-evidence-amber border border-evidence-amber/40 bg-evidence-amber/10 px-1.5 uppercase rounded-md font-bold">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-sans">
                    Funds heavy model API evaluation tokens and complex recursive boundary validation traps.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-bold text-white">$80/mo</span>
                  <button 
                    onClick={() => {
                      showToast('Patronage active trigger: Thank you for financing strict Opus audit pipelines.');
                      setSponsorDialog('Opus Validator');
                    }}
                    className="px-4 py-2 bg-evidence-amber text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-md hover:brightness-110 transition-all font-bold"
                  >
                    Select
                  </button>
                </div>
              </div>

              {/* Tier 3 */}
              <div 
                className="satin-panel border border-white/10 hover:border-evidence-amber/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-md transition-all"
                data-cursor-hover
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs uppercase font-bold text-white tracking-widest">
                      Enterprise Governance Patron
                    </span>
                    <span className="font-mono text-[9px] text-muted border border-white/10 px-1.5 uppercase rounded-md">
                      Level 03
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-sans">
                    Supports sustained multi-model benchmarking datasets and strict Reality Ledger QA priorities.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-bold text-white">$450/mo</span>
                  <button 
                    onClick={() => {
                      showToast('Patronage active trigger: Strategic partnership enabled. Deepest thanks.');
                      setSponsorDialog('Enterprise Governance Patron');
                    }}
                    className="px-4 py-2 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-md hover:bg-stone-200 transition-all font-bold"
                  >
                    Select
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ======================================= */}
        {/* SECTION 09 — Final Manifesto */}
        {/* ======================================= */}
        <section 
          id="manifesto" 
          className="min-h-screen flex flex-col items-center justify-center py-24 text-center border-t border-white/5 relative z-10"
        >
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-evidence-amber/60 mb-4 select-none">
            09 // FINAL MANIFESTO
          </div>

          <RollingHeadline
            text="The line remains true. Or it does not."
            className="text-4xl md:text-7xl font-serif font-light tracking-tight text-white mb-6 leading-tight"
          />

          <div className="max-w-2xl mx-auto space-y-6 text-sm md:text-base text-[#f7f5f2]/80 leading-relaxed font-sans mt-4">
            <p>
              Plumbline is built exclusively for the uncomfortable part of agentic software architecture: 
              the place where generic consensus is not enough, isolated tests are not enough, and absolute confidence becomes hazardous.
            </p>
            <p className="text-white font-medium">
              We do not promise that agents will never fail. We simply make failure impossible to hide.
            </p>
          </div>

          <div className="my-10 p-6 satin-panel border border-evidence-amber/10 rounded-md inline-block max-w-xl text-left select-none shadow-md">
            <p className="font-mono text-xs uppercase text-evidence-green/90 mb-1 tracking-wider font-bold">
              // SCALABILITY METRIC STATEMENT:
            </p>
            <p className="font-sans text-xs text-stone-400 leading-relaxed">
              If you only require basic script generation snippets, this is complete overkill. 
              But if you want to inspect, govern and iterate autonomous agent systems with a framework built to demonstrate they hang true: 
              We await you in the machine room.
            </p>
          </div>

          {/* Final Large CTAs */}
          <div className="flex flex-wrap gap-4 items-center justify-center max-w-lg mx-auto">
            <button
              onClick={() => {
                const el = document.getElementById('machine');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showToast('Awaiting agent directives in console');
              }}
              data-cursor-hover
              className="px-8 py-3.5 bg-evidence-amber text-black text-xs font-mono font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all rounded-md inline-flex items-center gap-2 shadow-[0_4px_15px_rgba(229,169,83,0.15)]"
            >
              <span>Explore Plumbline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="#nexus"
              data-cursor-hover
              className="px-8 py-3.5 border border-evidence-amber/20 hover:border-evidence-amber/40 bg-white/5 text-evidence-amber text-xs font-mono uppercase tracking-widest rounded-md"
            >
              Install locally
            </a>
          </div>

          {/* Subliminal Brand Footer details */}
          <div className="mt-28 border-t border-white/5 pt-8 w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 select-none font-mono text-[9px] text-[#62625d] uppercase tracking-widest">
            <span>DY_AI_PLUMBLINE_LICENSE_SPDX_2026</span>
            <span>MEASURED UNDER ABSOLUTE GRAVITY</span>
            <span>github.com/DYAI2025/plumbline</span>
          </div>

        </section>

      </main>

      {/* Forensic Modal Dialog for sponsorship */}
      {sponsorDialog && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#030405]/95 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0b0c10] satin-panel border border-[#e5a953]/40 p-6 rounded-md shadow-[0_24px_50px_-10px_rgba(0,0,0,0.9)] text-left">
            <button 
              onClick={() => setSponsorDialog(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4 font-mono">
              <span className="text-[10px] text-evidence-amber uppercase tracking-widest block font-bold">
                // ACTIVE INITIATION IN PROGRESS
              </span>
              <h3 className="text-lg font-bold text-white tracking-wider uppercase">
                {sponsorDialog}
              </h3>
              
              <hr className="border-white/10" />
              
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                You have initiated sponsorship patronage. Plumbline remains fully open-source and dedicated to establishing evidence-first standards for Claude Code systems.
              </p>

              <div className="p-3 bg-black/50 border border-white/5 rounded-md text-xs text-white/75 space-y-1">
                <p className="font-bold">// PATRONAGE DISPATCH LOGS:</p>
                <p>Status: Unwired mock API</p>
                <p>Network loop: Simulator Sandbox</p>
                <p>Telemetry: SECURE_PASSIVE_ONLY</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSponsorDialog(null);
                    showToast('Sponsorship pledge mock complete. Thank you, partner.');
                  }}
                  className="w-full py-2.5 bg-evidence-amber text-black font-bold uppercase text-xs tracking-widest rounded-md hover:brightness-110 active:scale-95 transition-all text-center"
                >
                  Confirm PLEDGE
                </button>
                <button
                  onClick={() => setSponsorDialog(null)}
                  className="w-full py-2.5 border border-white/10 text-white/60 font-medium uppercase text-xs tracking-widest rounded-md hover:bg-white/5 transition-all text-center"
                >
                  Abort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
