/**
 * Modèle ContactMessage - Messages de contact envoyés à l'admin
 */
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ContactMessage = sequelize.define('ContactMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'contact_messages',
    timestamps: true,
    underscored: true
});

export default ContactMessage;
