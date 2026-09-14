/**
 * Service Tickets
 * G�re la logique m�tier pour les billets
 */
import { Ticket, Order, OrderItem, ProviderProduct, sequelize } from '../models/index.js';
import TicketHold from '../models/ticket_hold_model.js';
import { Op } from 'sequelize';

/**
 * G�n�re un ID unique
 */
function generateId(prefix = 'id') {
    return prefix + '-' + Math.random().toString(36).slice(2, 10);
}

/**
 * Nettoie les r�servations expir�es
 */
async function cleanupExpiredHolds() {
    await TicketHold.destroy({
        where: {
            expiresAt: {
                [Op.lte]: new Date()
            }
        }
    });
}

/**
 * Calcule la quantit� r�serv�e (en hold) pour un ticket
 */
async function computeReservedQuantity(ticketId) {
    await cleanupExpiredHolds();

    const activeHolds = await TicketHold.findAll({
        where: {
            expiresAt: {
                [Op.gt]: new Date()
            }
        }
    });

    let total = 0;
    for (const hold of activeHolds) {
        const items = Array.isArray(hold.items) ? hold.items : [];
        for (const item of items) {
            if (item.type !== 'shop' && item.type !== 'merch' && item.ticketId === ticketId) {
                total += item.quantity;
            }
        }
    }

    return total;
}

/**
 * R�cup�re tous les tickets avec leur �tat
 */
async function getAllTickets() {
    const tickets = await Ticket.findAll({
        where: { isActive: true },
        order: [['segment', 'ASC'], ['date', 'ASC'], ['price', 'ASC']]
    });

    return await Promise.all(tickets.map(async (ticket) => {
        const reserved = await computeReservedQuantity(ticket.id);
        const available = ticket.totalStock - ticket.sold - reserved;
        return {
            ...ticket.toJSON(),
            reserved,
            available: Math.max(0, available)
        };
    }));
}

/**
 * R�cup�re un ticket par ID avec son �tat
 */
async function getTicketById(ticketId) {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return null;

    const reserved = await computeReservedQuantity(ticket.id);
    const available = ticket.totalStock - ticket.sold - reserved;

    return {
        ...ticket.toJSON(),
        reserved,
        available: Math.max(0, available)
    };
}

/**
 * Cr�e une r�servation temporaire (hold)
 */
async function createHold(userId, items, ttlMs = 15 * 60 * 1000) {
    for (const item of items) {
        if (item.type === 'shop') {
            const product = await ProviderProduct.findByPk(item.ticketId);
            if (!product) {
                return { success: false, message: `Produit boutique introuvable: ${item.ticketId}` };
            }
            const available = product.stock - (product.sold || 0);
            if (item.quantity > available) {
                return { success: false, message: `Stock insuffisant pour ${product.title}` };
            }
            continue;
        }

        if (item.type === 'merch') {
            continue;
        }

        const ticket = await getTicketById(item.ticketId);
        if (!ticket) {
            return { success: false, message: `Ticket inconnu: ${item.ticketId}` };
        }
        if (item.quantity > ticket.available) {
            return { success: false, message: `Stock insuffisant pour ${ticket.name}` };
        }
    }

    const holdId = generateId('hold');
    const expiresAt = new Date(Date.now() + ttlMs);
    const holdItems = items.map(i => ({
        ticketId: i.ticketId,
        quantity: i.quantity,
        type: i.type || 'ticket'
    }));

    await TicketHold.create({
        holdId,
        userId,
        items: holdItems,
        expiresAt
    });

    return {
        success: true,
        data: {
            holdId,
            expiresAt,
            ttlSeconds: Math.floor(ttlMs / 1000),
            items: holdItems
        }
    };
}

/**
 * Annule une r�servation temporaire
 */
async function cancelHold(holdId, requesterUserId = null) {
    await cleanupExpiredHolds();

    const hold = await TicketHold.findByPk(holdId);
    if (!hold) {
        return { success: false, message: 'R�servation introuvable ou expir�e' };
    }

    if (requesterUserId && String(hold.userId) !== String(requesterUserId)) {
        return { success: false, message: 'Acc�s refus� � cette r�servation' };
    }

    await hold.destroy();
    return { success: true, message: 'R�servation annul�e' };
}

/**
 * Confirme une commande (transforme un hold en commande)
 */
async function confirmOrder(userId, email, ticketItems, holdId = null) {
    const transaction = await sequelize.transaction();

    try {
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of ticketItems) {
            if (item.type === 'shop') {
                const product = await ProviderProduct.findByPk(item.ticketId, {
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });

                if (!product) {
                    throw new Error(`Produit boutique introuvable: ${item.ticketId}`);
                }

                const available = product.stock - product.sold;
                if (item.quantity > available) {
                    throw new Error(`Stock insuffisant pour � ${product.title} � (${available} restant${available > 1 ? 's' : ''}, ${item.quantity} demand�${item.quantity > 1 ? 's' : ''})`);
                }

                totalAmount += parseFloat(product.price) * item.quantity;

                await product.update({ sold: product.sold + item.quantity }, { transaction });

                orderItemsData.push({
                    productId: item.ticketId,
                    ticketId: null,
                    itemType: 'shop',
                    quantity: item.quantity,
                    unitPrice: product.price,
                    code: generateId('SHOP').toUpperCase()
                });
                continue;
            }

            if (item.type === 'merch') {
                const unitPrice = parseFloat(item.price || 0);
                totalAmount += unitPrice * item.quantity;

                orderItemsData.push({
                    productId: null,
                    ticketId: null,
                    itemType: 'merch',
                    quantity: item.quantity,
                    unitPrice,
                    code: generateId('MERCH').toUpperCase()
                });
                continue;
            }

            const ticket = await Ticket.findByPk(item.ticketId, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!ticket) {
                throw new Error(`Ticket inconnu: ${item.ticketId}`);
            }

            const available = ticket.totalStock - ticket.sold;
            if (item.quantity > available) {
                throw new Error(`Stock insuffisant pour � ${ticket.name} � (${available} restant${available > 1 ? 's' : ''}, ${item.quantity} demand�${item.quantity > 1 ? 's' : ''})`);
            }

            totalAmount += parseFloat(ticket.price) * item.quantity;
            await ticket.update({ sold: ticket.sold + item.quantity }, { transaction });

            for (let i = 0; i < item.quantity; i++) {
                orderItemsData.push({
                    ticketId: item.ticketId,
                    productId: null,
                    itemType: 'ticket',
                    quantity: 1,
                    unitPrice: ticket.price,
                    code: generateId('TKT').toUpperCase()
                });
            }
        }

        const order = await Order.create({
            userId,
            email,
            holdId,
            totalAmount,
            status: 'confirmed',
            orderDate: new Date()
        }, { transaction });

        for (const itemData of orderItemsData) {
            await OrderItem.create({ orderId: order.id, ...itemData }, { transaction });
        }

        if (holdId) {
            await TicketHold.destroy({ where: { holdId }, transaction });
        }

        await transaction.commit();

        const completeOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [
                    {
                        model: Ticket,
                        as: 'ticket',
                        attributes: ['id', 'name', 'segment', 'category', 'date'],
                        required: false
                    },
                    {
                        model: ProviderProduct,
                        as: 'product',
                        attributes: ['id', 'title', 'category', 'image', 'providerId'],
                        required: false
                    }
                ]
            }]
        });

        return { success: true, order: completeOrder };
    } catch (error) {
        await transaction.rollback();
        return { success: false, message: error.message };
    }
}

/**
 * R�cup�re les commandes d'un utilisateur
 */
async function getUserOrders(userId) {
    return await Order.findAll({
        where: { userId },
        include: [{
            model: OrderItem,
            as: 'items',
            include: [
                {
                    model: Ticket,
                    as: 'ticket',
                    attributes: ['id', 'name', 'segment', 'category', 'date', 'price'],
                    required: false
                },
                {
                    model: ProviderProduct,
                    as: 'product',
                    attributes: ['id', 'title', 'category', 'image', 'price', 'providerId'],
                    required: false
                }
            ]
        }],
        order: [['orderDate', 'DESC']]
    });
}

export {
    generateId,
    getAllTickets,
    getTicketById,
    createHold,
    cancelHold,
    confirmOrder,
    getUserOrders
};
