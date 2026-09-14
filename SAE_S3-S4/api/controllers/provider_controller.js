/* controller providers prestataires
 * gère les requêtes http des prestataires
 */
import * as providerService from '../services/provider_service.js';

/* get /api/providers
 * liste tous les prestataires
 */
async function getAllProviders(req, res) {
    try {
        const { category, search } = req.query;
        const providers = await providerService.getAllProviders({ category, search });
        res.json({ error: 0, data: providers });
    } catch (error) {
        console.error('Erreur getAllProviders:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/providers/:id
 * récupère un prestataire par id
 */
async function getProviderById(req, res) {
    try {
        const { id } = req.params;
        const provider = await providerService.getProviderById(id);
        
        if (!provider) {
            return res.status(404).json({ error: 1, message: 'Prestataire introuvable' });
        }
        
        res.json({ error: 0, data: provider });
    } catch (error) {
        console.error('Erreur getProviderById:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/providers
 * crée un nouveau prestataire organisateur uniquement
 */
async function createProvider(req, res) {
    try {
        const result = await providerService.createProvider(req.body);
        
        if (!result.success) {
            return res.status(400).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, data: result.provider });
    } catch (error) {
        console.error('Erreur createProvider:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* put /api/providers/:id
 * met à jour un prestataire
 */
async function updateProvider(req, res) {
    try {
        const { id } = req.params;
        const result = await providerService.updateProvider(id, req.body);
        
        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, data: result.provider });
    } catch (error) {
        console.error('Erreur updateProvider:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* delete /api/providers/:id
 * désactive un prestataire et son compte user associé
 */
async function deleteProvider(req, res) {
    try {
        const { id } = req.params;
        const result = await providerService.deleteProvider(id);

        if (!result.success) {
            return res.status(result.status || 404).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, message: result.message || 'Prestataire supprimé avec succès' });
    } catch (error) {
        console.error('Erreur deleteProvider:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* put /api/providers/me/profile
 * met à jour le profil du prestataire connecté
 */
async function updateMyProviderProfile(req, res) {
    try {
        const result = await providerService.updateMyProviderProfile(req.user, req.body);

        if (!result.success) {
            return res.status(result.status || 400).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, data: result.data });
    } catch (error) {
        console.error('Erreur updateMyProviderProfile:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/providers/:providerId/guestbook
 * ajoute une entrée au livre d or
 */
async function addGuestbookEntry(req, res) {
    try {
        const { providerId } = req.params;
        const result = await providerService.addGuestbookEntry(providerId, req.body, req.user);
        
        if (!result.success) {
            return res.status(result.status || 400).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, data: result.entry });
    } catch (error) {
        console.error('Erreur addGuestbookEntry:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/providers/:providerId/guestbook
 * récupère les entrées du livre d or
 */
async function getGuestbookEntries(req, res) {
    try {
        const { providerId } = req.params;
        const includeUnapproved = req.query.all === 'true';
        
        const entries = await providerService.getGuestbookEntries(providerId, includeUnapproved);
        res.json({ error: 0, data: entries });
    } catch (error) {
        console.error('Erreur getGuestbookEntries:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/providers/:providerId/visitors
 * incrémente le compteur de visiteurs
 */
async function incrementVisitors(req, res) {
    try {
        const { providerId } = req.params;
        const result = await providerService.incrementVisitorCount(providerId);
        
        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, message: 'Compteur incrémenté' });
    } catch (error) {
        console.error('Erreur incrementVisitors:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/providers/:providerId/visitors/stats
 * récupère les stats visiteurs d un prestataire
 */
async function getProviderVisitorSummary(req, res) {
    try {
        const { providerId } = req.params;
        const result = await providerService.getProviderVisitorSummary(providerId);

        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, data: result.data });
    } catch (error) {
        console.error('Erreur getProviderVisitorSummary:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

async function deleteGuestbookEntry(req, res) {
    try {
        const { providerId, entryId } = req.params;
        const result = await providerService.deleteGuestbookEntry(providerId, entryId, req.user);
        if (!result.success) {
            return res.status(result.status || 404).json({ error: 1, message: result.message });
        }
        res.json({ error: 0, message: 'Entrée supprimée' });
    } catch (error) {
        console.error('Erreur deleteGuestbookEntry:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

async function updateGuestbookEntry(req, res) {
    try {
        const { providerId, entryId } = req.params;
        const result = await providerService.updateGuestbookEntry(providerId, entryId, req.body, req.user);

        if (!result.success) {
            return res.status(result.status || 400).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, data: result.entry });
    } catch (error) {
        console.error('Erreur updateGuestbookEntry:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
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
    incrementVisitors,
    getProviderVisitorSummary
};
