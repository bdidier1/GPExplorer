/* controller users
 * gère les requêtes http pour la gestion des utilisateurs crud
 */
import { User } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import Provider from '../models/provider_model.js';
import { generateProviderInvitationToken } from '../services/auth_service.js';

const BCRYPT_ROUNDS = 12;
const PROVIDER_INVITATION_EXPIRES_HOURS = 24;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUserUpdatePayload(payload) {
    const sanitized = { ...payload };
    delete sanitized.password;
    delete sanitized.id;
    return sanitized;
}

function validateUserUpdateInput(id, updateData) {
    if (!UUID_REGEX.test(id)) {
        return { status: 400, message: 'Format d\'ID invalide' };
    }

    if (Object.keys(updateData).length === 0) {
        return { status: 400, message: 'Aucune donnée à mettre à jour' };
    }

    if (updateData.email && !EMAIL_REGEX.test(updateData.email)) {
        return { status: 400, message: 'Format d\'email invalide' };
    }

    if (updateData.username && (updateData.username.length < 3 || updateData.username.length > 50)) {
        return { status: 400, message: 'Le username doit contenir entre 3 et 50 caractères' };
    }

    return null;
}

async function hasUniqueConflict(userId, updateData) {
    if (!updateData.email && !updateData.username) {
        return false;
    }

    const orConditions = [];
    if (updateData.email) orConditions.push({ email: updateData.email });
    if (updateData.username) orConditions.push({ username: updateData.username });

    const existingUser = await User.findOne({
        where: {
            id: { [Op.ne]: userId },
            [Op.or]: orConditions
        }
    });

    return Boolean(existingUser);
}

function validateCreateUserInput(payload, normalizedRole) {
    const { username, email, password } = payload;

    if (!username || !email) {
        return 'Les champs username et email sont requis';
    }
    if (!EMAIL_REGEX.test(email)) {
        return 'Format d\'email invalide';
    }
    if (normalizedRole !== 'provider' && !password) {
        return 'Le mot de passe est requis';
    }
    if (password && password.length < 6) {
        return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (username.length < 3 || username.length > 50) {
        return 'Le username doit contenir entre 3 et 50 caractères';
    }

    return null;
}

function sanitizeSelfUpdatePayload(payload) {
    const sanitized = { ...payload };
    delete sanitized.id;
    delete sanitized.role;
    delete sanitized.isActive;
    delete sanitized.password;
    return sanitized;
}

function validateSelfUpdateInput(updateData) {
    const hasProfileField = ['username', 'firstName', 'lastName', 'email', 'phone']
        .some((field) => Object.hasOwn(updateData, field));
    const wantsPasswordUpdate = !!updateData.newPassword;

    if (!hasProfileField && !wantsPasswordUpdate) {
        return { status: 400, message: 'Aucune donnée à mettre à jour' };
    }

    if (updateData.email && !EMAIL_REGEX.test(updateData.email)) {
        return { status: 400, message: 'Format d\'email invalide' };
    }

    if (updateData.username && (updateData.username.length < 3 || updateData.username.length > 50)) {
        return { status: 400, message: 'Le username doit contenir entre 3 et 50 caractères' };
    }

    if (wantsPasswordUpdate && updateData.newPassword.length < 6) {
        return { status: 400, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' };
    }

    return null;
}

function buildSelfProfileUpdateData(payload) {
    const updateData = {};
    const editableFields = ['username', 'firstName', 'lastName', 'email', 'phone'];

    for (const field of editableFields) {
        if (Object.hasOwn(payload, field)) {
            updateData[field] = payload[field];
        }
    }

    return updateData;
}

async function validateAndApplySelfPasswordUpdate(payload, user, updateData) {
    if (!payload.newPassword) {
        return null;
    }

    if (!payload.currentPassword) {
        return { status: 400, message: 'Mot de passe actuel requis' };
    }

    if (!user.password) {
        return { status: 400, message: 'Ce compte n\'utilise pas de mot de passe local' };
    }

    const isCurrentPasswordValid = await bcrypt.compare(payload.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        return { status: 400, message: 'Mot de passe actuel incorrect' };
    }

    updateData.password = await bcrypt.hash(payload.newPassword, BCRYPT_ROUNDS);
    return null;
}

async function createProviderProfile(newUser, companyName, username, category) {
    await Provider.create({
        userId: newUser.id,
        name: companyName || username,
        description: `Description de ${companyName || username}`,
        category: category || 'other',
        isActive: true
    });
}

/* get /api/users
 * liste tous les utilisateurs
 */
async function getAllUsers(req, res) {
    try {
        const { role, search } = req.query;
        
        let whereClause = {};
        
        // filtre par rôle si besoin
        if (role) {
            whereClause.role = role;
        }
        
        // recherche sur nom email ou username
        if (search) {
            whereClause[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } }
            ];
        }
        
        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        
        res.json({ error: 0, data: users });
    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/users/me
 * récupère l utilisateur connecté
 */
async function getCurrentUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 1, message: 'Non autorisé' });
        }

        const userResponse = req.user.toJSON ? req.user.toJSON() : { ...req.user };
        delete userResponse.password;

        if (userResponse.role === 'provider') {
            const provider = await Provider.findOne({ where: { userId: userResponse.id } });
            if (provider) {
                userResponse.providerId = provider.id;
            }
        }

        res.json({ error: 0, data: userResponse });
    } catch (error) {
        console.error('Erreur getCurrentUser:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* put /api/users/me
 * met à jour le profil de l utilisateur connecté
 */
async function updateCurrentUser(req, res) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 1, message: 'Non autorisé' });
        }

        const payload = sanitizeSelfUpdatePayload(req.body || {});
        const inputError = validateSelfUpdateInput(payload);
        if (inputError) {
            return res.status(inputError.status).json({ error: 1, message: inputError.message });
        }

        const user = await User.findByPk(req.user.id);
        if (!user?.isActive) {
            return res.status(404).json({ error: 1, message: 'Utilisateur introuvable' });
        }

        const updateData = buildSelfProfileUpdateData(payload);

        const conflict = await hasUniqueConflict(user.id, updateData);
        if (conflict) {
            return res.status(409).json({ error: 1, message: 'Email ou username déjà utilisé' });
        }

        const passwordError = await validateAndApplySelfPasswordUpdate(payload, user, updateData);
        if (passwordError) {
            return res.status(passwordError.status).json({ error: 1, message: passwordError.message });
        }

        await user.update(updateData);

        const userResponse = user.toJSON();
        delete userResponse.password;

        return res.json({ error: 0, data: userResponse, message: 'Profil mis à jour' });
    } catch (error) {
        console.error('Erreur updateCurrentUser:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 1,
                message: 'Erreur de validation',
                details: error.errors.map(e => e.message)
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 1, message: 'Email ou username déjà utilisé' });
        }

        return res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/users/:id
 * récupère un utilisateur par id
 */
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        
        // validation du format uuid
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ 
                error: 1, 
                message: 'Format d\'ID invalide' 
            });
        }
        
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({ error: 1, message: 'Utilisateur introuvable' });
        }
        
        res.json({ error: 0, data: user });
    } catch (error) {
        console.error('Erreur getUserById:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/users
 * crée un nouvel utilisateur
 */
async function createUser(req, res) {
    try {
        const { username, email, password, role, firstName, lastName, phone, companyName, category } = req.body;
        const normalizedRole = role || 'user';

        const inputError = validateCreateUserInput({ username, email, password }, normalizedRole);
        if (inputError) {
            return res.status(400).json({ error: 1, message: inputError });
        }
        
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
            return res.status(409).json({ error: 1, message: 'Un utilisateur avec cet email ou username existe déjà' });
        }
        
        // génère un qr code id unique
        const qrCodeId = `qr-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
        const hashedPassword = password ? await bcrypt.hash(password, BCRYPT_ROUNDS) : null;

        // crée l utilisateur
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: normalizedRole,
            firstName,
            lastName,
            phone,
            companyName,
            category,
            qrCodeId,
            isActive: true
        });

        let invitationLink = null;
        if (normalizedRole === 'provider') {
            await createProviderProfile(newUser, companyName, username, category);

            const invitationToken = generateProviderInvitationToken(newUser);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            invitationLink = `${frontendUrl}/invitation/setup-password?token=${encodeURIComponent(invitationToken)}`;
        }
        
        // retourne l utilisateur sans le mot de passe
        const userResponse = newUser.toJSON();
        delete userResponse.password;

        const responseData = {
            ...userResponse,
            invitationLink,
            invitationExpiresInHours: invitationLink ? PROVIDER_INVITATION_EXPIRES_HOURS : null
        };
        
        res.status(201).json({ error: 0, data: responseData });
    } catch (error) {
        console.error('Erreur createUser:', error);
        
        // gère les erreurs sequelize de validation
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                error: 1, 
                message: 'Erreur de validation',
                details: error.errors.map(e => e.message)
            });
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ 
                error: 1, 
                message: 'Un utilisateur avec cet email ou username existe déjà' 
            });
        }
        
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* put /api/users/:id
 * met à jour un utilisateur
 */
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const updateData = sanitizeUserUpdatePayload(req.body || {});

        const inputError = validateUserUpdateInput(id, updateData);
        if (inputError) {
            return res.status(inputError.status).json({ error: 1, message: inputError.message });
        }
        
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: 1, message: 'Utilisateur introuvable' });
        }

        const conflict = await hasUniqueConflict(id, updateData);
        if (conflict) {
            return res.status(409).json({ error: 1, message: 'Email ou username déjà utilisé' });
        }
        
        await user.update(updateData);
        
        // retourne l utilisateur mis à jour sans mot de passe
        const userResponse = user.toJSON();
        delete userResponse.password;
        
        res.json({ error: 0, data: userResponse });
    } catch (error) {
        console.error('Erreur updateUser:', error);
        
        // gère les erreurs sequelize de validation
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                error: 1, 
                message: 'Erreur de validation',
                details: error.errors.map(e => e.message)
            });
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ 
                error: 1, 
                message: 'Email ou username déjà utilisé' 
            });
        }
        
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* delete /api/users/:id
 * désactive un utilisateur soft delete
 */
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        
        // validation du format uuid
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ 
                error: 1, 
                message: 'Format d\'ID invalide' 
            });
        }
        
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: 1, message: 'Utilisateur introuvable' });
        }
        
        // vérifie si l utilisateur est déjà désactivé
        if (!user.isActive) {
            return res.status(400).json({ 
                error: 1, 
                message: 'Cet utilisateur est déjà désactivé' 
            });
        }
        
        // soft delete on désactive au lieu de supprimer
        await user.update({ isActive: false });
        
        res.json({ error: 0, message: 'Utilisateur désactivé avec succès' });
    } catch (error) {
        console.error('Erreur deleteUser:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

export {
    getCurrentUser,
    updateCurrentUser,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
