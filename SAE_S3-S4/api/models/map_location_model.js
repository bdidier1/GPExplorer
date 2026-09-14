/**
 * Modèle MapLocation - Emplacements sur la carte interactive
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const MapLocation = sequelize.define('MapLocation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // Coordonnées sur la carte SVG (legacy, nullable)
    x: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    y: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Coordonnées polygone Leaflet [[lat,lng], ...]
    coords: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // ID du prestataire associé (peut être null si emplacement libre)
    providerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'providers',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Zone de la carte (si plusieurs zones)
    zone: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'map_locations',
    timestamps: true,
    underscored: true
});

export default MapLocation;
