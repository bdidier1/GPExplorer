/* controller map request
 * gère les demandes d emplacement sur la carte
 */
import * as mapRequestService from '../services/map_request_service.js';
import { Provider } from '../models/index.js';

export async function submitRequest(req, res) {
    try {
        const user = req.user;
        // on cherche le provider lié à l utilisateur
        const provider = await Provider.findOne({ where: { userId: user.id } });
        if (!provider) {
            return res.status(403).json({ error: 1, message: 'Aucun profil prestataire trouvé pour cet utilisateur' });
        }

        const { spot } = req.body;
        if (!spot?.id) {
            return res.status(400).json({ error: 1, message: 'Champ requis : spot.id' });
        }

        const providerMeta = {
            username: user.username,
            companyName: provider.name,
            contactPerson: provider.contactPerson
        };

        const result = await mapRequestService.submitRequest(provider.id, spot, providerMeta);
        if (!result.success) {
            return res.status(400).json({ error: 1, message: result.message });
        }
        res.status(201).json({ error: 0, data: result.request, message: 'Demande soumise avec succès' });
    } catch (error) {
        console.error('[MapRequest] submitRequest:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function getMyRequest(req, res) {
    try {
        const user = req.user;
        const provider = await Provider.findOne({ where: { userId: user.id } });
        if (!provider) {
            return res.json({ error: 0, data: null });
        }

        const request = await mapRequestService.getLatestRequestForProvider(provider.id);
        res.json({ error: 0, data: request });
    } catch (error) {
        console.error('[MapRequest] getMyRequest:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function getAllRequests(req, res) {
    try {
        const { status } = req.query;
        const requests = await mapRequestService.getAllRequests(status);
        res.json({ error: 0, data: requests });
    } catch (error) {
        console.error('[MapRequest] getAllRequests:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function approveRequest(req, res) {
    try {
        const result = await mapRequestService.approveRequest(req.params.id, req.user);
        if (!result.success) return res.status(400).json({ error: 1, message: result.message });
        res.json({ error: 0, data: result.request, message: 'Demande approuvée' });
    } catch (error) {
        console.error('[MapRequest] approveRequest:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function rejectRequest(req, res) {
    try {
        const { reason } = req.body;
        const result = await mapRequestService.rejectRequest(req.params.id, req.user, reason);
        if (!result.success) return res.status(400).json({ error: 1, message: result.message });
        res.json({ error: 0, data: result.request, message: 'Demande rejetée' });
    } catch (error) {
        console.error('[MapRequest] rejectRequest:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function removePendingRequests(req, res) {
    try {
        const user = req.user;
        const provider = await Provider.findOne({ where: { userId: user.id } });
        if (provider) {
            await mapRequestService.removePendingRequestsForProvider(provider.id);
        }
        res.json({ error: 0, message: 'Demandes en attente supprimées' });
    } catch (error) {
        console.error('[MapRequest] removePendingRequests:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}
