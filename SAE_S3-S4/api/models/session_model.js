/**
 * Modèle Session - Gestion des sessions utilisateurs
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Session = sequelize.define('Session', {
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
    sessionToken: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'sessions',
    timestamps: true,
    underscored: true
});

export default Session;
