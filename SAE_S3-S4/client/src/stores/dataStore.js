const items = [
  {
    id: 'event-hoodie',
    title: 'Pull GP Explorer',
    category: 'merch-evenement',
    price: 59,
    description: 'Hoodie officiel en coton bio avec marquage edition limitee.',
    image: '/img/merch/hoodie.jpg',
    stock: 45,
    tags: ['hoodie']
  },
  {
    id: 'event-cap',
    title: 'Casquette GP Explorer',
    category: 'merch-evenement',
    price: 29,
    description: 'Casquette incurvee brodee, taille ajustable, logo GPX.',
    image: '/img/merch/cap.jpg',
    stock: 78,
    tags: ['casquette']
  },
  {
    id: 'event-goodies-pack',
    title: 'Pack Goodies GPX',
    category: 'merch-evenement',
    price: 22,
    description: 'Lanyard, stickers, pins metal et carte collector.',
    image: '/img/merch/goodies.jpg',
    stock: 120,
    tags: ['goodies']
  },
  {
    id: 'event-poster',
    title: 'Affiche officielle GP Explorer',
    category: 'merch-evenement',
    price: 15,
    description: 'Poster A2 edition 2024 imprime sur papier premium.',
    image: '/img/merch/poster.jpg',
    stock: 200,
    tags: ['affiche']
  },
  {
    id: 'event-bottle',
    title: 'Gourde inox GPX',
    category: 'merch-evenement',
    price: 19,
    description: 'Bouteille isotherme 500ml double paroi, finition mate.',
    image: '/img/merch/bottle.jpg',
    stock: 95,
    tags: ['gourde']
  },
  {
    id: 'team-1-flag',
    title: 'Igraal - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau Igraal 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-igraal.jpg',
    stock: 32,
    tags: ['drapeau', 'Igraal']
  },
  {
    id: 'team-1-jersey',
    title: 'Igraal - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot Igraal respirant, coupe unisexe.',
    image: '/img/merch/jersey-igraal.jpg',
    stock: 28,
    tags: ['maillot', 'Igraal']
  },
  {
    id: 'team-2-flag',
    title: 'Alpine - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau Alpine 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-alpine.jpg',
    stock: 45,
    tags: ['drapeau', 'Alpine']
  },
  {
    id: 'team-2-jersey',
    title: 'Alpine - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot Alpine respirant, coupe unisexe.',
    image: '/img/merch/jersey-alpine.jpg',
    stock: 38,
    tags: ['maillot', 'Alpine']
  },
  {
    id: 'team-3-flag',
    title: 'MWII Racing Team - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau MWII Racing Team 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-mwii.jpg',
    stock: 41,
    tags: ['drapeau', 'MWII Racing Team']
  },
  {
    id: 'team-3-jersey',
    title: 'MWII Racing Team - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot MWII Racing Team respirant, coupe unisexe.',
    image: '/img/merch/jersey-mwii.jpg',
    stock: 35,
    tags: ['maillot', 'MWII Racing Team']
  },
  {
    id: 'team-4-flag',
    title: 'NordVPN - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau NordVPN 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-nordvpn.jpg',
    stock: 52,
    tags: ['drapeau', 'NordVPN']
  },
  {
    id: 'team-4-jersey',
    title: 'NordVPN - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot NordVPN respirant, coupe unisexe.',
    image: '/img/merch/jersey-nordvpn.jpg',
    stock: 44,
    tags: ['maillot', 'NordVPN']
  },
  {
    id: 'team-5-flag',
    title: 'Black Adam - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau Black Adam 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-blackadam.jpg',
    stock: 38,
    tags: ['drapeau', 'Black Adam']
  },
  {
    id: 'team-5-jersey',
    title: 'Black Adam - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot Black Adam respirant, coupe unisexe.',
    image: '/img/merch/jersey-blackadam.jpg',
    stock: 31,
    tags: ['maillot', 'Black Adam']
  },
  {
    id: 'team-6-flag',
    title: 'Cupra Team Pax - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau Cupra Team Pax 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-cupra.jpg',
    stock: 29,
    tags: ['drapeau', 'Cupra Team Pax']
  },
  {
    id: 'team-6-jersey',
    title: 'Cupra Team Pax - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot Cupra Team Pax respirant, coupe unisexe.',
    image: '/img/merch/jersey-cupra.jpg',
    stock: 26,
    tags: ['maillot', 'Cupra Team Pax']
  },
  {
    id: 'team-7-flag',
    title: 'Fruitz - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau Fruitz 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-fruitz.jpg',
    stock: 47,
    tags: ['drapeau', 'Fruitz']
  },
  {
    id: 'team-7-jersey',
    title: 'Fruitz - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot Fruitz respirant, coupe unisexe.',
    image: '/img/merch/jersey-fruitz.jpg',
    stock: 39,
    tags: ['maillot', 'Fruitz']
  },
  {
    id: 'team-8-flag',
    title: 'Rhinoshield - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau Rhinoshield 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-rhinoshield.jpg',
    stock: 55,
    tags: ['drapeau', 'Rhinoshield']
  },
  {
    id: 'team-8-jersey',
    title: 'Rhinoshield - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot Rhinoshield respirant, coupe unisexe.',
    image: '/img/merch/jersey-rhinoshield.jpg',
    stock: 42,
    tags: ['maillot', 'Rhinoshield']
  },
  {
    id: 'team-9-flag',
    title: 'PUBG Mobile - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau PUBG Mobile 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-pubg.jpg',
    stock: 36,
    tags: ['drapeau', 'PUBG Mobile']
  },
  {
    id: 'team-9-jersey',
    title: 'PUBG Mobile - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot PUBG Mobile respirant, coupe unisexe.',
    image: '/img/merch/jersey-pubg.jpg',
    stock: 33,
    tags: ['maillot', 'PUBG Mobile']
  },
  {
    id: 'team-10-flag',
    title: 'Oscaro - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau Oscaro 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-oscaro.jpg',
    stock: 50,
    tags: ['drapeau', 'Oscaro']
  },
  {
    id: 'team-10-jersey',
    title: 'Oscaro - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot Oscaro respirant, coupe unisexe.',
    image: '/img/merch/jersey-oscaro.jpg',
    stock: 40,
    tags: ['maillot', 'Oscaro']
  },
  {
    id: 'team-11-flag',
    title: 'World of Tanks - Drapeau',
    category: 'merch-equipe',
    price: 24,
    description: 'Drapeau World of Tanks 90x60cm, pret a agiter en tribune!',
    image: '/img/merch/flag-wot.jpg',
    stock: 43,
    tags: ['drapeau', 'World of Tanks']
  },
  {
    id: 'team-11-jersey',
    title: 'World of Tanks - Maillot officiel',
    category: 'merch-equipe',
    price: 69,
    description: 'Maillot World of Tanks respirant, coupe unisexe.',
    image: '/img/merch/jersey-wot.jpg',
    stock: 37,
    tags: ['maillot', 'World of Tanks']
  }
]

export { items }
