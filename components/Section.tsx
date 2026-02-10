import React from 'react';

interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  className?: string;
  dark?: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, subtitle, className = "", dark = false, children }) => {
  return (
    <section id={id} className={`py-24 md:py-32 px-6 ${dark ? 'bg-dark text-white' : 'bg-white text-dark'} ${className}`}>
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="mb-20 text-center max-w-4xl mx-auto animate-fade-in-up">
            {title && (
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${dark ? 'text-white' : 'text-primary'}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-lg md:text-xl font-medium leading-relaxed ${dark ? 'text-white/70' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
            <div className={`w-16 h-1 mx-auto mt-8 rounded-full ${dark ? 'bg-accent shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'bg-secondary'}`} />
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
