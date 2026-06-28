import type { Locale } from "@/i18n/routing";

// Single source of truth for all project data — baked at build time (static export,
// no runtime fetch). Language-neutral fields are written once; localized fields are
// co-located per project as { en, de, ar } so one edit updates every locale. The grid
// (SelectedWork), the detail body (ProjectDetail) and the detail route all read this.
// Add / edit / delete a project = edit THIS file only.

/** Per-locale value — all three locales required. Read via pick(). */
type Loc<T> = Record<Locale, T>;

/** Localized read (kept as the single accessor used across the app). */
export function pick<T>(value: Loc<T>, locale: Locale): T {
  return (value[locale] ?? value.en) as T;
}

export type ProjectLink = { label: string; url: string };

export type Project = {
  slug: string;
  category: "mobile" | "devops" | "frontend" | "backend";
  contribution?: "author" | "lead" | "developer" | "maintenance";
  period: string;
  detail: boolean;
  links: ProjectLink[];
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
    title: { en: "This portfolio", de: "Dieses Portfolio", ar: "هذا المعرض" },
    tagline: { en: "The site you’re on — static Next.js on AWS, fully IaC + OIDC CI/CD.", de: "Die Seite, auf der Sie sind — statisches Next.js auf AWS, vollständig als IaC mit OIDC-CI/CD.", ar: "الموقع الذي تتصفّحه — Next.js ثابت على AWS، بنية تحتية بالكامل ككود مع OIDC CI/CD." },
    role: { en: "Sole author — design, build, infra, pipeline", de: "Alleiniger Autor — Design, Umsetzung, Infrastruktur, Pipeline", ar: "المؤلِّف الوحيد — التصميم والبناء والبنية التحتية وخط الأنابيب" },
    stack: {
      en: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Terraform", "AWS CloudFront", "AWS S3", "AWS Lambda", "Amazon SES", "API Gateway", "GitHub Actions"],
      de: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Terraform", "AWS CloudFront", "AWS S3", "AWS Lambda", "Amazon SES", "API Gateway", "GitHub Actions"],
      ar: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Terraform", "AWS CloudFront", "AWS S3", "AWS Lambda", "Amazon SES", "API Gateway", "GitHub Actions"],
    },
    summary: { en: "A premium personal portfolio built as a deliberate full-stack proof: a statically-exported Next.js site served from CloudFront, with all AWS infrastructure defined in Terraform and deployed through keyless GitHub Actions OIDC. The repository itself — clean IaC and CI/CD — is part of the demonstration.", de: "Ein hochwertiges persönliches Portfolio, bewusst als Full-Stack-Nachweis gebaut: eine statisch exportierte Next.js-Seite, ausgeliefert über CloudFront, mit sämtlicher AWS-Infrastruktur in Terraform und einem schlüssellosen Deployment über GitHub-Actions-OIDC. Das Repository selbst — sauberes IaC und CI/CD — ist Teil des Nachweises.", ar: "معرض أعمال شخصي راقٍ بُنِي كبرهانٍ متعمَّد على العمل عبر الحزمة كاملة: موقع Next.js مُصدَّر بشكل ثابت ويُقدَّم عبر CloudFront، مع تعريف كامل لبنية AWS التحتية في Terraform ونشرٍ بلا مفاتيح عبر GitHub Actions OIDC. المستودع نفسه — بنية تحتية ككود وCI/CD نظيفان — جزءٌ من البرهان." },
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
      ar: [
        "كامل البنية التحتية بـ Terraform — CloudFront مع S3 خاص (OAC)، وشهادة ACM TLS، ودالّة تواصل Lambda، وAPI Gateway، وIAM؛ قابلة لإعادة الإنتاج من الكود.",
        "نشرٌ بلا مفاتيح عبر اتحاد GitHub Actions OIDC مع AWS، وكل إجراء خارجي مُثبَّت على SHA — دون بيانات اعتماد طويلة الأمد.",
        "مسار تواصل عديم الخوادم: API Gateway ← دالّة Node 20 Lambda ← SES، مع مصيدة وتحقّق من جهة الخادم وبلا قاعدة بيانات.",
        "تدويلٌ آمن للتصدير الثابت EN/DE عبر التوجيه بالمسارات الفرعية وgenerateStaticParams — دون وسيط زمن تشغيل.",
        "طبقة حركة (Lenis للتمرير الناعم، وGSAP ScrollTrigger، وFramer Motion) مُقيَّدة بالكامل خلف prefers-reduced-motion عند 60 إطارًا/ثانية.",
        "Lighthouse 100 في الأداء وإمكانية الوصول وأفضل الممارسات وتحسين محركات البحث على سطح المكتب؛ مع HSTS وترويسات تحصين عبر CloudFront.",
      ],
    },
  },
  {
    slug: "sedra-life",
    category: "mobile",
    contribution: "developer",
    period: "2026–",
    detail: true,
    links: [
      { label: "App Store", url: "https://apps.apple.com/eg/app/sedra-life/id6759986998" },
      { label: "Play Store", url: "https://play.google.com/store/apps/details?id=com.sedra&hl=en" },
    ],
    title: { en: "Sedra Life", de: "Sedra Life", ar: "سيدرا" },
    tagline: { en: "A premium cross-platform real-estate & lifestyle app, built ground-up for AbyDOS.", de: "Eine erstklassige, plattformübergreifende Immobilien- und Lifestyle-App, von Grund auf für AbyDOS entwickelt.", ar: "تطبيق عقارات وأسلوب حياة راقٍ ومتعدّد المنصّات، مبنيٌّ من الصفر لشركة AbyDOS." },
    role: { en: "Flutter Engineer — ground-up build", de: "Flutter-Entwickler — Neuentwicklung", ar: "مهندس Flutter — بناء من الصفر" },
    stack: {
      en: ["Flutter", "Dart", "Clean Architecture", "BLoC"],
      de: ["Flutter", "Dart", "Clean Architecture", "BLoC"],
      ar: ["Flutter", "Dart", "Clean Architecture", "BLoC"],
    },
    summary: { en: "A cross-platform real-estate and lifestyle platform built from the ground up for AbyDOS, a software company in Sohag, Egypt, to showcase premium residential and commercial projects. Architected on a shared Clean Architecture + BLoC foundation that is reused across a two-app Sedra suite, with a scalable, testable codebase from day one.", de: "Eine plattformübergreifende Immobilien- und Lifestyle-Plattform, von Grund auf für AbyDOS — ein Softwareunternehmen in Sohag, Ägypten — entwickelt, um erstklassige Wohn- und Gewerbeprojekte zu präsentieren. Aufgebaut auf einem gemeinsamen Fundament aus Clean Architecture und BLoC, das in einer aus zwei Apps bestehenden Sedra-Suite wiederverwendet wird — mit einer skalierbaren, testbaren Codebasis von Tag eins an.", ar: "منصّة عقارات وأسلوب حياة متعدّدة المنصّات، مبنيّة من الصفر لشركة AbyDOS البرمجية في سوهاج بمصر، لعرض مشاريع سكنية وتجارية راقية. مُهندَسة على أساسٍ مشترك من Clean Architecture وBLoC يُعاد استخدامه عبر حزمة Sedra المكوّنة من تطبيقين، بقاعدة كود قابلة للتوسّع والاختبار منذ اليوم الأول." },
    highlights: {
      en: [
        "Building the app from the ground up on a Clean Architecture + BLoC foundation designed for reuse across the companion Sedra suite.",
        "Modeling property listings, project showcases and payment plans into a scalable, testable domain layer.",
        "Establishing the shared architecture and state management that both Sedra apps are built on.",
      ],
      de: [
        "Aufbau der App von Grund auf auf einem Fundament aus Clean Architecture und BLoC, das für die Wiederverwendung in der begleitenden Sedra-Suite ausgelegt ist.",
        "Modellierung von Immobilienangeboten, Projektpräsentationen und Zahlungsplänen in einer skalierbaren, testbaren Domänenschicht.",
        "Etablierung der gemeinsamen Architektur und Zustandsverwaltung, auf der beide Sedra-Apps aufbauen.",
      ],
      ar: [
        "بناء التطبيق من الصفر على أساسٍ من Clean Architecture وBLoC مُصمَّم لإعادة الاستخدام عبر حزمة Sedra المرافِقة.",
        "نمذجة قوائم العقارات وعروض المشاريع وخطط السداد ضمن طبقة مجال قابلة للتوسّع والاختبار.",
        "إرساء البنية المعمارية المشتركة وإدارة الحالة التي يقوم عليها تطبيقا سيدرا.",
      ],
    },
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
    title: { en: "QMS", de: "QMS", ar: "QMS" },
    tagline: { en: "A healthcare ecosystem for synchronized appointment booking and pharmacy fulfillment.", de: "Eine integrierte medizinische Plattform für Terminbuchungen und Apotheken-Bestellungen.", ar: "منظومة رعاية صحية لحجز المواعيد المتزامن وصرف الأدوية." },
    role: { en: "Flutter Developer", de: "Flutter-Entwickler", ar: "مطوّر Flutter" },
    stack: {
      en: ["Flutter", "Dart", "BLoC", "Clean Architecture", "Geofencing", "GitHub Actions"],
      de: ["Flutter", "Dart", "BLoC", "Clean Architecture", "Geofencing", "GitHub Actions"],
      ar: ["Flutter", "Dart", "BLoC", "Clean Architecture", "Geofencing", "GitHub Actions"],
    },
    summary: { en: "A cross-platform medical ecosystem designed to bridge the gap between patients, healthcare providers, and local pharmacies. Built using Clean Architecture and BLoC, the platform coordinates real-time scheduling and location-based medicine ordering through robust asynchronous stream management.", de: "Ein plattformübergreifendes medizinisches Ökosystem, das Patienten nahtlos mit Ärzten und lokalen Apotheken verbindet. Entwickelt mit Clean Architecture und BLoC, koordiniert die Plattform die Echtzeit-Terminplanung sowie standortbasierte Medikamentenbestellungen.", ar: "منظومة طبية متعدّدة المنصّات صُمِّمت لردم الفجوة بين المرضى ومقدّمي الرعاية الصحية والصيدليات المحلية. مبنيّة بـ Clean Architecture وBLoC، تنسّق المنصّة الجدولة الفورية وطلب الأدوية المعتمد على الموقع عبر إدارة قوية للتدفّقات غير المتزامنة." },
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
      ar: [
        "هندسة تطبيق سوق طبي قابل للتوسّع باستخدام Clean Architecture لفصل واجهة العرض فصلًا صارمًا عن قواعد العمل الصحية المعقّدة.",
        "بناء منطق تفاعلي قائم على التدفّقات وآليات احتياطية دائمة للتعامل بسلاسة مع الحجز الفوري المتزامن والتحقّق الديناميكي من مخزون الصيدليات.",
        "دمج خدمات موقع مُحسَّنة مع تسييج جغرافي مخصّص وتهدئة للطلبات لتقديم توصيات سريعة لأقرب صيدلية مع تقليل حِمل الـ API.",
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
    title: { en: "Albruaz", de: "Albruaz", ar: "البرواز" },
    tagline: { en: "A high-performance, video-driven competition platform with gamified engagement.", de: "Eine video-basierte Wettbewerbsplattform mit spielerischer Nutzerinteraktion.", ar: "منصّة مسابقات عالية الأداء قائمة على الفيديو بطابعٍ تفاعلي مُلعَّب." },
    role: { en: "Lead Flutter Developer", de: "Lead Flutter-Entwickler", ar: "مطوّر Flutter رئيسي" },
    stack: {
      en: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitHub Actions"],
      de: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitHub Actions"],
      ar: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitHub Actions"],
    },
    summary: { en: "A cross-platform mobile application designed for video-based competitions, allowing users to upload submissions, cast votes, and participate in time-limited contests. Built using Clean Architecture and BLoC, the platform optimizes media delivery pipelines to guarantee smooth playback and high-bandwidth processing under peak loads.", de: "Eine plattformübergreifende mobile Anwendung für Video-Wettbewerbe, bei der Nutzer Beiträge einreichen, abstimmen und an zeitlich begrenzten Wettbewerben teilnehmen können. Entwickelt mit Clean Architecture und BLoC, optimiert das System die Medienbereitstellung für eine flüssige Wiedergabe bei hoher Auslastung.", ar: "تطبيق جوّال متعدّد المنصّات مُصمَّم للمسابقات القائمة على الفيديو، يتيح للمستخدمين رفع المشاركات والتصويت والمشاركة في مسابقات محدّدة بوقت. مبنيٌّ بـ Clean Architecture وBLoC، يُحسِّن النظام مسارات توصيل الوسائط لضمان تشغيلٍ سلس ومعالجة عالية النطاق تحت الأحمال القصوى." },
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
      ar: [
        "قيادة التصميم المعماري والتنفيذ الأساسي وفق مبادئ SOLID، وإطلاق MVP مستقر استوعب أكثر من 5000 مشاركة فيديو في دورة الإصدار الأولى.",
        "تحسين أداء تشغيل الفيديو وتقليل عبء الشبكة عبر مواصفات أجهزة متنوّعة من خلال استراتيجيات تخزين مؤقت مخصّصة، وتحميل كسول، وضغط الفيديو من جهة العميل.",
        "كتابة مجموعات اختبار TDD شاملة للمكوّنات كثيفة المنطق، وإرساء خطوط GitHub Actions CI/CD لأتمتة الفحص والاختبار والنشر المستمر.",
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
    title: { en: "Royake", de: "Royake", ar: "رؤياك" },
    tagline: { en: "An enterprise-grade consulting application built with BLoC and strict TDD.", de: "Eine umfassende Beratungsplattform mit BLoC und testgetriebener Entwicklung.", ar: "تطبيق استشارات بمستوى المؤسسات مبنيٌّ بـ BLoC وTDD صارم." },
    role: { en: "Senior Flutter Developer & Team Mentor", de: "Senior Flutter-Entwickler & Team-Mentor", ar: "مطوّر Flutter أول ومُرشِد فريق" },
    stack: {
      en: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitLab CI/CD"],
      de: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitLab CI/CD"],
      ar: ["Flutter", "Dart", "BLoC", "Clean Architecture", "TDD", "GitLab CI/CD"],
    },
    summary: { en: "A robust, cross-platform consulting platform engineered for maximum testability and scalability. Built using Clean Architecture and BLoC state management, the application automates complex client onboarding and heavy data-streaming workflows while maintaining rigorous production-grade quality standards.", de: "Eine plattformübergreifende Beratungsplattform, entwickelt mit Fokus auf Skalierbarkeit und architektonische Disziplin. Durch den Einsatz von BLoC-Zustandsmanagement und testgetriebener Entwicklung (TDD) optimiert das System Onboarding-Prozesse und komplexe Datenströme unter höchsten Qualitätsstandards.", ar: "منصّة استشارات متينة ومتعدّدة المنصّات، مُهندَسة لأقصى قابلية للاختبار والتوسّع. مبنيّة بـ Clean Architecture وإدارة الحالة عبر BLoC، تُؤتمت التطبيق عمليات الإعداد المعقّدة للعملاء وتدفّقات البيانات الثقيلة مع الحفاظ على معايير جودة إنتاجية صارمة." },
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
      ar: [
        "هندسة قاعدة كود معيارية مُوجَّهة بالميزات باستخدام Clean Architecture وBLoC لتمكين تطوير متوازٍ سلس وضمان انتشارٍ متوقَّع للحالة.",
        "إرساء خطوط GitLab CI/CD مؤتمتة وتطبيق التطوير المقاد بالاختبار، مع الحفاظ على تغطية كود تتجاوز 80% عبر الوحدات الحرجة للعمل.",
        "إرشاد فريق الهندسة عبر مراجعات كود منظّمة وتدفّقات TDD، وتوسيع المنصّة إلى أكثر من 40,000 تنزيل مجمّع مع خفض عبء إعداد العملاء يدويًا بنسبة 40%.",
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
    title: { en: "Pet Care", de: "Pet Care", ar: "Pet Care" },
    tagline: { en: "An all-in-one pet services marketplace and healthcare platform.", de: "Ein All-in-One-Marktplatz und eine Gesundheitsplattform für Haustiere.", ar: "سوق متكامل لخدمات الحيوانات الأليفة ومنصّة رعاية صحية." },
    role: { en: "Flutter Support & Maintenance Engineer", de: "Flutter-Entwickler · Support & Wartung", ar: "مهندس دعم وصيانة Flutter" },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "App Optimization"],
      de: ["Flutter", "Dart", "Produktions-Support", "App-Optimierung"],
      ar: ["Flutter", "Dart", "دعم الإنتاج", "تحسين التطبيق"],
    },
    summary: { en: "A cross-platform pet care ecosystem connecting owners with veterinary clinics, specialized boarding hotels, and pet commerce services. Handled production-phase technical ownership, managing stability patches, code maintenance, and performance fine-tuning post-launch.", de: "Ein plattformübergreifendes Haustier-Ökosystem, das Besitzer mit Tierkliniken, Tierhotels und E-Commerce-Diensten verbindet. Übernahme des Post-Launch-Supports, der Stabilitätsupdates und der kontinuierlichen Codebasis-Optimierung.", ar: "منظومة رعاية للحيوانات الأليفة متعدّدة المنصّات تربط المالكين بالعيادات البيطرية وفنادق الإيواء المتخصّصة وخدمات التجارة. تولّيتُ المسؤولية التقنية في مرحلة الإنتاج، بإدارة رُقَع الاستقرار وصيانة الكود وضبط الأداء بعد الإطلاق." },
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
      ar: [
        "تولّي المسؤولية التقنية لقاعدة كود إنتاجية موروثة، وإدارة استمرارية تشغيلية سلسة وتنفيذ تحديثات صيانة موجَّهة لواجهة وتجربة المستخدم.",
        "إجراء جولات تصحيح وتحسين دقيقة لمعالجة الأعطال في الحالات الحدّية، وضمان أداء متّسق عبر iOS وAndroid.",
        "تبسيط إجراءات الصيانة بعد الإطلاق، وضمان تسليمات خالية من الانحدار لكل التحديثات التدريجية والإصدارات الطفيفة.",
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
    title: { en: "Orood", de: "Orood", ar: "عروض" },
    tagline: { en: "A cross-platform localized deals and commercial promotions aggregator.", de: "Ein plattformübergreifender Aggregator für lokale Angebote und Rabatte.", ar: "مُجمِّع متعدّد المنصّات للعروض المحلية والترويجات التجارية." },
    role: { en: "Flutter Support & Maintenance Engineer", de: "Flutter-Entwickler · Support & Wartung", ar: "مهندس دعم وصيانة Flutter" },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "Image Caching & Memory Optimization"],
      de: ["Flutter", "Dart", "Produktions-Support", "Bild-Caching & Speicheroptimierung"],
      ar: ["Flutter", "Dart", "دعم الإنتاج", "تخزين الصور المؤقت وتحسين الذاكرة"],
    },
    summary: { en: "A dynamic, cross-platform shopping promotions ecosystem enabling users to discover location-targeted commercial discounts, retail coupons, and catalog offers. Managed post-launch product ownership, production stability patches, and media optimization for high-density image feeds.", de: "Eine plattformübergreifende Aktions-Plattform, mit der Nutzer standortbezogene Rabatte, Coupons und Einzelhandelsangebote entdecken können. Übernahme des Post-Launch-Supports, der Performance-Optimierung und der Medien-Bereitstellung für hochdichte Bilder-Feeds.", ar: "منظومة ترويجات تسوّق ديناميكية ومتعدّدة المنصّات تتيح للمستخدمين اكتشاف خصوماتٍ تجارية مستهدفة بالموقع، وقسائم التجزئة، وعروض الكتالوج. أدَرتُ ملكية المنتج بعد الإطلاق، ورُقَع الاستقرار الإنتاجي، وتحسين الوسائط لخلاصات الصور عالية الكثافة." },
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
      ar: [
        "الحفاظ على الاستقرار التشغيلي والتوافر العالي لمنصّة عروض تجزئة إنتاجية، وتنسيق تسليم سلس للإصلاحات العاجلة وتحديثات الإصدارات الطفيفة.",
        "تحسين مسارات عرض الصور وطبقات التخزين المؤقت للبيانات عبر خلاصات كتالوج تجارية ضخمة لتقليل بصمة الذاكرة من جهة العميل وضمان تمرير لانهائي سلس.",
        "تشخيص وحلّ حالات حدّية متعدّدة المناطق في الموقع والتصفية، مع فرض معايير ضمان جودة صارمة لضمان إصدارات خالية من الانحدار.",
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
    title: { en: "QRattel", de: "QRattel", ar: "رتل الحلقة الذكية" },
    tagline: { en: "A cross-platform app for client engagement and real-world pre-release testing.", de: "Eine plattformübergreifende App für Kundenbindung und Vorab-Feldtests.", ar: "تطبيق متعدّد المنصّات لإشراك العملاء واختبارات ما قبل الإصدار في الميدان." },
    role: { en: "Flutter Developer & Technical Collaborator", de: "Flutter-Entwickler & technischer Mitarbeiter", ar: "مطوّر Flutter ومتعاون تقني" },
    stack: {
      en: ["Flutter", "Dart", "Agile", "Software Testing"],
      de: ["Flutter", "Dart", "Agile", "Softwaretests"],
      ar: ["Flutter", "Dart", "Agile", "اختبار البرمجيات"],
    },
    summary: { en: "A cross-platform mobile application engineered to drive client engagement and facilitate rigorous pre-release field testing. Built with a focus on high maintainability, the platform features real-time communication modules to validate performance and stability under live operational conditions.", de: "Eine plattformübergreifende mobile Anwendung zur Steigerung der Kundenbindung und Durchführung intensiver Vorab-Tests. Die App kombiniert Echtzeit-Kommunikationsmodule mit einer wartungsfreundlichen Architektur, um maximale Stabilität unter realen Bedingungen zu gewährleisten.", ar: "تطبيق جوّال متعدّد المنصّات مُهندَس لتعزيز إشراك العملاء وتيسير اختبارات ميدانية صارمة قبل الإصدار. مبنيٌّ بتركيزٍ على قابلية صيانة عالية، يضمّ التطبيق وحدات تواصل فوري للتحقّق من الأداء والاستقرار في ظروف تشغيل حيّة." },
    highlights: {
      en: [
        "Developed custom cross-platform applications optimized for long-term scalability and code maintainability, directly aligning technical execution with business requirements.",
        "Engineered real-time video-calling features from scratch, incorporating custom signaling logic and highly responsive UI layouts to maintain connection stability.",
        "Managed the end-to-end application lifecycle and navigated client-side development halts through proactive communication, incremental delivery, and strategic backlog reprioritization.",
      ],
      de: [
        "Entwicklung maßgeschneiderter plattformübergreifender Apps mit Fokus auf Skalierbarkeit und Code-Wartbarkeit zur Erfüllung komplexer Geschäftsanforderungen.",
        "Implementierung nativer Videoanruf-Funktionen inklusive der zugehörigen Signalisierungslogik und responsiver UI für eine stabile Nutzererfahrung.",
        "Steuerung des gesamten App-Lifecycles und erfolgreiche Bewältigung kundenseitiger Projektpausen durch agile Backlog-Priorisierung und inkrementelle Lieferungen.",
      ],
      ar: [
        "تطوير تطبيقات متعدّدة المنصّات مخصّصة ومُحسَّنة لقابلية التوسّع وصيانة الكود على المدى الطويل، بمواءمةٍ مباشرة بين التنفيذ التقني ومتطلبات العمل.",
        "بناء ميزات مكالمات فيديو فورية من الصفر، بمنطق إشارات مخصّص وتخطيطات واجهة عالية الاستجابة للحفاظ على استقرار الاتصال.",
        "إدارة دورة حياة التطبيق من الطرف إلى الطرف، وتجاوز توقّفات التطوير من جهة العميل عبر تواصل استباقي وتسليم تدريجي وإعادة ترتيب استراتيجي للأولويات.",
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
    title: { en: "Al Frayan App", de: "Al Frayan App", ar: "تطبيق آل فريان" },
    tagline: { en: "A cross-platform community hub and educational portal for cultural services.", de: "Ein plattformübergreifendes Community-Hub und Bildungsportal für kulturelle Dienste.", ar: "مركز مجتمعي وبوّابة تعليمية متعدّدة المنصّات للخدمات الثقافية." },
    role: { en: "Flutter Support & Maintenance Engineer", de: "Flutter-Entwickler · Support & Wartung", ar: "مهندس دعم وصيانة Flutter" },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "Content Delivery Optimization"],
      de: ["Flutter", "Dart", "Produktions-Support", "Content-Auslieferungsoptimierung"],
      ar: ["Flutter", "Dart", "دعم الإنتاج", "تحسين توصيل المحتوى"],
    },
    summary: { en: "A dedicated cross-platform mobile portal engineered to deliver structured educational modules, interactive cultural and religious competitions, and specialized social utility services. Directed post-launch technical management, ensuring reliable news-feed delivery and robust error handling.", de: "Ein dediziertes mobiles Portal für strukturierte Bildungsprogramme, interaktive kulturelle Wettbewerbe und soziale Dienste. Übernahme des Post-Launch-Supports zur Absicherung stabiler Newsticker-Feeds und systemweiter Stabilität.", ar: "بوّابة جوّال متعدّدة المنصّات مُهندَسة لتقديم وحدات تعليمية منظّمة، ومسابقات ثقافية ودينية تفاعلية، وخدمات اجتماعية متخصّصة. أدَرتُ الجوانب التقنية بعد الإطلاق، بما يضمن توصيلًا موثوقًا لخلاصات الأخبار ومعالجة قوية للأخطاء." },
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
      ar: [
        "الحفاظ على الاستمرارية التشغيلية واستقرار الأصول لمنصّة مجتمعية تعليمية، وضمان تنفيذٍ متوقَّع عبر المنصّات على إصدارات iOS وAndroid المُحدَّثة.",
        "إعادة هيكلة إجراءات مزامنة البيانات لمعالجة إخفاقات عرض المحتوى في الحالات الحدّية، وترقية التبعيات الأساسية منهجيًا لتعزيز الأمان ضد استثناءات زمن التشغيل.",
        "الإشراف على الإصلاحات العاجلة التدريجية وعمليات النشر الإنتاجية الطفيفة، وتنفيذ تغييرات الامتثال وخصوصية الحسابات بتركيزٍ صارم على انعدام الانحدار.",
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
    title: { en: "Sabq App", de: "Sabq App", ar: "تطبيق سبق" },
    tagline: { en: "A multi-role competition management and evaluation ecosystem.", de: "Eine Wettbewerbs- und Bewertungsplattform mit rollenbasiertem Zugriff.", ar: "منظومة متعدّدة الأدوار لإدارة المسابقات وتقييمها." },
    role: { en: "Flutter Support & Maintenance Engineer", de: "Flutter-Entwickler · Support & Wartung", ar: "مهندس دعم وصيانة Flutter" },
    stack: {
      en: ["Flutter", "Dart", "Production Support", "Role-Based Access Control", "State Management"],
      de: ["Flutter", "Dart", "Produktions-Support", "Rollenbasierte Zugriffskontrolle", "Zustandsverwaltung"],
      ar: ["Flutter", "Dart", "دعم الإنتاج", "التحكم في الوصول حسب الأدوار", "إدارة الحالة"],
    },
    summary: { en: "A specialized cross-platform competition platform engineered to manage, track, and evaluate multi-stage cultural and religious contests. Supervised production-phase code maintenance, focusing on stabilizing complex role-based access layers and auditing pipelines for competitors, judges, and administrators.", de: "Eine spezialisierte plattformübergreifende App zur Verwaltung und Auswertung mehrstufiger kultureller und religiöser Wettbewerbe. Verantwortlich für den Post-Launch-Support, die Stabilisierung komplexer Benutzer-Workflows für Teilnehmer, Juroren und System-Administratoren.", ar: "منصّة مسابقات متخصّصة ومتعدّدة المنصّات مُهندَسة لإدارة المسابقات الثقافية والدينية متعدّدة المراحل وتتبّعها وتقييمها. أشرفتُ على صيانة الكود في مرحلة الإنتاج، بالتركيز على استقرار طبقات الوصول المعقّدة المعتمدة على الأدوار، ومسارات التدقيق للمتسابقين والمحكّمين والمسؤولين." },
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
      ar: [
        "صيانة وتحسين بنية معقّدة متعدّدة الأدوار، مع ضمان عزل صارم للبيانات وانتشارٍ سليم للحالة بين المتسابقين والمحكّمين المستقلّين ومسؤولي النظام.",
        "تشخيص وحلّ حالات حدّية دقيقة في محرّك التقييم غير المتزامن وخوارزميات الإسناد العشوائي للمشاركات للحفاظ على سلامة البيانات والعدالة أثناء دورات التقييم النشطة.",
        "تنسيق الإصلاحات العاجلة وتحديثات تبعيات المنصّة لإصدارات الإنتاج الحيّة، بما يضمن توافرًا مستمرًّا في زمن التشغيل خلال مراحل المسابقات عالية الازدحام.",
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
    title: { en: "Drs Space", de: "Drs Space", ar: "دكتور سبيس" },
    tagline: { en: "A dual-app telemedicine platform streamlining doctor–patient interactions.", de: "Eine Telemedizin-Plattform mit dedizierten Apps für Patienten und Ärzte.", ar: "منصّة طب عن بُعد بتطبيقين تُبسِّط تفاعلات الطبيب والمريض." },
    role: { en: "Flutter Developer & Technical Collaborator", de: "Flutter-Entwickler & technischer Mitarbeiter", ar: "مطوّر Flutter ومتعاون تقني" },
    stack: {
      en: ["Flutter", "Dart", "Clean Architecture", "OOP", "Material Design"],
      de: ["Flutter", "Dart", "Clean Architecture", "OOP", "Material Design"],
      ar: ["Flutter", "Dart", "Clean Architecture", "OOP", "Material Design"],
    },
    summary: { en: "A cross-platform telemedicine ecosystem featuring dedicated applications for both patients and doctors. Built using Clean Architecture and OOP principles, the platform delivers synchronized workflows and real-time video consultations to optimize remote healthcare delivery.", de: "Eine plattformübergreifende Telemedizin-Lösung mit synchronisierten Anwendungen für Patienten und Ärzte. Entwickelt auf Basis von Clean Architecture und OOP-Prinzipien, bietet das System Echtzeit-Videokonsultationen zur Optimierung der medizinischen Betreuung.", ar: "منظومة طب عن بُعد متعدّدة المنصّات تضمّ تطبيقين مخصّصين للمرضى والأطباء. مبنيّة بـ Clean Architecture ومبادئ البرمجة الكائنية، تقدّم المنصّة تدفّقات عمل متزامنة واستشارات فيديو فورية لتحسين تقديم الرعاية الصحية عن بُعد." },
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
      ar: [
        "هندسة قاعدة كود قابلة للتوسّع ومُوجَّهة بالميزات باستخدام Clean Architecture لمشاركة المنطق الأساسي وتعظيم قابلية الصيانة عبر التطبيقين.",
        "تنفيذ عناصر واجهة مخصّصة وتخطيطات تكيّفية ومكوّنات استشارات فيديو فورية لضمان تجربة مستخدم سلسة وعالية الاستجابة.",
        "إدارة دورة الحياة من الطرف إلى الطرف، وتجاوز فترات التوقّف المتقطّعة في التطوير عبر تواصل استباقي مع العميل ونشرٍ تدريجي على App Store وPlay Store.",
      ],
    },
  },
];

// Detail (featured) slugs — single source for generateStaticParams + route guards.
export const detailSlugs = projects.filter((p) => p.detail).map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

// Build-time integrity guard: fails the build with a clear message on a malformed edit.
(() => {
  const seen = new Set<string>();
  const locales: Locale[] = ["en", "de", "ar"];
  for (const p of projects) {
    if (!/^[a-z0-9-]+$/.test(p.slug)) throw new Error(`projects.ts: invalid slug "${p.slug}"`);
    if (seen.has(p.slug)) throw new Error(`projects.ts: duplicate slug "${p.slug}"`);
    seen.add(p.slug);
    for (const l of locales) {
      if (!p.title[l] || !p.tagline[l] || !p.role[l]) throw new Error(`projects.ts: "${p.slug}" missing title/tagline/role for "${l}"`);
      if (p.stack[l].length === 0) throw new Error(`projects.ts: "${p.slug}" empty stack for "${l}"`);
      if (p.detail && (!p.summary[l] || p.highlights[l].length === 0)) throw new Error(`projects.ts: featured "${p.slug}" needs summary + highlights for "${l}"`);
    }
  }
})();
