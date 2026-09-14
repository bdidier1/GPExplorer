/**
 * Modèle Provider - Prestataires de l'événement
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Provider = sequelize.define('Provider', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    logo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    // Contenu HTML de la page prestataire (éditeur WYSIWYG)
    htmlContent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Contenu structuré de la page prestataire (services, à propos, etc.)
    contentData: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    hasStatsAccess: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    hasGuestbookAccess: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'providers',
    timestamps: true,
    underscored: true
});

export default Provider;
