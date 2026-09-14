import { Router } from 'express';
import passport from '../config/passport.js';
import * as authController from '../controllers/auth_controller.js';

const router = Router();

// routes classiques avec email et mot de passe
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/provider-invitations/setup-password', authController.setupProviderPassword);

// routes oauth google
router.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get('/auth/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err) {
                console.error('Erreur Google OAuth callback:', err);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/auth/callback?error=google_auth_failed&details=${encodeURIComponent(err.message || 'unknown')}`);
            }
            if (!user) {
                console.error('Google OAuth: pas d\'utilisateur retourné. Info:', info);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/auth/callback?error=google_auth_failed`);
            }
            req.user = user;
            next();
        })(req, res, next);
    },
    authController.oauthCallback
);

// routes oauth discord
router.get('/auth/discord',
    passport.authenticate('discord', {
        scope: ['identify', 'email'],
        session: false
    })
);

router.get('/auth/discord/callback',
    (req, res, next) => {
        passport.authenticate('discord', { session: false }, (err, user, info) => {
            if (err) {
                console.error('Erreur Discord OAuth callback:', err);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/auth/callback?error=discord_auth_failed&details=${encodeURIComponent(err.message || 'unknown')}`);
            }
            if (!user) {
                console.error('Discord OAuth: pas d\'utilisateur retourné. Info:', info);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/auth/callback?error=discord_auth_failed`);
            }
            req.user = user;
            next();
        })(req, res, next);
    },
    authController.oauthCallback
);

export default router;
