import { useEffect, useState } from 'react';
import { SectionInfo } from '../types';

interface VerticalSectionNavProps {
  sections: SectionInfo[];
}

export default function VerticalSectionNav({ sections }: VerticalSectionNavProps) {
  const [activeSection, setActiveSection] = useState('00');

  useEffect(() => {
    // Collect all section DOM elements
    const elements = sections.map(sec => document.getElementById(sec.id)).filter(Boolean) as HTMLElement[];
    
    if (elements.length === 0) return;

    // Set up observer to track active section
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px', // Trigger active state when section crosses the upper/middle focal area
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const found = sections.find(s => s.id === sectionId);
          if (found) {
            setActiveSection(found.num);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [sections]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      aria-label="Vertical Section Navigation"
      className="fixed left-6 lg:left-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-5 z-40 select-none scale-90 md:scale-100"
    >
      <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-white/5 pointer-events-none" />
      
      {sections.map((sec) => {
        const isActive = activeSection === sec.num;
        return (
          <button
            key={sec.id}
            onClick={() => handleScrollTo(sec.id)}
            data-cursor-hover
            className="group flex items-center gap-4 text-left pointer-events-auto"
            aria-label={`Scroll to ${sec.label}`}
          >
            {/* Active Circle node */}
            <div className="relative">
              <div className={`w-[7px] h-[7px] rounded-full border transition-all duration-300 ${
                isActive 
                  ? 'bg-evidence-amber border-evidence-amber scale-125 shadow-[0_0_10px_rgba(229,169,83,0.8)]' 
                  : 'bg-transparent border-white/20 group-hover:border-white/60'
              }`} />
            </div>

            {/* Label and Section Number */}
            <div className="flex flex-col leading-none">
              <span className={`font-mono text-[9px] font-bold tracking-widest transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-white/30 group-hover:text-white/60'
              }`}>
                {sec.num}
              </span>
              <span className={`font-mono text-[8px] tracking-widest uppercase transition-colors duration-200 mt-0.5 ${
                isActive ? 'text-evidence-amber font-medium' : 'text-transparent group-hover:text-white/40'
              }`}>
                {sec.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
