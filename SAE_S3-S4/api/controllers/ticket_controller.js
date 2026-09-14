/* controller tickets
 * gère les requêtes http des billets
 */
import * as ticketService from '../services/ticket_service.js';

// temps de réservation temporaire en millisecondes
const RESERVATION_TTL_MS = (process.env.RESERVATION_TTL_MIN || 15) * 60 * 1000;

/* get /api/tickets
 * liste tous les billets avec leur état
 */
async function getAllTickets(req, res) {
    try {
        const tickets = await ticketService.getAllTickets();
        res.json({ error: 0, data: tickets });
    } catch (error) {
        console.error('Erreur getAllTickets:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/tickets/:id
 * récupère un billet par id
 */
async function getTicketById(req, res) {
    try {
        const { id } = req.params;
        const ticket = await ticketService.getTicketById(id);
        
        if (!ticket) {
            return res.status(404).json({ error: 1, message: 'Billet introuvable' });
        }
        
        res.json({ error: 0, data: ticket });
    } catch (error) {
        console.error('Erreur getTicketById:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/panier/reserver
 * réserve des billets temporairement
 */
async function createReservation(req, res) {
    try {
        const { items = [] } = req.body || {};
        const userId = req.user?.id;
        
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 1, message: 'Aucun item à réserver' });
        }
        
        // on valide chaque item
        for (const item of items) {
            if (!item.ticketId) {
                return res.status(400).json({ error: 1, message: 'ticketId requis pour chaque item' });
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                return res.status(400).json({ error: 1, message: 'Quantité invalide' });
            }
        }
        
        const result = await ticketService.createHold(userId, items, RESERVATION_TTL_MS);
        
        if (!result.success) {
            return res.status(409).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, data: result.data });
        
    } catch (error) {
        console.error('Erreur createReservation:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/panier/annuler
 * annule une réservation temporaire
 */
async function cancelReservation(req, res) {
    try {
        const { holdId } = req.body || {};
        
        if (!holdId) {
            return res.status(400).json({ error: 1, message: 'holdId requis' });
        }
        
        const result = await ticketService.cancelHold(holdId, req.user?.id);
        
        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, message: result.message });
        
    } catch (error) {
        console.error('Erreur cancelReservation:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/orders/save
 * confirme et sauvegarde une commande
 */
async function saveOrder(req, res) {
    try {
        const { email, tickets, holdId } = req.body || {};
        const userId = req.user?.id;
        
        if (!email || !tickets || tickets.length === 0) {
            return res.status(400).json({ error: 1, message: 'Données manquantes' });
        }
        
        const result = await ticketService.confirmOrder(userId, email, tickets, holdId);
        
        if (!result.success) {
            return res.status(400).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, message: 'Commande sauvegardée', data: result.order });
        
    } catch (error) {
        console.error('Erreur saveOrder:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/orders/user/:userId
 * récupère les commandes d un utilisateur
 */
async function getUserOrders(req, res) {
    try {
        const { userId } = req.params;
        const orders = await ticketService.getUserOrders(userId);
        res.json({ error: 0, data: orders });
    } catch (error) {
        console.error('Erreur getUserOrders:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

export {
    getAllTickets,
    getTicketById,
    createReservation,
    cancelReservation,
    saveOrder,
    getUserOrders
};
