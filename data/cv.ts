/**
 * ÚNICA fuente de verdad del contenido del juego.
 * Todo el mundo (edificios, NPCs, objetos, textos) se genera a partir de este archivo.
 * Todo texto visible usa `Text` ({ en, es }); se resuelve con `t()` (ver data/i18n.ts).
 */
import type { Text } from "./i18n";

export type Category = "tech" | "soft";

export type Skill = {
  id: string;
  /** Casi siempre igual en los dos idiomas (nombres propios de tecnologías). */
  name: Text;
  category: Category;
  /** Agrupa la habilidad (ej: "Frontend", "Backend"). La clave de color usa `area.en`. */
  area: Text;
  /** 1 (básico) a 5 (experto) */
  level: 1 | 2 | 3 | 4 | 5;
  years?: number;
  description: Text;
  /** Color del objeto de reemplazo (hex). Si falta se usa el del área. */
  color?: string;
  /** Prompt para Meshy. Si falta se genera uno a partir del nombre. */
  assetPrompt?: string;
};

export type Job = {
  id: string;
  /** Nombre propio: no se traduce. */
  company: string;
  role: Text;
  /** Texto libre, ej: "Nov 2021 – Mar 2024". */
  period: Text;
  summary: Text;
  achievements: Text[];
  /** ids de las skills usadas en este trabajo */
  skills: string[];
  /** El NPC que representa este trabajo */
  npc: { name: string; role: Text; greeting: Text };
  /** Tiñe el edificio (ver `buildingTypeIds` en assets/manifest.ts) y el NPC de este trabajo. */
  color?: string;
  npcPrompt?: string;
};

/** Trabajos previos a los 5 recientes: se muestran en una lista compacta (ver Archive.tsx), sin edificio propio. */
export type EarlierJob = {
  company: string;
  role: Text;
  period: Text;
};

export type Profile = {
  /** Nombre propio: no se traduce. */
  name: string;
  title: Text;
  /** Casi siempre igual en los dos idiomas (topónimo). */
  location?: string;
  summary: Text;
  /** Links de contacto. Para mail usá "mailto:...". */
  links: { label: Text; url: string }[];
  /** Ruta a tu CV en PDF dentro de /public (ej: "/cv.pdf"). Opcional. */
  pdf?: string;
  contactMessage: Text;
};

export type CV = {
  profile: Profile;
  skills: Skill[];
  /** En orden cronológico: el primero queda al inicio de la avenida. Los 5 más recientes. */
  jobs: Job[];
  /** Trabajos anteriores a esos 5, mostrados en el panel de trayectoria (ver Archive.tsx). */
  earlierJobs: EarlierJob[];
};

export const cv: CV = {
  profile: {
    name: "Mariano Eiberman",
    title: { en: "Senior Web Developer", es: "Desarrollador Web Senior" },
    location: "Argentina",
    summary: {
      en: "Senior web developer with experience building end-to-end digital products — from UI architecture to the backend that supports it. I care about clean interfaces, solid performance, and shipping things that actually work. Walk the city to see where I've been.",
      es: "Desarrollador web senior con experiencia construyendo productos digitales de punta a punta — desde la arquitectura de UI hasta el backend que la sostiene. Me importa la interfaz prolija, el rendimiento sólido y entregar cosas que realmente funcionan. Caminá la ciudad para conocer mi recorrido.",
    },
    links: [
      { label: { en: "GitHub", es: "GitHub" }, url: "https://github.com/eibertek" },
      { label: { en: "LinkedIn", es: "LinkedIn" }, url: "https://www.linkedin.com/in/eibermanm" },
      { label: { en: "Website", es: "Sitio web" }, url: "https://www.eibertek.com.ar/es" },
      { label: { en: "Email", es: "Email" }, url: "mailto:mariano.eiberman@gmail.com" },
    ],
    contactMessage: {
      en: "You made it to the end of the tour! If anything you saw caught your eye, write to me.",
      es: "¡Llegaste al final del recorrido! Si algo de lo que viste te interesa, escribime.",
    },
  },

  skills: [
    // ── Tecnologías ──────────────────────────────────────────────
    {
      id: "ts",
      name: { en: "JavaScript / TypeScript", es: "JavaScript / TypeScript" },
      category: "tech",
      area: { en: "Frontend", es: "Frontend" },
      level: 5,
      years: 13,
      description: {
        en: "My daily language across the whole JavaScript family, from legacy codebases to modern TypeScript stacks.",
        es: "Mi lenguaje de todos los días en toda la familia JavaScript, desde código legado hasta stacks modernos con TypeScript.",
      },
      color: "#4c8dff",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small blue dragon-like creature made of sharp geometric crystal facets, faint glowing type-bracket patterns on its scales, serpentine body, friendly curious expression",
    },
    {
      id: "react",
      name: { en: "React", es: "React" },
      category: "tech",
      area: { en: "Frontend", es: "Frontend" },
      level: 5,
      years: 8,
      description: {
        en: "Complex interfaces, state management and performance tuning — my main UI tool since 2017.",
        es: "Interfaces complejas, manejo de estado y ajuste de performance — mi herramienta de UI principal desde 2017.",
      },
      color: "#61dafb",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small cyan-blue creature with three thin glowing rings orbiting around its body like electron orbits, round friendly body, big eyes",
    },
    {
      id: "next",
      name: { en: "Next.js", es: "Next.js" },
      category: "tech",
      area: { en: "Frontend", es: "Frontend" },
      level: 5,
      years: 5,
      description: {
        en: "App Router, SSR/SSG and route handlers — the framework behind my last two roles.",
        es: "App Router, SSR/SSG y route handlers — el framework detrás de mis últimos dos trabajos.",
      },
      color: "#4f6df5",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small sleek dark blue winged creature with triangular angular wings, streamlined body, confident pose",
    },
    {
      id: "node",
      name: { en: "Node.js", es: "Node.js" },
      category: "tech",
      area: { en: "Backend", es: "Backend" },
      level: 5,
      years: 10,
      description: {
        en: "REST APIs, background jobs and third-party integrations across almost every role since 2017.",
        es: "APIs REST, trabajos en segundo plano e integraciones con terceros en casi todos mis trabajos desde 2017.",
      },
      color: "#6fcf57",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a friendly green many-legged bug-like creature with a smooth hexagonal shell on its back, six small legs, big round eyes",
    },
    {
      id: "graphql",
      name: { en: "GraphQL", es: "GraphQL" },
      category: "tech",
      area: { en: "Backend", es: "Backend" },
      level: 4,
      description: {
        en: "One of my strongest listed skills — querying and shaping exactly the data a UI needs.",
        es: "Una de mis habilidades más marcadas — consultar y moldear exactamente los datos que necesita una UI.",
      },
      color: "#f06fc2",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small pink magenta creature with a faceted polyhedron body and glowing node-like dots connected by thin lines across its surface",
    },
    {
      id: "contentful",
      name: { en: "Contentful", es: "Contentful" },
      category: "tech",
      area: { en: "CMS", es: "CMS" },
      level: 5,
      years: 3,
      description: {
        en: "Certified Professional, plus a Personalization skill badge. Headless CMS integration and content modeling.",
        es: "Certified Professional, más el badge de Personalization. Integración de CMS headless y modelado de contenido.",
      },
      color: "#5b6fe0",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small purple-blue cloud-like creature with three small orbiting content-block squares floating around it",
    },
    {
      id: "postgres",
      name: { en: "PostgreSQL", es: "PostgreSQL" },
      category: "tech",
      area: { en: "Data", es: "Datos" },
      level: 3,
      years: 2,
      description: {
        en: "Relational modeling and queries as the data layer behind a full-stack Node.js project.",
        es: "Modelado relacional y consultas como capa de datos de un proyecto full-stack con Node.js.",
      },
      color: "#5a8fc2",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small blue elephant-like creature with a cylindrical database-drum shaped body, short trunk, stubby legs, friendly look",
    },
    {
      id: "cypress",
      name: { en: "Cypress.io", es: "Cypress.io" },
      category: "tech",
      area: { en: "Testing", es: "Testing" },
      level: 4,
      description: {
        en: "End-to-end test coverage — one of my strongest listed skills.",
        es: "Cobertura de tests end-to-end — una de mis habilidades más marcadas.",
      },
      color: "#3ebd93",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small dark green beetle-like creature wearing a tiny magnifying-glass-shaped marking on its shell, alert inspecting pose",
    },
    {
      id: "angular",
      name: { en: "Angular", es: "Angular" },
      category: "tech",
      area: { en: "Frontend", es: "Frontend" },
      level: 2,
      years: 1,
      description: {
        en: "Used alongside React depending on the project at Cognizant Softvision.",
        es: "Lo usé junto a React según el proyecto, en Cognizant Softvision.",
      },
      color: "#e6584c",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small red shield-shaped creature with a faceted gem pattern on its chest, sturdy confident stance",
    },
    {
      id: "php",
      name: { en: "PHP", es: "PHP" },
      category: "tech",
      area: { en: "Backend", es: "Backend" },
      level: 2,
      years: 5,
      description: {
        en: "Where I started: five years across several roles before moving fully into the JavaScript ecosystem.",
        es: "Donde arranqué: cinco años en varios trabajos antes de pasarme de lleno al ecosistema JavaScript.",
      },
      color: "#8d8fd9",
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small indigo-violet creature shaped like an old rolled scroll with a friendly nostalgic vintage look",
    },

    // ── Soft skills ──────────────────────────────────────────────
    {
      id: "communication",
      name: { en: "Communication", es: "Comunicación" },
      category: "soft",
      area: { en: "People", es: "Personas" },
      level: 5,
      description: {
        en: "Explaining technical things to non-technical people (and back). One of my strongest listed skills.",
        es: "Explicar cosas técnicas a gente no técnica (y al revés). Una de mis habilidades más marcadas.",
      },
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a cheerful speech-bubble shaped creature with two small antenna-like speaker ears, round simple body, big smiling mouth",
    },
    {
      id: "leadership",
      name: { en: "Leadership", es: "Liderazgo" },
      category: "soft",
      area: { en: "People", es: "Personas" },
      level: 4,
      description: {
        en: "From Supervising Associate at EY to leading the projects I'm on today.",
        es: "Desde Supervising Associate en EY hasta liderar los proyectos en los que estoy hoy.",
      },
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small golden lion cub creature with a fluffy mane and a tiny flowing cape, confident friendly pose",
    },
    {
      id: "teamwork",
      name: { en: "Teamwork", es: "Trabajo en equipo" },
      category: "soft",
      area: { en: "People", es: "Personas" },
      level: 5,
      description: {
        en: "Collaboration has been central to every team I've been part of — it shows in how projects turn out.",
        es: "La colaboración fue central en cada equipo del que formé parte — se nota en cómo salen los proyectos.",
      },
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small creature made of three interlocking puzzle-piece segments in slightly different warm shades, round friendly silhouette, big eyes",
    },
    {
      id: "adaptability",
      name: { en: "Adaptability", es: "Adaptabilidad" },
      category: "soft",
      area: { en: "Mindset", es: "Mentalidad" },
      level: 5,
      description: {
        en: "PHP, Angular, React, Next.js, five countries' worth of clients — 15+ years of changing stacks without losing the thread.",
        es: "PHP, Angular, React, Next.js, clientes de medio mundo — más de 15 años cambiando de stack sin perder el hilo.",
      },
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a small chameleon-like creature mid color-shift between two pastel tones, curled tail, big rotating eyes",
    },
    {
      id: "problem-solving",
      name: { en: "Problem Solving", es: "Resolución de problemas" },
      category: "soft",
      area: { en: "Mindset", es: "Mentalidad" },
      level: 4,
      description: {
        en: "Fixing bugs and optimizing performance is a big part of the job — breaking down hard problems into small steps.",
        es: "Corregir errores y optimizar performance es buena parte del trabajo — descomponer lo difícil en pasos chicos.",
      },
      assetPrompt:
        "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background, a clever fox-like creature with a glowing lightbulb shape at the tip of its tail, alert pose, bushy tail",
    },
  ],

  jobs: [
    {
      id: "happyfuncorp",
      company: "HappyFunCorp",
      role: { en: "Senior Web Developer", es: "Desarrollador Web Senior" },
      period: { en: "March 2024 – Present", es: "Marzo 2024 – Presente" },
      summary: {
        en: "Remote role for a US-based studio: I research, design and maintain UI components end to end, across the JavaScript ecosystem.",
        es: "Rol remoto para un estudio de EE. UU.: investigo, diseño y mantengo componentes de UI de punta a punta, dentro del ecosistema JavaScript.",
      },
      achievements: [
        {
          en: "Research, design and manage UI components for the client-facing product.",
          es: "Investigo, diseño y gestiono componentes de UI del producto de cara al cliente.",
        },
        { en: "Fix bugs and optimize front-end performance.", es: "Corrijo errores y optimizo el rendimiento del front-end." },
        { en: "Build test coverage where it's missing.", es: "Sumo cobertura de tests donde falta." },
      ],
      skills: ["ts", "react", "next", "node"],
      npc: {
        name: "Jordan",
        role: { en: "Product Lead", es: "Líder de Producto" },
        greeting: {
          en: "Different timezone, same standup energy. Good to have you.",
          es: "Distinto huso horario, misma energía de standup. Qué bueno tenerte.",
        },
      },
    },
    {
      id: "globant-2021",
      company: "Globant",
      role: { en: "Senior Web UI Developer", es: "Desarrollador Web UI Senior" },
      period: { en: "November 2021 – March 2024", es: "Noviembre 2021 – Marzo 2024" },
      summary: {
        en: "Delivered JavaScript-based solutions for a client project, using Next.js, React and Contentful as a headless CMS.",
        es: "Entregué soluciones basadas en JavaScript para un proyecto de cliente, usando Next.js, React y Contentful como CMS headless.",
      },
      achievements: [
        { en: "Shipped product features end to end with Next.js and React.", es: "Entregué features de producto de punta a punta con Next.js y React." },
        {
          en: "Modeled content and integrated Contentful as the headless CMS.",
          es: "Modelé contenido e integré Contentful como CMS headless.",
        },
        {
          en: "Earned Contentful's Certified Professional and Personalization badges along the way.",
          es: "Me certifiqué como Contentful Certified Professional y obtuve el badge de Personalization en el camino.",
        },
      ],
      skills: ["next", "react", "contentful", "ts"],
      npc: {
        name: "Valentina",
        role: { en: "Tech Lead", es: "Tech Lead" },
        greeting: { en: "Ask him about Contentful. No, really, ask him.", es: "Preguntale por Contentful. En serio, preguntale." },
      },
    },
    {
      id: "health-note",
      company: "Health Note",
      role: { en: "Senior Software Developer", es: "Desarrollador de Software Senior" },
      period: { en: "March 2021 – October 2021", es: "Marzo 2021 – Octubre 2021" },
      summary: {
        en: "Backend-focused role building software with Node.js for a US healthtech product.",
        es: "Rol enfocado en backend, desarrollando software con Node.js para un producto healthtech de EE. UU.",
      },
      achievements: [
        { en: "Built and maintained backend services in Node.js.", es: "Construí y mantuve servicios backend en Node.js." },
        {
          en: "Worked directly with a US-based healthtech team under real product constraints.",
          es: "Trabajé directamente con un equipo healthtech de EE. UU. bajo restricciones reales de producto.",
        },
      ],
      skills: ["node", "ts"],
      npc: {
        name: "Sam",
        role: { en: "Engineering Manager", es: "Engineering Manager" },
        greeting: { en: "Healthtech moves fast. You kept up.", es: "El healthtech se mueve rápido. Vos le seguiste el ritmo." },
      },
    },
    {
      id: "banco-del-sol",
      company: "Banco del Sol",
      role: { en: "Backend Developer", es: "Desarrollador de Back-end" },
      period: { en: "October 2020 – December 2020", es: "Octubre 2020 – Diciembre 2020" },
      summary: { en: "A short backend stint in the fintech space.", es: "Un paso breve por el backend en el mundo fintech." },
      achievements: [
        { en: "Backend development for a financial services product.", es: "Desarrollo backend para un producto de servicios financieros." },
      ],
      skills: ["node"],
      npc: {
        name: "Lucas",
        role: { en: "Backend Lead", es: "Líder de Backend" },
        greeting: {
          en: "Short stint, but you left things better than you found them.",
          es: "Fue corto, pero dejaste las cosas mejor de lo que las encontraste.",
        },
      },
    },
    {
      id: "cognizant-softvision",
      company: "Cognizant Softvision",
      role: { en: "Software Developer", es: "Desarrollador de Software" },
      period: { en: "February 2019 – September 2020", es: "Febrero 2019 – Septiembre 2020" },
      summary: {
        en: "Full-stack JavaScript developer — React or Angular depending on the project, Node.js on the backend, PostgreSQL for data and Elastix as a search engine.",
        es: "Desarrollador FullStack JavaScript — React o Angular según el proyecto, Node.js en el backend, PostgreSQL para datos y Elastix como motor de búsqueda.",
      },
      achievements: [
        {
          en: "Built full-stack features with React and Angular depending on the project.",
          es: "Construí features full-stack con React y Angular según el proyecto.",
        },
        {
          en: "Backend development in Node.js with a PostgreSQL database.",
          es: "Desarrollo backend en Node.js con base de datos PostgreSQL.",
        },
        { en: "Integrated Elastix as a search engine.", es: "Integré Elastix como motor de búsqueda." },
      ],
      skills: ["react", "angular", "node", "postgres"],
      npc: {
        name: "Priya",
        role: { en: "Project Manager", es: "Project Manager" },
        greeting: { en: "React one week, Angular the next. You never blinked.", es: "React una semana, Angular la siguiente. Nunca te inmutaste." },
      },
    },
    {
      id: "ey",
      company: "EY",
      role: { en: "Supervising Associate – Frontend Developer", es: "Supervising Associate – Desarrollador Frontend" },
      period: { en: "April 2017 – January 2019", es: "Abril 2017 – Enero 2019" },
      summary: {
        en: "Led the frontend migration of a Visual Studio (C#) project to React, while the backend stayed on Visual C#.",
        es: "Lideré la migración del frontend de un proyecto de Visual Studio (C#) a React, mientras el backend seguía en Visual C#.",
      },
      achievements: [
        { en: "Migrated a legacy Visual C# frontend to React.js.", es: "Migré un frontend legado en Visual C# a React.js." },
        {
          en: "Supervised the frontend workstream as Supervising Associate.",
          es: "Supervisé el frente de frontend como Supervising Associate.",
        },
      ],
      skills: ["react", "ts"],
      npc: {
        name: "Diego",
        role: { en: "Engagement Manager", es: "Engagement Manager" },
        greeting: {
          en: "Supervising Associate — you earned that title migrating this whole thing to React.",
          es: "Supervising Associate — te ganaste ese título migrando todo esto a React.",
        },
      },
    },
  ],

  earlierJobs: [
    {
      company: "Coderhouse",
      role: { en: "Full-stack Instructor", es: "Profesor FullStack" },
      period: { en: "August 2018 – October 2018", es: "Agosto 2018 – Octubre 2018" },
    },
    {
      company: "Coderhouse",
      role: { en: "Mobile Development Instructor", es: "Profesor de Desarrollo Móvil" },
      period: { en: "April 2019 – July 2019", es: "Abril 2019 – Julio 2019" },
    },
    {
      company: "Globant",
      role: { en: "Full-stack Developer", es: "Desarrollador Full-stack" },
      period: { en: "April 2017 – August 2017", es: "Abril 2017 – Agosto 2017" },
    },
    {
      company: "LiveNation",
      role: { en: "Front End Developer", es: "Desarrollador Front End" },
      period: { en: "March 2016 – March 2017", es: "Marzo 2016 – Marzo 2017" },
    },
    {
      company: "Disney Resort Project",
      role: { en: "PHP / UI Developer", es: "Desarrollador PHP / UI" },
      period: { en: "August 2015 – March 2016", es: "Agosto 2015 – Marzo 2016" },
    },
    {
      company: "Staffing IT",
      role: { en: "PHP Developer", es: "Desarrollador PHP" },
      period: { en: "August 2014 – August 2015", es: "Agosto 2014 – Agosto 2015" },
    },
    {
      company: "Buffa Sistemas",
      role: { en: "PHP Developer (Telecom Personal)", es: "Desarrollador PHP (Telecom Personal)" },
      period: { en: "September 2013 – April 2014", es: "Septiembre 2013 – Abril 2014" },
    },
    {
      company: "CDA Informática",
      role: { en: "PHP Developer", es: "Programador PHP" },
      period: { en: "April 2013 – September 2013", es: "Abril 2013 – Septiembre 2013" },
    },
    {
      company: "Intraway Corp.",
      role: { en: "Apex / PHP Developer", es: "Programador Apex / PHP" },
      period: { en: "April 2012 – March 2013", es: "Abril 2012 – Marzo 2013" },
    },
    {
      company: "INFOC",
      role: { en: "PHP Developer", es: "Programador PHP" },
      period: { en: "September 2011 – April 2012", es: "Septiembre 2011 – Abril 2012" },
    },
    {
      company: "Sole Software SRL",
      role: { en: "Computer Technician", es: "Técnico en Computación" },
      period: { en: "July 2007 – August 2011", es: "Julio 2007 – Agosto 2011" },
    },
    {
      company: "ADT Security Services",
      role: { en: "Installer", es: "Instalador" },
      period: { en: "September 2006 – May 2007", es: "Septiembre 2006 – Mayo 2007" },
    },
  ],
};
