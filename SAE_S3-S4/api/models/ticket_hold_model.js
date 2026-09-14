/**
 * Modèle TicketHold - Réservations temporaires (panier)
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const TicketHold = sequelize.define('TicketHold', {
    holdId: {
        type: DataTypes.STRING(64),
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'ticket_holds',
    timestamps: true,
    underscored: true
});

export default TicketHold;
