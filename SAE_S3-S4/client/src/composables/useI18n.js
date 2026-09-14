import { ref, computed } from 'vue'
import { useLanguage } from './useLanguage.js'
import fr from '@/locales/fr.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const messages = {
    fr,
    en,
    es
}

export function useI18n() {
    const { currentLanguage } = useLanguage()

    const t = (path, params = {}) => {
        const lang = currentLanguage.value || 'fr'
        const keys = path.split('.')

        let current = messages[lang] || messages['fr']

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key]
            } else {
                // Fallback to FR if key missing in current lang
                let fallback = messages['fr']
                for (const k of keys) {
                    if (fallback && typeof fallback === 'object' && k in fallback) {
                        fallback = fallback[k]
                    } else {
                        return path // Key not found
                    }
                }
                current = fallback
                break
            }
        }

        if (typeof current === 'string') {
            // Replace params
            let result = current
            for (const [key, value] of Object.entries(params)) {
                result = result.replace(`{${key}}`, value)
            }
            return result
        }

        return current
    }

    return { t }
}
