import { ref } from 'vue'

const STORAGE_KEY = 'preferredLanguage'
const currentLanguage = ref('fr')

// Initialisation unique
if (typeof window !== 'undefined') {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            currentLanguage.value = saved
        }
    } catch (error) {
        console.warn('[i18n] Impossible de lire la langue persistée', error)
    }

    window.addEventListener('languageChanged', (event) => {
        const nextLang = event?.detail?.language
        if (typeof nextLang === 'string') {
            currentLanguage.value = nextLang
        }
    })
}

export function useLanguage() {
    return { currentLanguage }
}
