/**
 * ÚNICA fuente de verdad del contenido del juego.
 * Todo el mundo (edificios, NPCs, objetos, textos) se genera a partir de este archivo.
 * Los datos de abajo son de EJEMPLO: reemplazalos por los tuyos.
 */

export type Category = "tech" | "soft";

export type Skill = {
  id: string;
  name: string;
  category: Category;
  /** Agrupa la habilidad (ej: "Frontend", "Backend"). Define el color por defecto. */
  area: string;
  /** 1 (básico) a 5 (experto) */
  level: 1 | 2 | 3 | 4 | 5;
  years?: number;
  description: string;
  /** Color del objeto de reemplazo (hex). Si falta se usa el del área. */
  color?: string;
  /** Prompt para Meshy. Si falta se genera uno a partir del nombre. */
  assetPrompt?: string;
};

export type Job = {
  id: string;
  company: string;
  role: string;
  /** Texto libre, ej: "2020 – 2023" */
  period: string;
  summary: string;
  achievements: string[];
  /** ids de las skills usadas en este trabajo */
  skills: string[];
  /** El NPC que representa este trabajo */
  npc: { name: string; role: string; greeting: string };
  /** Tiñe el edificio (ver `buildingTypeIds` en assets/manifest.ts) y el NPC de este trabajo. */
  color?: string;
  npcPrompt?: string;
};

export type Profile = {
  name: string;
  title: string;
  location?: string;
  summary: string;
  /** Links de contacto. Para mail usá "mailto:...". */
  links: { label: string; url: string }[];
  /** Ruta a tu CV en PDF dentro de /public (ej: "/cv.pdf"). Opcional. */
  pdf?: string;
  contactMessage: string;
};

export type CV = {
  profile: Profile;
  skills: Skill[];
  /** En orden cronológico: el primero queda al inicio de la avenida. */
  jobs: Job[];
};

export const cv: CV = {
  profile: {
    name: "Tu Nombre",
    title: "Desarrollador Full-stack",
    location: "Buenos Aires, Argentina",
    summary:
      "Desarrollador con experiencia construyendo productos web de punta a punta. Me gusta resolver problemas reales, trabajar en equipo y aprender cosas nuevas. Caminá la ciudad para conocer mi recorrido.",
    links: [
      { label: "GitHub", url: "https://github.com/tu-usuario" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/tu-usuario" },
      { label: "Email", url: "mailto:tu@email.com" },
    ],
    contactMessage:
      "¡Llegaste al final del recorrido! Si algo de lo que viste te interesa, escribime.",
  },

  skills: [
    // ── Tecnologías ──────────────────────────────────────────────
    {
      id: "ts",
      name: "TypeScript",
      category: "tech",
      area: "Frontend",
      level: 5,
      years: 5,
      description: "Mi lenguaje principal. Tipado estricto, tipos de dominio y herramientas internas.",
    },
    {
      id: "react",
      name: "React",
      category: "tech",
      area: "Frontend",
      level: 5,
      years: 5,
      description: "Interfaces complejas, manejo de estado y performance.",
    },
    {
      id: "next",
      name: "Next.js",
      category: "tech",
      area: "Frontend",
      level: 4,
      years: 3,
      description: "App Router, SSR/SSG y APIs con route handlers.",
    },
    {
      id: "node",
      name: "Node.js",
      category: "tech",
      area: "Backend",
      level: 4,
      years: 5,
      description: "APIs REST, colas de trabajo e integraciones con terceros.",
    },
    {
      id: "python",
      name: "Python",
      category: "tech",
      area: "Backend",
      level: 3,
      years: 3,
      description: "Scripts de automatización, análisis de datos y pequeños servicios.",
    },
    {
      id: "postgres",
      name: "PostgreSQL",
      category: "tech",
      area: "Datos",
      level: 4,
      years: 4,
      description: "Modelado, índices y consultas que no se arrastran.",
    },
    {
      id: "docker",
      name: "Docker",
      category: "tech",
      area: "Cloud / DevOps",
      level: 3,
      years: 3,
      description: "Entornos reproducibles y despliegues consistentes.",
    },
    {
      id: "aws",
      name: "AWS",
      category: "tech",
      area: "Cloud / DevOps",
      level: 3,
      years: 2,
      description: "Servicios gestionados, almacenamiento y despliegues básicos.",
    },

    // ── Soft skills ──────────────────────────────────────────────
    {
      id: "leadership",
      name: "Liderazgo",
      category: "soft",
      area: "Personas",
      level: 4,
      description: "Guiar al equipo, destrabar bloqueos y ayudar a crecer a otras personas.",
    },
    {
      id: "communication",
      name: "Comunicación",
      category: "soft",
      area: "Personas",
      level: 4,
      description: "Explicar cosas técnicas a gente no técnica (y al revés).",
    },
    {
      id: "teamwork",
      name: "Trabajo en equipo",
      category: "soft",
      area: "Personas",
      level: 5,
      description: "Colaboración, revisiones de código constructivas y ownership compartido.",
    },
    {
      id: "problem-solving",
      name: "Resolución de problemas",
      category: "soft",
      area: "Mentalidad",
      level: 5,
      description: "Descomponer lo difícil en pasos chicos y avanzar.",
    },
    {
      id: "adaptability",
      name: "Adaptabilidad",
      category: "soft",
      area: "Mentalidad",
      level: 4,
      description: "Cambiar de stack, de rol o de prioridades sin perder el ritmo.",
    },
  ],

  jobs: [
    {
      id: "estudio-pixel",
      company: "Estudio Pixel",
      role: "Desarrollador Junior",
      period: "2018 – 2020",
      summary: "Mi primer trabajo en desarrollo: sitios y herramientas internas para clientes de una agencia.",
      achievements: [
        "Entregué más de 15 sitios web a clientes de distintos rubros.",
        "Aprendí a trabajar con diseñadores y a cumplir plazos reales.",
      ],
      skills: ["react", "node", "teamwork"],
      npc: {
        name: "Lucía",
        role: "Directora creativa",
        greeting: "¡Acá empezó todo! Llegó con ganas de aprender y no paró.",
      },
    },
    {
      id: "nube-labs",
      company: "Nube Labs",
      role: "Desarrollador Full-stack",
      period: "2020 – 2023",
      summary: "Producto SaaS con equipo distribuido: del modelado de datos hasta la interfaz.",
      achievements: [
        "Rediseñé el módulo de reportes y reduje los tiempos de carga a la mitad.",
        "Migré servicios a contenedores y automaticé los despliegues.",
        "Mentoreé a dos personas juniors.",
      ],
      skills: ["ts", "react", "next", "node", "postgres", "docker", "communication"],
      npc: {
        name: "Martín",
        role: "CTO",
        greeting: "Cuando algo se rompía a las 2 a.m., sabíamos a quién llamar.",
      },
    },
    {
      id: "empresa-actual",
      company: "Tu Empresa Actual",
      role: "Tech Lead",
      period: "2023 – Actualidad",
      summary: "Liderazgo técnico de un equipo pequeño, decisiones de arquitectura y relación con producto.",
      achievements: [
        "Lidero un equipo de 5 personas y la hoja de ruta técnica.",
        "Definí la arquitectura de la nueva plataforma en la nube.",
      ],
      skills: ["ts", "next", "aws", "leadership", "problem-solving", "adaptability"],
      npc: {
        name: "Sofía",
        role: "Product Manager",
        greeting: "Con vos al frente, planificar es mucho más fácil.",
      },
    },
  ],
};
