/**
 * Modèle VisitorCount - Comptage des visiteurs (statistiques)
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const VisitorCount = sequelize.define('VisitorCount', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'providers',
            key: 'id'
        }
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    recordedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // Pour filtrer par heure/jour
    hour: {
        type: DataTypes.INTEGER, // 0-23
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'visitor_counts',
    timestamps: true,
    underscored: true
});

export default VisitorCount;
