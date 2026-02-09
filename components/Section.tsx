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
    <section id={id} className={`py-20 md:py-28 px-6 ${dark ? 'bg-gray-900 text-white' : 'bg-white text-dark'} ${className}`}>
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="mb-16 text-center max-w-3xl mx-auto">
            {title && (
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${dark ? 'text-white' : 'text-primary'}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-lg md:text-xl leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
            <div className={`w-24 h-1 mx-auto mt-6 rounded ${dark ? 'bg-accent' : 'bg-secondary'}`} />
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
