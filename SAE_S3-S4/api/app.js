/* architecture en couches : routes -> controllers -> services -> models */

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// charge les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

// import des modèles et synchro bdd
import { syncDatabase } from './models/index.js';

// passport.js stratégies local + jwt
import passport from './config/passport.js';

// import des routes
import authRoutes from './routes/auth_routes.js';
import ticketRoutes from './routes/ticket_routes.js';
import providerRoutes from './routes/provider_routes.js';
import mapRoutes from './routes/map_routes.js';
import homeContentRoutes from './routes/home_content_routes.js';
import statsRoutes from './routes/stats_routes.js';
import usersRoutes from './routes/users_routes.js';
import contactRoutes from './routes/contact_routes.js';
import providerMessageRoutes from './routes/provider_message_routes.js';
import mapRequestRoutes from './routes/map_request_routes.js';
import providerProductRoutes from './routes/provider_product_routes.js';

// ============================================
// configuration express
// ============================================
const app = express();

// cors autorise les requêtes cross-origin
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true // important pour les cookies/sessions
}));

// parse json avec limite augmentée pour les images base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// fichiers statiques avant le middleware session
// ============================================
app.use('/img', express.static(path.join(__dirname, 'img')));

// ============================================
// configuration sessions basée sur le cours
// ============================================
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'votre_secret_super_securise_sae',
    resave: false,
    saveUninitialized: false, // ne pas créer de session vide
    cookie: {
        secure: false, // mettre true si https en production
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// ============================================
// passport.js jwt + local strategies
// ============================================
// session false car on est stateless avec jwt
app.use(passport.initialize());

// ============================================
// configuration swagger basée sur le cours
// ============================================
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.yaml');
const swaggerDocs = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Festival - Documentation'
}));

// ============================================
// routes api
// ============================================
// toutes les routes sont préfixées par /api
app.use('/api', authRoutes);
app.use('/api', ticketRoutes);
app.use('/api', providerProductRoutes);
app.use('/api', providerRoutes);
app.use('/api', mapRoutes);
app.use('/api', homeContentRoutes);
app.use('/api', statsRoutes);
app.use('/api', usersRoutes);
app.use('/api', contactRoutes);
app.use('/api', providerMessageRoutes);
app.use('/api', mapRequestRoutes);

// route de santé
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// redirection racine vers la doc swagger
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});
// ============================================
// gestion des erreurs
// ============================================
// route non trouvée 404
app.use((req, res, next) => {
    res.status(404).json({
        error: 1,
        message: `Route non trouvée: ${req.method} ${req.path}`
    });
});

// gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(err.status || 500).json({
        error: 1,
        message: err.message || 'Erreur interne du serveur'
    });
});

// ============================================
// démarrage du serveur
// ============================================
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // synchronise la base de données sauf si SKIP_DB_SYNC=true
        if (process.env.SKIP_DB_SYNC?.toLowerCase() === 'true') {
            console.log('SKIP_DB_SYNC=true: synchronisation de la base de données sautée (mode documentation).');
        } else {
            await syncDatabase();
        }
        
        // démarre le serveur
        app.listen(PORT, () => {
            console.log('API Festival GP Explorer démarrée');
            console.log(`Serveur: http://localhost:${PORT}`);
            console.log(`Swagger: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Erreur au démarrage du serveur:', error);
        process.exit(1);
    }
}

await startServer();

export default app;
