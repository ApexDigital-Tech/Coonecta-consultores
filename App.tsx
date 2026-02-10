import React, { useState } from 'react';
import Hero from './components/Hero';
import Section from './components/Section';
import ConectaAI from './components/ConectaAI';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/auth/LoginForm';
import { useAuth } from './hooks/useAuth';
import { SERVICES, CASES, TEAM, FAQS, NAV_LINKS } from './constants';
import { Menu, X, CheckCircle, ChevronDown, ChevronUp, Facebook, Linkedin, Youtube, Mail, MapPin, Phone, Puzzle, TrendingDown, ShieldAlert, Lock, Loader2 } from 'lucide-react';

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [view, setView] = useState<'public' | 'login' | 'admin'>('public');

  // 🔐 Hook de autenticación real (reemplaza la contraseña hardcodeada)
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // 🔐 Handler para logout seguro
  const handleLogout = async () => {
    await signOut();
    setView('public');
  };

  // ⏳ Loading state mientras se verifica la sesión
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // 🔐 Vista de Login - Ahora usa Supabase Auth real
  if (view === 'login') {
    return (
      <LoginForm
        onClose={() => setView('public')}
        onSuccess={() => setView('admin')}
      />
    );
  }

  // 🔐 Vista Admin - Verificamos que esté autenticado Y sea admin
  if (view === 'admin') {
    // Si no hay usuario autenticado, redirigir a login
    if (!user) {
      setView('login');
      return null;
    }

    // Si no es admin, mostrar mensaje
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Permisos Insuficientes</h2>
            <p className="text-gray-600 mb-6">
              Tu cuenta no tiene permisos de administrador.
            </p>
            <button
              onClick={() => { handleLogout(); setView('public'); }}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <AdminDashboard onLogout={handleLogout} />
        <ConectaAI />
      </>
    );
  }

  return (
    <div className="font-sans antialiased text-dark bg-gray-50">
      <ConectaAI />

      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20 md:h-24">
            <div className="flex-shrink-0 flex items-center">
              <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className="flex items-center group cursor-pointer">
                {!logoError ? (
                  <img
                    src="/conecta-logo.png"
                    alt="CONECTA"
                    className="h-10 md:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-2xl font-black text-primary tracking-tighter">CONECTA</span>
                )}
              </a>
            </div>
            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-10">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-gray-600 hover:text-primary transition-all px-1 py-2 text-sm font-black uppercase tracking-widest cursor-pointer relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                  >
                    {link.name}
                  </a>
                ))}
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="bg-primary text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all shadow-premium hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  Agenda Gratis
                </a>
              </div>
            </div>
            <div className="-mr-2 flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col space-y-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-3 rounded-2xl text-base font-black uppercase tracking-widest text-gray-700 hover:text-primary hover:bg-primary/5 transition-all text-center"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-center shadow-lg"
              >
                Agenda Gratis
              </a>
            </div>
          </div>
        )}
      </nav>

      <Hero />

      {/* SECTIONS */}
      <Section id="challenges" title="Desafíos de Impacto" subtitle="El 73% de los proyectos sociales no logra demostrar resultados medibles. Te ayudamos a cambiar esa estadística." className="bg-pale">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Fragmentación",
              desc: "Esfuerzos aislados que duplican costos y reducen el alcance real.",
              icon: <Puzzle className="w-10 h-10 text-white" />,
              color: "from-[#1B4F72] to-[#12344D]",
              stat: "68% sin alianzas efectivas"
            },
            {
              title: "Impacto Invisible",
              desc: "Falta de evidencia rigurosa para convencer a donantes y stakeholders.",
              icon: <TrendingDown className="w-10 h-10 text-white" />,
              color: "from-[#229954] to-[#145A32]",
              stat: "73% sin medición clara"
            },
            {
              title: "Debilidad Interna",
              desc: "Procesos obsoletos que frenan el crecimiento y el escalamiento.",
              icon: <ShieldAlert className="w-10 h-10 text-white" />,
              color: "from-[#D4AF37] to-[#B8860B]",
              stat: "Mejora operativa urgente"
            }
          ].map((item, idx) => (
            <div key={idx} className="group bg-white p-10 rounded-[2.5rem] shadow-premium hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 flex flex-col h-full animate-zoom-in">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-xl transition-transform duration-500 group-hover:rotate-6`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-dark italic">{item.title}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-medium flex-grow">{item.desc}</p>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-[12px] font-black text-primary flex items-center shadow-inner-premium uppercase tracking-widest">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3 animate-pulse"></span>
                {item.stat}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="services" title="Nuestros Pilares" subtitle="Estrategias de intervención diseñadas para resultados de alto nivel técnico.">
        <div className="grid lg:grid-cols-3 gap-12">
          {SERVICES.map((service) => (
            <div key={service.id} className="flex flex-col h-full bg-white border border-gray-100 rounded-[3rem] overflow-hidden hover:border-primary/20 transition-all duration-500 group shadow-premium hover:shadow-2xl animate-zoom-in">
              <div className="p-10 flex-grow">
                <div className="mb-8 p-5 bg-pale rounded-[2rem] w-24 h-24 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-500 transform group-hover:scale-110">
                  {service.icon}
                </div>
                <h3 className="text-3xl font-black mb-6 text-primary tracking-tighter italic">{service.title}</h3>
                <p className="text-gray-500 mb-8 font-medium leading-relaxed">{service.description}</p>
                <div className="space-y-4 mb-2">
                  {service.process.slice(0, 3).map((step, i) => (
                    <div key={i} className="flex items-center text-sm font-bold text-gray-400 group-hover:text-primary transition-colors">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3 group-hover:bg-primary transition-colors" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50/50 p-8 border-t border-gray-100 backdrop-blur-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Inversión Referencial</p>
                <p className="text-2xl font-black text-dark italic">{service.price}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="methodology" title="Metodología HPO" subtitle="18 años de refinamiento. Evaluamos la salud de tu impacto desde la raíz." dark>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-fade-in-up">
            <h3 className="text-3xl font-black text-accent mb-10 italic uppercase tracking-widest">¿Qué medimos en HPO?</h3>
            <div className="space-y-10">
              {[
                { title: "Dimensión Estratégica", desc: "Alineación de visión, gobernanza y impacto proyectado.", color: "bg-primary" },
                { title: "Dimensión Operativa", desc: "Eficiencia de procesos, recursos y estándares de calidad.", color: "bg-secondary" },
                { title: "Dimensión Humana", desc: "Clima, cultura organizacional, liderazgo y capacidades críticas.", color: "bg-accent" },
              ].map((dim, idx) => (
                <div key={idx} className="flex group">
                  <div className={`mr-6 mt-1 ${dim.color} p-3 rounded-2xl text-white shadow-xl transition-transform group-hover:scale-110`}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-2 italic">{dim.title}</h4>
                    <p className="text-white/50 font-medium">{dim.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-zoom-in">
            <div className="absolute inset-0 mesh-gradient opacity-20 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-6 scale-90 md:scale-100">
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center shadow-2xl transition-transform hover:-translate-y-4 hover:bg-white/10">
                <span className="text-5xl block mb-4">🎯</span>
                <span className="font-black text-white uppercase tracking-widest text-[12px]">Estrategia</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center shadow-2xl transition-transform translate-y-12 hover:-translate-y-4 hover:bg-white/10">
                <span className="text-5xl block mb-4">⚙️</span>
                <span className="font-black text-white uppercase tracking-widest text-[12px]">Operaciones</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center shadow-2xl transition-transform -translate-y-8 hover:-translate-y-4 hover:bg-white/10">
                <span className="text-5xl block mb-4">👥</span>
                <span className="font-black text-white uppercase tracking-widest text-[12px]">Personas</span>
              </div>
              <div className="bg-accent/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-accent/30 text-center shadow-2xl transition-transform translate-y-4 hover:-translate-y-4 hover:bg-white/10">
                <span className="text-5xl block mb-4 text-accent">🚀</span>
                <span className="font-black text-accent uppercase tracking-widest text-[12px]">Impacto</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="cases" title="Evidencia de Éxito" subtitle="Resultados reales en los contextos más desafiantes del mundo.">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CASES.map((study) => (
            <div key={study.id} className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-50 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full animate-zoom-in">
              <div className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 bg-secondary/5 px-4 py-1.5 rounded-full inline-block self-start border border-secondary/10">{study.location}</div>
              <h3 className="text-xl font-black text-dark mb-6 leading-tight flex-grow italic">{study.title}</h3>
              <div className="space-y-3 pt-6 border-t border-gray-100">
                {study.results.slice(0, 2).map((res, i) => (
                  <div key={i} className="flex items-center text-[13px] font-bold text-gray-500">
                    <span className="text-primary mr-3 text-lg font-black italic">!</span> {res}
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">ORG: {study.client}</span>
                <div className="w-8 h-8 bg-pale rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all cursor-pointer">
                  <ChevronDown size={14} className="transform -rotate-90" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="team" title="Nuestros Expertos" subtitle="Lideramos con rigor académico y experiencia en campo." className="bg-pale font-display">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {TEAM.map((member, idx) => (
            <div key={idx} className="bg-white rounded-[3rem] overflow-hidden shadow-premium group hover:shadow-2xl transition-all duration-500 animate-zoom-in">
              <div className="relative h-72 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
              <div className="p-10 text-center relative">
                <h3 className="font-black text-xl text-dark tracking-tighter mb-2 italic">{member.name}</h3>
                <p className="text-sm text-secondary font-black uppercase tracking-widest mb-6">{member.role}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {member.bio.slice(0, 2).map((b, i) => (
                    <span key={i} className="text-[10px] bg-gray-50 text-gray-400 px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-gray-100">{b}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="contact" title="Hablemos de Impacto" className="bg-primary/95 shadow-inner-premium backdrop-blur-sm" dark>
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="space-y-10 animate-fade-in-up">
            <h3 className="text-4xl font-black text-white italic tracking-tighter">¿Listo para escalar tu propósito?</h3>
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-lg">
              Agenda una sesión estratégica de 30 minutos sin costo con nuestro equipo.
              Descubre cómo podemos sistematizar tu éxito social.
            </p>
            <div className="space-y-6">
              {[
                { icon: <Mail />, text: "contacto@conectaconsultores.com" },
                { icon: <Phone />, text: "+591 707 12345" },
                { icon: <MapPin />, text: "Cochabamba & La Paz, Bolivia" },
              ].map((item, i) => (
                <div key={i} className="flex items-center text-white/80 group">
                  <div className="mr-6 text-accent bg-white/5 p-4 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all">
                    {item.icon}
                  </div>
                  <span className="font-bold text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[3.5rem] p-12 border border-white/10 shadow-2xl animate-zoom-in">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6">
                <input type="text" className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white outline-none focus:ring-4 ring-accent/20 placeholder:text-white/20 transition-all shadow-inner-premium" placeholder="Nombre completo" />
                <input type="email" className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white outline-none focus:ring-4 ring-accent/20 placeholder:text-white/20 transition-all shadow-inner-premium" placeholder="Email institucional" />
                <select className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium appearance-none">
                  <option className="bg-dark">Diagnóstico HPO</option>
                  <option className="bg-dark">Evaluación de Impacto</option>
                  <option className="bg-dark">Estrategia Social</option>
                </select>
              </div>
              <button className="w-full h-20 bg-accent text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-accent/20 text-lg italic">
                Iniciar Transformación
              </button>
            </form>
          </div>
        </div>
      </Section>

      <footer className="bg-dark text-white/30 py-20 px-6 border-t border-white/5 font-display">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="mb-6 h-12">
                {!logoError ? (
                  <img src="/conecta-logo.png" alt="CONECTA" className="h-full w-auto opacity-30 grayscale brightness-200" />
                ) : (
                  <span className="text-3xl font-black text-white/20 tracking-tighter">CONECTA</span>
                )}
              </div>
              <p className="max-w-sm font-bold italic tracking-tighter leading-tight">Transformando el ADN de las organizaciones sociales desde 2004.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-10 font-black uppercase tracking-[0.3em] text-[10px]">
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">YouTube</a>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest gap-4">
            <div className="flex items-center gap-6">
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Términos</a>
              </div>
              <button
                onClick={() => setView('login')}
                className="flex items-center gap-2 text-white/10 hover:text-white/50 transition-all cursor-pointer group"
              >
                <Lock size={12} className="opacity-50 group-hover:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Admin</span>
              </button>
            </div>
            <p>© 2026 CONECTA Consultores en Impacto Social. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;