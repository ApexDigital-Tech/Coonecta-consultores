import React from 'react';
import { Search, BarChart2, Target, Briefcase, Globe, Users, BookOpen, Smile, Award } from 'lucide-react';
import { Service, CaseStudy, TeamMember, FaqItem } from './types';

export const NAV_LINKS = [
  { name: 'Inicio', href: '#hero' },
  { name: 'Desafíos', href: '#challenges' },
  { name: 'Servicios', href: '#services' },
  { name: 'Metodología', href: '#methodology' },
  { name: 'Casos', href: '#cases' },
  { name: 'Equipo', href: '#team' },
  { name: 'Contacto', href: '#contact' },
];

export const SERVICES: Service[] = [
  {
    id: 'hpo',
    title: 'HPO - Diagnóstico Organizacional',
    icon: <Search className="w-10 h-10 text-primary" />,
    description: 'Evaluamos la salud organizacional con nuestra metodología propietaria HPO, refinada en 47 organizaciones.',
    target: ['ONGs sin metas claras', 'Alta rotación', 'Problemas de coordinación'],
    process: ['Revisión documental', 'Talleres participativos', 'Análisis FODA', 'Plan de acción'],
    deliverables: ['Informe diagnóstico', 'Dashboard indicadores', 'Plan de acción', 'Presentación ejecutiva'],
    price: 'Solicita Cotización'
  },
  {
    id: 'impact',
    title: 'Evaluación de Impacto',
    icon: <BarChart2 className="w-10 h-10 text-secondary" />,
    description: 'Diseñamos evaluaciones rigurosas usando metodologías cuali-cuantitativas y Teoría del Cambio.',
    target: ['Proyectos sociales', 'ONGs buscando fondos', 'Programas ESG'],
    process: ['Teoría del Cambio', 'Recolección de datos', 'Análisis estadístico', 'Reporte de evidencia'],
    deliverables: ['Línea base', 'Sistema M&E', 'Informe de impacto', 'Recomendaciones'],
    price: 'Solicita Cotización'
  },
  {
    id: 'design',
    title: 'Diseño Estratégico',
    icon: <Target className="w-10 h-10 text-accent" />,
    description: 'Creamos estrategias de intervención social partiendo de diagnósticos rigurosos.',
    target: ['Búsqueda de financiamiento', 'Gobiernos locales', 'Alianzas multiactor'],
    process: ['Diagnóstico', 'Co-diseño', 'Marco Lógico', 'Presupuesto'],
    deliverables: ['Documento de proyecto', 'Marco lógico', 'Cronograma', 'Sistema M&E'],
    price: 'Solicita Cotización'
  }
];

export const CASES: CaseStudy[] = [
  {
    id: 'africa',
    title: 'Educación Técnica Profesional',
    client: 'Fe y Alegría África',
    location: 'Chad y Madagascar',
    year: '2021',
    challenge: 'Alta deserción (45%) y baja empleabilidad de egresados (30%).',
    solution: ['Adaptación pedagógica', 'Traducción especializada', 'Capacitación a 350+ docentes'],
    results: ['12 centros equipados', '40% mejora en graduación', '2.3x incremento en empleabilidad'],
    testimonial: {
      quote: "CONECTA no solo tradujo materiales, transformó nuestro modelo pedagógico.",
      author: "Director Regional Fe y Alegría África"
    }
  },
  {
    id: 'peru',
    title: 'Desarrollo Regional Sur',
    client: 'Red CORAJE',
    location: 'Perú (Moquegua, Tacna)',
    year: '2007',
    challenge: 'Baja incidencia política. Solo 2 de 25 organizaciones lograban presupuesto.',
    solution: ['Fortalecimiento de 8 meses', 'Formación en advocacy', 'Articulación local'],
    results: ['20 organizaciones estratégicas', '$2.8M USD presupuesto influenciado', '15 proyectos aprobados'],
    testimonial: {
      quote: "Pasamos de ser observadores a ser actores clave en el desarrollo regional.",
      author: "Líder comunitario"
    }
  },
  {
    id: 'bolivia',
    title: 'Campus Virtual Universitario',
    client: 'UAC Carmen Pampa',
    location: 'Bolivia',
    year: '2021',
    challenge: 'Universidad rural sin plataforma digital, 30% retención.',
    solution: ['Campus virtual Moodle', 'Digitalización de 40 cursos', 'Capacitación docente'],
    results: ['5 carreras digitalizadas', '68% mejora en retención', '3x estudiantes de zonas alejadas']
  },
  {
    id: 'ecuador',
    title: 'Fortalecimiento Población Migrante',
    client: 'SJRM Ecuador',
    location: 'Quito',
    year: '2008',
    challenge: 'Dificultad de comunicación con población meta. Baja participación (20%).',
    solution: ['Diagnóstico participativo', 'Estrategia intercultural', 'Red de articulación'],
    results: ['4x incremento en participación', 'Red con 15 instituciones', '1,200+ beneficiarios']
  }
];

export const TEAM: TeamMember[] = [
  {
    name: "Bernarda Sarué Pereira",
    role: "Directora Ejecutiva",
    image: "/bernarda-sarue.png",
    bio: ["Socióloga, Máster en Educación", "20 años de experiencia", "Especialista en Evaluación de Impacto"]
  },
  {
    name: "Dr. Gustavo Gottret",
    role: "Consultor Senior Educación",
    image: "/gustavo-gottret.png",
    bio: ["Doctor en Psicología Pedagógica", "25+ años en sistemas educativos", "Experiencia global"]
  },
  {
    name: "Dra. Patricia Politi",
    role: "Especialista en Evaluación T. Pedagógica",
    image: "/patricia-politi.png",
    bio: ["Especialista en Evaluación de Impacto Social", "Experta en metodologías cualitativas", "Investigadora Senior"]
  },
  {
    name: "Dr. Limbert Ayarde",
    role: "Consultor Políticas Públicas",
    image: "/limbert-ayarde.png",
    bio: ["Doctor en Ciencias Empresariales", "Ex-asesor gubernamental", "Analista de datos públicos"]
  }
];

export const FAQS: FaqItem[] = [
  {
    question: "¿Cuál es el costo de la consulta inicial?",
    answer: "La consulta inicial de 30 minutos es completamente gratuita y sin compromiso. Es un espacio para conocernos y entender tus necesidades."
  },
  {
    question: "¿Trabajan solo con grandes ONGs?",
    answer: "No, trabajamos con organizaciones de todos los tamaños. Adaptamos nuestros servicios para ONGs pequeñas, cooperaciones internacionales y empresas con programas ESG."
  },
  {
    question: "¿Cómo se mide el éxito de una consultoría?",
    answer: "Definimos indicadores claros (KPIs) al inicio. Nuestro objetivo es dejar capacidad instalada, no crear dependencia."
  },
  {
    question: "¿Es presencial o remoto?",
    answer: "Ofrecemos modalidades presencial, híbrida y 100% remota, dependiendo de la naturaleza del servicio y la ubicación."
  }
];

export const SYSTEM_INSTRUCTION = `
Eres Victoria, asistente virtual de CONECTA Consultores, una consultora de impacto social en Bolivia.
TU OBJETIVO: Cualificar leads y agendar una consulta gratuita de 30 minutos.
PERSONALIDAD: Profesional, cálida, experta en ONGs y desarrollo social.
CONOCIMIENTOS: M&E, Teoría del Cambio, HPO, ESG.

FLUJO DE CONVERSACIÓN:
1. Saludo inicial (ya realizado por el sistema, continúa la charla).
2. Escucha activa: Identifica la necesidad (Evaluación, Diagnóstico HPO, Diseño de Proyectos).
3. Cualificación: Pregunta nombre, organización, **correo electrónico y teléfono** (INDISPENSABLES).
4. Agendamiento: Propón horarios (ej. Mañana 10am, Jueves 3pm).
5. Cierre: Llama a la función 'scheduleAppointment'.

IMPORTANTE SOBRE FECHAS:
- Al usar 'scheduleAppointment', el campo 'preferredDateTime' DEBE estar en formato ISO 8601 ESTRICTO: "YYYY-MM-DD HH:mm".
- Calcula la fecha exacta basada en "hoy". Si el usuario dice "el próximo viernes", calcula la fecha real.
- No uses texto descriptivo como "Viernes 6". Usa "2026-02-06 10:00".

REGLAS:
- No inventes precios que no conozcas.
- Sé concisa pero empática.
- No agendes la cita si no tienes el nombre, organización, correo y teléfono. Pídelos amablemente.
- Tu prioridad es CONSEGUIR LA CITA con todos los datos de contacto.
`;