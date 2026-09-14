/* service d authentification
 * gère la logique métier du login register et des sessions jwt
 */
import { User, Session } from '../models/index.js';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../config', '.env') });

/* nombre de rounds bcrypt
 * 12 est un bon compromis sécurité perf
 */
const BCRYPT_ROUNDS = 12;
const PROVIDER_INVITATION_EXPIRES_IN = process.env.PROVIDER_INVITATION_EXPIRES_IN || '24h';

function getInvitationSecret() {
    return process.env.JWT_INVITATION_SECRET || process.env.JWT_SECRET;
}

/* génère un id unique */
function generateId(prefix = 'id') {
    return prefix + '-' + Math.random().toString(36).slice(2, 10) + '-' + Math.random().toString(36).slice(2, 10);
}

/* trouve un utilisateur avec email ou username */
async function findUserByEmailOrUsername(identifier) {
    return await User.findOne({
        where: {
            [Op.or]: [
                { email: identifier },
                { username: identifier }
            ],
            isActive: true
        }
    });
}

/* vérifie les identifiants avec bcrypt
 * retourne l utilisateur si tout est ok
 */
async function verifyCredentials(identifier, password) {
    const user = await findUserByEmailOrUsername(identifier);

    if (!user) {
        // comparaison fictive pour limiter les timing attacks
        await bcrypt.compare(password, '$2b$12$invalidhashfortimingprotection000000000000000000000');
        return { success: false, message: "Email/nom d'utilisateur ou mot de passe incorrect" };
    }

    if (!user.password) {
        return {
            success: false,
            message: 'Ce compte doit d\'abord définir son mot de passe via le lien d\'invitation'
        };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return { success: false, message: "Email/nom d'utilisateur ou mot de passe incorrect" };
    }

    return { success: true, user };
}

/* génère un refresh token jwt et le sauvegarde en bdd
 * retourne le token et le sessionId
 */
async function generateRefreshToken(user) {
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await Session.create({
        userId: user.id,
        sessionToken: token,
        expiresAt,
        isActive: true
    });

    // session.id est le uuid de la session
    return { token, sessionId: session.id };
}

/* vérifie la signature du refresh token
 * vérifie aussi que la session existe encore en bdd
 */
async function verifyRefreshToken(token) {
    try {
        jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
        return null;
    }

    const session = await Session.findOne({
        where: {
            sessionToken: token,
            isActive: true,
            expiresAt: { [Op.gt]: new Date() }
        },
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName']
        }]
    });

    return session;
}

/* invalide un refresh token
 * utile pour déconnexion et rotation de token
 */
async function invalidateSession(sessionToken) {
    const result = await Session.update(
        { isActive: false },
        { where: { sessionToken } }
    );
    return result[0] > 0;
}

/* crée un nouvel utilisateur */
async function createUser(userData) {
    const { username, email, password, firstName, lastName, phone, role } = userData;
    
    // vérifie si l utilisateur existe déjà
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [
                { email },
                { username }
            ]
        }
    });
    
    if (existingUser) {
        return { success: false, message: "Un compte avec cet email ou nom d'utilisateur existe déjà" };
    }
    
    // hash le mot de passe avant de le stocker
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const qrCodeId = generateId('qr');
    
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'user',
        qrCodeId,
        isActive: true,
        companyName: userData.companyName || null,
        category: userData.category || null,
        contactPerson: userData.contactPerson || `${firstName} ${lastName}`,
        organization: userData.organization || null,
        position: userData.position || null
    });
    
    return { success: true, user: newUser };
}

/* génère un token d invitation pour le setup du mot de passe prestataire */
function generateProviderInvitationToken(user) {
    return jwt.sign(
        {
            type: 'provider-invitation',
            userId: user.id,
            email: user.email
        },
        getInvitationSecret(),
        { expiresIn: PROVIDER_INVITATION_EXPIRES_IN }
    );
}

/* vérifie un token d invitation prestataire */
function verifyProviderInvitationToken(token) {
    return jwt.verify(token, getInvitationSecret());
}

export {
    generateId,
    findUserByEmailOrUsername,
    verifyCredentials,
    generateRefreshToken,
    verifyRefreshToken,
    invalidateSession,
    createUser,
    generateProviderInvitationToken,
    verifyProviderInvitationToken
};
