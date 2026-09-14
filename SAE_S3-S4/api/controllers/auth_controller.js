import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as authService from '../services/auth_service.js';
import Provider from '../models/provider_model.js';
import { User } from '../models/index.js';

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};

function refreshCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: REFRESH_COOKIE_MAX_AGE
    };
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Données manquantes',
                message: 'Email et mot de passe requis'
            });
        }

        const result = await authService.verifyCredentials(email, password);
        if (!result.success) {
            return res.status(401).json({
                error: 'Identifiants invalides',
                message: result.message
            });
        }

        const user = result.user;
        const token = generateToken(user);

        const { token: refreshToken, sessionId } = await authService.generateRefreshToken(user);
        res.cookie('refreshToken', refreshToken, refreshCookieOptions());

        const userData = {
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            qrCodeId: user.qrCodeId
        };

        if (user.role === 'provider') {
            if (user.companyName) userData.companyName = user.companyName;
            if (user.category) userData.category = user.category;
            // on cherche le provider lie a cet utilisateur pour avoir le providerId
            try {
                const providerRecord = await Provider.findOne({ where: { userId: user.id } });
                if (providerRecord) userData.providerId = providerRecord.id;
            } catch (e) {
                console.error('Erreur recherche provider:', e);
            }
        }
        if (user.role === 'organizer' && user.organization) userData.organization = user.organization;

        res.json({
            message: 'Connexion réussie',
            user: userData,
            token,
            sessionId,
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
}

async function refresh(req, res) {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                error: 'Refresh token requis',
                message: 'Refresh token manquant'
            });
        }

        const session = await authService.verifyRefreshToken(token);

        if (!session) {
            res.clearCookie('refreshToken');
            return res.status(401).json({
                error: 'Refresh token invalide',
                message: 'Refresh token invalide ou expiré. Reconnectez-vous.'
            });
        }

        const user = session.user;

        await authService.invalidateSession(token);

        const newToken = generateToken(user);
        const { token: newRefreshToken, sessionId } = await authService.generateRefreshToken(user);

        res.cookie('refreshToken', newRefreshToken, refreshCookieOptions());

        res.json({
            message: 'Token renouvelé',
            token: newToken,
            sessionId,
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });
    } catch (error) {
        console.error('Erreur refresh:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
}

async function register(req, res) {
    try {
        const { username, email, password, confirmPassword, firstName, lastName, phone, role } = req.body;

        if (!firstName || firstName.trim().length < 2) {
            return res.status(400).json({ error: 'Validation', message: 'Le prénom doit contenir au moins 2 caractères' });
        }
        if (!lastName || lastName.trim().length < 2) {
            return res.status(400).json({ error: 'Validation', message: 'Le nom doit contenir au moins 2 caractères' });
        }
        if (!username || username.trim().length < 3) {
            return res.status(400).json({ error: 'Validation', message: "Le nom d'utilisateur doit contenir au moins 3 caractères" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: 'Validation', message: 'Adresse email invalide' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Validation', message: 'Le mot de passe doit contenir au moins 6 caractères' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Validation', message: 'Les mots de passe ne correspondent pas' });
        }

        const result = await authService.createUser({
            username, email, password, firstName, lastName, phone,
            role: role || 'user',
            companyName: req.body.companyName,
            category: req.body.category
        });

        if (!result.success) {
            return res.status(409).json({ error: 'Conflit', message: result.message });
        }

        const user = result.user;

        const token = generateToken(user);

        res.status(201).json({
            message: 'Compte créé avec succès',
            user: {
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                qrCodeId: user.qrCodeId
            },
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
}

async function logout(req, res) {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            await authService.invalidateSession(token);
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });

        res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
        console.error('Erreur logout:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
}

/* callback oauth google discord
 * appele apres auth reussie avec passport
 * genere un jwt puis redirige vers le front avec le token dans l url
 */
async function oauthCallback(req, res) {
    try {
        if (!req.user) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
        }

        const user = req.user;
        const token = generateToken(user);
        const { token: refreshToken, sessionId } = await authService.generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, refreshCookieOptions());

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const params = new URLSearchParams({
            token,
            userId: user.id,
            username: user.username,
            email: user.email || '',
            role: user.role,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            provider: user.authProvider || 'oauth',
            qrCodeId: user.qrCodeId || '',
            sessionId
        });

        return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (error) {
        console.error('Erreur OAuth callback:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/auth/callback?error=token_generation_failed`);
    }
}

/* route post /api/provider-invitations/setup-password
 * permet a un prestataire invite de definir son mot de passe local
 */
async function setupProviderPassword(req, res) {
    try {
        const { token: invitationToken, password, confirmPassword } = req.body || {};

        if (!invitationToken || !password || !confirmPassword) {
            return res.status(400).json({
                error: 1,
                message: 'Token, mot de passe et confirmation requis'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                error: 1,
                message: 'Le mot de passe doit contenir au moins 6 caractères'
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                error: 1,
                message: 'Les mots de passe ne correspondent pas'
            });
        }

        let invitationPayload;
        try {
            invitationPayload = authService.verifyProviderInvitationToken(invitationToken);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({ error: 1, message: 'Lien d\'invitation expiré' });
            }
            return res.status(400).json({ error: 1, message: 'Lien d\'invitation invalide' });
        }

        if (invitationPayload?.type !== 'provider-invitation' || !invitationPayload?.userId) {
            return res.status(400).json({ error: 1, message: 'Token d\'invitation invalide' });
        }

        const user = await User.findByPk(invitationPayload.userId);

        if (!user || !user.isActive) {
            return res.status(404).json({ error: 1, message: 'Compte prestataire introuvable' });
        }
        if (user.role !== 'provider') {
            return res.status(400).json({ error: 1, message: 'Ce compte n\'est pas un prestataire' });
        }
        if (invitationPayload.email && user.email !== invitationPayload.email) {
            return res.status(400).json({ error: 1, message: 'Invitation invalide pour ce compte' });
        }
        if (user.password) {
            return res.status(409).json({
                error: 1,
                message: 'Le mot de passe est déjà configuré pour ce compte'
            });
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await user.update({ password: hashedPassword });

        const accessToken = generateToken(user);
        const { token: refreshToken, sessionId } = await authService.generateRefreshToken(user);
        res.cookie('refreshToken', refreshToken, refreshCookieOptions());

        const userData = {
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            qrCodeId: user.qrCodeId
        };

        if (user.companyName) userData.companyName = user.companyName;
        if (user.category) userData.category = user.category;

        try {
            const providerRecord = await Provider.findOne({ where: { userId: user.id } });
            if (providerRecord) userData.providerId = providerRecord.id;
        } catch (e) {
            console.error('Erreur recherche provider:', e);
        }

        return res.json({
            error: 0,
            message: 'Mot de passe configuré avec succès. Connexion automatique effectuée.',
            user: userData,
            token: accessToken,
            sessionId,
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });
    } catch (error) {
        console.error('Erreur setupProviderPassword:', error);
        return res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

export {
    login,
    refresh,
    register,
    logout,
    oauthCallback,
    setupProviderPassword
};
