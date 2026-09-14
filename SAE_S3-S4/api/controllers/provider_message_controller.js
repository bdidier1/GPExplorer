/* controller provider message
 * gère les messages privés des prestataires
 */
import * as providerMessageService from '../services/provider_message_service.js';
import { Provider } from '../models/index.js';

export async function sendMessage(req, res) {
    try {
        const { id: providerId } = req.params;
        const { author, email, content } = req.body;

        if (!author || !email || !content) {
            return res.status(400).json({ error: 1, message: 'Champs requis : author, email, content' });
        }

        const result = await providerMessageService.sendMessage(providerId, { author, email, content });
        if (!result.success) return res.status(404).json({ error: 1, message: result.message });

        res.status(201).json({ error: 0, data: result.message, message: 'Message envoyé avec succès' });
    } catch (error) {
        console.error('[ProviderMessage] sendMessage:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function getMessages(req, res) {
    try {
        const { id: providerId } = req.params;

        // on vérifie que la personne est le bon prestataire ou un admin
        const user = req.user;
        const isAdmin = user.role === 'organizer';
        const isOwner = user.provider?.id === providerId || user.provider?.providerId === providerId;

        if (!isAdmin && !isOwner) {
            // sinon on contrôle via la bdd
            const provider = await Provider.findOne({ where: { userId: user.id } });
            if (!provider || provider.id !== providerId) {
                return res.status(403).json({ error: 1, message: 'Accès refusé' });
            }
        }

        const messages = await providerMessageService.getMessagesForProvider(providerId);
        res.json({ error: 0, data: messages });
    } catch (error) {
        console.error('[ProviderMessage] getMessages:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function markAsRead(req, res) {
    try {
        const result = await providerMessageService.markAsRead(req.params.msgId);
        if (!result.success) return res.status(404).json({ error: 1, message: result.message });
        res.json({ error: 0, data: result.message });
    } catch (error) {
        console.error('[ProviderMessage] markAsRead:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function deleteMessage(req, res) {
    try {
        const result = await providerMessageService.deleteMessage(req.params.msgId);
        if (!result.success) return res.status(404).json({ error: 1, message: result.message });
        res.json({ error: 0, message: 'Message supprimé' });
    } catch (error) {
        console.error('[ProviderMessage] deleteMessage:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function getUnreadCount(req, res) {
    try {
        const { id: providerId } = req.params;
        const count = await providerMessageService.getUnreadCount(providerId);
        res.json({ error: 0, data: { count } });
    } catch (error) {
        console.error('[ProviderMessage] getUnreadCount:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}
