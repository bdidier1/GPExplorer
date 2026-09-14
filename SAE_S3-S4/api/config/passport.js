import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

// ============================================
// Stratégie JWT (existante)
// ============================================
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findByPk(payload.userId, {
            attributes: { exclude: ['password'] }
        });
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

// ============================================
// Stratégie Local (existante)
// ============================================
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ where: { email, isActive: true } });
            if (!user) return done(null, false, { message: 'Identifiants invalides' });
            if (!user.password) return done(null, false, { message: 'Utilisez la connexion via Google ou Discord' });
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return done(null, false, { message: 'Identifiants invalides' });
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// ============================================
// Stratégie Google OAuth 2.0
// ============================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
            scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || null;
                const name = profile.displayName || '';
                const picture = profile.photos?.[0]?.value || null;

                // Chercher par googleId
                let user = await User.findOne({ where: { googleId: profile.id } });

                if (!user && email) {
                    // Chercher par email (lier un compte existant)
                    user = await User.findOne({ where: { email, isActive: true } });
                    if (user) {
                        user.googleId = profile.id;
                        user.authProvider = user.authProvider === 'local' ? 'local+google' : user.authProvider;
                        if (picture && !user.picture) user.picture = picture;
                        await user.save();
                    }
                }

                if (!user) {
                    // Créer un nouveau compte
                    const nameParts = name.split(' ');
                    const firstName = nameParts[0] || 'Utilisateur';
                    const lastName = nameParts.slice(1).join(' ') || 'Google';
                    const username = email
                        ? email.split('@')[0] + '_g' + Math.random().toString(36).slice(2, 6)
                        : 'google_' + profile.id.slice(0, 8);

                    user = await User.create({
                        googleId: profile.id,
                        email,
                        username,
                        firstName,
                        lastName,
                        picture,
                        authProvider: 'google',
                        role: 'user',
                        isActive: true,
                        password: null,
                        qrCodeId: 'qr-' + Math.random().toString(36).slice(2, 10) + '-' + Math.random().toString(36).slice(2, 10)
                    });
                }

                return done(null, user);
            } catch (error) {
                console.error('Erreur Google OAuth:', error);
                return done(error, null);
            }
        }
    ));
    console.log('Stratégie Google OAuth configurée');
} else {
    console.log('Google OAuth non configuré (GOOGLE_CLIENT_ID/SECRET manquants)');
}

// ============================================
// Stratégie Discord OAuth 2.0
// ============================================
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use(new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3001/api/auth/discord/callback',
            scope: ['identify', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.email || null;
                const name = profile.global_name || profile.username || '';
                const picture = profile.avatar
                    ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                    : null;

                // Chercher par discordId
                let user = await User.findOne({ where: { discordId: profile.id } });

                if (!user && email) {
                    // Chercher par email (lier un compte existant)
                    user = await User.findOne({ where: { email, isActive: true } });
                    if (user) {
                        user.discordId = profile.id;
                        user.authProvider = user.authProvider === 'local' ? 'local+discord' : user.authProvider;
                        if (picture && !user.picture) user.picture = picture;
                        await user.save();
                    }
                }

                if (!user) {
                    // Créer un nouveau compte
                    const username = (profile.username || 'discord_' + profile.id.slice(0, 8))
                        + '_d' + Math.random().toString(36).slice(2, 6);

                    user = await User.create({
                        discordId: profile.id,
                        email,
                        username,
                        firstName: name.split(' ')[0] || 'Utilisateur',
                        lastName: name.split(' ').slice(1).join(' ') || 'Discord',
                        picture,
                        authProvider: 'discord',
                        role: 'user',
                        isActive: true,
                        password: null,
                        qrCodeId: 'qr-' + Math.random().toString(36).slice(2, 10) + '-' + Math.random().toString(36).slice(2, 10)
                    });
                }

                return done(null, user);
            } catch (error) {
                console.error('Erreur Discord OAuth:', error);
                return done(error, null);
            }
        }
    ));
    console.log('Stratégie Discord OAuth configurée');
} else {
    console.log('Discord OAuth non configuré (DISCORD_CLIENT_ID/SECRET manquants)');
}


export default passport;
