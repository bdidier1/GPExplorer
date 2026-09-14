/* controller statistiques
 * gère les requêtes http des stats admin
 */
import * as statsService from '../services/stats_service.js';

/* get /api/admin/stats/dashboard
 * résumé complet pour le dashboard admin
 */
async function getDashboardSummary(req, res) {
    try {
        const summary = await statsService.getDashboardSummary();
        res.json({ error: 0, data: summary });
    } catch (error) {
        console.error('Erreur getDashboardSummary:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/admin/stats/stock
 * statistiques de stock
 */
async function getStockStats(req, res) {
    try {
        const stats = await statsService.getStockStats();
        res.json({ error: 0, data: stats });
    } catch (error) {
        console.error('Erreur getStockStats:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/admin/stats/visitors
 * statistiques de visiteurs par prestataire
 */
async function getVisitorStats(req, res) {
    try {
        const stats = await statsService.getVisitorStatsByProvider();
        res.json({ error: 0, data: stats });
    } catch (error) {
        console.error('Erreur getVisitorStats:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

export {
    getDashboardSummary,
    getStockStats,
    getVisitorStats
};
