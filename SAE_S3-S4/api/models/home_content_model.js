/**
 * Modèle HomeContent - Contenu de la page d'accueil (multilingue)
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const HomeContent = sequelize.define('HomeContent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    language: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: 'fr'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    htmlContent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'home_contents',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['language']
        }
    ]
});

export default HomeContent;
