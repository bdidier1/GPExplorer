/* controller home content
 * gère les requêtes http du contenu de la page d accueil
 */
import * as homeContentService from '../services/home_content_service.js';

/* get /api/home-content
 * récupère tout le contenu multilingue
 */
async function getAllContent(req, res) {
    try {
        const content = await homeContentService.getAllContent();
        res.json(content);
    } catch (error) {
        console.error('Erreur getAllContent:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/home-content/:language
 * récupère le contenu pour une langue
 */
async function getContentByLanguage(req, res) {
    try {
        const { language } = req.params;
        const content = await homeContentService.getContentByLanguage(language);
        res.json({ error: 0, data: content });
    } catch (error) {
        console.error('Erreur getContentByLanguage:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/home-content
 * met à jour le contenu pour une langue
 */
async function updateContent(req, res) {
    try {
        const { language, title, htmlContent, imageUrl } = req.body;
        
        if (!language || !title) {
            return res.status(400).json({ error: 1, message: 'Langue et titre requis' });
        }
        
        const result = await homeContentService.updateContent(language, title, htmlContent, imageUrl);
        
        if (!result.success) {
            return res.status(400).json({ error: 1, message: result.message });
        }
        
        res.json({ error: 0, ...result.content });
    } catch (error) {
        console.error('Erreur updateContent:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

export {
    getAllContent,
    getContentByLanguage,
    updateContent
};
