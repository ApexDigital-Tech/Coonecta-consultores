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
      {/* Image Background with Parallax */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ transform: `translateY(${scrollProgress * 0.5 * 100}px)` }}
      >
         <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop" 
            alt="Fondo Conecta"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
         
         {/* Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-b from-dark/95 via-dark/50 to-dark/90" />
         <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
      </div>

      {/* Content */}
      <div 
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto"
        style={{ 
          opacity: 1 - scrollProgress * 1.5,
          transform: `translateY(${scrollProgress * -50}px)`
        }}
      >
        {/* Logo Container - White card style to ensure logo pops */}
        <div className="mb-10 p-6 bg-white rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500 animate-fade-in-up">
           {!logoError ? (
             <img 
              src="/conecta-logo.png" 
              alt="CONECTA Consultores" 
              className="w-64 md:w-96 h-auto object-contain"
              onError={() => setLogoError(true)}
             />
           ) : (
             <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">
               CONECTA
             </h1>
           )}
        </div>

        <p className="text-xl md:text-2xl text-accent font-medium mb-4 uppercase tracking-widest text-shadow-sm animate-fade-in-up delay-100">
          Consultores en Impacto Social
        </p>
        <p className="text-lg md:text-2xl text-white max-w-3xl leading-relaxed font-light drop-shadow-md animate-fade-in-up delay-200">
          Transformamos organizaciones sociales en agentes de cambio <span className="font-semibold text-secondary bg-white/10 px-2 py-1 rounded">medible</span> y <span className="font-semibold text-secondary bg-white/10 px-2 py-1 rounded">sostenible</span>.
        </p>
        
        <div 
          className="mt-16 animate-bounce text-white/70 text-sm cursor-pointer hover:text-white transition-colors flex flex-col items-center"
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
          <span className="mb-2">Descubre más</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>
    </div>
  );
};

export default Hero;