import { defineStore } from 'pinia'
import { get, post } from '@/services/apiClient.js'

export const useHomeContentStore = defineStore('homeContent', {
  state: () => ({
    content: {
      fr: {
        title: 'À propos de l\'événement',
        htmlContent: `
          <p><strong>GP EXPLORER – THE LAST RACE est l'événement automobile organisé par un créateur de contenu le plus attendu de l'année, qui se déroulera sur le légendaire Circuit Bugatti du Mans du 8 au 10 octobre 2026.</strong></p>
          <p>Plongez au cœur de l'univers palpitant de la Formule 4 avec une expérience immersive unique mêlant vitesse, sensations fortes et divertissement d'exception. Assistez à des courses spectaculaires disputées par vos créateurs de contenus favoris, vivez l'ambiance des paddocks et découvrez les coulisses d'un week-end de compétition intense.</p>
          <p>Au programme : épreuves de Formule 4, karting professionnel, simulateurs ultra-réalistes, grande roue panoramique, concerts exclusifs et gastronomie premium.</p>
          <p>Ne manquez pas THE LAST RACE – un week-end mémorable où la passion de la course rencontre l'énergie unique du GP Explorer !</p>
        `,
        imageUrl: '/img/img-home-about.jpeg'
      },
      en: {
        title: 'About the Event',
        htmlContent: `
          <p><strong>GP EXPLORER – THE LAST RACE is the most anticipated automotive event of the year organized by a content creator, taking place at the legendary Circuit Bugatti at Le Mans from October 8 to 10, 2026.</strong></p>
          <p>Immerse yourself in the thrilling world of Formula 4 with a unique immersive experience combining speed, thrills and exceptional entertainment. Watch spectacular races contested by your favorite content creators, experience the paddock atmosphere and discover behind the scenes of an intense competition weekend.</p>
          <p>On the program: Formula 4 events, professional karting, ultra-realistic simulators, panoramic Ferris wheel, exclusive concerts and premium gastronomy.</p>
          <p>Don't miss THE LAST RACE – a memorable weekend where the passion for racing meets the unique energy of GP Explorer!</p>
        `,
        imageUrl: '/img/img-home-about.jpeg'
      },
      es: {
        title: 'Acerca del Evento',
        htmlContent: `
          <p><strong>GP EXPLORER – THE LAST RACE es el evento automovilístico más esperado del año organizado por un creador de contenido, que tendrá lugar en el legendario Circuito Bugatti de Le Mans del 8 al 10 de octubre de 2026.</strong></p>
          <p>Sumérgete en el emocionante mundo de la Fórmula 4 con una experiencia inmersiva única que combina velocidad, emociones fuertes y entretenimiento excepcional. Observa carreras espectaculares disputadas por tus creadores de contenido favoritos, vive el ambiente del paddock y descubre los bastidores de un fin de semana de competición intensa.</p>
          <p>En el programa: eventos de Fórmula 4, karting profesional, simuladores ultra-realistas, noria panorámica, conciertos exclusivos y gastronomía premium.</p>
          <p>¡No te pierdas THE LAST RACE – un fin de semana memorable donde la pasión por las carreras se encuentra con la energía única de GP Explorer!</p>
        `,
        imageUrl: '/img/img-home-about.jpeg'
      }
    }
  }),
  
  actions: {
    async loadContent() {
      try {
        const data = await get('/api/home-content')
        if (data && !data.error) {
          // l'api retourne soit fr en es soit error data
          const contentData = data.data || data
          if (contentData.fr || contentData.en || contentData.es) {
            this.content = contentData
          }
        }
      } catch (error) {
        console.warn('Impossible de charger le contenu depuis le serveur, utilisation du contenu par défaut', error)
      }
    },
    
    async updateContent(language, title, htmlContent, imageUrl) {
      try {
        const data = await post('/api/home-content', {
          language,
          title,
          htmlContent,
          imageUrl
        })
        
        const result = data.data || data
        if (result && !data.error) {
          this.content[language] = {
            title: result.title || title,
            htmlContent: result.htmlContent || htmlContent,
            imageUrl: result.imageUrl || imageUrl
          }
          return { success: true }
        }
        throw new Error(data.message || 'Erreur lors de la sauvegarde')
      } catch (error) {
        console.error('Erreur lors de la mise à jour du contenu:', error)
        return { success: false, error: error.message }
      }
    },
    
    getContent(language) {
      return this.content[language] || this.content.fr
    }
  }
})
