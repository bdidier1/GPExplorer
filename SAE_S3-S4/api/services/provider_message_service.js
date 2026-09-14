/* service providermessage
 * gère les messages privés envoyés aux prestataires
 */
import { ProviderMessage, Provider } from '../models/index.js';
import { createMessageCrudService } from './message_crud_service.js';

const messageCrud = createMessageCrudService(ProviderMessage);

async function sendMessage(providerId, data) {
    const provider = await Provider.findByPk(providerId);
    if (!provider) return { success: false, message: 'Prestataire introuvable' };

    const message = await ProviderMessage.create({
        providerId,
        author: data.author,
        email: data.email,
        content: data.content
    });
    return { success: true, message };
}

async function getMessagesForProvider(providerId) {
    return await messageCrud.getAllMessages({ providerId });
}

async function markAsRead(messageId) {
    return await messageCrud.markAsRead(messageId);
}

async function deleteMessage(messageId) {
    return await messageCrud.deleteMessage(messageId);
}

async function getUnreadCount(providerId) {
    return await messageCrud.getUnreadCount({ providerId });
}

export { sendMessage, getMessagesForProvider, markAsRead, deleteMessage, getUnreadCount };
