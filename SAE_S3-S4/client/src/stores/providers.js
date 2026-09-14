import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useLanguage } from '@/composables/useLanguage.js'
import { useI18n } from '@/composables/useI18n.js'
import { del, get, post, put } from '@/services/apiClient.js'

const isBrowser = Boolean(globalThis.window)

function mergeProviderContent(baseContent = {}, overrideContent = {}) {
  const merged = {
    ...baseContent,
    ...overrideContent,
    fr: {
      ...baseContent.fr,
      ...overrideContent.fr
    },
    en: {
      ...baseContent.en,
      ...overrideContent.en
    },
    es: {
      ...baseContent.es,
      ...overrideContent.es
    },
    logos: {
      ...baseContent.logos,
      ...overrideContent.logos
    },
    settings: {
      ...baseContent.settings,
      ...overrideContent.settings
    }
  }

  if (Array.isArray(overrideContent.fr?.services)) merged.fr.services = overrideContent.fr.services
  if (Array.isArray(overrideContent.en?.services)) merged.en.services = overrideContent.en.services
  if (Array.isArray(overrideContent.es?.services)) merged.es.services = overrideContent.es.services

  return merged
}

function parseProviderContentData(rawContentData) {
  if (!rawContentData || typeof rawContentData !== 'string') return null
  try {
    const parsed = JSON.parse(rawContentData)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function clonePlainValue(value) {
  if (Array.isArray(value)) {
    return value.map(clonePlainValue)
  }

  if (value && typeof value === 'object') {
    const cloned = {}
    for (const [key, nestedValue] of Object.entries(value)) {
      cloned[key] = clonePlainValue(nestedValue)
    }
    return cloned
  }

  return value
}

function safeCloneContent(value) {
  if (!value || typeof value !== 'object') return {}

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      // Certains objets réactifs/non sérialisables ne sont pas clonables.
    }
  }

  return clonePlainValue(value)
}

function normalizeServiceForDisplay(service = {}) {
  return {
    title: stripHtml(service.title) || '',
    description: stripHtml(service.description) || '',
    visibility: service.visibility === 'private' ? 'private' : 'public',
    enabled: service.enabled !== false,
    url: typeof service.url === 'string' ? service.url.trim() : ''
  }
}

function slugifyName(name = '') {
  return String(name).toLowerCase().replaceAll(/\s+/g, '')
}

function stripHtml(html) {
  if (!html) return ''
  if (!isBrowser) return html.replaceAll(/<[^>]*>/g, '')
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

function filterServicesByAudience(services = [], audience = 'public') {
  return (services || [])
    .map(normalizeServiceForDisplay)
    .filter(service => service.enabled)
    .filter(service => audience === 'all' || service.visibility === 'public')
    .map(({ title, description, visibility, url }) => ({ title, description, visibility, url }))
}

function getLocalizedProviderSection(content = {}, lang = 'fr') {
  if (!content || typeof content !== 'object') {
    return {}
  }

  const hasFlatLegacyShape = ['pageTitle', 'titleDescription', 'aboutDescription', 'servicesSubtitle']
    .some(key => typeof content[key] === 'string')

  if (hasFlatLegacyShape) {
    return content
  }

  const preferred = content[lang] && typeof content[lang] === 'object' ? content[lang] : {}
  const fallback = content.fr && typeof content.fr === 'object' ? content.fr : {}

  const merged = {
    ...fallback,
    ...preferred
  }

  if (Array.isArray(preferred.services) && preferred.services.length > 0) {
    merged.services = preferred.services
  } else if (Array.isArray(fallback.services) && fallback.services.length > 0) {
    merged.services = fallback.services
  } else {
    merged.services = []
  }

  return merged
}

export const useProvidersStore = defineStore('providers', () => {
  const activeProviders = ref([])
  const providerContent = ref({})
  const contentHydrated = ref(false)

  const { currentLanguage } = useLanguage()
  const { t } = useI18n()

  function initializeProviders() {
    return fetchProvidersFromAPI()
  }

  async function fetchProvidersFromAPI() {
    try {
      const json = await get('/api/providers')
      if (json.error === 0 && Array.isArray(json.data) && json.data.length > 0) {
        activeProviders.value = json.data.map(p => ({
          id: p.id,
          username: p.user?.username || p.username || slugifyName(p.name),
          companyName: p.name,
          category: p.category,
          email: p.user?.email || '',
          phone: p.user?.phone || '',
          contactPerson: p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : '',
          isActive: p.isActive !== false,
          userId: p.userId,
          description: p.description,
          logo: p.logo,
          htmlContent: p.htmlContent,
          contentData: p.contentData || null,
          hasStatsAccess: p.hasStatsAccess === true,
          hasGuestbookAccess: p.hasGuestbookAccess !== false
        }))
      } else {
        activeProviders.value = []
      }
    } catch (e) {
      console.error('Erreur chargement prestataires API:', e)
      activeProviders.value = []
    }
    hydrateProviderContent()
  }

  function hydrateProviderContent() {
    if (!isBrowser) {
      return
    }
    activeProviders.value.forEach(provider => {
      loadProviderContent(provider.username)
    })
    contentHydrated.value = true
  }

  function loadProviderContent(username) {
    if (!username) return null

    let content = safeCloneContent(providerContent.value[username])

    const existingContent = providerContent.value[username]
    if (existingContent) {
      content = mergeProviderContent(content, existingContent)
    }

    const provider = activeProviders.value.find(p => p.username === username)
    if (provider) {
      content.settings = {
        ...content.settings,
        hasStatsAccess: provider.hasStatsAccess === true,
        hasGuestbookAccess: provider.hasGuestbookAccess !== false
      }

      const dbContent = parseProviderContentData(provider.contentData)
      if (dbContent) {
        content = mergeProviderContent(content, dbContent)
      }
    }

    // enrichit avec le htmlcontent qui vient de l'api
    if (provider?.htmlContent) {
      if (!content.fr) content.fr = {}
      content.fr.htmlDescription = provider.htmlContent
    }

    providerContent.value[username] = content
    return providerContent.value[username]
  }

  function getProviderContent(username) {
    if (providerContent.value[username]) {
      return providerContent.value[username]
    }
    return loadProviderContent(username)
  }

  function setProviderContent(username, content) {
    if (!username) return
    const existingContent = providerContent.value[username] || {}
    const mergedContent = mergeProviderContent(existingContent, content || {})
    providerContent.value[username] = mergedContent

    // sauvegarde le htmlcontent côté api si le provider a un id
    const provider = activeProviders.value.find(p => p.username === username)
    if (provider?.id) {
      provider.hasStatsAccess = mergedContent.settings?.hasStatsAccess === true
      provider.hasGuestbookAccess = mergedContent.settings?.hasGuestbookAccess !== false

      put(`/api/providers/${provider.id}`, {
        htmlContent: mergedContent.fr?.htmlDescription,
        contentData: JSON.stringify(mergedContent),
        hasStatsAccess: provider.hasStatsAccess,
        hasGuestbookAccess: provider.hasGuestbookAccess
      })
    }
  }

  function clearProviderContent(username) {
    if (!username || !providerContent.value[username]) return
    delete providerContent.value[username]
  }

  async function addProvider(provider) {
    const exists = activeProviders.value.some(p => p.username === provider.username)
    if (exists) {
      return { success: false, error: 'Ce prestataire existe déjà' }
    }

    try {
      const json = await post('/api/providers', {
        userId: provider.userId,
        name: provider.companyName || provider.username,
        description: provider.description || '',
        category: provider.category,
        logo: provider.logo || '',
        htmlContent: provider.htmlContent || ''
      })
      if (json.error === 0 && json.data) {
        const p = json.data
        const newProvider = {
          id: p.id,
          username: provider.username || slugifyName(p.name),
          companyName: p.name,
          category: p.category,
          email: provider.email || '',
          phone: provider.phone || '',
          contactPerson: provider.contactPerson || '',
          isActive: true,
          userId: p.userId
        }
        activeProviders.value.push(newProvider)
        hydrateProviderContent()
        return { success: true, provider: newProvider }
      }
      return { success: false, error: json.message || 'Erreur création prestataire' }
    } catch (e) {
      console.error('Erreur ajout prestataire:', e)
      return { success: false, error: 'Erreur réseau' }
    }
  }

  async function removeProvider(providerId) {
    const provider = activeProviders.value.find(p => p.id === providerId)
    if (!provider) {
      return { success: false, error: 'Prestataire non trouvé' }
    }

    try {
      const response = await del(`/api/providers/${providerId}`)
      if (response?.error !== 0) {
        return { success: false, error: response?.message || 'Erreur suppression prestataire' }
      }

      activeProviders.value = activeProviders.value.filter(p => p.id !== providerId)
      clearProviderContent(provider.username)
      return { success: true }
    } catch (e) {
      console.error('Erreur removeProvider:', e)
      return { success: false, error: 'Erreur réseau' }
    }
  }

  async function updateProvider(providerId, updates) {
    const provider = activeProviders.value.find(p => p.id === providerId)
    if (provider) {
      try {
        await put(`/api/providers/${providerId}`, updates)
        Object.assign(provider, updates)
        hydrateProviderContent()
        return { success: true, provider }
      } catch (e) {
        console.error('Erreur updateProvider:', e)
        return { success: false, error: 'Erreur réseau' }
      }
    }
    return { success: false, error: 'Prestataire non trouvé' }
  }

  function getProviderByUsername(username) {
    return activeProviders.value.find(p => p.username === username)
  }

  function getDefaultServicesForCategory(category) {
    const defaults = {
      gaming: [
        { title: t('provider_defaults.gaming.title1'), description: t('provider_defaults.gaming.desc1') },
        { title: t('provider_defaults.gaming.title2'), description: t('provider_defaults.gaming.desc2') },
        { title: t('provider_defaults.gaming.title3'), description: t('provider_defaults.gaming.desc3') }
      ],
      beverages: [
        { title: t('provider_defaults.beverages.title1'), description: t('provider_defaults.beverages.desc1') },
        { title: t('provider_defaults.beverages.title2'), description: t('provider_defaults.beverages.desc2') },
        { title: t('provider_defaults.beverages.title3'), description: t('provider_defaults.beverages.desc3') }
      ],
      food: [
        { title: t('provider_defaults.food.title1'), description: t('provider_defaults.food.desc1') },
        { title: t('provider_defaults.food.title2'), description: t('provider_defaults.food.desc2') },
        { title: t('provider_defaults.food.title3'), description: t('provider_defaults.food.desc3') }
      ],
      karting: [
        { title: t('provider_defaults.karting.title1'), description: t('provider_defaults.karting.desc1') },
        { title: t('provider_defaults.karting.title2'), description: t('provider_defaults.karting.desc2') },
        { title: t('provider_defaults.karting.title3'), description: t('provider_defaults.karting.desc3') }
      ],
      camping: [
        { title: t('provider_defaults.camping.title1'), description: t('provider_defaults.camping.desc1') },
        { title: t('provider_defaults.camping.title2'), description: t('provider_defaults.camping.desc2') },
        { title: t('provider_defaults.camping.title3'), description: t('provider_defaults.camping.desc3') }
      ],
      music: [
        { title: t('provider_defaults.music.title1'), description: t('provider_defaults.music.desc1') },
        { title: t('provider_defaults.music.title2'), description: t('provider_defaults.music.desc2') },
        { title: t('provider_defaults.music.title3'), description: t('provider_defaults.music.desc3') }
      ],
      default: [
        { title: t('provider_defaults.default.title1'), description: t('provider_defaults.default.desc1') },
        { title: t('provider_defaults.default.title2'), description: t('provider_defaults.default.desc2') },
        { title: t('provider_defaults.default.title3'), description: t('provider_defaults.default.desc3') }
      ]
    }
    return (defaults[category] || defaults.default).map(service => ({
      ...service,
      visibility: 'public',
      enabled: true,
      url: ''
    }))
  }

  const partnersCatalog = computed(() => {
    return activeProviders.value
      .filter(provider => provider.isActive)
      .map(provider => {
        const content = providerContent.value[provider.username] || {}
        const lang = currentLanguage.value || 'fr'
        const finalContent = getLocalizedProviderSection(content, lang)

        const fallbackImage = '/logos/default-provider.png'

        // gère les logos
        const logos = content.logos || {}
        const normalLogo = logos.normal || content.imageLink || fallbackImage
        const alternateLogo = logos.alternate || normalLogo

        // si aucun service charge des valeurs par défaut selon la catégorie
        const providerServices = finalContent.services && finalContent.services.length > 0
          ? filterServicesByAudience(finalContent.services, 'public')
          : getDefaultServicesForCategory(provider.category)

        return {
          ...provider,
          displayName: stripHtml(finalContent.pageTitle) || provider.companyName || provider.username,
          blurb: stripHtml(finalContent.titleDescription) || defaultBlurb(provider),
          aboutDescription: stripHtml(finalContent.aboutDescription) || '',
          services: providerServices,
          servicesSubtitle: stripHtml(finalContent.servicesSubtitle) || '',
          imageLink: normalLogo,
          imageLinkDark: alternateLogo,
          fallbackImage
        }
      })
  })

  function defaultBlurb(provider) {
    return `${t('provider_defaults.official_partner')} ${provider.companyName || provider.username} `
  }

  initializeProviders()

  watch(activeProviders, () => {
    hydrateProviderContent()
  }, { deep: true })

  return {
    activeProviders,
    providerContent,
    contentHydrated,
    partnersCatalog,
    addProvider,
    removeProvider,
    updateProvider,
    getProviderByUsername,
    initializeProviders,
    getProviderContent,
    setProviderContent
  }
})

export default useProvidersStore
