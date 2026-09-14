/* service map request
 * gère les demandes d emplacement sur la carte
 */
import { MapRequest, Provider, MapLocation } from '../models/index.js';
import { Op } from 'sequelize';

async function submitRequest(providerId, spotData, providerMeta) {
    const assignedLocation = await MapLocation.findOne({
        where: { providerId }
    });

    if (assignedLocation) {
        return {
            success: false,
            message: 'Vous disposez deja d\'un emplacement attribue. Retirez-vous de cet emplacement avant de faire une nouvelle demande.'
        };
    }

    // si une demande pending existe déjà on la met à jour
    const existing = await MapRequest.findOne({
        where: { providerId, status: 'pending' }
    });

    if (existing) {
        await existing.update({
            spotId: spotData.id,
            spotLabel: spotData.label,
            providerUsername: providerMeta.username,
            providerDisplayName: providerMeta.companyName || providerMeta.username,
            providerContact: providerMeta.contactPerson || null
        });
        return { success: true, request: existing };
    }

    const request = await MapRequest.create({
        providerId,
        providerUsername: providerMeta.username,
        providerDisplayName: providerMeta.companyName || providerMeta.username,
        providerContact: providerMeta.contactPerson || null,
        spotId: spotData.id,
        spotLabel: spotData.label,
        status: 'pending'
    });
    return { success: true, request };
}

async function approveRequest(requestId, adminUser) {
    const request = await MapRequest.findByPk(requestId);
    if (!request) return { success: false, message: 'Demande introuvable' };
    if (request.status !== 'pending') return { success: false, message: 'Cette demande a déjà été traitée' };

    const assignedLocation = await MapLocation.findOne({
        where: {
            providerId: request.providerId,
            id: { [Op.ne]: request.spotId }
        }
    });

    if (assignedLocation) {
        return {
            success: false,
            message: 'Ce prestataire dispose deja d\'un emplacement attribue. Il doit se retirer de son emplacement actuel avant toute nouvelle attribution.'
        };
    }

    // assigne l emplacement sur la carte
    const location = await MapLocation.findByPk(request.spotId);

    if (location) {
        await location.update({ providerId: request.providerId });
    }

    await request.update({
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: adminUser ? { id: adminUser.id, username: adminUser.username } : null
    });
    return { success: true, request };
}

async function rejectRequest(requestId, adminUser, reason = null) {
    const request = await MapRequest.findByPk(requestId);
    if (!request) return { success: false, message: 'Demande introuvable' };
    if (request.status !== 'pending') return { success: false, message: 'Cette demande a déjà été traitée' };

    await request.update({
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: adminUser ? { id: adminUser.id, username: adminUser.username } : null,
        decisionReason: reason
    });
    return { success: true, request };
}

async function getAllRequests(statusFilter) {
    const where = {};
    if (statusFilter === 'pending') where.status = 'pending';
    else if (statusFilter === 'processed') where.status = { [Op.in]: ['approved', 'rejected'] };

    return await MapRequest.findAll({
        where,
        include: [{
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'category'],
            required: false
        }],
        order: [['created_at', 'DESC']]
    });
}

async function getLatestRequestForProvider(providerId) {
    return await MapRequest.findOne({
        where: { providerId },
        order: [['created_at', 'DESC']]
    });
}

async function removePendingRequestsForProvider(providerId) {
    await MapRequest.destroy({
        where: { providerId, status: 'pending' }
    });
    return { success: true };
}

export {
    submitRequest,
    approveRequest,
    rejectRequest,
    getAllRequests,
    getLatestRequestForProvider,
    removePendingRequestsForProvider
};
