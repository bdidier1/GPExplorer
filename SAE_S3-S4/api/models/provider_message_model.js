/**
 * Modèle ProviderMessage - Messages privés envoyés aux prestataires
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ProviderMessage = sequelize.define('ProviderMessage', {
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
    author: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'provider_messages',
    timestamps: true,
    underscored: true
});

export default ProviderMessage;
