/* controller map carte interactive
 * gère les requêtes http des emplacements
 */
import * as mapService from '../services/map_service.js';

/* get /api/map/locations
 * récupère tous les emplacements
 */
async function getAllLocations(req, res) {
    try {
        const locations = await mapService.getAllLocations();
        res.json({ error: 0, data: locations });
    } catch (error) {
        console.error('Erreur getAllLocations:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/map/locations/:id
 * récupère un emplacement par id
 */
async function getLocationById(req, res) {
    try {
        const { id } = req.params;
        const location = await mapService.getLocationById(id);
        
        if (!location) {
            return res.status(404).json({ error: 1, message: 'Emplacement introuvable' });
        }
        
        res.json({ error: 0, data: location });
    } catch (error) {
        console.error('Erreur getLocationById:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/map/locations
 * crée un nouvel emplacement
 */
async function createLocation(req, res) {
    try {
        const { name, x, y } = req.body;
        
        if (!name || x === undefined || y === undefined) {
            return res.status(400).json({ error: 1, message: 'Données manquantes (name, x, y requis)' });
        }
        
        const result = await mapService.createLocation(req.body);
        
        if (!result.success) {
            return res.status(400).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, data: result.location });
    } catch (error) {
        console.error('Erreur createLocation:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* put /api/map/locations/:id
 * met à jour un emplacement
 */
async function updateLocation(req, res) {
    try {
        const { id } = req.params;
        const result = await mapService.updateLocation(id, req.body);
        
        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, data: result.location });
    } catch (error) {
        console.error('Erreur updateLocation:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* delete /api/map/locations/:id
 * supprime un emplacement
 */
async function deleteLocation(req, res) {
    try {
        const { id } = req.params;
        const result = await mapService.deleteLocation(id);
        
        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, message: result.message });
    } catch (error) {
        console.error('Erreur deleteLocation:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* put /api/map/locations/:id/assign
 * associe un prestataire à un emplacement
 */
async function assignProvider(req, res) {
    try {
        const { id } = req.params;
        const { providerId } = req.body;
        
        const result = await mapService.assignProviderToLocation(id, providerId);
        
        if (!result.success) {
            return res.status(400).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, data: result.location });
    } catch (error) {
        console.error('Erreur assignProvider:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/map/locations/swap
 * échange les prestataires entre deux emplacements
 */
async function swapProviders(req, res) {
    try {
        const { locationId1, locationId2 } = req.body;
        
        if (!locationId1 || !locationId2) {
            return res.status(400).json({ error: 1, message: 'Deux IDs d\'emplacement requis' });
        }
        
        const result = await mapService.swapProviders(locationId1, locationId2);
        
        if (!result.success) {
            return res.status(400).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, data: result.locations });
    } catch (error) {
        console.error('Erreur swapProviders:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/map/locations/free
 * récupère les emplacements libres
 */
async function getFreeLocations(req, res) {
    try {
        const locations = await mapService.getFreeLocations();
        res.json({ error: 0, data: locations });
    } catch (error) {
        console.error('Erreur getFreeLocations:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/map/zones/:zone
 * récupère les emplacements d une zone
 */
async function getLocationsByZone(req, res) {
    try {
        const { zone } = req.params;
        const locations = await mapService.getLocationsByZone(zone);
        res.json({ error: 0, data: locations });
    } catch (error) {
        console.error('Erreur getLocationsByZone:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

export {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    assignProvider,
    swapProviders,
    getFreeLocations,
    getLocationsByZone
};
