/**
 * Modèle User - Utilisateurs de l'application
 * Rôles: user, provider, organizer
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50]
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            // Ne valider que si un password est fourni (null = OAuth user)
            customLen(value) {
                if (value !== null && value.length < 6) {
                    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
                }
            }
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'provider', 'organizer'),
        defaultValue: 'user',
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    // Champs spécifiques aux prestataires
    companyName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    contactPerson: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // Champs spécifiques aux organisateurs
    organization: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    position: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // QR Code unique pour l'utilisateur
    qrCodeId: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
    },
    // Champs OAuth
    authProvider: {
        type: DataTypes.STRING(20),
        defaultValue: 'local',
        allowNull: false,
        field: 'auth_provider'
    },
    googleId: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
    },
    discordId: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
    },
    picture: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true, // createdAt, updatedAt automatiques
    underscored: true // snake_case pour les colonnes
});

export default User;
