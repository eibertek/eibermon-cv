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
    // El `color` y el `assetPrompt` de cada Eibermon de tech apuntan al color de marca
    // y a un diseño de criatura propio (ver docs/superpowers/plans para el concepto).
    {
      id: "ts",
      name: "TypeScript",
      category: "tech",
      area: "Frontend",
      level: 5,
      years: 5,
      description: "Mi lenguaje principal. Tipado estricto, tipos de dominio y herramientas internas.",
      color: "#4c8dff",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small blue dragon-like creature made of sharp geometric crystal facets, faint glowing type-bracket patterns on its scales, serpentine body, friendly curious expression",
    },
    {
      id: "react",
      name: "React",
      category: "tech",
      area: "Frontend",
      level: 5,
      years: 5,
      description: "Interfaces complejas, manejo de estado y performance.",
      color: "#61dafb",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small cyan-blue creature with three thin glowing rings orbiting around its body like electron orbits, round friendly body, big eyes",
    },
    {
      id: "next",
      name: "Next.js",
      category: "tech",
      area: "Frontend",
      level: 4,
      years: 3,
      description: "App Router, SSR/SSG y APIs con route handlers.",
      color: "#4f6df5",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small sleek dark blue winged creature with triangular angular wings, streamlined body, confident pose",
    },
    {
      id: "node",
      name: "Node.js",
      category: "tech",
      area: "Backend",
      level: 4,
      years: 5,
      description: "APIs REST, colas de trabajo e integraciones con terceros.",
      color: "#6fcf57",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a friendly green many-legged bug-like creature with a smooth hexagonal shell on its back, six small legs, big round eyes",
    },
    {
      id: "python",
      name: "Python",
      category: "tech",
      area: "Backend",
      level: 3,
      years: 3,
      description: "Scripts de automatización, análisis de datos y pequeños servicios.",
      color: "#4b8bbe",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a two-toned blue and yellow snake-like creature coiled in a figure-eight shape, smooth segmented body, friendly face",
    },
    {
      id: "postgres",
      name: "PostgreSQL",
      category: "tech",
      area: "Datos",
      level: 4,
      years: 4,
      description: "Modelado, índices y consultas que no se arrastran.",
      color: "#5a8fc2",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small blue elephant-like creature with a cylindrical database-drum shaped body, short trunk, stubby legs, friendly look",
    },
    {
      id: "docker",
      name: "Docker",
      category: "tech",
      area: "Cloud / DevOps",
      level: 3,
      years: 3,
      description: "Entornos reproducibles y despliegues consistentes.",
      color: "#4da6ff",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small blue whale-like creature carrying a few stacked cargo container boxes on its back, round friendly body, small fin",
    },
    {
      id: "aws",
      name: "AWS",
      category: "tech",
      area: "Cloud / DevOps",
      level: 3,
      years: 2,
      description: "Servicios gestionados, almacenamiento y despliegues básicos.",
      color: "#ffa94d",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small orange cloud-shaped creature with a curved smile-arrow marking underneath like a grin, soft puffy body, tiny stubby arms and legs",
    },

    // ── Soft skills ──────────────────────────────────────────────
    {
      id: "leadership",
      name: "Liderazgo",
      category: "soft",
      area: "Personas",
      level: 4,
      description: "Guiar al equipo, destrabar bloqueos y ayudar a crecer a otras personas.",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small golden lion cub creature with a fluffy mane and a tiny flowing cape, confident friendly pose",
    },
    {
      id: "communication",
      name: "Comunicación",
      category: "soft",
      area: "Personas",
      level: 4,
      description: "Explicar cosas técnicas a gente no técnica (y al revés).",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a cheerful speech-bubble shaped creature with two small antenna-like speaker ears, round simple body, big smiling mouth",
    },
    {
      id: "teamwork",
      name: "Trabajo en equipo",
      category: "soft",
      area: "Personas",
      level: 5,
      description: "Colaboración, revisiones de código constructivas y ownership compartido.",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small creature made of three interlocking puzzle-piece segments in slightly different warm shades, round friendly silhouette, big eyes",
    },
    {
      id: "problem-solving",
      name: "Resolución de problemas",
      category: "soft",
      area: "Mentalidad",
      level: 5,
      description: "Descomponer lo difícil en pasos chicos y avanzar.",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a clever fox-like creature with a glowing lightbulb shape at the tip of its tail, alert pose, bushy tail",
    },
    {
      id: "adaptability",
      name: "Adaptabilidad",
      category: "soft",
      area: "Mentalidad",
      level: 4,
      description: "Cambiar de stack, de rol o de prioridades sin perder el ritmo.",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small chameleon-like creature mid color-shift between two pastel tones, curled tail, big rotating eyes",
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
