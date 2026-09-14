/* service providers prestataires
 * gère la logique métier des prestataires
 */
import { sequelize, Provider, User, MapLocation, GuestbookEntry, VisitorCount, Order, OrderItem, ProviderProduct } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function serviceError(status, message) {
    return { success: false, status, message };
}

function collectProviderProfileUpdates(payload = {}) {
    const updatesUser = {};
    const updatesProvider = {};

    if (payload.username !== undefined) {
        const username = String(payload.username).trim();
        if (username.length < 3 || username.length > 50) {
            return { error: serviceError(400, 'Le username doit contenir entre 3 et 50 caractères') };
        }
        updatesUser.username = username;
    }

    if (payload.email !== undefined) {
        const email = String(payload.email).trim().toLowerCase();
        if (!EMAIL_REGEX.test(email)) {
            return { error: serviceError(400, 'Format d\'email invalide') };
        }
        updatesUser.email = email;
    }

    if (payload.firstName !== undefined) {
        updatesUser.firstName = String(payload.firstName).trim() || null;
    }

    if (payload.lastName !== undefined) {
        updatesUser.lastName = String(payload.lastName).trim() || null;
    }

    if (payload.phone !== undefined) {
        updatesUser.phone = String(payload.phone).trim() || null;
    }

    if (payload.companyName !== undefined) {
        const companyName = String(payload.companyName).trim();
        if (!companyName) {
            return { error: serviceError(400, 'Le nom de l\'entreprise est requis') };
        }
        updatesUser.companyName = companyName;
        updatesProvider.name = companyName;
    }

    if (payload.category !== undefined) {
        const category = String(payload.category).trim() || 'other';
        updatesUser.category = category;
        updatesProvider.category = category;
    }

    return { updatesUser, updatesProvider };
}

async function validateAndPreparePasswordUpdate(payload, user, updatesUser) {
    const hasNewPassword = String(payload?.newPassword ?? '').length > 0;

    if (!hasNewPassword) {
        return null;
    }

    const currentPassword = String(payload.currentPassword || '');
    const newPassword = String(payload.newPassword);

    if (!currentPassword) {
        return serviceError(400, 'Le mot de passe actuel est requis');
    }
    if (newPassword.length < 6) {
        return serviceError(400, 'Le nouveau mot de passe doit contenir au moins 6 caractères');
    }
    if (!user.password) {
        return serviceError(400, 'Ce compte ne possède pas de mot de passe local (OAuth)');
    }

    const isValidCurrent = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrent) {
        return serviceError(400, 'Mot de passe actuel incorrect');
    }

    updatesUser.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    return null;
}

async function ensureUniqueUserIdentity(currentUserId, updatesUser) {
    if (!updatesUser.email && !updatesUser.username) {
        return null;
    }

    const orConditions = [];
    if (updatesUser.email) orConditions.push({ email: updatesUser.email });
    if (updatesUser.username) orConditions.push({ username: updatesUser.username });

    const existingUser = await User.findOne({
        where: {
            id: { [Op.ne]: currentUserId },
            [Op.or]: orConditions
        }
    });

    return existingUser ? serviceError(409, 'Email ou username déjà utilisé') : null;
}

async function ensureProviderProfilesExist() {
    const providerUsers = await User.findAll({
        where: {
            role: 'provider',
            isActive: true
        },
        attributes: ['id', 'username', 'companyName', 'category']
    });

    if (!providerUsers.length) {
        return;
    }

    const existingProviders = await Provider.findAll({
        attributes: ['userId']
    });
    const existingByUserId = new Set(existingProviders.map(provider => provider.userId));

    const missingProfiles = providerUsers
        .filter(user => !existingByUserId.has(user.id))
        .map(user => ({
            userId: user.id,
            name: user.companyName || user.username,
            description: `Description de ${user.companyName || user.username}`,
            category: user.category || 'other',
            isActive: true
        }));

    if (missingProfiles.length) {
        await Provider.bulkCreate(missingProfiles);
    }
}

/* récupère tous les prestataires */
async function getAllProviders(filters = {}) {
    await ensureProviderProfilesExist();

    const whereClause = { isActive: true };
    
    if (filters.category) {
        whereClause.category = filters.category;
    }
    
    if (filters.search) {
        whereClause[Op.or] = [
            { name: { [Op.iLike]: `%${filters.search}%` } },
            { description: { [Op.iLike]: `%${filters.search}%` } }
        ];
    }
    
    return await Provider.findAll({
        where: whereClause,
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'companyName']
            },
            {
                model: MapLocation,
                as: 'location',
                attributes: ['id', 'name', 'x', 'y', 'zone']
            }
        ],
        order: [['name', 'ASC']]
    });
}

/* récupère un prestataire par id */
async function getProviderById(providerId) {
    return await Provider.findByPk(providerId, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'phone', 'companyName']
            },
            {
                model: MapLocation,
                as: 'location'
            }
        ]
    });
}

/* crée un nouveau prestataire */
async function createProvider(providerData) {
    const { userId, name, description, category, logo, htmlContent } = providerData;
    let contentData = null;
    if (typeof providerData.contentData === 'string') {
        contentData = providerData.contentData;
    } else if (providerData.contentData) {
        contentData = JSON.stringify(providerData.contentData);
    }
    
    // vérifie que l'utilisateur existe et a bien le rôle provider
    const user = await User.findByPk(userId);
    if (user?.role !== 'provider') {
        return { success: false, message: 'Utilisateur invalide ou non prestataire' };
    }
    
    // vérifie qu'un profil provider n'existe pas déjà
    const existingProvider = await Provider.findOne({ where: { userId } });
    if (existingProvider) {
        return { success: false, message: 'Un profil prestataire existe déjà pour cet utilisateur' };
    }
    
    const provider = await Provider.create({
        userId,
        name,
        description,
        category,
        logo,
        htmlContent,
        contentData,
        hasStatsAccess: providerData.hasStatsAccess === true,
        hasGuestbookAccess: providerData.hasGuestbookAccess !== false,
        needsElectricity: providerData.needsElectricity || false,
        needsWater: providerData.needsWater || false,
        requiredSpace: providerData.requiredSpace || null,
        isActive: true
    });
    
    return { success: true, provider };
}

/* met à jour un prestataire */
async function updateProvider(providerId, updateData) {
    const provider = await Provider.findByPk(providerId);
    
    if (!provider) {
        return { success: false, message: 'Prestataire introuvable' };
    }
    
    const payload = { ...updateData };
    if (payload.contentData && typeof payload.contentData !== 'string') {
        payload.contentData = JSON.stringify(payload.contentData);
    }

    await provider.update(payload);
    
    return { success: true, provider };
}

/* désactive un prestataire et son utilisateur associé */
async function deleteProvider(providerId) {
    const provider = await Provider.findByPk(providerId);

    if (!provider) {
        return { success: false, status: 404, message: 'Prestataire introuvable' };
    }

    if (!provider.isActive) {
        return { success: false, status: 400, message: 'Ce prestataire est déjà désactivé' };
    }

    await provider.update({ isActive: false });

    if (provider.userId) {
        const user = await User.findByPk(provider.userId);
        if (user?.isActive) {
            await user.update({ isActive: false });
        }
    }

    return { success: true, message: 'Prestataire désactivé avec succès' };
}

/* met à jour le profil du prestataire connecté */
async function updateMyProviderProfile(authUser, payload = {}) {
    if (!authUser?.id) {
        return serviceError(401, 'Non authentifié');
    }

    const provider = await Provider.findOne({ where: { userId: authUser.id } });
    if (!provider) {
        return serviceError(404, 'Profil prestataire introuvable');
    }

    const user = await User.findByPk(authUser.id);
    if (user?.role !== 'provider') {
        return serviceError(403, 'Accès refusé');
    }

    const updatesResult = collectProviderProfileUpdates(payload);
    if (updatesResult.error) {
        return updatesResult.error;
    }
    const { updatesUser, updatesProvider } = updatesResult;

    const passwordError = await validateAndPreparePasswordUpdate(payload, user, updatesUser);
    if (passwordError) {
        return passwordError;
    }

    if (!Object.keys(updatesUser).length && !Object.keys(updatesProvider).length) {
        return serviceError(400, 'Aucune donnée à mettre à jour');
    }

    const uniqueError = await ensureUniqueUserIdentity(user.id, updatesUser);
    if (uniqueError) {
        return uniqueError;
    }

    await sequelize.transaction(async (transaction) => {
        if (Object.keys(updatesUser).length) {
            await user.update(updatesUser, { transaction });
        }
        if (Object.keys(updatesProvider).length) {
            await provider.update(updatesProvider, { transaction });
        }
    });

    return {
        success: true,
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            companyName: user.companyName,
            category: user.category,
            providerId: provider.id
        }
    };
}

/**
 * Ajoute une entrée au livre d'or
 */
async function addGuestbookEntry(providerId, entryData, currentUser) {
    const provider = await Provider.findByPk(providerId);
    
    if (!provider) {
        return serviceError(404, 'Prestataire introuvable');
    }

    if (!currentUser?.id) {
        return serviceError(401, 'Utilisateur requis');
    }

    const existingEntry = await GuestbookEntry.findOne({
        where: {
            providerId,
            userId: currentUser.id
        }
    });

    if (existingEntry) {
        return serviceError(409, 'Vous avez déjà publié un avis pour ce prestataire');
    }

    const trimmedMessage = String(entryData.message || '').trim();
    const rating = Number(entryData.rating);

    if (!trimmedMessage || Number.isNaN(rating)) {
        return serviceError(400, 'Message et note requis');
    }

    const authorName = String(entryData.authorName || '').trim()
        || String(currentUser.username || '').trim()
        || String(currentUser.email || '').trim()
        || 'Utilisateur';
    
    const entry = await GuestbookEntry.create({
        providerId,
        userId: currentUser.id,
        authorName,
        authorEmail: entryData.authorEmail || currentUser.email || null,
        message: trimmedMessage,
        rating: Math.min(Math.max(rating, 1), 5),
        isApproved: true
    });
    
    return { success: true, entry };
}

async function updateGuestbookEntry(providerId, entryId, entryData, currentUser) {
    if (!currentUser?.id) {
        return serviceError(401, 'Utilisateur requis');
    }

    const entry = await GuestbookEntry.findOne({
        where: {
            id: entryId,
            providerId
        }
    });

    if (!entry) {
        return serviceError(404, 'Entrée introuvable');
    }

    if (entry.userId !== currentUser.id) {
        return serviceError(403, 'Vous ne pouvez pas modifier cet avis');
    }

    const trimmedMessage = String(entryData.message || '').trim();
    const rating = Number(entryData.rating);

    if (!trimmedMessage || Number.isNaN(rating)) {
        return serviceError(400, 'Message et note requis');
    }

    entry.message = trimmedMessage;
    entry.rating = Math.min(Math.max(rating, 1), 5);
    await entry.save();

    return { success: true, entry };
}

/**
 * Supprime une entrée du livre d'or
 */
async function deleteGuestbookEntry(providerId, entryId, currentUser) {
    if (!currentUser?.id) {
        return serviceError(401, 'Utilisateur requis');
    }

    const entry = await GuestbookEntry.findOne({
        where: {
            id: entryId,
            providerId
        }
    });

    if (!entry) {
        return serviceError(404, 'Entrée introuvable');
    }

    if (entry.userId !== currentUser.id && currentUser.role !== 'organizer') {
        return serviceError(403, 'Vous ne pouvez pas supprimer cet avis');
    }

    await entry.destroy();
    return { success: true };
}

/**
 * Récupère les entrées du livre d'or d'un prestataire
 */
async function getGuestbookEntries(providerId, includeUnapproved = false) {
    const whereClause = { providerId };
    
    if (!includeUnapproved) {
        whereClause.isApproved = true;
    }
    
    return await GuestbookEntry.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
    });
}

/**
 * Incrémente le compteur de visiteurs
 */
async function incrementVisitorCount(providerId) {
    const provider = await Provider.findByPk(providerId);
    
    if (!provider) {
        return { success: false, message: 'Prestataire introuvable' };
    }
    
    const now = new Date();
    
    await VisitorCount.create({
        providerId,
        count: 1,
        recordedAt: now,
        hour: now.getHours(),
        date: now.toISOString().split('T')[0]
    });
    
    return { success: true };
}

/**
 * Récupère les statistiques de visiteurs
 */
async function getVisitorStats(providerId, startDate = null, endDate = null) {
    const whereClause = { providerId };
    
    if (startDate && endDate) {
        whereClause.date = {
            [Op.between]: [startDate, endDate]
        };
    }
    
    const counts = await VisitorCount.findAll({
        where: whereClause,
        attributes: [
            'date',
            'hour',
            [sequelize.fn('SUM', sequelize.col('count')), 'totalCount']
        ],
        group: ['date', 'hour'],
        order: [['date', 'ASC'], ['hour', 'ASC']]
    });
    
    return counts;
}

/**
 * Récupère un résumé des visiteurs pour un prestataire
 */
async function getProviderVisitorSummary(providerId) {
    const provider = await Provider.findByPk(providerId);
    if (!provider) {
        return { success: false, message: 'Prestataire introuvable' };
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoDate = weekAgo.toISOString().split('T')[0];
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 29);

    const [
        totalVisitsRaw,
        todayVisitsRaw,
        weekVisitsRaw,
        dailyRows,
        shopTotalsRaw,
        shopWeekTotalsRaw,
        shopDailyRows
    ] = await Promise.all([
        VisitorCount.sum('count', { where: { providerId } }),
        VisitorCount.sum('count', { where: { providerId, date: today } }),
        VisitorCount.sum('count', { where: { providerId, date: { [Op.gte]: weekAgoDate } } }),
        VisitorCount.findAll({
            where: { providerId, date: { [Op.gte]: weekAgoDate } },
            attributes: ['date', [fn('SUM', col('count')), 'visits']],
            group: ['date'],
            order: [['date', 'ASC']],
            raw: true
        }),
        OrderItem.findOne({
            where: { itemType: 'shop' },
            attributes: [
                [fn('SUM', col('OrderItem.quantity')), 'totalQuantity'],
                [fn('SUM', literal('quantity * unit_price')), 'totalRevenue']
            ],
            include: [
                {
                    model: Order,
                    as: 'order',
                    where: { status: 'confirmed' },
                    attributes: [],
                    required: true
                },
                {
                    model: ProviderProduct,
                    as: 'product',
                    where: { providerId },
                    attributes: [],
                    required: true
                }
            ],
            raw: true
        }),
        OrderItem.findOne({
            where: { itemType: 'shop' },
            attributes: [
                [fn('SUM', col('OrderItem.quantity')), 'totalQuantity'],
                [fn('SUM', literal('quantity * unit_price')), 'totalRevenue']
            ],
            include: [
                {
                    model: Order,
                    as: 'order',
                    where: {
                        status: 'confirmed',
                        orderDate: { [Op.gte]: weekAgo }
                    },
                    attributes: [],
                    required: true
                },
                {
                    model: ProviderProduct,
                    as: 'product',
                    where: { providerId },
                    attributes: [],
                    required: true
                }
            ],
            raw: true
        }),
        OrderItem.findAll({
            where: { itemType: 'shop' },
            attributes: [
                [fn('DATE', col('order.order_date')), 'date'],
                [fn('SUM', col('OrderItem.quantity')), 'totalQuantity'],
                [fn('SUM', literal('quantity * unit_price')), 'totalRevenue']
            ],
            include: [
                {
                    model: Order,
                    as: 'order',
                    where: {
                        status: 'confirmed',
                        orderDate: { [Op.gte]: monthAgo }
                    },
                    attributes: [],
                    required: true
                },
                {
                    model: ProviderProduct,
                    as: 'product',
                    where: { providerId },
                    attributes: [],
                    required: true
                }
            ],
            group: [fn('DATE', col('order.order_date'))],
            order: [[fn('DATE', col('order.order_date')), 'ASC']],
            raw: true
        })
    ]);

    const byDate = new Map(dailyRows.map(row => [row.date, Number(row.visits) || 0]));
    const daily = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        daily.push({ date: key, count: byDate.get(key) || 0 });
    }

    const shopByDate = new Map(
        (shopDailyRows || []).map(row => [
            row.date,
            {
                quantity: Number(row.totalQuantity) || 0,
                revenue: Number(row.totalRevenue) || 0
            }
        ])
    );

    const shopDaily = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        const entry = shopByDate.get(key) || { quantity: 0, revenue: 0 };
        shopDaily.push({ date: key, ...entry });
    }

    return {
        success: true,
        data: {
            providerId,
            totalVisits: Number(totalVisitsRaw) || 0,
            todayVisits: Number(todayVisitsRaw) || 0,
            weekVisits: Number(weekVisitsRaw) || 0,
            daily,
            shop: {
                totalProductsSold: Number(shopTotalsRaw?.totalQuantity) || 0,
                totalRevenue: Number(shopTotalsRaw?.totalRevenue) || 0,
                weekProductsSold: Number(shopWeekTotalsRaw?.totalQuantity) || 0,
                weekRevenue: Number(shopWeekTotalsRaw?.totalRevenue) || 0,
                daily: shopDaily
            }
        }
    };
}

export {
    getAllProviders,
    getProviderById,
    createProvider,
    updateProvider,
    deleteProvider,
    updateMyProviderProfile,
    addGuestbookEntry,
    updateGuestbookEntry,
    deleteGuestbookEntry,
    getGuestbookEntries,
    incrementVisitorCount,
    getVisitorStats,
    getProviderVisitorSummary
};
