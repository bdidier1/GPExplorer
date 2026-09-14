/* factory crud générique pour les messages
 * évite de dupliquer la même logique dans les services de messagerie
 */
function createMessageCrudService(Model) {
    async function getAllMessages(where = {}) {
        return await Model.findAll({
            where,
            order: [['created_at', 'DESC']]
        });
    }

    async function markAsRead(messageId) {
        const message = await Model.findByPk(messageId);
        if (!message) return { success: false, message: 'Message introuvable' };
        await message.update({ isRead: true });
        return { success: true, message };
    }

    async function deleteMessage(messageId) {
        const message = await Model.findByPk(messageId);
        if (!message) return { success: false, message: 'Message introuvable' };
        await message.destroy();
        return { success: true };
    }

    async function getUnreadCount(where = {}) {
        return await Model.count({
            where: { ...where, isRead: false }
        });
    }

    return {
        getAllMessages,
        markAsRead,
        deleteMessage,
        getUnreadCount
    };
}

export { createMessageCrudService };