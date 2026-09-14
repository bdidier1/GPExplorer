/* service statistiques
 * gère les stats pour l'organisateur
 */
import { Ticket, Order, OrderItem, VisitorCount, Provider, ProviderProduct } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

/* récupère les stats globales des ventes */
async function getSalesStats() {
    // total des ventes
    const totalSales = await Order.sum('totalAmount', {
        where: { status: 'confirmed' }
    }) || 0;
    
    // nombre de commandes
    const totalOrders = await Order.count({
        where: { status: 'confirmed' }
    });
    
    // quantités vendues par type d'article
    const soldByTypeRaw = await OrderItem.findAll({
        attributes: [
            'itemType',
            [fn('SUM', col('quantity')), 'totalQuantity']
        ],
        include: [{
            model: Order,
            as: 'order',
            where: { status: 'confirmed' },
            attributes: []
        }],
        group: ['itemType'],
        raw: true
    });

    const soldByType = soldByTypeRaw.reduce((acc, row) => {
        const key = row.itemType || 'other';
        acc[key] = Number.parseInt(row.totalQuantity, 10) || 0;
        return acc;
    }, {});

    const totalTicketsSold = soldByType.ticket || 0;
    const totalObjectsSold = soldByType.shop || 0;
    const totalItemsSold = Object.values(soldByType).reduce((sum, qty) => sum + qty, 0);
    
    return {
        totalSales: Number.parseFloat(totalSales),
        totalOrders,
        totalTicketsSold,
        totalObjectsSold,
        totalItemsSold,
        soldByType,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
    };
}

/* récupère les ventes par segment de billet */
async function getSalesBySegment() {
    const stats = await OrderItem.findAll({
        attributes: [
            [fn('SUM', col('quantity')), 'totalQuantity'],
            [fn('SUM', literal('quantity * unit_price')), 'totalRevenue']
        ],
        include: [
            {
                model: Ticket,
                as: 'ticket',
                attributes: ['segment']
            },
            {
                model: Order,
                as: 'order',
                where: { status: 'confirmed' },
                attributes: []
            }
        ],
        group: ['ticket.segment', 'ticket.id'],
        raw: true
    });
    
    // regroupe par segment
    const bySegment = {};
    for (const stat of stats) {
        const segment = stat['ticket.segment'];
        if (!bySegment[segment]) {
            bySegment[segment] = { quantity: 0, revenue: 0 };
        }
        bySegment[segment].quantity += Number.parseInt(stat.totalQuantity, 10) || 0;
        bySegment[segment].revenue += Number.parseFloat(stat.totalRevenue) || 0;
    }
    
    return bySegment;
}

/* récupère les stats de stock */
async function getStockStats() {
    const tickets = await Ticket.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'segment', 'category', 'totalStock', 'sold']
    });
    
    return tickets.map(ticket => ({
        id: ticket.id,
        name: ticket.name,
        segment: ticket.segment,
        category: ticket.category,
        totalStock: ticket.totalStock,
        sold: ticket.sold,
        available: ticket.totalStock - ticket.sold,
        soldPercentage: ticket.totalStock > 0 ? 
            Math.round((ticket.sold / ticket.totalStock) * 100) : 0
    }));
}

/* récupère les stats de visiteurs par prestataire */
async function getVisitorStatsByProvider() {
    const stats = await VisitorCount.findAll({
        attributes: [
            'providerId',
            [fn('SUM', col('count')), 'totalVisitors']
        ],
        include: [{
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'category']
        }],
        group: ['providerId', 'provider.id'],
        order: [[fn('SUM', col('count')), 'DESC']]
    });
    
    return stats;
}

/* récupère les achats par catégorie billets + produits */
async function getPurchasesByCategory() {
    const rows = await OrderItem.findAll({
        attributes: [
            'itemType',
            [fn('SUM', col('OrderItem.quantity')), 'totalQuantity']
        ],
        include: [
            {
                model: Order,
                as: 'order',
                where: { status: 'confirmed' },
                attributes: []
            },
            {
                model: Ticket,
                as: 'ticket',
                attributes: ['id', 'name', 'segment', 'category'],
                required: false
            },
            {
                model: ProviderProduct,
                as: 'product',
                attributes: ['id', 'title', 'category'],
                required: false
            }
        ],
        group: [
            'itemType',
            'ticket.id',
            'ticket.name',
            'ticket.segment',
            'ticket.category',
            'product.id',
            'product.title',
            'product.category'
        ],
        raw: true
    });

    const byCategory = {};

    for (const row of rows) {
        const itemType = row.itemType || 'other';
        const ticketSegment = row['ticket.segment'];
        const ticketCategory = row['ticket.category'];
        const ticketName = row['ticket.name'];
        const productCategory = row['product.category'];
        const productTitle = row['product.title'];

        let category;
        if (itemType === 'ticket') {
            category = ticketSegment || ticketCategory || ticketName || 'billet_non_categorise';
        } else if (itemType === 'shop') {
            category = productCategory || productTitle || 'produit_non_categorise';
        } else if (itemType === 'merch') {
            category = 'merch';
        } else {
            category = itemType || 'non_classe';
        }
        const key = `${itemType}:${category}`;

        if (!byCategory[key]) {
            byCategory[key] = {
                itemType,
                category,
                quantity: 0
            };
        }

        byCategory[key].quantity += Number.parseInt(row.totalQuantity, 10) || 0;
    }

    return Object.values(byCategory)
        .sort((a, b) => b.quantity - a.quantity);
}

/* récupère le chiffre d'affaires journalier billets + produits */
async function getDailyRevenueTicketsAndProducts(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));

    const rows = await OrderItem.findAll({
        where: {
            itemType: {
                [Op.in]: ['ticket', 'shop']
            }
        },
        attributes: [
            [fn('DATE', col('order.order_date')), 'date'],
            [fn('SUM', literal('quantity * unit_price')), 'revenue']
        ],
        include: [{
            model: Order,
            as: 'order',
            where: {
                status: 'confirmed',
                orderDate: { [Op.gte]: startDate }
            },
            attributes: [],
            required: true
        }],
        group: [fn('DATE', col('order.order_date'))],
        order: [[fn('DATE', col('order.order_date')), 'ASC']],
        raw: true
    });

    const revenueByDate = new Map(
        rows.map(row => [row.date, Number.parseFloat(row.revenue) || 0])
    );

    const dailyRevenue = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        dailyRevenue.push({ date: key, revenue: revenueByDate.get(key) || 0 });
    }

    return dailyRevenue;
}

/* récupère un résumé complet pour le dashboard admin */
async function getDashboardSummary() {
    const [salesStats, stockStats, salesBySegment, purchasesByCategory, dailyRevenue] = await Promise.all([
        getSalesStats(),
        getStockStats(),
        getSalesBySegment(),
        getPurchasesByCategory(),
        getDailyRevenueTicketsAndProducts(30)
    ]);
    
    // calcule le taux de remplissage global
    const totalStock = stockStats.reduce((sum, t) => sum + t.totalStock, 0);
    const totalSold = stockStats.reduce((sum, t) => sum + t.sold, 0);
    const fillRate = totalStock > 0 ? Math.round((totalSold / totalStock) * 100) : 0;
    
    return {
        sales: salesStats,
        fillRate,
        salesBySegment,
        purchasesByCategory,
        dailyRevenue,
        lowStock: stockStats.filter(t => t.soldPercentage > 80).length,
        outOfStock: stockStats.filter(t => t.available === 0).length
    };
}

export {
    getSalesStats,
    getSalesBySegment,
    getStockStats,
    getVisitorStatsByProvider,
    getPurchasesByCategory,
    getDashboardSummary
};
