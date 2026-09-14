/* service home content
 * gère le contenu multilingue de la page d accueil
 */
import { HomeContent } from '../models/index.js';
import fs from 'fs';
import path from 'path';

// contenu par défaut
const defaultContent = {
    fr: {
        title: 'À propos de l\'événement',
        htmlContent: `
            <p><strong>GP EXPLORER – THE LAST RACE est l'événement automobile organisé par un créateur de contenu le plus attendu de l'année, qui se déroulera sur le légendaire Circuit Bugatti du Mans du 8 au 10 octobre 2026.</strong></p>
            <p>Plongez au cœur de l'univers palpitant de la Formule 4 avec une expérience immersive unique mêlant vitesse, sensations fortes et divertissement d'exception.</p>
        `,
        imageUrl: '/img/img-home-about.jpeg'
    },
    en: {
        title: 'About the Event',
        htmlContent: `
            <p><strong>GP EXPLORER – THE LAST RACE is the most anticipated automotive event of the year organized by a content creator, taking place at the legendary Circuit Bugatti at Le Mans from October 8 to 10, 2026.</strong></p>
            <p>Immerse yourself in the thrilling world of Formula 4 with a unique immersive experience combining speed, thrills and exceptional entertainment.</p>
        `,
        imageUrl: '/img/img-home-about.jpeg'
    },
    es: {
        title: 'Acerca del Evento',
        htmlContent: `
            <p><strong>GP EXPLORER – THE LAST RACE es el evento automovilístico más esperado del año organizado por un creador de contenido, que tendrá lugar en el legendario Circuito Bugatti de Le Mans del 8 al 10 de octubre de 2026.</strong></p>
            <p>Sumérgete en el emocionante mundo de la Fórmula 4 con una experiencia inmersiva única que combina velocidad, emociones fuertes y entretenimiento excepcional.</p>
        `,
        imageUrl: '/img/img-home-about.jpeg'
    }
};

/* récupère tout le contenu multilingue */
async function getAllContent() {
    const contents = await HomeContent.findAll();
    
    if (contents.length === 0) {
        // retourne le contenu par défaut
        return defaultContent;
    }
    
    // transforme en objet par langue
    const result = {};
    for (const content of contents) {
        result[content.language] = {
            title: content.title,
            htmlContent: content.htmlContent,
            imageUrl: content.imageUrl
        };
    }
    
    return result;
}

/* récupère le contenu pour une langue */
async function getContentByLanguage(language) {
    const content = await HomeContent.findOne({
        where: { language }
    });
    
    if (!content) {
        return defaultContent[language] || defaultContent.fr;
    }
    
    return {
        title: content.title,
        htmlContent: content.htmlContent,
        imageUrl: content.imageUrl
    };
}

/* met à jour le contenu pour une langue */
async function updateContent(language, title, htmlContent, imageUrl) {
    let finalImageUrl = imageUrl;
    
    // si l image est en base64 on la sauvegarde
    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
        const saved = await saveBase64Image(imageUrl);
        if (saved.success) {
            finalImageUrl = saved.imageUrl;
        } else {
            return { success: false, message: saved.message };
        }
    }
    
    // upsert pour update ou insert
    const [content, created] = await HomeContent.upsert({
        language,
        title,
        htmlContent,
        imageUrl: finalImageUrl
    }, {
        returning: true
    });
    
    return {
        success: true,
        content: {
            title: content.title,
            htmlContent: content.htmlContent,
            imageUrl: content.imageUrl
        }
    };
}

/* sauvegarde une image base64 sur le disque */
async function saveBase64Image(dataUrl) {
    try {
        const matches = dataUrl.match(/^data:(image\/(png|jpeg|jpg));base64,(.*)$/);
        
        if (!matches) {
            return { success: false, message: 'Format d\'image invalide' };
        }
        
        const ext = matches[2] === 'jpeg' ? 'jpg' : matches[2];
        const base64Data = matches[3];
        
        const fileName = `home-about-${Date.now()}.${ext}`;
        const filePath = path.join(process.cwd(), 'img', fileName);
        
        // crée le dossier img s il n existe pas
        const imgDir = path.join(process.cwd(), 'img');
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }
        
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        
        return { success: true, imageUrl: `/img/${fileName}` };
        
    } catch (error) {
        return { success: false, message: 'Erreur lors de l\'enregistrement de l\'image' };
    }
}

export {
    getAllContent,
    getContentByLanguage,
    updateContent
};
