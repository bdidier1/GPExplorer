/**
 * Modèle GuestbookEntry - Livre d'or des prestataires
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const GuestbookEntry = sequelize.define('GuestbookEntry', {
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
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    authorName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    authorEmail: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'guestbook_entries',
    timestamps: true,
    underscored: true
});

export default GuestbookEntry;
