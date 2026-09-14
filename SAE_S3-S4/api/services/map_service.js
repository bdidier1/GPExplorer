/* service map carte interactive
 * gère la logique métier des emplacements sur la carte
 */
import { MapLocation, Provider } from '../models/index.js';

/* récupère tous les emplacements de la carte */
async function getAllLocations() {
    return await MapLocation.findAll({
        include: [{
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'category', 'logo'],
            required: false
        }],
        order: [['zone', 'ASC'], ['name', 'ASC']]
    });
}

/* récupère un emplacement par id */
async function getLocationById(locationId) {
    return await MapLocation.findByPk(locationId, {
        include: [{
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'category', 'description', 'logo']
        }]
    });
}

/* crée un nouvel emplacement */
async function createLocation(locationData) {
    const location = await MapLocation.create({
        name: locationData.name,
        x: locationData.x,
        y: locationData.y,
        providerId: locationData.providerId || null,
        surface: locationData.surface,
        hasElectricity: locationData.hasElectricity || false,
        hasWater: locationData.hasWater || false,
        electricalPower: locationData.electricalPower,
        description: locationData.description,
        zone: locationData.zone
    });
    
    return { success: true, location };
}

/* met à jour un emplacement */
async function updateLocation(locationId, updateData) {
    const location = await MapLocation.findByPk(locationId);
    
    if (!location) {
        return { success: false, message: 'Emplacement introuvable' };
    }
    
    await location.update(updateData);
    
    return { success: true, location };
}

/* supprime un emplacement */
async function deleteLocation(locationId) {
    const location = await MapLocation.findByPk(locationId);
    
    if (!location) {
        return { success: false, message: 'Emplacement introuvable' };
    }
    
    await location.destroy();
    
    return { success: true, message: 'Emplacement supprimé' };
}

/* associe un prestataire à un emplacement */
async function assignProviderToLocation(locationId, providerId) {
    const location = await MapLocation.findByPk(locationId);
    
    if (!location) {
        return { success: false, message: 'Emplacement introuvable' };
    }
    
    // vérifie si le prestataire existe
    if (providerId) {
        const provider = await Provider.findByPk(providerId);
        if (!provider) {
            return { success: false, message: 'Prestataire introuvable' };
        }
        
        // retire le prestataire de son ancien emplacement si besoin
        await MapLocation.update(
            { providerId: null },
            { where: { providerId } }
        );
    }
    
    await location.update({ providerId });
    
    // recharge avec le provider
    const updatedLocation = await getLocationById(locationId);
    
    return { success: true, location: updatedLocation };
}

/* échange les prestataires entre deux emplacements */
async function swapProviders(locationId1, locationId2) {
    const location1 = await MapLocation.findByPk(locationId1);
    const location2 = await MapLocation.findByPk(locationId2);
    
    if (!location1 || !location2) {
        return { success: false, message: 'Emplacement(s) introuvable(s)' };
    }
    
    const tempProviderId = location1.providerId;
    
    await location1.update({ providerId: location2.providerId });
    await location2.update({ providerId: tempProviderId });
    
    return { 
        success: true, 
        locations: [
            await getLocationById(locationId1),
            await getLocationById(locationId2)
        ]
    };
}

/* récupère les emplacements libres */
async function getFreeLocations() {
    return await MapLocation.findAll({
        where: { providerId: null },
        order: [['zone', 'ASC'], ['name', 'ASC']]
    });
}

/* récupère les emplacements par zone */
async function getLocationsByZone(zone) {
    return await MapLocation.findAll({
        where: { zone },
        include: [{
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'category', 'logo'],
            required: false
        }],
        order: [['name', 'ASC']]
    });
}

export {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    assignProviderToLocation,
    swapProviders,
    getFreeLocations,
    getLocationsByZone
};
