/**
 * Modèle ProviderProduct - Produits des prestataires
 * Ces produits apparaissent dans la boutique et peuvent être commandés par les utilisateurs.
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ProviderProduct = sequelize.define('ProviderProduct', {
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
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    titleI18n: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    descriptionI18n: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'provider_products',
    timestamps: true,
    underscored: true
});

export default ProviderProduct;
