import { Provider, MapLocation } from '../models/index.js';

function forbidden(res, message = 'Acces refuse') {
    return res.status(403).json({ error: 1, message });
}

async function findProviderByUserId(userId) {
    return await Provider.findOne({ where: { userId, isActive: true } });
}

function ensureSelfOrOrganizer(paramName = 'userId') {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 1, message: 'Non autorise. Veuillez vous connecter.' });
        }

        if (req.user.role === 'organizer') {
            return next();
        }

        if (String(req.user.id) !== String(req.params[paramName])) {
            return forbidden(res, 'Acces refuse a cette ressource utilisateur');
        }

        return next();
    };
}

function ensureProviderOwnsParamOrOrganizer(paramName = 'providerId') {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 1, message: 'Non autorise. Veuillez vous connecter.' });
        }

        if (req.user.role === 'organizer') {
            return next();
        }

        if (req.user.role !== 'provider') {
            return forbidden(res);
        }

        const provider = await findProviderByUserId(req.user.id);
        if (!provider) {
            return forbidden(res, 'Profil prestataire introuvable');
        }

        if (String(provider.id) !== String(req.params[paramName])) {
            return forbidden(res, 'Acces refuse a ce prestataire');
        }

        req.currentProvider = provider;
        return next();
    };
}

async function ensureCanAssignMap(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 1, message: 'Non autorise. Veuillez vous connecter.' });
    }

    if (req.user.role === 'organizer') {
        return next();
    }

    if (req.user.role !== 'provider') {
        return forbidden(res);
    }

    const provider = await findProviderByUserId(req.user.id);
    if (!provider) {
        return forbidden(res, 'Profil prestataire introuvable');
    }

    const requestedProviderId = req.body?.providerId;

    // un prestataire ne peut s assigner que lui même
    if (requestedProviderId && String(requestedProviderId) !== String(provider.id)) {
        return forbidden(res, 'Vous ne pouvez pas assigner un autre prestataire');
    }

    // un prestataire peut uniquement libérer son propre emplacement
    if (requestedProviderId === null) {
        const location = await MapLocation.findByPk(req.params.id);
        if (!location || String(location.providerId) !== String(provider.id)) {
            return forbidden(res, 'Vous ne pouvez liberer que votre propre emplacement');
        }
    }

    req.currentProvider = provider;
    return next();
}

export { ensureSelfOrOrganizer, ensureProviderOwnsParamOrOrganizer, ensureCanAssignMap };
