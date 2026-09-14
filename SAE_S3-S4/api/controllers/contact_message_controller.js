/* controller des messages de contact pour l admin */
import * as contactMessageService from '../services/contact_message_service.js';

export async function sendMessage(req, res) {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 1, message: 'Champs requis : name, email, subject, message' });
        }

        const result = await contactMessageService.createMessage({ name, email, phone, subject, message });
        res.status(201).json({ error: 0, data: result.message, message: 'Message envoyé avec succès' });
    } catch (error) {
        console.error('[ContactMessage] sendMessage:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function getMessages(req, res) {
    try {
        const messages = await contactMessageService.getAllMessages();
        res.json({ error: 0, data: messages });
    } catch (error) {
        console.error('[ContactMessage] getMessages:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function markAsRead(req, res) {
    try {
        const result = await contactMessageService.markAsRead(req.params.id);
        if (!result.success) return res.status(404).json({ error: 1, message: result.message });
        res.json({ error: 0, data: result.message });
    } catch (error) {
        console.error('[ContactMessage] markAsRead:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function deleteMessage(req, res) {
    try {
        const result = await contactMessageService.deleteMessage(req.params.id);
        if (!result.success) return res.status(404).json({ error: 1, message: result.message });
        res.json({ error: 0, message: 'Message supprimé' });
    } catch (error) {
        console.error('[ContactMessage] deleteMessage:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}

export async function getUnreadCount(req, res) {
    try {
        const count = await contactMessageService.getUnreadCount();
        res.json({ error: 0, data: { count } });
    } catch (error) {
        console.error('[ContactMessage] getUnreadCount:', error);
        res.status(500).json({ error: 1, message: error.message });
    }
}
