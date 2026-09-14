/* service contact message
 * gère les messages de contact côté admin
 */
import { ContactMessage } from '../models/index.js';
import { createMessageCrudService } from './message_crud_service.js';

const messageCrud = createMessageCrudService(ContactMessage);

async function createMessage(data) {
    const message = await ContactMessage.create({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message
    });
    return { success: true, message };
}

async function getAllMessages() {
    return await messageCrud.getAllMessages();
}

async function markAsRead(messageId) {
    return await messageCrud.markAsRead(messageId);
}

async function deleteMessage(messageId) {
    return await messageCrud.deleteMessage(messageId);
}

async function getUnreadCount() {
    return await messageCrud.getUnreadCount();
}

export { createMessage, getAllMessages, markAsRead, deleteMessage, getUnreadCount };
