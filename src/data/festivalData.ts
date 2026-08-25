import { Activity, Guest, GalleryItem } from '../types';

export const FESTIVAL_INFO = {
  name: 'JAMBO FESTIVAL 2026',
  edition: '3e édition',
  slogan: '« Pesa tourisme ya mboka chance ! »',
  mainTagline: '« À la découverte des richesses naturelles, culturelles et touristiques de la République démocratique du Congo. »',
  secondaryTagline: '« Faire du tourisme de notre pays une pépite. »',
  heroClosingTagline: '« JAMBO Festival, plus qu\'un événement : une vitrine du tourisme congolais et une invitation à porter l\'image de la RDC plus loin ! »',
  creationYear: '2024',
  dates: {
    day1: '18 Octobre 2026',
    day2: '24 Octobre 2026',
    summary: '18 & 24 OCTOBRE 2026',
    isoDay1: '2026-10-18T08:00:00+01:00',
  },
  location: {
    country: 'République démocratique du Congo',
    mainCity: 'Kinshasa',
    day1Venue: 'Musée national de la RDC (Kinshasa)',
    day2Venue: 'Amani Eco-Park, Mitendi (Kinshasa)',
  },
  contact: {
    email: 'contact@jambofestival.cd',
    phone: '+243 81 000 2026 / +243 99 000 2026',
    address: 'Boulevard Triomphal, Kinshasa, RDC',
  },
  mission: 'Innover dans le secteur du tourisme grâce à des initiatives favorisant l\'insertion professionnelle, la formation et la valorisation des métiers de l\'accueil.',
  vision: 'Créer des opportunités d\'emploi, favoriser l\'insertion professionnelle et contribuer à l\'autonomisation des femmes à travers le tourisme.',
  values: [
    { title: 'Professionnalisme', desc: 'Rigueur et excellence dans l\'exécution des métiers de l\'accueil et du guidage.' },
    { title: 'Inclusion', desc: 'Accessibilité et participation active de toutes les couches de la société congolaise.' },
    { title: 'Respect de l\'environnement', desc: 'Pratique de l\'écotourisme durable et protection de la biodiversité.' },
    { title: 'Promotion du patrimoine', desc: 'Mise en lumière des trésors historiques, culturels et naturels de la RDC.' },
    { title: 'Leadership féminin', desc: 'Autonomisation et valorisation des femmes actrices du tourisme.' },
    { title: 'Innovation', desc: 'Développement de nouvelles approches pour dynamiser le tourisme local.' },
  ],
  pricing: {
    standard: {
      type: 'STANDARD' as const,
      price: 15,
      currency: 'USD',
      validity: 'Valable UNIQUEMENT le 18 octobre 2026',
      features: [
        'Accès complet à la journée du 18 octobre 2026',
        'Accès à l\'exposition au Musée national de la RDC',
        'Participation aux panels & ateliers thématiques',
        'Accès à l\'espace networking et rencontres',
        'Billet numérique nominatif avec QR Code sécurisé',
      ],
    },
    vip: {
      type: 'VIP' as const,
      price: 25,
      currency: 'USD',
      validity: 'Valable UNIQUEMENT le 18 octobre 2026',
      features: [
        'Accès VIP privilégié à la journée du 18 octobre 2026',
        'Accès à l\'espace VIP Lounge & cocktail de bienvenue',
        'Places réservées au premier rang lors des conférences',
        'Accès prioritaire à l\'exposition au Musée national',
        'Kit festival exclusif & badge collector',
        'Rencontre privilégiée avec les invités et personnalités',
      ],
    },
  },
};

export const OBJECTIVES = [
  {
    id: 'eco-tourisme',
    title: 'Promouvoir l\'écotourisme en RDC',
    description: 'Sensibiliser le grand public et les acteurs économiques à l\'écotourisme responsable et durable au cœur du bassin du Congo.',
    iconName: 'Compass',
  },
  {
    id: 'environnement',
    title: 'Encourager la préservation de l\'environnement',
    description: 'Protéger nos écosystèmes fragiles à travers des gestes concrets et la valorisation des parcs et réserves écologiques congolaises.',
    iconName: 'Trees',
  },
  {
    id: 'metiers-accueil',
    title: 'Valoriser les métiers de l\'accueil',
    description: 'Rehausser les standards de qualité du service, de l\'hôtellerie et du guidage touristique pour offrir un accueil digne de l\'hospitalité congolaise.',
    iconName: 'Award',
  },
  {
    id: 'insertion-femmes',
    title: 'Favoriser l\'insertion des jeunes femmes',
    description: 'Former, certifier et accompagner l\'insertion professionnelle des jeunes femmes dans les carrières florissantes du tourisme.',
    iconName: 'Users',
  },
  {
    id: 'culture-locale',
    title: 'Développer une culture touristique locale',
    description: 'Donner envie aux Congolais et aux résidents de voyager à l\'intérieur de leur propre pays : « Pesa tourisme ya mboka chance ! »',
    iconName: 'HeartHandshake',
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    name: 'Formations spécialisées en accueil & guidage',
    date: '18 Octobre 2026',
    time: 'Horaire à confirmer',
    location: 'Musée national de la RDC',
    description: 'Sessions intensives de renforcement de capacités destinées aux hôtesses, guides touristiques et professionnels de l\'hospitalité.',
    category: 'Formation',
    isConfirmed: true,
    registrationOpen: true,
  },
  {
    id: 'act-2',
    name: 'Cérémonie officielle de remise de brevets',
    date: '18 Octobre 2026',
    time: 'Horaire à confirmer',
    location: 'Musée national de la RDC',
    description: 'Remise solennelle des certificats et brevets de formation professionnelle aux lauréates de l\'édition.',
    category: 'Cérémonie',
    isConfirmed: true,
  },
  {
    id: 'act-3',
    name: 'Espace Networking & Carrefour Professionnel',
    date: '18 Octobre 2026',
    time: 'Horaire à confirmer',
    location: 'Musée national de la RDC',
    description: 'Rencontres B2B, échanges entre agences de voyages, hôteliers, institutions publiques et entrepreneurs touristiques.',
    category: 'Networking',
    isConfirmed: true,
  },
  {
    id: 'act-4',
    name: 'Grande Exposition au Musée national de la RDC',
    date: '18 Octobre 2026',
    time: 'Horaire à confirmer',
    location: 'Musée national de la RDC (Kinshasa)',
    description: 'Immersion dans le patrimoine ancestral, la diversité culturelle et les richesses artistiques des terroirs de la RDC.',
    category: 'Exposition',
    isConfirmed: true,
  },
  {
    id: 'act-5',
    name: 'Rencontres et échanges thématiques',
    date: '18 Octobre 2026',
    time: 'Horaire à confirmer',
    location: 'Musée national de la RDC',
    description: 'Débats et tables rondes sur l\'avenir de l\'écotourisme et les opportunités d\'investissement dans le tourisme congolais.',
    category: 'Échange',
    isConfirmed: true,
  },
  {
    id: 'act-6',
    name: 'Présence des invités et personnalités d\'honneur',
    date: '18 Octobre 2026',
    time: 'Horaire à confirmer',
    location: 'Musée national de la RDC',
    description: 'Allocutions officielles de la Marraine Madame Malicka Mukuba, des représentants de l\'ANADEC, de l\'ONT et du CNJ.',
    category: 'Cérémonie',
    isConfirmed: true,
  },
  {
    id: 'act-7',
    name: 'Grande Randonnée Touristique à Amani Eco-Park',
    date: '24 Octobre 2026',
    time: 'Horaire à confirmer',
    location: 'Amani Eco-Park, Mitendi (Kinshasa)',
    description: 'Journée d\'aventure en plein air, immersion dans la nature préservée, sentiers écologiques et découverte touristique conviviale.',
    category: 'Randonnée',
    isConfirmed: true,
    registrationOpen: true,
  },
];

export const GUESTS: Guest[] = [
  {
    id: 'malicka-mukuba',
    name: 'Madame Malicka Mukuba',
    title: 'Marraine Officielle de la 3e Édition',
    role: 'MARRAINE',
    organization: 'JAMBO Festival 2026',
    bio: 'Personnalité d\'influence engagée pour la valorisation de la culture congolaise, le leadership féminin et la promotion internationale de la destination RDC.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'godefroy-kizaba',
    name: 'Godefroy Kizaba',
    title: 'Directeur Général de l\'ANADEC',
    role: 'INTERVENANT',
    organization: 'ANADEC',
    bio: 'Pionnier de l\'accompagnement entrepreneurial en RDC, artisan du développement des PME touristiques et de l\'innovation chez les jeunes.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'allan-lofoli',
    name: 'Allan Lofoli',
    title: 'Chargé des agences – Province de Kinshasa',
    role: 'INTERVENANT',
    organization: 'Office National du Tourisme (ONT)',
    bio: 'Expert en régulation et promotion des circuits touristiques, engagé pour l\'attractivité et l\'essor du tourisme réceptif en RDC.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'claude-mbuyi',
    name: 'Ir Claude Mbuyi',
    title: 'Président du Conseil National de la Jeunesse (CNJ)',
    role: 'INTERVENANT',
    organization: 'CNJ RDC',
    bio: 'Porte-voix de la jeunesse congolaise pour l\'employabilité, l\'écotourisme citoyen et l\'entrepreneuriat durable.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
  },
];

export const HISTORY_EDITIONS = [
  {
    year: '2024',
    title: 'Création de JAMBO Festival',
    date: 'Année 2024',
    location: 'Kinshasa, RDC',
    description: 'Naissance de l\'initiative visant à innover dans le tourisme congolais et à promouvoir l\'insertion des femmes dans l\'accueil.',
    highlights: [
      'Lancement de la vision « Pesa tourisme ya mboka chance ! »',
      'Structuration des premiers modules de formation en accueil',
      'Mobilisation des premiers partenaires institutionnels',
    ],
  },
  {
    year: '2025',
    title: '2e Édition — Expérience Kinkole',
    date: '15 Mars 2025',
    location: 'Kinkole, Kinshasa',
    description: 'Une édition mémorable qui a consolidé l\'impact du festival auprès de la jeunesse et des acteurs du tourisme.',
    highlights: [
      'Conférence thématique sur l\'écotourisme fluvial',
      'Grande randonnée touristique et visites guidées de sites locaux',
      'Formation professionnelle certifiante des participantes',
      'Remise solennelle de certificats',
      'Insertion directe de lauréates dans des structures touristiques partenaires',
    ],
  },
  {
    year: '2026',
    title: '3e Édition — Consécration & Expansion',
    date: '18 & 24 Octobre 2026',
    location: 'Musée national & Amani Eco-Park Mitendi',
    description: 'La plus grande édition à ce jour, réunissant professionnels, passionnés de nature et personnalités de premier plan.',
    highlights: [
      '18 Octobre : Journée professionnelle au Musée national de la RDC',
      '24 Octobre : Grande randonnée touristique à Amani Eco-Park, Mitendi',
      'Plateforme officielle & billetterie numérique sécurisée par QR Code',
    ],
  },
];

export const EXHIBITION_INFO = {
  title: 'Grande Exposition Culturelle & Touristique',
  date: '18 Octobre 2026',
  location: 'Musée National de la RDC, Kinshasa',
  description: 'Une scénographie immersive présentant le potentiel écotouristique des 26 provinces de la RDC, les œuvres artisanales d\'exception, la mémoire historique et la vitalité créative contemporaine.',
  features: [
    'Pavillon des Parcs Nationaux & Réserves Naturelles',
    'Galerie des Trésors de l\'Artisanat Congolais',
    'Espace Réalité & Circuits Touristiques Régionaux',
    'Rencontres avec les Conservateurs et Médiateurs Culturels',
  ],
};

export const TRANSPORT_INFO = {
  status: 'Informations à venir',
  description: 'L\'organisation communiquera prochainement l\'ensemble des points de rassemblement, navettes dédiées et options de déplacement pour rejoindre les sites du 18 octobre (Musée national) et du 24 octobre (Amani Eco-Park, Mitendi).',
};

export const FAQ_ITEMS = [
  {
    question: 'Le billet du 18 octobre donne-t-il accès à la randonnée du 24 octobre ?',
    answer: 'Non. Le billet acheté (Standard 15 USD ou VIP 25 USD) est valable UNIQUEMENT pour la journée du 18 octobre 2026 au Musée national de la RDC. La randonnée du 24 octobre à Amani Eco-Park est une activité distincte avec réservation indépendante.',
  },
  {
    question: 'Où se déroule la journée du 18 octobre 2026 ?',
    answer: 'La journée professionnelle, culturelle et touristique du 18 octobre se tient au Musée national de la RDC, situé sur le Boulevard Triomphal à Kinshasa.',
  },
  {
    question: 'Comment récupérer mon billet après l\'achat en ligne ?',
    answer: 'Dès validation de votre paiement en ligne, votre billet numérique officiel s\'affiche instantanément avec son QR Code unique. Vous pouvez le télécharger, l\'imprimer, le recevoir par e-mail et le retrouver à tout moment dans l\'espace « Mon JAMBO » grâce à votre adresse e-mail.',
  },
  {
    question: 'Comment s\'inscrire aux formations d\'hôtesses et guides ?',
    answer: 'Vous pouvez postuler directement via le formulaire de candidature disponible dans la section Formations de ce site web. Les dossiers sont évalués par l\'équipe pédagogique.',
  },
  {
    question: 'Quels sont les moyens de paiement acceptés pour la billetterie ?',
    answer: 'La plateforme intègre le règlement par Mobile Money (M-Pesa, Orange Money, Airtel Money) et cartes bancaires. En mode démonstration sécurisé, la génération du billet officiel est instantanée.',
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Musée national de la RDC — Écrin culturel',
    category: 'Patrimoine',
    src: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    description: 'Lieu d\'accueil de la journée professionnelle du 18 octobre 2026.',
    caption: 'Lieu d\'accueil de la journée professionnelle du 18 octobre 2026.',
    year: '2026',
  },
  {
    id: 'gal-2',
    title: 'Nature verdoyante et parcs écologiques',
    category: 'Randonnées',
    src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    description: 'Aperçu des paysages qui accueilleront la randonnée du 24 octobre à Mitendi.',
    caption: 'Aperçu des paysages qui accueilleront la randonnée du 24 octobre à Mitendi.',
    year: '2026',
  },
  {
    id: 'gal-3',
    title: 'Formation des hôtesses et guides',
    category: 'Formations',
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    description: 'Ateliers pratiques de perfectionnement des métiers de l\'accueil.',
    caption: 'Ateliers pratiques de perfectionnement des métiers de l\'accueil.',
    year: '2025',
  },
  {
    id: 'gal-4',
    title: 'Visite guidée à Kinkole — Édition 2025',
    category: 'Moments forts',
    src: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    description: 'Moments forts de la journée du 15 mars 2025 à Kinkole.',
    caption: 'Moments forts de la journée du 15 mars 2025 à Kinkole.',
    year: '2025',
  },
  {
    id: 'gal-5',
    title: 'Rencontres et échanges professionnels',
    category: 'Écotourisme',
    src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    description: 'Conférences réunissant les leaders de l\'écosystème touristique en RDC.',
    caption: 'Conférences réunissant les leaders de l\'écosystème touristique en RDC.',
    year: '2025',
  },
  {
    id: 'gal-6',
    title: 'Artisanat et trésors artistiques congolais',
    category: 'Patrimoine',
    src: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80',
    description: 'Valorisation des créateurs et des traditions vivantes de notre terroir.',
    caption: 'Valorisation des créateurs et des traditions vivantes de notre terroir.',
    year: '2026',
  },
];
