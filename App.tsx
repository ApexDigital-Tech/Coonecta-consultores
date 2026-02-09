import React, { useState } from 'react';
import Hero from './components/Hero';
import Section from './components/Section';
import Patricia from './components/Patricia';
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

    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="font-sans antialiased text-dark bg-gray-50">

      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex-shrink-0 flex items-center">
              <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className="flex items-center group cursor-pointer">
                {!logoError ? (
                  <img
                    src="/conecta-logo.png"
                    alt="CONECTA"
                    className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary tracking-tighter">CONECTA</span>
                )}
              </a>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                  >
                    {link.name}
                  </a>
                ))}
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="bg-secondary text-white px-5 py-2 rounded-full font-medium hover:bg-green-700 transition-colors shadow-md hover:shadow-lg cursor-pointer"
                >
                  Agenda Gratis
                </a>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <Hero />
      <Patricia />

      {/* SECTIONS */}
      <Section id="challenges" title="Los Desafíos Críticos" subtitle="El 73% de los proyectos sociales no logra demostrar impacto medible." className="bg-pale">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Fragmentación",
              desc: "Esfuerzos aislados que duplican costos y reducen el alcance real.",
              icon: <Puzzle className="w-10 h-10 text-white" />,
              color: "from-blue-500 to-blue-700",
              stat: "68% sin alianzas efectivas"
            },
            {
              title: "Impacto Invisible",
              desc: "Falta de evidencia rigurosa para convencer a donantes exigentes.",
              icon: <TrendingDown className="w-10 h-10 text-white" />,
              color: "from-red-500 to-pink-600",
              stat: "73% sin medición clara"
            },
            {
              title: "Debilidad Interna",
              desc: "Procesos obsoletos que frenan el crecimiento del equipo.",
              icon: <ShieldAlert className="w-10 h-10 text-white" />,
              color: "from-amber-400 to-orange-600",
              stat: "Alta rotación de personal"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-dark">{item.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{item.desc}</p>
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm font-bold text-secondary flex items-center">
                <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                {item.stat}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="services" title="Nuestros 3 Pilares" subtitle="Soluciones integrales para transformar tu organización.">
        <div className="grid lg:grid-cols-3 gap-10">
          {SERVICES.map((service) => (
            <div key={service.id} className="flex flex-col h-full bg-white border rounded-2xl overflow-hidden hover:border-secondary transition-colors group">
              <div className="p-8 flex-grow">
                <div className="mb-6 p-4 bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.process.slice(0, 3).map((step, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-500">
                      <CheckCircle size={16} className="text-secondary mr-2 mt-1 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 p-6 border-t">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Inversión Referencial</p>
                <p className="text-xl font-bold text-dark">{service.price}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="methodology" title="Metodología HPO" subtitle="18 años de refinamiento. No solo diagnosticamos, transformamos." dark>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-accent mb-6">¿Qué evalúa HPO?</h3>
            <div className="space-y-6">
              {[
                { title: "Dimensión Estratégica", desc: "Misión, visión, gobernanza y alineación." },
                { title: "Dimensión Operativa", desc: "Procesos, eficiencia, recursos y calidad." },
                { title: "Dimensión Humana", desc: "Clima, cultura, liderazgo y capacidades." },
              ].map((dim, idx) => (
                <div key={idx} className="flex">
                  <div className="mr-4 mt-1 bg-white/10 p-2 rounded text-accent">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{dim.title}</h4>
                    <p className="text-gray-400">{dim.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-6 bg-white/5 rounded-lg border border-white/10">
              <p className="text-gray-300 italic">
                "El 85% de nuestros clientes HPO reportan mejoras medibles en desempeño financiero y social en menos de 6 meses."
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary p-6 rounded-lg text-center transform translate-y-8 opacity-80 shadow-lg">
                <span className="text-4xl block mb-2">🎯</span>
                <span className="font-bold text-white">Estrategia</span>
              </div>
              <div className="bg-secondary p-6 rounded-lg text-center opacity-90 shadow-lg">
                <span className="text-4xl block mb-2">⚙️</span>
                <span className="font-bold text-white">Procesos</span>
              </div>
              <div className="bg-accent p-6 rounded-lg text-center opacity-90 shadow-lg">
                <span className="text-4xl block mb-2">👥</span>
                <span className="font-bold text-white">Personas</span>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center transform -translate-y-8 border border-white/20 shadow-lg">
                <span className="text-4xl block mb-2">🚀</span>
                <span className="font-bold text-white">Impacto</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="cases" title="Resultados Cuantificados" subtitle="Evidencia real de transformación.">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CASES.map((study) => (
            <div key={study.id} className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition-all flex flex-col">
              <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">{study.location}</div>
              <h3 className="text-lg font-bold text-dark mb-4 leading-tight">{study.title}</h3>
              <div className="flex-grow">
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{study.challenge}</p>
                <div className="space-y-2">
                  {study.results.slice(0, 2).map((res, i) => (
                    <div key={i} className="flex items-start text-xs font-medium text-green-700 bg-green-50 p-2 rounded">
                      <span className="mr-2">📈</span> {res}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t text-xs text-gray-400">
                Cliente: {study.client}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="text-primary font-semibold hover:text-secondary underline underline-offset-4">
            Ver todos los casos de éxito
          </button>
        </div>
      </Section>

      <Section id="team" title="Expertos en Desarrollo" className="bg-pale">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM.map((member, idx) => (
            <div key={idx} className="bg-white rounded-lg overflow-hidden shadow-md group">
              <div className="h-64 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-lg text-dark">{member.name}</h3>
                <p className="text-sm text-secondary font-medium mb-3">{member.role}</p>
                <p className="text-xs text-gray-500">{member.bio[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="clients" className="py-12 bg-white">
        <p className="text-center text-gray-400 text-sm uppercase tracking-widest mb-8">Confían en nosotros</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="font-bold text-2xl text-gray-400">Fe y Alegría</div>
          <div className="font-bold text-2xl text-gray-400">SJRM</div>
          <div className="font-bold text-2xl text-gray-400">UAC-CP</div>
          <div className="font-bold text-2xl text-gray-400">Red CORAJE</div>
        </div>
      </Section>

      <Section id="faq" title="Preguntas Frecuentes">
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleFaq(idx)}
              >
                <span className="font-medium text-dark">{faq.question}</span>
                {openFaq === idx ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>
              {openFaq === idx && (
                <div className="p-5 bg-gray-50 text-gray-600 text-sm border-t">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section id="contact" title="Hablemos de tu Impacto" className="bg-primary" dark>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white">¿Listo para transformar tu organización?</h3>
            <p className="text-gray-300">
              La forma más rápida de empezar es hablando con <strong>Victoria</strong>, nuestra asistente virtual.
              Ella puede agendar tu consulta gratuita en 2 minutos.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-gray-200">
                <Mail className="mr-4 text-accent" />
                contacto@conectaconsultores.com
              </div>
              <div className="flex items-center text-gray-200">
                <Phone className="mr-4 text-accent" />
                +591 707 12345
              </div>
              <div className="flex items-center text-gray-200">
                <MapPin className="mr-4 text-accent" />
                Cochabamba & La Paz, Bolivia
              </div>
            </div>

            <div className="pt-8 flex space-x-4">
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl text-dark">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Institucional</label>
                <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="nombre@organizacion.org" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué necesitas?</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                  <option>Diagnóstico Organizacional HPO</option>
                  <option>Evaluación de Impacto</option>
                  <option>Diseño de Proyectos</option>
                  <option>Otro</option>
                </select>
              </div>
              <button className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg mt-2">
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </Section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="mb-4 md:mb-0">
            <div className="mb-4">
              {!logoError ? (
                <img
                  src="/conecta-logo.png"
                  alt="CONECTA"
                  className="h-10 w-auto object-contain brightness-0 invert opacity-80"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-2xl font-bold text-white tracking-tighter block">CONECTA</span>
              )}
            </div>
            <div className="flex items-center">
              <p>Transformando organizaciones sociales desde 2004.</p>
              <button
                onClick={() => setView('login')}
                className="opacity-20 hover:opacity-100 hover:text-primary transition-all ml-4 text-white"
                title="Acceso Admin"
              >
                <Lock size={14} />
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8 text-center md:text-right">
            <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
            <span className="opacity-80">© 2024 CONECTA Consultores.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;