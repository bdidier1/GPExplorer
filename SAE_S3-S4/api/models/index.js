/**
 * Fichier central des modèles Sequelize
 * Gère les associations et la synchronisation de la BDD
 */
import sequelize from '../database/db.js';
import { DataTypes } from 'sequelize';

// Importation des modèles
import User from './user_model.js';
import Session from './session_model.js';
import Ticket from './ticket_model.js';
import TicketHold from './ticket_hold_model.js';
import Order from './order_model.js';
import OrderItem from './order_item_model.js';
import Provider from './provider_model.js';
import MapLocation from './map_location_model.js';
import HomeContent from './home_content_model.js';
import GuestbookEntry from './guestbook_model.js';
import VisitorCount from './visitor_count_model.js';
import ContactMessage from './contact_message_model.js';
import ProviderMessage from './provider_message_model.js';
import MapRequest from './map_request_model.js';
import ProviderProduct from './provider_product_model.js';

// ==========================================
// ASSOCIATIONS (Relations entre tables)
// ==========================================

// User <-> Session (1:N)
User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Order (1:N)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> TicketHold (1:N)
User.hasMany(TicketHold, { foreignKey: 'userId', as: 'ticketHolds' });
TicketHold.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Ticket <-> OrderItem (1:N)
Ticket.hasMany(OrderItem, { foreignKey: 'ticketId', as: 'orderItems' });
OrderItem.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// ProviderProduct <-> OrderItem (1:N)
ProviderProduct.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(ProviderProduct, { foreignKey: 'productId', as: 'product' });

// User <-> Provider (1:1)
User.hasOne(Provider, { foreignKey: 'userId', as: 'provider' });
Provider.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Provider <-> MapLocation (1:1)
Provider.hasOne(MapLocation, { foreignKey: 'providerId', as: 'location' });
MapLocation.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// Provider <-> GuestbookEntry (1:N)
Provider.hasMany(GuestbookEntry, { foreignKey: 'providerId', as: 'guestbookEntries' });
GuestbookEntry.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// User <-> GuestbookEntry (1:N)
User.hasMany(GuestbookEntry, { foreignKey: 'userId', as: 'guestbookEntries' });
GuestbookEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Provider <-> VisitorCount (1:N)
Provider.hasMany(VisitorCount, { foreignKey: 'providerId', as: 'visitorCounts' });
VisitorCount.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// Provider <-> ProviderMessage (1:N)
Provider.hasMany(ProviderMessage, { foreignKey: 'providerId', as: 'messages' });
ProviderMessage.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// Provider <-> MapRequest (1:N)
Provider.hasMany(MapRequest, { foreignKey: 'providerId', as: 'mapRequests' });
MapRequest.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// Provider <-> ProviderProduct (1:N)
Provider.hasMany(ProviderProduct, { foreignKey: 'providerId', as: 'products' });
ProviderProduct.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// ==========================================
// SYNCHRONISATION BDD
// ==========================================
async function ensureProviderAccessSettingsColumns() {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('providers');

    if (!tableDescription.content_data) {
        await queryInterface.addColumn('providers', 'content_data', {
            type: DataTypes.TEXT('long'),
            allowNull: true
        });
    }

    if (!tableDescription.has_stats_access) {
        await queryInterface.addColumn('providers', 'has_stats_access', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    }

    if (!tableDescription.has_guestbook_access) {
        await queryInterface.addColumn('providers', 'has_guestbook_access', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
    }
}

async function ensureProviderProductI18nColumns() {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('provider_products');

    if (!tableDescription.title_i18n) {
        await queryInterface.addColumn('provider_products', 'title_i18n', {
            type: DataTypes.JSON,
            allowNull: true
        });
    }

    if (!tableDescription.description_i18n) {
        await queryInterface.addColumn('provider_products', 'description_i18n', {
            type: DataTypes.JSON,
            allowNull: true
        });
    }
}

async function ensureGuestbookUserColumnAndConstraints() {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('guestbook_entries');

    if (!tableDescription.user_id) {
        await queryInterface.addColumn('guestbook_entries', 'user_id', {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    }

    const indexes = await queryInterface.showIndex('guestbook_entries');
    const hasUniqueProviderUser = indexes.some((index) => {
        if (!index.unique || !Array.isArray(index.fields)) {
            return false;
        }
        const fieldNames = index.fields.map(field => field.attribute);
        return fieldNames.includes('provider_id') && fieldNames.includes('user_id');
    });

    if (!hasUniqueProviderUser) {
        await queryInterface.addIndex('guestbook_entries', ['provider_id', 'user_id'], {
            unique: true,
            name: 'uniq_guestbook_provider_user'
        });
    }
}

async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données établie avec succès.');

        // Synchronisation des tables (force: false pour ne pas écraser les données)
        // En développement, vous pouvez utiliser force: true pour recréer les tables
        await sequelize.sync({ force: false, alter: false });
        await ensureProviderAccessSettingsColumns();
        await ensureProviderProductI18nColumns();
        await ensureGuestbookUserColumnAndConstraints();
        console.log('Base de données synchronisée.');

    } catch (error) {
        console.error('Erreur de connexion à la base de données:', error);
        throw error;
    }
}

// Export des modèles et fonctions
export {
    sequelize,
    syncDatabase,
    User,
    Session,
    Ticket,
    TicketHold,
    Order,
    OrderItem,
    Provider,
    MapLocation,
    HomeContent,
    GuestbookEntry,
    VisitorCount,
    ContactMessage,
    ProviderMessage,
    MapRequest,
    ProviderProduct
};
