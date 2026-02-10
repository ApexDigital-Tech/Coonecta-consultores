import React, { useEffect, useState } from 'react';

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
        {/* Floating Logo Container */}
        <div className="mb-12 p-8 glass rounded-[2.5rem] shadow-premium animate-float ring-1 ring-white/30">
          {!logoError ? (
            <img
              src="/conecta-logo.png"
              alt="CONECTA Consultores"
              className="w-72 md:w-[450px] h-auto object-contain drop-shadow-xl"
              onError={() => setLogoError(true)}
            />
          ) : (
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter text-shadow-premium">
              CONECTA
            </h1>
          )}
        </div>

        <div className="space-y-6 animate-fade-in-up">
          <p className="text-lg md:text-xl text-accent font-black uppercase tracking-[0.3em] text-shadow-premium">
            Consultores en Impacto Social
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-white max-w-4xl leading-[1.1] font-bold drop-shadow-2xl">
            Transformamos organizaciones sociales en agentes de cambio <br />
            <span className="text-secondary underline decoration-white/20 underline-offset-8">medible</span> y <span className="text-secondary underline decoration-white/20 underline-offset-8">sostenible</span>.
          </h2>
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