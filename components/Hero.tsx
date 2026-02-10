import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const Hero = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;
      const progress = Math.min(scrollY / height, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div id="hero" className="relative h-screen w-full overflow-hidden bg-dark">
      {/* Mesh Gradient + Image Parallax */}
      <div
        className="absolute inset-0 w-full h-full mesh-gradient opacity-60"
        style={{ transform: `translateY(${scrollProgress * 0.2 * 100}px)` }}
      />

      <div
        className="absolute inset-0 w-full h-full"
        style={{ transform: `translateY(${scrollProgress * 0.4 * 100}px)` }}
      >
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
          alt="Fondo Conecta"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-transparent to-dark/90" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-6xl mx-auto"
        style={{
          opacity: 1 - scrollProgress * 1.5,
          transform: `translateY(${scrollProgress * -30}px)`
        }}
      >
        {/* Premium Tagline Badge */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full ring-1 ring-white/20 shadow-premium">
            <Sparkles className="w-3 h-3 text-accent animate-pulse" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/80">
              Consultores en Impacto Social
            </span>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8 animate-fade-in-up">
          <h2 className="text-3xl md:text-6xl lg:text-7xl text-white max-w-5xl leading-[1.1] md:leading-[1.05] font-black drop-shadow-2xl px-2 tracking-tighter italic">
            Transformamos organizaciones sociales en agentes de cambio <br className="hidden md:block" />
            <span className="text-accent underline decoration-white/10 underline-offset-[12px]">medible</span> y <span className="text-accent underline decoration-white/10 underline-offset-[12px]">sostenible</span>.
          </h2>

          <p className="text-sm md:text-lg text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
            Estrategias de intervención de alto nivel técnico para maximizar el retorno social de cada inversión.
          </p>
        </div>

        <div
          className="absolute bottom-12 flex flex-col items-center animate-bounce cursor-pointer group"
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById('challenges');
            if (element) {
              const headerOffset = 80;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.scrollY - headerOffset;
              window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
          }}
        >
          <span className="mb-3 text-white/50 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Descubre el impacto</span>
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m7 7V3" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;