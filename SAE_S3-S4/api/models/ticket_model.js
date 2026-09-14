/**
 * Modèle Ticket - Billets de l'événement
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    segment: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'grand_prix'
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    variant: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    totalStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'tickets',
    timestamps: true,
    underscored: true
});

export default Ticket;
