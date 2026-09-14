/**
 * Modèle OrderItem - Détails des articles dans une commande (billets + produits boutique)
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    // Pour les billets classiques
    ticketId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        references: {
            model: 'tickets',
            key: 'id'
        }
    },
    // Pour les produits prestataires (boutique)
    productId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'provider_products',
            key: 'id'
        }
    },
    // Type d'article : 'ticket' ou 'shop'
    itemType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'ticket'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    // Code unique du billet (pour QR code / vérification)
    code: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: true
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    underscored: true
});

export default OrderItem;
