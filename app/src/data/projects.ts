import type { Locale } from "@/i18n/routing";

// Single source of truth for all project data — baked at build time (static export,
// no runtime fetch). Language-neutral fields are written once; localized fields are
// co-located per project as { en, de } so one edit updates both locales. The grid
// (SelectedWork), the detail body (ProjectDetail) and the detail route all read this.
// Add / edit / delete a project = edit THIS file only.

/** Per-locale value: { en, de }. */
type Loc<T> = Record<Locale, T>;

export type ProjectLink = { label: string; url: string };

export type Project = {
  /** URL-safe id; also the detail route segment. Must be unique. */
  slug: string;
  category: "mobile" | "devops" | "frontend" | "backend";
  /** Drives the contribution tag on non-featured cards. Omit for plain dev work. */
  contribution?: "author" | "lead" | "developer" | "maintenance";
  period: string;
  /** true → featured /work/<slug> detail page; false → grid card only. */
  detail: boolean;
  links: ProjectLink[];
  // Localized fields (co-located EN + DE):
  title: Loc<string>;
  tagline: Loc<string>;
  role: Loc<string>;
  stack: Loc<string[]>;
  summary: Loc<string>;
  highlights: Loc<string[]>;
};

export const projects: Project[] = [
  {
    slug: "portfolio-site",
    category: "devops",
    contribution: "author",
    period: "2026",
    detail: true,
    links: [
      { label: "Live", url: "https://www.khaledhossameldin.com" },
      { label: "Repo", url: "https://github.com/KhaledHossameldin/portfolio" },
    ],
    title: { en: "This portfolio", de: "Dieses Portfolio" },
    tagline: { en: "The site you’re on — static Next.js on AWS, fully IaC + OIDC CI/CD.", de: "Die Seite, auf der Sie sind — statisches Next.js auf AWS, vollständig als IaC mit OIDC-CI/CD." },
    role: { en: "Sole author — design, build, infra, pipeline", de: "Alleiniger Autor — Design, Umsetzung, Infrastruktur, Pipeline" },
    stack: {
      en: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Terraform", "AWS CloudFront", "AWS S3", "AWS Lambda", "Amazon SES", "API Gateway", "GitHub Actions"],
      de: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Terraform", "AWS CloudFront", "AWS S3", "AWS Lambda", "Amazon SES", "API Gateway", "GitHub Actions"],
    },
    summary: { en: "A premium personal portfolio built as a deliberate full-stack proof: a statically-exported Next.js site served from CloudFront, with all AWS infrastructure defined in Terraform and deployed through keyless GitHub Actions OIDC. The repository itself — clean IaC and CI/CD — is part of the demonstration.", de: "Ein hochwertiges persönliches Portfolio, bewusst als Full-Stack-Nachweis gebaut: eine statisch exportierte Next.js-Seite, ausgeliefert über CloudFront, mit sämtlicher AWS-Infrastruktur in Terraform und einem schlüssellosen Deployment über GitHub-Actions-OIDC. Das Repository selbst — sauberes IaC und CI/CD — ist Teil des Nachweises." },
    highlights: {
      en: [
        "All infrastructure as Terraform — CloudFront + private S3 (OAC), ACM TLS, contact Lambda, API Gateway, IAM; reproducible from code.",
        "Keyless deploys via GitHub Actions OIDC federation to AWS, every third-party action SHA-pinned — no long-lived credentials.",
        "Serverless contact path: API Gateway → Node 20 Lambda → SES, with a honeypot and server-side validation and no datastore.",
        "Static-export-safe EN/DE i18n via sub-path routing and generateStaticParams — no runtime middleware.",
        "Motion layer (Lenis smooth-scroll, GSAP ScrollTrigger, Framer Motion) fully gated behind prefers-reduced-motion at 60fps.",
        "Lighthouse 100 across Performance, Accessibility, Best Practices and SEO on desktop; HSTS and hardening headers via CloudFront.",
      ],
      de: [
        "Gesamte Infrastruktur als Terraform — CloudFront mit privatem S3 (OAC), ACM-TLS, Kontakt-Lambda, API Gateway, IAM; vollständig aus Code reproduzierbar.",
        "Schlüssellose Deployments über GitHub-Actions-OIDC-Föderation zu AWS, jede Drittanbieter-Action auf einen Commit-SHA gepinnt — keine langlebigen Zugangsdaten.",
        "Serverloser Kontaktweg: API Gateway → Node-20-Lambda → SES, mit Honeypot und serverseitiger Validierung, ganz ohne Datenbank.",
        "Statisch-export-sichere EN/DE-Internationalisierung über Sub-Pfad-Routing und generateStaticParams — keine Laufzeit-Middleware.",
        "Motion-Ebene (Lenis-Smooth-Scroll, GSAP ScrollTrigger, Framer Motion) vollständig hinter prefers-reduced-motion gekapselt, bei 60fps.",
        "Lighthouse 100 in Performance, Accessibility, Best Practices und SEO auf dem Desktop; HSTS und Härtungs-Header über CloudFront.",
      ],
    },
  },
  {
    slug: "sedra-life",
    category: "mobile",
    contribution: "maintenance",
    period: "2025–2026",
    detail: true,
    links: [
      { label: "App Store", url: "https://apps.apple.com/eg/app/sedra-life/id6759986998" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=com.sedra&hl=en" }
    ],
    title: {
      en: "Sedra Life",
      de: "Sedra Life"
    },
    tagline: {
      en: "A premium cross-platform real estate and lifestyle application for property management",
      de: "Eine erstklassige, plattformübergreifende Immobilien- und Lifestyle-Anwendung für die Immobilienverwaltung"
    },
    role: {
      en: "Flutter Support & Maintenance Engineer",
      de: "Flutter-Support- & Wartungsingenieur"
    },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "App Optimization"],
      de: ["Flutter", "Dart", "Production Support", "App-Optimierung"]
    },
    summary: {
      en: "A specialized mobile real estate and lifestyle platform showcasing premium residential and commercial projects for a leading developer in Upper Egypt. Handled ongoing technical ownership, ensuring production stability, zero-regression dependency updates, and interface optimizations.",
      de: "Eine spezialisierte mobile Immobilien- und Lifestyle-Plattform, die erstklassige Wohn- und Gewerbeprojekte eines führenden Bauträgers in Oberägypten präsentiert. Übernahme der laufenden technischen Verantwortung zur Sicherung der Produktionsstabilität, regressionsfreier Updates und UI-Optimierungen."
    },
    highlights: {
      en: [
        "Maintained production operational continuity, managing hotfixes and platform compatibility updates for both iOS and Android stores.",
        "Optimized content rendering and localized listing layouts to ensure a smooth, high-performance showcase of real estate portfolios and payment plans.",
        "Conducted thorough post-launch debugging sweeps to address edge-case runtime exceptions, keeping application availability uninterrupted."
      ],
      de: [
        "Sicherung der laufenden Betriebskontinuität in der Produktionsphase inklusive Hotfixes und Plattformkompatibilitäts-Updates für die iOS- und Android-Stores.",
        "Optimierung des Content-Renderings und der lokalisierten Layouts für eine flüssige, performante Präsentation von Immobilienportfolios und Zahlungsplänen.",
        "Durchführung gründlicher Post-Launch-Debugging-Zyklen zur Behebung von Laufzeitfehlern bei extremen Randbedingungen, um eine unterbrechungsfreie Verfügbarkeit zu garantieren."
      ]
    }
  },
  {
    slug: "qms",
    category: "mobile",
    contribution: "developer",
    period: "2025",
    detail: true,
    links: [
      { label: "App Store", url: "https://apps.apple.com/us/app/qms-sa/id1671837019" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=net.qmsgroup" },
    ],
    title: { en: "QMS", de: "QMS" },
    tagline: { en: "A healthcare ecosystem for synchronized appointment booking and pharmacy fulfillment.", de: "Eine integrierte medizinische Plattform für Terminbuchungen und Apotheken-Bestellungen." },
    role: { en: "Flutter Developer", de: "Flutter-Entwickler" },
    stack: {
      en: ["Flutter", "Dart", "BLoC", "Clean Architecture", "Geofencing", "GitHub Actions"],
      de: ["Flutter", "Dart", "BLoC", "Clean Architecture", "Geofencing", "GitHub Actions"],
    },
    summary: { en: "A cross-platform medical ecosystem designed to bridge the gap between patients, healthcare providers, and local pharmacies. Built using Clean Architecture and BLoC, the platform coordinates real-time scheduling and location-based medicine ordering through robust asynchronous stream management.", de: "Ein plattformübergreifendes medizinisches Ökosystem, das Patienten nahtlos mit Ärzten und lokalen Apotheken verbindet. Entwickelt mit Clean Architecture und BLoC, koordiniert die Plattform die Echtzeit-Terminplanung sowie standortbasierte Medikamentenbestellungen." },
    highlights: {
      en: [
        "Architected a scalable medical marketplace application using Clean Architecture to strictly separate UI presentation from complex healthcare business rules.",
        "Engineered reactive stream-based logic and persistent fallback mechanisms to handle concurrent real-time appointment booking and dynamic pharmacy stock checks smoothly.",
        "Integrated optimized location-based services featuring custom geofencing and request debouncing to deliver fast nearby-pharmacy recommendations while reducing API load.",
      ],
      de: [
        "Architektur einer skalierbaren medizinischen Marktplatz-App mittels Clean Architecture zur strikten Trennung der Benutzeroberfläche von komplexen Geschäftsregeln.",
        "Implementierung reaktiver, Stream-basierter Logik und Fallback-Mechanismen zur sicheren Bewältigung paralleler Echtzeit-Buchungen und dynamischer Bestandsprüfungen.",
        "Integration optimierter, standortbasierter Dienste mit individuellem Geofencing und Request-Debouncing zur Bereitstellung schneller Apotheken-Vorschläge bei minimaler API-Last.",
      ],
    },
  },
  {
    slug: "albruaz",
    category: "mobile",
    contribution: "lead",
    period: "2024–2025",
    detail: true,
    links: [
      { label: "App Store", url: "https://apps.apple.com/us/app/%D8%A7%D9%84%D8%A8%D8%B1%D9%88%D8%A7%D8%B2/id6474915560" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=com.mawasim.mawasim&pli=1" },
    ],
    title: { en: "Albruaz", de: "Albruaz" },
    tagline: { en: "A high-performance, video-driven competition platform with gamified engagement.", de: "Eine video-basierte Wettbewerbsplattform mit spielerischer Nutzerinteraktion." },
    role: { en: "Lead Flutter Developer", de: "Lead Flutter-Entwickler" },
    stack: {
      en: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitHub Actions"],
      de: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitHub Actions"],
    },
    summary: { en: "A cross-platform mobile application designed for video-based competitions, allowing users to upload submissions, cast votes, and participate in time-limited contests. Built using Clean Architecture and BLoC, the platform optimizes media delivery pipelines to guarantee smooth playback and high-bandwidth processing under peak loads.", de: "Eine plattformübergreifende mobile Anwendung für Video-Wettbewerbe, bei der Nutzer Beiträge einreichen, abstimmen und an zeitlich begrenzten Wettbewerben teilnehmen können. Entwickelt mit Clean Architecture und BLoC, optimiert das System die Medienbereitstellung für eine flüssige Wiedergabe bei hoher Auslastung." },
    highlights: {
      en: [
        "Led the architectural design and core implementation following SOLID principles, launching a stable MVP that handled over 5,000 video submissions in its first release cycle.",
        "Optimized video playback performance and minimized network overhead across diverse device specs through custom caching strategies, lazy loading, and client-side video compression.",
        "Authored comprehensive TDD test suites for logic-heavy components and established GitHub Actions CI/CD pipelines to automate linting, testing, and continuous deployment.",
      ],
      de: [
        "Leitung des Architekturentwurfs und der Kernimplementierung nach SOLID-Prinzipien für ein stabiles MVP, das über 5.000 Videoeinsendungen im ersten Release-Zyklus verarbeitete.",
        "Optimierung der Videowiedergabe und Reduzierung des Netzwerk-Overheads durch die Implementierung von Caching-Strategien, Lazy Loading und clientseitiger Videokompression.",
        "Erstellung umfassender TDD-Test-Suites für logikintensive Komponenten und Aufbau von GitHub-Actions-CI/CD-Pipelines zur Automatisierung von Linting, Testing und Deployments.",
      ],
    },
  },
  {
    slug: "royake",
    category: "mobile",
    contribution: "lead",
    period: "2022–2024",
    detail: true,
    links: [
      { label: "App Store", url: "https://apps.apple.com/eg/app/%D8%B1%D8%A4%D9%8A%D8%A7%D9%83/id1247346945" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=royak.royak&hl=en" },
    ],
    title: { en: "Royake", de: "Royake" },
    tagline: { en: "An enterprise-grade consulting application built with BLoC and strict TDD.", de: "Eine umfassende Consulting-Plattform mit BLoC und testgetriebener Entwicklung." },
    role: { en: "Senior Flutter Developer & Team Mentor", de: "Senior Flutter-Entwickler & Team-Mentor" },
    stack: {
      en: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitLab CI/CD"],
      de: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitLab CI/CD"],
    },
    summary: { en: "A robust, cross-platform consulting platform engineered for maximum testability and scalability. Built using Clean Architecture and BLoC state management, the application automates complex client onboarding and heavy data-streaming workflows while maintaining rigorous production-grade quality standards.", de: "Eine plattformübergreifende Beratungsplattform, entwickelt mit Fokus auf Skalierbarkeit und architektonische Disziplin. Durch den Einsatz von BLoC-Zustandsmanagement und Test-Driven Development (TDD) optimiert das System Onboarding-Prozesse und komplexe Daten-Streams unter höchsten Qualitätsstandards." },
    highlights: {
      en: [
        "Architected a modular, feature-driven codebase using Clean Architecture and BLoC to enable seamless parallel development and ensure predictable state propagation.",
        "Established automated GitLab CI/CD pipelines and implemented Test-Driven Development, sustaining over 80% code coverage across business-critical modules.",
        "Mentored the engineering team through structured code reviews and TDD workflows, scaling the platform to over 40,000 combined downloads while reducing manual client-onboarding workload by 40%.",
      ],
      de: [
        "Architektur einer modularen, funktionsgesteuerten Codebasis mittels Clean Architecture und BLoC zur Ermöglichung nahtloser, paralleler Teamentwicklung.",
        "Aufbau automatisierter GitLab-CI/CD-Pipelines und Etablierung von TDD zur Gewährleistung von über 80% Testabdeckung in allen geschäftskritischen Modulen.",
        "Mentoring des Entwicklerteams bei der Skalierung der Plattform auf über 40.000 kombinierte Downloads, während der manuelle Arbeitsaufwand um 40% reduziert wurde.",
      ],
    },
  },
  {
    slug: "pet-care",
    category: "mobile",
    contribution: "maintenance",
    period: "2024",
    detail: false,
    links: [
      { label: "App Store", url: "https://apps.apple.com/eg/app/pet-care/id6451312624" },
    ],
    title: { en: "Pet Care", de: "Pet Care" },
    tagline: { en: "An all-in-one pet services marketplace and healthcare platform.", de: "Ein All-in-One-Marktplatz und eine Gesundheitsplattform für Haustiere." },
    role: { en: "Flutter Support & Maintenance Engineer", de: "Flutter-Entwickler · Support & Wartung" },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "App Optimization"],
      de: ["Flutter", "Dart", "Production Support", "App-Optimierung"],
    },
    summary: { en: "A cross-platform pet care ecosystem connecting owners with veterinary clinics, specialized boarding hotels, and pet commerce services. Handled production-phase technical ownership, managing stability patches, code maintenance, and performance fine-tuning post-launch.", de: "Ein plattformübergreifendes Haustier-Ökosystem, das Besitzer mit Tierkliniken, Tierhotels und E-Commerce-Diensten verbindet. Übernahme des Post-Launch-Supports, der Stabilitätsupdates und der kontinuierlichen Codebasis-Optimierung." },
    highlights: {
      en: [
        "Assumed technical ownership of the inherited production codebase, managing smooth operational continuity and executing targeted UI/UX maintenance updates.",
        "Conducted thorough debugging and optimization sweeps to address edge-case crashes, ensuring consistent cross-platform performance across iOS and Android.",
        "Streamlined post-launch maintenance procedures, ensuring zero-regression deliveries for all incremental updates and minor releases.",
      ],
      de: [
        "Übernahme der technischen Verantwortung für die bestehende Produktions-Codebasis zur Sicherung der Betriebskontinuität und Umsetzung gezielter UI/UX-Updates.",
        "Durchführung gründlicher Debugging- und Optimierungszyklen zur Behebung von Edge-Case-Abstürzen für eine stabile plattformübergreifende Performance.",
        "Strukturierung der Post-Launch-Wartungsprozesse zur Gewährleistung regressionsfreier Lieferungen bei allen inkrementellen App-Updates.",
      ],
    },
  },
  {
    slug: "orood",
    category: "mobile",
    contribution: "maintenance",
    period: "2024",
    detail: false,
    links: [
      { label: "App Store", url: "https://apps.apple.com/us/app/orood/id6470238089" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=com.dev.orood" },
    ],
    title: { en: "Orood", de: "Orood" },
    tagline: { en: "A cross-platform localized deals and commercial promotions aggregator.", de: "Ein plattformübergreifender Aggregator für lokale Angebote und Rabatte." },
    role: { en: "Flutter Support & Maintenance Engineer", de: "Flutter-Entwickler · Support & Wartung" },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "Image Caching & Memory Optimization"],
      de: ["Flutter", "Dart", "Production Support", "Image Caching & Speicheroptimierung"],
    },
    summary: { en: "A dynamic, cross-platform shopping promotions ecosystem enabling users to discover location-targeted commercial discounts, retail coupons, and catalog offers. Managed post-launch product ownership, production stability patches, and media optimization for high-density image feeds.", de: "Eine plattformübergreifende Promotion-Plattform, mit der Nutzer standortbezogene Rabatte, Coupons und Einzelhandelsangebote entdecken können. Übernahme des Post-Launch-Supports, der Performance-Optimierung und der Medien-Bereitstellung für hochdichte Bilder-Feeds." },
    highlights: {
      en: [
        "Maintained operational stability and high availability for a production retail deals platform, orchestrating seamless delivery of hotfixes and minor version updates.",
        "Optimized image rendering pipelines and data caching layers across high-volume commercial catalog streams to minimize client-side memory footprints and ensure smooth infinite scroll.",
        "Diagnosed and resolved multi-region location and filter edge cases, enforcing strict QA validation standards to ensure zero-regression releases.",
      ],
      de: [
        "Sicherung hoher Verfügbarkeit und betrieblicher Stabilität der Live-Einzelhandels-App durch die strukturierte Bereitstellung von Hotfixes und kleineren Produkt-Updates.",
        "Optimierung der Bild-Rendering-Pipelines und Caching-Ebenen innerhalb datenintensiver Produktkataloge zur Reduzierung des Speicherverbrauchs und für flüssiges Scrollen.",
        "Diagnose und Behebung überregionaler Standort- und Filter-Edge-Cases unter Einhaltung strenger QA-Vorgaben für absolut regressionsfreie Releases.",
      ],
    },
  },
  {
    slug: "qrattel",
    category: "mobile",
    contribution: "developer",
    period: "2021–2023",
    detail: false,
    links: [
      { label: "App Store", url: "https://apps.apple.com/eg/app/%D8%B1%D8%AA-%D9%84-%D8%A7%D9%84%D8%AD%D9%84%D9%82%D8%A9-%D8%A7%D9%84%D8%B0%D9%83%D9%8A%D8%A9/id1608794369" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=com.qrattel.sa&hl=en" },
    ],
    title: { en: "QRattel", de: "QRattel" },
    tagline: { en: "A cross-platform app for client engagement and real-world pre-release testing.", de: "Eine plattformübergreifende App für Kundenbindung und Vorab-Feldtests." },
    role: { en: "Flutter Developer & Technical Collaborator", de: "Flutter-Entwickler & technischer Mitarbeiter" },
    stack: {
      en: ["Flutter", "Dart", "Agile", "Software Testing"],
      de: ["Flutter", "Dart", "Agile", "Software-Testing"],
    },
    summary: { en: "A cross-platform mobile application engineered to drive client engagement and facilitate rigorous pre-release field testing. Built with a focus on high maintainability, the platform features real-time communication modules to validate performance and stability under live operational conditions.", de: "Eine plattformübergreifende mobile Anwendung zur Steigerung der Kundenbindung und Durchführung intensiver Vorab-Tests. Die App kombiniert Echtzeit-Kommunikationsmodule mit einer wartungsfreundlichen Architektur, um maximale Stabilität unter realen Bedingungen zu gewährleisten." },
    highlights: {
      en: [
        "Developed custom cross-platform applications optimized for long-term scalability and code maintainability, directly aligning technical execution with business requirements.",
        "Engineered real-time video-calling features from scratch, incorporating custom signaling logic and highly responsive UI layouts to maintain connection stability.",
        "Managed the end-to-end application lifecycle and navigated client-side development halts through proactive communication, incremental delivery, and strategic backlog reprioritization.",
      ],
      de: [
        "Entwicklung maßgeschneiderter Cross-Platform-Apps mit Fokus auf Skalierbarkeit und Code-Wartbarkeit zur Erfüllung komplexer Geschäftsanforderungen.",
        "Implementierung nativer Videoanruf-Funktionen inklusive der zugehörigen Signalisierungslogik und responsiver UI für eine stabile Nutzererfahrung.",
        "Steuerung des gesamten App-Lifecycles und erfolgreiche Bewältigung kundenseitiger Projektpausen durch agile Backlog-Priorisierung und inkrementelle Lieferungen.",
      ],
    },
  },
  {
    slug: "al-frayan",
    category: "mobile",
    contribution: "maintenance",
    period: "2024–2025",
    detail: false,
    links: [
      { label: "App Store", url: "https://apps.apple.com/eg/app/%D8%A2%D9%84-%D9%81%D8%B1%D9%8A%D8%A7%D9%86/id1552692044" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=com.Alfrayan.sa&hl=ar" },
    ],
    title: { en: "Al Frayan App", de: "Al Frayan App" },
    tagline: { en: "A cross-platform community hub and educational portal for cultural services.", de: "Ein plattformübergreifendes Community-Hub und Bildungsportal für kulturelle Dienste." },
    role: { en: "Flutter Support & Maintenance Engineer", de: "Flutter-Entwickler · Support & Wartung" },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "Content Delivery Optimization"],
      de: ["Flutter", "Dart", "Production Support", "Content-Delivery-Optimierung"],
    },
    summary: { en: "A dedicated cross-platform mobile portal engineered to deliver structured educational modules, interactive cultural and religious competitions, and specialized social utility services. Directed post-launch technical management, ensuring reliable news-feed delivery and robust error handling.", de: "Ein dediziertes mobiles Portal für strukturierte Bildungsprogramme, interaktive kulturelle Wettbewerbe und soziale Dienste. Übernahme des Post-Launch-Supports zur Absicherung stabiler Newsticker-Feeds und systemweiter Stabilität." },
    highlights: {
      en: [
        "Maintained operational continuity and asset stability for an educational community platform, ensuring predictable cross-platform execution on updated iOS and Android versions.",
        "Refactored data synchronization routines to address edge-case content rendering failures and systematically upgraded core dependencies to enhance runtime exception safety.",
        "Supervised incremental hotfixes and minor production deployments, executing compliance and account-privacy changes with a strict focus on zero-regression safety.",
      ],
      de: [
        "Sicherung des laufenden Betriebs und der Asset-Stabilität einer spezialisierten Bildungs-App zur Gewährleistung einer fehlerfreien plattformübergreifenden Ausführung.",
        "Refactoring von Datensynchronisations-Routinen zur Behebung von Darstellungsfehlern sowie Aktualisierung von Kernabhängigkeiten zur Optimierung der Laufzeitsicherheit.",
        "Überwachung inkrementeller Hotfixes und Minor-Releases im Live-Betrieb sowie Umsetzung datenschutzrelevanter Updates unter Einhaltung strenger Regressionsprüfungen.",
      ],
    },
  },
  {
    slug: "sabq-app",
    category: "mobile",
    contribution: "maintenance",
    period: "2024–2025",
    detail: false,
    links: [
      { label: "App Store", url: "https://apps.apple.com/eg/app/%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%B3%D8%A8%D9%82/id1534112194" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=com.sabq.win.Sabq&hl=ar" },
    ],
    title: { en: "Sabq App", de: "Sabq App" },
    tagline: { en: "A multi-role competition management and evaluation ecosystem.", de: "Eine Wettbewerbs- und Bewertungsplattform mit rollenbasiertem Zugriff." },
    role: { en: "Flutter Support & Maintenance Engineer", de: "Flutter-Entwickler · Support & Wartung" },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "Role-Based Access Control", "State Management"],
      de: ["Flutter", "Dart", "Production Support", "Rollenbasierte Zugriffskontrolle", "State Management"],
    },
    summary: { en: "A specialized cross-platform competition platform engineered to manage, track, and evaluate multi-stage cultural and religious contests. Supervised production-phase code maintenance, focusing on stabilizing complex role-based access layers and auditing pipelines for competitors, judges, and administrators.", de: "Eine spezialisierte Cross-Platform-App zur Verwaltung und Auswertung mehrstufiger kultureller und religiöser Wettbewerbe. Verantwortlich für den Post-Launch-Support, die Stabilisierung komplexer Benutzer-Workflows für Teilnehmer, Juroren und System-Administratoren." },
    highlights: {
      en: [
        "Maintained and optimized a complex, multi-role architecture, ensuring strict data isolation and flawless state propagation between competitors, independent evaluators, and system admins.",
        "Diagnosed and resolved subtle edge cases in the asynchronous evaluation engine and randomized submission-assignment algorithms to preserve data integrity and fairness during active grading cycles.",
        "Orchestrated hotfixes and platform dependency updates for live production builds, guaranteeing continuous runtime availability during peak high-traffic competition phases.",
      ],
      de: [
        "Wartung und Optimierung einer komplexen, rollenbasierten Systemarchitektur zur Gewährleistung strikter Datentrennung und fehlerfreier Zustandsübergänge zwischen allen Benutzergruppen.",
        "Behebung kritischer Fehler in der asynchronen Bewertungs-Engine und den Zuweisungs-Algorithmen zur Sicherung der Datenintegrität während aktiver Bewertungsphasen.",
        "Bereitstellung von Hotfixes und Plattform-Abhängigkeits-Updates für Live-Releases zur Gewährleistung eines ausfallsicheren Betriebs bei stark frequentierten Wettbewerbsphasen.",
      ],
    },
  },
  {
    slug: "drs-space",
    category: "mobile",
    contribution: "developer",
    period: "2021–2022",
    detail: false,
    links: [],
    title: { en: "Drs Space", de: "Drs Space" },
    tagline: { en: "A dual-app telemedicine platform streamlining doctor–patient interactions.", de: "Eine Telemedizin-Plattform mit dedizierten Apps für Patienten und Ärzte." },
    role: { en: "Flutter Developer & Technical Collaborator", de: "Flutter-Entwickler & technischer Mitarbeiter" },
    stack: {
      en: ["Flutter", "Dart", "Clean Architecture", "OOP", "Material Design"],
      de: ["Flutter", "Dart", "Clean Architecture", "OOP", "Material Design"],
    },
    summary: { en: "A cross-platform telemedicine ecosystem featuring dedicated applications for both patients and doctors. Built using Clean Architecture and OOP principles, the platform delivers synchronized workflows and real-time video consultations to optimize remote healthcare delivery.", de: "Eine plattformübergreifende Telemedizin-Lösung mit synchronisierten Anwendungen für Patienten und Ärzte. Entwickelt auf Basis von Clean Architecture und OOP-Prinzipien, bietet das System Echtzeit-Videokonsultationen zur Optimierung der medizinischen Betreuung." },
    highlights: {
      en: [
        "Architected a scalable, feature-driven codebase using Clean Architecture to share core logic and maximize maintainability across both client applications.",
        "Implemented custom widgets, adaptive layouts, and real-time video consultation components to ensure a seamless, responsive user experience.",
        "Managed the end-to-end lifecycle, navigating intermittent development pauses through proactive client communication and incremental App Store and Play Store deployments.",
      ],
      de: [
        "Architektur einer skalierbaren, funktionsgesteuerten Codebasis nach Clean-Architecture-Prinzipien zur gemeinsamen Nutzung der Kernlogik beider Client-Apps.",
        "Implementierung maßgeschneiderter Widgets, adaptiver Layouts und der Logik für Echtzeit-Videoanrufe für eine reibungslose Benutzererfahrung.",
        "Verantwortung für den gesamten App-Lifecycle von Feldtests bis zu den App-Store- und Play-Store-Releases samt agiler Anpassungen bei Projektpausen.",
      ],
    },
  },
];

// Detail (featured) slugs — single source for generateStaticParams + route guards.
export const detailSlugs = projects.filter((p) => p.detail).map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

// Build-time integrity guard: fails the build with a clear message on a malformed edit,
// instead of shipping an empty render or crashing one locale at prerender.
(() => {
  const seen = new Set<string>();
  for (const p of projects) {
    if (!/^[a-z0-9-]+$/.test(p.slug)) throw new Error(`projects.ts: invalid slug "${p.slug}"`);
    if (seen.has(p.slug)) throw new Error(`projects.ts: duplicate slug "${p.slug}"`);
    seen.add(p.slug);
    if (p.detail && (!p.summary.en || !p.summary.de || p.highlights.en.length === 0 || p.highlights.de.length === 0)) {
      throw new Error(`projects.ts: featured "${p.slug}" needs summary + highlights in both locales`);
    }
  }
})();
