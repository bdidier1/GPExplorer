/**
 * Modèle Order - Commandes de billets
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    holdId: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'confirmed'
    },
    orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
});

export default Order;
