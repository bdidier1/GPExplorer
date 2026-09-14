/**
 * Modèle MapRequest - Demandes d'emplacement sur la carte par les prestataires
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const MapRequest = sequelize.define('MapRequest', {
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
    providerUsername: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    providerDisplayName: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    providerContact: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    spotId: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    spotLabel: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reviewedBy: {
        type: DataTypes.JSON,
        allowNull: true
    },
    decisionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'map_requests',
    timestamps: true,
    underscored: true
});

export default MapRequest;
