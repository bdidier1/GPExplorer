// Base de données simulée pour les utilisateurs GP Explorer
// Structure MongoDB avec collections séparées

// ========================================
// COLLECTION : USERS
// ========================================
let users = [
  // UTILISATEURS STANDARD
  {"_id":"64gpx001","username":"user","password":"user123","email":"user@gpexplorer.com","role":"user","firstName":"Jean","lastName":"Dupont","phone":"+33 6 12 34 56 78","isActive":true,"createdAt":{"$date":"2024-01-15T10:30:00.000Z"}},
  {"_id":"64gpx002","username":"marie.martin","password":"marie456","email":"marie.martin@email.fr","role":"user","firstName":"Marie","lastName":"Martin","phone":"+33 6 23 45 67 89","isActive":true,"createdAt":{"$date":"2024-02-20T14:20:00.000Z"}},

  // PRESTATAIRES
  {"_id":"64gpx101","username":"playseat","password":"playseat2024","email":"contact@playseat.com","role":"provider","companyName":"Playseat","category":"gaming","contactPerson":"Pierre Leclerc","phone":"+33 1 23 45 67 89","isActive":true,"createdAt":{"$date":"2023-11-01T08:00:00.000Z"}},
  {"_id":"64gpx102","username":"ciaokombucha","password":"ciao2024","email":"contact@ciaokombucha.fr","role":"provider","companyName":"Ciao Kombucha","category":"beverages","contactPerson":"Sophie Dubois","phone":"+33 1 34 56 78 90","isActive":true,"createdAt":{"$date":"2023-11-05T10:15:00.000Z"}},
  {"_id":"64gpx103","username":"sodikart","password":"sodikart2024","email":"pro@sodikart.com","role":"provider","companyName":"Sodikart","category":"karting","contactPerson":"Julien Rousseau","phone":"+33 1 45 67 89 01","isActive":true,"createdAt":{"$date":"2023-11-10T14:30:00.000Z"}},
  {"_id":"64gpx104","username":"decathlon","password":"decathlon2024","email":"event@decathlon.fr","role":"provider","companyName":"Decathlon","category":"camping","contactPerson":"Laura Petit","phone":"+33 1 56 78 90 12","isActive":true,"createdAt":{"$date":"2023-11-12T09:00:00.000Z"}},
  {"_id":"64gpx105","username":"burgouzz","password":"burgouzz2024","email":"contact@burgouzz.fr","role":"provider","companyName":"Burgouzz","category":"food","contactPerson":"Antoine Moreau","phone":"+33 1 67 89 01 23","isActive":true,"createdAt":{"$date":"2023-11-15T11:45:00.000Z"}},
  {"_id":"64gpx106","username":"deezer","password":"deezer2024","email":"pro@deezer.com","role":"provider","companyName":"Deezer","category":"music","contactPerson":"Emma Laurent","phone":"+33 1 78 90 12 34","isActive":true,"createdAt":{"$date":"2023-11-18T16:20:00.000Z"}},

  // ORGANISATEURS (ADMIN)
  {"_id":"64gpx201","username":"admin","password":"admin2024","email":"admin@gpexplorer.com","role":"organizer","firstName":"Emma","lastName":"Durand","position":"Directeur Événementiel","phone":"+33 1 89 01 23 45","isActive":true,"createdAt":{"$date":"2023-10-01T08:00:00.000Z"}},
  {"_id":"64gpx202","username":"coordination","password":"coord2024","email":"coordination@gpexplorer.com","role":"organizer","firstName":"Camille","lastName":"Lefebvre","position":"Coordinateur Logistique","phone":"+33 1 90 12 34 56","isActive":true,"createdAt":{"$date":"2023-10-05T09:30:00.000Z"}},
  {"_id":"64gpx203","username":"billetterie","password":"ticket2024","email":"billetterie@gpexplorer.com","role":"organizer","firstName":"Lucas","lastName":"Garnier","position":"Responsable Billetterie","phone":"+33 1 01 23 45 67","isActive":true,"createdAt":{"$date":"2023-10-10T10:00:00.000Z"}},
];

// ========================================
// COLLECTION : SESSIONS
// ========================================
let sessions = [
  {"_id":"64gpxs001","userId":"64gpx201","sessionToken":"550e8400-e29b-41d4-a716-446655440000","createdAt":{"$date":"2024-01-15T10:00:00.000Z"},"expiresAt":{"$date":"2025-01-15T10:00:00.000Z"},"isActive":true},
  {"_id":"64gpxs002","userId":"64gpx001","sessionToken":"6ba7b810-9dad-11d1-80b4-00c04fd430c8","createdAt":{"$date":"2024-01-15T11:30:00.000Z"},"expiresAt":{"$date":"2025-01-15T11:30:00.000Z"},"isActive":true},
  {"_id":"64gpxs003","userId":"64gpx101","sessionToken":"7c9e8d20-1e2f-33g3-91c5-11d15ge541d9","createdAt":{"$date":"2024-01-14T14:20:00.000Z"},"expiresAt":{"$date":"2025-01-14T14:20:00.000Z"},"isActive":false},
];

// ========================================
// COLLECTION : LOGIN_ATTEMPTS
// ========================================
let loginAttempts = [
  {"_id":"64gpxl001","username":"admin@gpexplorer.com","success":true,"ipAddress":"192.168.1.100","userAgent":"Mozilla/5.0","timestamp":{"$date":"2024-01-15T10:00:00.000Z"}},
  {"_id":"64gpxl002","username":"admin@gpexplorer.com","success":false,"ipAddress":"192.168.1.101","userAgent":"Mozilla/5.0","timestamp":{"$date":"2024-01-15T09:45:00.000Z"},"reason":"wrong_password"},
  {"_id":"64gpxl003","username":"user@gpexplorer.com","success":true,"ipAddress":"192.168.1.102","userAgent":"Chrome/118.0","timestamp":{"$date":"2024-01-15T11:30:00.000Z"}},
  {"_id":"64gpxl004","username":"contact@playseat.com","success":true,"ipAddress":"192.168.1.103","userAgent":"Firefox/120.0","timestamp":{"$date":"2024-01-14T14:20:00.000Z"}},
  {"_id":"64gpxl005","username":"unknown@test.com","success":false,"ipAddress":"192.168.1.104","userAgent":"Safari/17.0","timestamp":{"$date":"2024-01-14T16:45:00.000Z"},"reason":"user_not_found"},
];

// ========================================
// COLLECTION : PERMISSIONS
// ========================================
let permissions = [
  {"_id":"64gpxp001","userId":"64gpx201","resource":"admin_panel","action":"read","granted":true},
  {"_id":"64gpxp002","userId":"64gpx201","resource":"user_management","action":"write","granted":true},
  {"_id":"64gpxp003","userId":"64gpx202","resource":"event_management","action":"read","granted":true},
  {"_id":"64gpxp004","userId":"64gpx202","resource":"event_management","action":"write","granted":true},
];

// ========================================
// COLLECTION : USER_PROFILES
// ========================================
let userProfiles = [
  {"_id":"64gpxu001","userId":"64gpx001","avatar":null,"bio":"Passionné de F1","preferences":{"theme":"light","language":"fr","notifications":true},"lastLogin":{"$date":"2024-01-15T11:30:00.000Z"}},
  {"_id":"64gpxu002","userId":"64gpx002","avatar":null,"bio":"Amatrice de courses automobiles","preferences":{"theme":"light","language":"fr","notifications":false},"lastLogin":{"$date":"2024-02-20T14:20:00.000Z"}},
  {"_id":"64gpxu101","userId":"64gpx101","avatar":null,"bio":"Spécialiste simulation F1","preferences":{"theme":"dark","language":"fr","notifications":true},"lastLogin":{"$date":"2024-01-14T14:20:00.000Z"}},
  {"_id":"64gpxu201","userId":"64gpx201","avatar":null,"bio":"Administrateur système GP Explorer","preferences":{"theme":"dark","language":"fr","notifications":true},"lastLogin":{"$date":"2024-01-15T10:00:00.000Z"}},
];

// ========================================
// COLLECTION : TICKETS (Festival 8-10 octobre 2026)
// ========================================
let tickets = [
  // PASSES FESTIVAL & MULTI-JOURS
  {"_id":"66fest001","id":"PASS-DAY-08","segment":"grand_prix","name":"Pass Journée - Jeudi 8 oct","category":"general","variant":"day","price":65.00,"date":"2026-10-08","description":"Accès complet au site et aux scènes le 8 octobre 2026","available":5100,"reserved":0,"totalStock":6000,"isActive":true},
  {"_id":"66fest002","id":"PASS-DAY-09","segment":"grand_prix","name":"Pass Journée - Vendredi 9 oct","category":"general","variant":"day","price":72.00,"date":"2026-10-09","description":"Accès complet au site et aux scènes le 9 octobre 2026","available":5300,"reserved":0,"totalStock":6500,"isActive":true},
  {"_id":"66fest003","id":"PASS-DAY-10","segment":"grand_prix","name":"Pass Journée - Samedi 10 oct","category":"general","variant":"day","price":70.00,"date":"2026-10-10","description":"Accès complet au site et aux scènes le 10 octobre 2026","available":5100,"reserved":0,"totalStock":6200,"isActive":true},
  {"_id":"66fest004","id":"PASS-2J-89","segment":"grand_prix","name":"Pass 2 jours - 8 & 9 oct","category":"general","variant":"weekend","price":120.00,"date":"2026-10-08","description":"Accès festival sur deux jours (8 et 9 octobre)","available":2600,"reserved":0,"totalStock":4000,"isActive":true},
  {"_id":"66fest005","id":"PASS-2J-910","segment":"grand_prix","name":"Pass 2 jours - 9 & 10 oct","category":"general","variant":"weekend","price":125.00,"date":"2026-10-09","description":"Accès festival sur deux jours (9 et 10 octobre)","available":2500,"reserved":0,"totalStock":3800,"isActive":true},
  {"_id":"66fest006","id":"PASS-3J-810","segment":"grand_prix","name":"Pass 3 jours - 8, 9, 10 oct","category":"general","variant":"event","price":165.00,"date":"2026-10-08","description":"Pass intégral pour les trois jours du festival","available":1700,"reserved":0,"totalStock":2600,"isActive":true},
  {"_id":"66fest007","id":"PASS-TRIB-2J","segment":"grand_prix","name":"Pass Tribune 2 jours","category":"tribune","variant":"weekend","price":189.00,"date":"2026-10-08","description":"Accès tribunes réservées pendant deux jours","available":820,"reserved":0,"totalStock":1200,"isActive":true},
  {"_id":"66fest008","id":"VIP-2J-89","segment":"grand_prix","name":"VIP 2 jours - 8 & 9 oct","category":"vip","variant":"weekend","price":240.00,"date":"2026-10-08","description":"Salon VIP, restauration premium et accès prioritaire sur 2 jours","available":470,"reserved":0,"totalStock":650,"isActive":true},
  {"_id":"66fest009","id":"VIP-3J-810","segment":"grand_prix","name":"VIP 3 jours - 8, 9, 10 oct","category":"vip","variant":"event","price":340.00,"date":"2026-10-08","description":"Hospitalité VIP complète durant tout le festival","available":370,"reserved":0,"totalStock":520,"isActive":true},

  // CONCERT (Placement & dates)
  {"_id":"66conc001","id":"CONCERT-GEN-08","segment":"concert","name":"Concert - Pelouse libre (8 oct)","category":"general","variant":"day","price":54.00,"date":"2026-10-08","description":"Accès concert du 8/10 en pelouse libre","available":3000,"reserved":0,"totalStock":4500,"isActive":true},
  {"_id":"66conc002","id":"CONCERT-GEN-09","segment":"concert","name":"Concert - Pelouse libre (9 oct)","category":"general","variant":"day","price":59.00,"date":"2026-10-09","description":"Accès concert du 9/10 en pelouse libre","available":3200,"reserved":0,"totalStock":4800,"isActive":true},
  {"_id":"66conc003","id":"CONCERT-GEN-10","segment":"concert","name":"Concert - Pelouse libre (10 oct)","category":"general","variant":"day","price":57.00,"date":"2026-10-10","description":"Accès concert du 10/10 en pelouse libre","available":3000,"reserved":0,"totalStock":4700,"isActive":true},
  {"_id":"66conc004","id":"CONCERT-GOLD-08","segment":"concert","name":"Concert - Golden Circle (8 oct)","category":"tribune","variant":"day","price":92.00,"date":"2026-10-08","description":"Zone Golden Circle avec entrée prioritaire le 8 octobre","available":1120,"reserved":0,"totalStock":1600,"isActive":true},
  {"_id":"66conc005","id":"CONCERT-GOLD-09","segment":"concert","name":"Concert - Golden Circle (9 oct)","category":"tribune","variant":"day","price":99.00,"date":"2026-10-09","description":"Zone Golden Circle avec entrée prioritaire le 9 octobre","available":1190,"reserved":0,"totalStock":1700,"isActive":true},
  {"_id":"66conc006","id":"CONCERT-GOLD-10","segment":"concert","name":"Concert - Golden Circle (10 oct)","category":"tribune","variant":"day","price":95.00,"date":"2026-10-10","description":"Zone Golden Circle avec entrée prioritaire le 10 octobre","available":1170,"reserved":0,"totalStock":1700,"isActive":true},
  {"_id":"66conc007","id":"CONCERT-PRESTIGE-08","segment":"concert","name":"Concert - Carré Prestige (8 oct)","category":"vip","variant":"day","price":149.00,"date":"2026-10-08","description":"Carré Prestige, coupe-file et lounge le 8 octobre","available":440,"reserved":0,"totalStock":650,"isActive":true},
  {"_id":"66conc008","id":"CONCERT-PRESTIGE-09","segment":"concert","name":"Concert - Carré Prestige (9 oct)","category":"vip","variant":"day","price":159.00,"date":"2026-10-09","description":"Carré Prestige, coupe-file et lounge le 9 octobre","available":470,"reserved":0,"totalStock":700,"isActive":true},
  {"_id":"66conc009","id":"CONCERT-PRESTIGE-10","segment":"concert","name":"Concert - Carré Prestige (10 oct)","category":"vip","variant":"day","price":155.00,"date":"2026-10-10","description":"Carré Prestige, coupe-file et lounge le 10 octobre","available":450,"reserved":0,"totalStock":700,"isActive":true},

  // KARTING (sessions datées)
  {"_id":"66kart001","id":"KART-CHRONO-08","segment":"karting","name":"Karting Chrono 12 min (8 oct)","category":"karting","variant":"session","price":36.00,"date":"2026-10-08","description":"Session chronométrée 12 minutes - classement live","available":125,"reserved":0,"totalStock":160,"isActive":true},
  {"_id":"66kart002","id":"KART-CHRONO-09","segment":"karting","name":"Karting Chrono 12 min (9 oct)","category":"karting","variant":"session","price":39.00,"date":"2026-10-09","description":"Session chronométrée 12 minutes - classement live","available":130,"reserved":0,"totalStock":170,"isActive":true},
  {"_id":"66kart003","id":"KART-CHRONO-10","segment":"karting","name":"Karting Chrono 12 min (10 oct)","category":"karting","variant":"session","price":39.00,"date":"2026-10-10","description":"Session chronométrée 12 minutes - classement live","available":125,"reserved":0,"totalStock":170,"isActive":true},
  {"_id":"66kart004","id":"KART-ENDUR-08","segment":"karting","name":"Karting Endurance 40 min (8 oct)","category":"karting","variant":"session_long","price":92.00,"date":"2026-10-08","description":"Relais endurance 40 minutes par équipes","available":42,"reserved":0,"totalStock":60,"isActive":true},
  {"_id":"66kart005","id":"KART-ENDUR-09","segment":"karting","name":"Karting Endurance 40 min (9 oct)","category":"karting","variant":"session_long","price":96.00,"date":"2026-10-09","description":"Relais endurance 40 minutes par équipes","available":40,"reserved":0,"totalStock":60,"isActive":true},
  {"_id":"66kart006","id":"KART-ENDUR-10","segment":"karting","name":"Karting Endurance 40 min (10 oct)","category":"karting","variant":"session_long","price":96.00,"date":"2026-10-10","description":"Relais endurance 40 minutes par équipes","available":38,"reserved":0,"totalStock":60,"isActive":true},
  {"_id":"66kart007","id":"KART-FAMILY-08","segment":"karting","name":"Karting Découverte Junior (8 oct)","category":"karting","variant":"family","price":28.00,"date":"2026-10-08","description":"Session découverte accompagnée pour les plus jeunes","available":80,"reserved":0,"totalStock":110,"isActive":true},
  {"_id":"66kart008","id":"KART-FAMILY-09","segment":"karting","name":"Karting Découverte Junior (9 oct)","category":"karting","variant":"family","price":28.00,"date":"2026-10-09","description":"Session découverte accompagnée pour les plus jeunes","available":78,"reserved":0,"totalStock":110,"isActive":true},
  {"_id":"66kart009","id":"KART-FAMILY-10","segment":"karting","name":"Karting Découverte Junior (10 oct)","category":"karting","variant":"family","price":28.00,"date":"2026-10-10","description":"Session découverte accompagnée pour les plus jeunes","available":76,"reserved":0,"totalStock":110,"isActive":true},

  // PLAYSEAT (Simulation F1)
  {"_id":"66play001","id":"PLAY-60-08","segment":"playseat","name":"Playseat Relais F1 60 min (8 oct)","category":"simulation","variant":"experience","price":58.00,"date":"2026-10-08","description":"Créneau d'une heure sur simulateur officiel Playseat","available":55,"reserved":0,"totalStock":70,"isActive":true},
  {"_id":"66play002","id":"PLAY-60-09","segment":"playseat","name":"Playseat Relais F1 60 min (9 oct)","category":"simulation","variant":"experience","price":58.00,"date":"2026-10-09","description":"Créneau d'une heure sur simulateur officiel Playseat","available":52,"reserved":0,"totalStock":70,"isActive":true},
  {"_id":"66play003","id":"PLAY-60-10","segment":"playseat","name":"Playseat Relais F1 60 min (10 oct)","category":"simulation","variant":"experience","price":58.00,"date":"2026-10-10","description":"Créneau d'une heure sur simulateur officiel Playseat","available":50,"reserved":0,"totalStock":70,"isActive":true},
  {"_id":"66play004","id":"PLAY-SHOOT-08","segment":"playseat","name":"Playseat Shootout Qualif (8 oct)","category":"simulation","variant":"experience","price":42.00,"date":"2026-10-08","description":"Tentative chronométrée avec coaching et classement live","available":100,"reserved":0,"totalStock":130,"isActive":true},
  {"_id":"66play005","id":"PLAY-SHOOT-09","segment":"playseat","name":"Playseat Shootout Qualif (9 oct)","category":"simulation","variant":"experience","price":42.00,"date":"2026-10-09","description":"Tentative chronométrée avec coaching et classement live","available":96,"reserved":0,"totalStock":130,"isActive":true},
  {"_id":"66play006","id":"PLAY-SHOOT-10","segment":"playseat","name":"Playseat Shootout Qualif (10 oct)","category":"simulation","variant":"experience","price":42.00,"date":"2026-10-10","description":"Tentative chronométrée avec coaching et classement live","available":94,"reserved":0,"totalStock":130,"isActive":true},

  // BURGOUZZ (restauration)
  {"_id":"66food001","id":"FOOD-MENU-08","segment":"food","name":"Menu Burgouzz Fast Track (8 oct)","category":"burger","variant":"combo","price":22.00,"date":"2026-10-08","description":"Burger signature + boisson - retrait prioritaire","available":330,"reserved":0,"totalStock":450,"isActive":true},
  {"_id":"66food002","id":"FOOD-MENU-09","segment":"food","name":"Menu Burgouzz Fast Track (9 oct)","category":"burger","variant":"combo","price":22.00,"date":"2026-10-09","description":"Burger signature + boisson - retrait prioritaire","available":310,"reserved":0,"totalStock":450,"isActive":true},
  {"_id":"66food003","id":"FOOD-MENU-10","segment":"food","name":"Menu Burgouzz Fast Track (10 oct)","category":"burger","variant":"combo","price":22.00,"date":"2026-10-10","description":"Burger signature + boisson - retrait prioritaire","available":300,"reserved":0,"totalStock":450,"isActive":true},
  {"_id":"66food004","id":"FOOD-BRUNCH-09","segment":"food","name":"Brunch Burgouzz (9 oct)","category":"burger","variant":"pack","price":28.00,"date":"2026-10-09","description":"Brunch assis avec service prioritaire","available":160,"reserved":0,"totalStock":220,"isActive":true},
  {"_id":"66food005","id":"FOOD-BRUNCH-10","segment":"food","name":"Brunch Burgouzz (10 oct)","category":"burger","variant":"pack","price":28.00,"date":"2026-10-10","description":"Brunch assis avec service prioritaire","available":155,"reserved":0,"totalStock":220,"isActive":true},

  // BOISSONS
  {"_id":"66drink001","id":"DRINK-PASS-08","segment":"beverage","name":"Pass dégustation boissons (8 oct)","category":"drink","variant":"pack","price":19.00,"date":"2026-10-08","description":"4 boissons artisanales à retirer le 8 octobre","available":240,"reserved":0,"totalStock":320,"isActive":true},
  {"_id":"66drink002","id":"DRINK-PASS-09","segment":"beverage","name":"Pass dégustation boissons (9 oct)","category":"drink","variant":"pack","price":19.00,"date":"2026-10-09","description":"4 boissons artisanales à retirer le 9 octobre","available":230,"reserved":0,"totalStock":320,"isActive":true},
  {"_id":"66drink003","id":"DRINK-PASS-10","segment":"beverage","name":"Pass dégustation boissons (10 oct)","category":"drink","variant":"pack","price":19.00,"date":"2026-10-10","description":"4 boissons artisanales à retirer le 10 octobre","available":225,"reserved":0,"totalStock":320,"isActive":true},
  {"_id":"66drink004","id":"DRINK-REFILL-08","segment":"beverage","name":"Refill illimité 4h (8 oct)","category":"drink","variant":"session","price":28.00,"date":"2026-10-08","description":"Gourde fournie + recharges illimitées pendant 4h","available":115,"reserved":0,"totalStock":160,"isActive":true},
  {"_id":"66drink005","id":"DRINK-REFILL-09","segment":"beverage","name":"Refill illimité 4h (9 oct)","category":"drink","variant":"session","price":28.00,"date":"2026-10-09","description":"Gourde fournie + recharges illimitées pendant 4h","available":110,"reserved":0,"totalStock":160,"isActive":true},
  {"_id":"66drink006","id":"DRINK-REFILL-10","segment":"beverage","name":"Refill illimité 4h (10 oct)","category":"drink","variant":"session","price":28.00,"date":"2026-10-10","description":"Gourde fournie + recharges illimitées pendant 4h","available":108,"reserved":0,"totalStock":160,"isActive":true},

  // CAMPING & LOGISTIQUE
  {"_id":"66camp001","id":"CAMP-KIT-2P-3J","segment":"decathlon","name":"Kit camping 2 pers (3 jours)","category":"rental","variant":"location","price":95.00,"date":"2026-10-08","description":"Tente, matelas et éclairage pour 3 jours","available":120,"reserved":0,"totalStock":180,"isActive":true},
  {"_id":"66camp002","id":"CAMP-KIT-4P-3J","segment":"decathlon","name":"Kit camping 4 pers (3 jours)","category":"rental","variant":"location","price":149.00,"date":"2026-10-08","description":"Pack familial 4 personnes pour 3 jours","available":60,"reserved":0,"totalStock":90,"isActive":true},
  {"_id":"66camp003","id":"CAMP-LOCKER-08","segment":"decathlon","name":"Casier sécurisé journalier (8 oct)","category":"rental","variant":"location","price":15.00,"date":"2026-10-08","description":"Casier équipé + recharge électrique pour le 8 octobre","available":130,"reserved":0,"totalStock":200,"isActive":true},
  {"_id":"66camp004","id":"CAMP-LOCKER-09","segment":"decathlon","name":"Casier sécurisé journalier (9 oct)","category":"rental","variant":"location","price":15.00,"date":"2026-10-09","description":"Casier équipé + recharge électrique pour le 9 octobre","available":125,"reserved":0,"totalStock":200,"isActive":true},
  {"_id":"66camp005","id":"CAMP-LOCKER-10","segment":"decathlon","name":"Casier sécurisé journalier (10 oct)","category":"rental","variant":"location","price":15.00,"date":"2026-10-10","description":"Casier équipé + recharge électrique pour le 10 octobre","available":120,"reserved":0,"totalStock":200,"isActive":true},
  {"_id":"66camp006","id":"CAMP-CARAVAN-3J","segment":"decathlon","name":"Emplacement caravane (3 jours)","category":"rental","variant":"location","price":189.00,"date":"2026-10-08","description":"Emplacement réservé caravane pour 3 jours avec branchement","available":45,"reserved":0,"totalStock":70,"isActive":true},

  // CASHLESS
  {"_id":"66cash001","id":"CASHLESS-START-08","segment":"cashless","name":"Cashless préchargé 50€ (8 oct)","category":"cashless","variant":"credit","price":50.00,"date":"2026-10-08","description":"Bracelet cashless chargé de 50€ pour le 8 octobre","available":1400,"reserved":0,"totalStock":2000,"isActive":true},
  {"_id":"66cash002","id":"CASHLESS-BOOST-3J","segment":"cashless","name":"Cashless boost 120€ (3 jours)","category":"cashless","variant":"credit","price":120.00,"date":"2026-10-08","description":"Crédit cashless valable sur l'ensemble des 3 jours","available":750,"reserved":0,"totalStock":1200,"isActive":true},
  {"_id":"66cash003","id":"CASHLESS-FAM-3J","segment":"cashless","name":"Cashless famille 200€ (3 jours)","category":"cashless","variant":"credit","price":200.00,"date":"2026-10-08","description":"Pack cashless famille pour toutes les dépenses du festival","available":350,"reserved":0,"totalStock":600,"isActive":true}
];

// ========================================
// EXPORTS
// ========================================
export {
  users,
  sessions,
  loginAttempts,
  permissions,
  userProfiles,
  tickets,
};
