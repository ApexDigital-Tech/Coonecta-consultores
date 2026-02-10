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
    <section id={id} className={`py-16 md:py-24 px-6 ${dark ? 'bg-dark text-white' : 'bg-white text-dark'} ${className}`}>
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="mb-20 text-center max-w-4xl mx-auto animate-fade-in-up">
            <h2 className={`text-3xl md:text-4xl font-black mb-4 tracking-tighter ${dark ? 'text-white italic' : 'text-primary'}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`text-base md:text-lg font-medium leading-relaxed ${dark ? 'text-white/60' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
            <div className={`w-12 h-1 mx-auto mt-6 rounded-full ${dark ? 'bg-accent shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'bg-secondary'}`} />
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
