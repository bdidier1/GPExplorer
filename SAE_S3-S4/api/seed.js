import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { sequelize, User, Provider, ProviderProduct, MapLocation, MapRequest, Ticket, Order, OrderItem, HomeContent, GuestbookEntry, VisitorCount, ContactMessage, ProviderMessage } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DATA_PATH = path.join(__dirname, '..', 'client', 'src', 'data');
const CLIENT_STORES_PATH = path.join(__dirname, '..', 'client', 'src', 'stores');

async function loadData() {
    try {
        console.log('📂 Chargement des fichiers de données...');

        const dataJsPath = path.join(CLIENT_DATA_PATH, 'data.js');
        const dataJs = await import(dataJsPath);

        const mapDataJsPath = path.join(CLIENT_DATA_PATH, 'mapData.js');
        const mapDataJs = await import(mapDataJsPath);

        const providerContentJsPath = path.join(CLIENT_DATA_PATH, 'providerContent.js');
        const providerContentJs = await import(providerContentJsPath);

        const dataStoreJsPath = path.join(CLIENT_STORES_PATH, 'dataStore.js');
        const dataStoreJs = await import(dataStoreJsPath);

        const readJson = (filename) => JSON.parse(fs.readFileSync(path.join(CLIENT_DATA_PATH, filename), 'utf8'));

        const homeContentJson = readJson('home-content.json');
        const ticketsJson = readJson('tickets.json');

        return {
            users: dataJs.users,
            catalogueTickets: dataJs.tickets,
            mapSpots: mapDataJs.vendorSpots,
            providerContent: providerContentJs.providerContent,
            homeContent: homeContentJson,
            soldTickets: ticketsJson,
            shopItems: Array.isArray(dataStoreJs.items) ? dataStoreJs.items : []
        };
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        throw error;
    }
}

async function importHomeContent(homeContent) {
    console.log('🏠 Importation du contenu Home...');
    for (const [lang, content] of Object.entries(homeContent)) {
        await HomeContent.create({
            language: lang,
            title: content.title,
            htmlContent: content.htmlContent,
            imageUrl: content.imageUrl
        });
    }
}

async function importMapSpots(mapSpots) {
    console.log('📍 Importation des emplacements...');
    for (const spot of mapSpots) {
        await MapLocation.create({
            name: spot.label,
            x: null,
            y: null,
            coords: spot.coords || null,
            zone: spot.zone || null,
            description: spot.description || null
        });
    }
}

async function importTicketCatalogue(catalogueTickets) {
    console.log('🎟️ Importation du catalogue billets...');
    for (const t of catalogueTickets) {
        await Ticket.create({
            id: t.id,
            name: t.name,
            segment: t.segment,
            category: t.category,
            variant: t.variant,
            price: t.price,
            date: t.date,
            description: t.description,
            totalStock: t.totalStock,
            sold: t.reserved || 0,
            isActive: t.isActive
        });
    }
}

async function importUsers(users, providerContent, idMap) {
    console.log('👤 Importation des utilisateurs...');
    for (const u of users) {
        const newUser = await User.create({
            username: u.username,
            email: u.email,
            password: await bcrypt.hash(u.password, 12),
            role: u.role,
            firstName: u.firstName || u.contactPerson?.split(' ')[0] || 'Prénom',
            lastName: u.lastName || u.contactPerson?.split(' ')[1] || 'Nom',
            phone: u.phone,
            companyName: u.companyName,
            category: u.category,
            contactPerson: u.contactPerson,
            organization: u.position ? 'GP Explorer Orga' : null,
            position: u.position,
            isActive: u.isActive === undefined ? true : u.isActive,
            qrCodeId: 'qr-' + Math.random().toString(36).slice(2, 10) + '-' + Math.random().toString(36).slice(2, 10)
        });

        idMap.users[u._id] = newUser.id;

        if (u.role !== 'provider') continue;

        const contentKey = u.username.toLowerCase().replaceAll(/\s+/g, '');
        const content = providerContent[contentKey];
        const description = content?.fr?.aboutDescription || 'Description du prestataire';

        const newProvider = await Provider.create({
            userId: newUser.id,
            name: u.companyName || u.username,
            description,
            category: u.category || 'Partenaire',
            contentData: content ? JSON.stringify(content) : null
        });

        idMap.providers[u.username] = newProvider.id;
    }
}

async function importOrders(soldTickets, idMap) {
    console.log(' Importation des commandes existantes...');
    const ordersByUser = {};

    for (const details of soldTickets) {
        const newUserId = idMap.users[details.userId];
        if (!newUserId) continue;
        if (!ordersByUser[newUserId]) {
            ordersByUser[newUserId] = [];
        }
        ordersByUser[newUserId].push(details);
    }

    for (const [userId, items] of Object.entries(ordersByUser)) {
        const firstItem = items[0];
        const order = await Order.create({
            userId,
            email: firstItem.email || 'user@gpexplorer.com',
            status: 'confirmed',
            totalAmount: 0
        });

        let total = 0;
        for (const item of items) {
            const ticketProduct = await Ticket.findByPk(item.ticketId);
            const price = ticketProduct ? ticketProduct.price : 0;

            await OrderItem.create({
                orderId: order.id,
                ticketId: item.ticketId,
                quantity: 1,
                unitPrice: price
            });

            total += Number(price);
        }
        await order.update({ totalAmount: total });
    }
}

async function importShopProducts(shopItems, idMap) {
    console.log('🛍️ Importation des produits boutique...');

    if (!Array.isArray(shopItems) || shopItems.length === 0) {
        console.log('Aucun produit boutique à importer.');
        return;
    }

    const adminUserId = idMap.users['64gpx201'];
    if (!adminUserId) {
        throw new Error('Utilisateur organisateur introuvable pour créer le provider boutique.');
    }

    const shopContentData = {
        fr: {
            pageTitle: 'BOUTIQUE GP EXPLORER',
            titleDescription: 'Boutique officielle du GP Explorer',
            servicesSubtitle: 'La boutique officielle de l\'événement',
            aboutDescription: 'Boutique officielle du GP Explorer',
            services: [
                {
                    key: 'gpexplorer-shop-browse',
                    title: 'Découvrir la boutique',
                    description: 'Accédez aux produits officiels GP Explorer et finalisez vos achats en ligne.',
                    visibility: 'public',
                    enabled: true,
                    url: '/shop'
                }
            ]
        },
        en: {
            pageTitle: 'GP EXPLORER SHOP',
            titleDescription: 'Official GP Explorer shop',
            servicesSubtitle: 'The event\'s official merchandise store',
            aboutDescription: 'Official GP Explorer shop',
            services: [
                {
                    key: 'gpexplorer-shop-browse',
                    title: 'Browse the shop',
                    description: 'Explore official GP Explorer products and complete your order online.',
                    visibility: 'public',
                    enabled: true,
                    url: '/shop'
                }
            ]
        },
        es: {
            pageTitle: 'TIENDA GP EXPLORER',
            titleDescription: 'Tienda oficial GP Explorer',
            servicesSubtitle: 'La tienda oficial del evento',
            aboutDescription: 'Tienda oficial GP Explorer',
            services: [
                {
                    key: 'gpexplorer-shop-browse',
                    title: 'Descubrir la tienda',
                    description: 'Explora los productos oficiales de GP Explorer y finaliza tu compra en línea.',
                    visibility: 'public',
                    enabled: true,
                    url: '/shop'
                }
            ]
        },
        logos: {
            normal: '/logos/gpexplorer-logo.png',
            alternate: '/gp_logo.png'
        }
    };

    const shopProvider = await Provider.create({
        userId: adminUserId,
        name: 'GP Explorer Shop',
        description: 'Boutique officielle du GP Explorer',
        category: 'merch',
        logo: '/logos/gpexplorer-logo.png',
        contentData: JSON.stringify(shopContentData)
    });

    for (const item of shopItems) {
        const parsedPrice = Number.parseFloat(item.price);
        const parsedStock = Number.parseInt(item.stock, 10);

        await ProviderProduct.create({
            providerId: shopProvider.id,
            title: item.title,
            description: item.description || null,
            price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
            stock: Number.isFinite(parsedStock) ? parsedStock : 0,
            sold: 0,
            category: item.category || null,
            image: item.image || null,
            tags: Array.isArray(item.tags) ? item.tags : [],
            isActive: true
        });
    }

    console.log(`Produits boutique importés: ${shopItems.length}`);
}

async function assignMapLocationsToProviders(idMap) {
    console.log('🗺️ Attribution des emplacements prestataires...');

    const assignments = [
        { slot: 'Emplacement libre A1', providerUsername: 'playseat' },
        { slot: 'Emplacement libre A2', providerUsername: 'ciaokombucha' },
        { slot: 'Emplacement libre B1', providerUsername: 'sodikart' },
        { slot: 'Emplacement libre B2', providerUsername: 'decathlon' },
        { slot: 'Emplacement libre C1', providerUsername: 'burgouzz' },
        { slot: 'Emplacement libre C2', providerUsername: 'deezer' }
    ];

    for (const assignment of assignments) {
        const providerId = idMap.providers[assignment.providerUsername];
        if (!providerId) continue;

        const location = await MapLocation.findOne({ where: { name: assignment.slot } });
        if (!location) continue;

        await location.update({ providerId });
    }
}

async function importGuestbookEntriesForPlayseat(idMap) {
    console.log('📝 Importation du livre d\'or Playseat...');

    const playseatProviderId = idMap.providers.playseat;
    if (!playseatProviderId) {
        console.log('Playseat non trouvé, livre d\'or ignoré.');
        return;
    }

    const entries = [
        {
            userRef: '64gpx001',
            authorName: 'Jean Dupont',
            authorEmail: 'jean.dupont@email.fr',
            message: 'Super accueil sur le stand Playseat, les sessions sont fluides et les simulateurs sont top.',
            rating: 5,
            isApproved: true
        },
        {
            userRef: '64gpx002',
            authorName: 'Marie Martin',
            authorEmail: 'marie.martin@email.fr',
            message: 'Très bonne expérience, staff pro et conseils utiles pour améliorer mes chronos.',
            rating: 4,
            isApproved: true
        },
        {
            userRef: null,
            authorName: 'Alex B.',
            authorEmail: 'alex.b@example.com',
            message: 'Les sièges sont très confortables et la simulation est immersive. Je recommande vivement.',
            rating: 5,
            isApproved: true
        }
    ];

    for (const entry of entries) {
        await GuestbookEntry.create({
            providerId: playseatProviderId,
            userId: entry.userRef ? idMap.users[entry.userRef] || null : null,
            authorName: entry.authorName,
            authorEmail: entry.authorEmail,
            message: entry.message,
            rating: entry.rating,
            isApproved: entry.isApproved
        });
    }
}

async function importStatsData(idMap) {
    console.log('📈 Importation des données statistiques (graphiques)...');

    const providerIds = {
        playseat: idMap.providers.playseat,
        ciaokombucha: idMap.providers.ciaokombucha,
        sodikart: idMap.providers.sodikart,
        decathlon: idMap.providers.decathlon,
        burgouzz: idMap.providers.burgouzz,
        deezer: idMap.providers.deezer
    };

    const days = ['2026-10-08', '2026-10-09', '2026-10-10'];
    const hours = [10, 12, 14, 16, 18];

    for (const date of days) {
        for (const hour of hours) {
            await VisitorCount.create({
                providerId: providerIds.playseat,
                count: 18 + hour,
                hour,
                date,
                recordedAt: new Date(`${date}T${String(hour).padStart(2, '0')}:00:00Z`)
            });

            await VisitorCount.create({
                providerId: providerIds.ciaokombucha,
                count: 10 + Math.floor(hour / 2),
                hour,
                date,
                recordedAt: new Date(`${date}T${String(hour).padStart(2, '0')}:15:00Z`)
            });

            await VisitorCount.create({
                providerId: providerIds.sodikart,
                count: 8 + Math.floor(hour / 3),
                hour,
                date,
                recordedAt: new Date(`${date}T${String(hour).padStart(2, '0')}:30:00Z`)
            });
        }
    }

    const demoUserId = idMap.users['64gpx001'];
    const demoUserEmail = 'user@gpexplorer.com';
    const sampleTicket = await Ticket.findOne({ where: { segment: 'playseat', isActive: true } });
    const sampleProduct = await ProviderProduct.findOne({ where: { isActive: true } });

    if (!demoUserId || !sampleTicket || !sampleProduct) {
        console.log('Données ventes graphiques partielles: ticket/playseat/produit manquant.');
        return;
    }

    const dailyOrders = [
        { date: '2026-10-08T11:20:00Z', ticketQty: 2, productQty: 1 },
        { date: '2026-10-09T13:45:00Z', ticketQty: 3, productQty: 2 },
        { date: '2026-10-10T17:10:00Z', ticketQty: 4, productQty: 2 }
    ];

    for (const day of dailyOrders) {
        const order = await Order.create({
            userId: demoUserId,
            email: demoUserEmail,
            status: 'confirmed',
            totalAmount: 0,
            orderDate: new Date(day.date)
        });

        const ticketUnitPrice = Number(sampleTicket.price);
        const productUnitPrice = Number(sampleProduct.price);

        await OrderItem.create({
            orderId: order.id,
            ticketId: sampleTicket.id,
            productId: null,
            itemType: 'ticket',
            quantity: day.ticketQty,
            unitPrice: ticketUnitPrice,
            code: `TKT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
        });

        await OrderItem.create({
            orderId: order.id,
            ticketId: null,
            productId: sampleProduct.id,
            itemType: 'shop',
            quantity: day.productQty,
            unitPrice: productUnitPrice,
            code: null
        });

        const totalAmount = (ticketUnitPrice * day.ticketQty) + (productUnitPrice * day.productQty);
        await order.update({ totalAmount });
    }
}

async function importAdminContactMessages() {
    console.log('📬 Importation des messages de contact admin...');

    const messages = [
        {
            name: 'Pierre Leroy',
            email: 'pierre.leroy@email.fr',
            phone: '06 12 34 56 78',
            subject: 'tickets',
            message: 'Bonjour, je souhaiterais savoir si les billets VIP donnent accès aux paddocks et si un accompagnateur peut être présent. Merci de votre retour.',
            isRead: true
        },
        {
            name: 'Marc Dubois',
            email: 'marc.dubois@free.fr',
            phone: '06 23 45 67 89',
            subject: 'general',
            message: 'Bonjour, je suis professeur de technologie et je souhaiterais organiser une sortie scolaire avec ma classe de 3ème (28 élèves). Y a-t-il des tarifs groupes et des activités pédagogiques prévues ?',
            isRead: false
        },
        {
            name: 'Sophie Marchand',
            email: 'sophie.marchand@redbull-racing.com',
            phone: '06 78 90 12 34',
            subject: 'provider_request',
            message: 'Bonjour,\n\nJe représente Red Bull Racing France et nous souhaiterions devenir partenaire officiel de l\'événement GP Explorer.\n\nNous proposons :\n- Un stand de dégustation de nos boissons énergisantes\n- Des animations avec simulateurs de F1\n- Des goodies exclusifs pour les visiteurs\n\nNous serions disponibles pour échanger sur les modalités de partenariat à votre convenance.\n\nCordialement,\nSophie Marchand\nResponsable Partenariats France',
            isRead: false
        }
    ];

    for (const msg of messages) {
        await ContactMessage.create(msg);
    }
}

async function importPlayseatContactMessages(idMap) {
    console.log('📩 Importation des messages de contact Playseat...');

    const playseatProviderId = idMap.providers.playseat;
    if (!playseatProviderId) {
        console.log('Playseat non trouvé, messages de contact ignorés.');
        return;
    }

    const messages = [
        {
            providerId: playseatProviderId,
            author: 'Lucas Martin',
            email: 'lucas.martin@email.fr',
            content: 'Bonjour, je suis passionné de simracing et j\'aimerais savoir si vous proposez des sessions d\'essai sur vos simulateurs pendant l\'événement. Merci !',
            isRead: true
        },
        {
            providerId: playseatProviderId,
            author: 'Camille Lefevre',
            email: 'camille.lefevre@yahoo.fr',
            content: 'Bonjour, y a-t-il une limite d\'âge pour essayer les simulateurs ? Mon fils de 10 ans est fan de course automobile et aimerait beaucoup tester.',
            isRead: false
        }
    ];

    for (const msg of messages) {
        await ProviderMessage.create(msg);
    }
}

async function importMapRequests(idMap) {
    console.log('🗺️ Importation des demandes d\'emplacement...');

    const freeLocations = await MapLocation.findAll({
        where: { providerId: null }
    });

    if (freeLocations.length === 0) {
        console.log('Aucun emplacement libre pour créer des demandes.');
        return;
    }

    const requests = [
        {
            providerUsername: 'sodikart',
            providerDisplayName: 'Sodikart',
            providerContact: 'contact@sodikart.com',
            status: 'pending',
            spotIndex: 0
        },
        {
            providerUsername: 'decathlon',
            providerDisplayName: 'Decathlon',
            providerContact: 'partenariat@decathlon.fr',
            status: 'pending',
            spotIndex: 1
        },
        {
            providerUsername: 'ciaokombucha',
            providerDisplayName: 'Ciao Kombucha',
            providerContact: 'hello@ciaokombucha.fr',
            status: 'pending',
            spotIndex: 4
        }
    ];

    for (const req of requests) {
        const providerId = idMap.providers[req.providerUsername];
        if (!providerId) {
            console.log(`Provider ${req.providerUsername} non trouvé, demande ignorée.`);
            continue;
        }

        const spot = freeLocations[req.spotIndex % freeLocations.length];

        await MapRequest.create({
            providerId,
            providerUsername: req.providerUsername,
            providerDisplayName: req.providerDisplayName,
            providerContact: req.providerContact,
            spotId: spot.id,
            spotLabel: spot.name,
            status: req.status,
            reviewedAt: req.reviewedAt || null,
            reviewedBy: req.reviewedBy || null,
            decisionReason: req.decisionReason || null
        });
    }

    console.log('Demandes d\'emplacement importées.');
}

try {
    const data = await loadData();

    console.log('🔄 Connexion et synchronisation BDD...');
    await sequelize.sync({ force: true });
    console.log('Base de données remise à zéro.');

    const idMap = {
        users: {},
        providers: {}
    };

    await importHomeContent(data.homeContent);
    await importMapSpots(data.mapSpots);
    await importTicketCatalogue(data.catalogueTickets);
    await importUsers(data.users, data.providerContent, idMap);
    await assignMapLocationsToProviders(idMap);
    await importShopProducts(data.shopItems, idMap);
    await importOrders(data.soldTickets, idMap);
    await importGuestbookEntriesForPlayseat(idMap);
    await importStatsData(idMap);
    await importAdminContactMessages();
    await importPlayseatContactMessages(idMap);
    await importMapRequests(idMap);

    console.log('Seed complet terminé avec succès.');
    process.exit(0);
} catch (error) {
    console.error('FATAL ERROR du seed:', error);
    process.exit(1);
}
