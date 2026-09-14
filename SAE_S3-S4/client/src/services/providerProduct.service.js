import { get, post, put, del } from '@/services/apiClient.js'

/* gère les produits prestataires avec des appels api directs */

const SUPPORTED_LANGUAGES = ['fr', 'en', 'es']

function getPreferredLanguage() {
  if (globalThis.window !== undefined) {
    const lang = globalThis.window.localStorage.getItem('preferredLanguage')
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      return lang
    }
  }

  return 'fr'
}

function normalizeI18nMap(value, fallback = '') {
  const normalized = {}

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const lang of SUPPORTED_LANGUAGES) {
      const entry = value[lang]
      if (typeof entry === 'string' && entry.trim()) {
        normalized[lang] = entry.trim()
      }
    }
  }

  if (Object.keys(normalized).length === 0 && typeof fallback === 'string' && fallback.trim()) {
    normalized.fr = fallback.trim()
  }

  return normalized
}

function resolveLocalizedText(i18nMap, fallback = '', preferredLanguage = 'fr') {
  if (i18nMap[preferredLanguage]) {
    return i18nMap[preferredLanguage]
  }

  for (const lang of SUPPORTED_LANGUAGES) {
    if (i18nMap[lang]) {
      return i18nMap[lang]
    }
  }

  if (typeof fallback === 'string' && fallback.trim()) {
    return fallback.trim()
  }

  return ''
}

async function getProducts(providerId) {
  try {
    const json = await get(`/api/providers/${providerId}/products`)
    if (json.error === 0) return json
    return { error: 1, data: [], message: json.message }
  } catch (e) {
    console.error('Erreur getProducts:', e)
    return { error: 1, data: [] }
  }
}

async function addProduct(providerId, productData) {
  try {
    const json = await post(`/api/providers/${providerId}/products`, productData)
    if (json.error !== 0) throw new Error(json.message || json.error || 'Erreur ajout produit')
    return json
  } catch (e) {
    console.error('addProduct error:', e)
    throw e
  }
}

async function updateProduct(providerId, productId, productData) {
  try {
    const json = await put(`/api/providers/${providerId}/products/${productId}`, productData)
    if (json.error !== 0) throw new Error(json.message || json.error || 'Erreur modification produit')
    return json
  } catch (e) {
    console.error('updateProduct error:', e)
    throw e
  }
}

async function deleteProduct(providerId, productId) {
  try {
    const json = await del(`/api/providers/${providerId}/products/${productId}`)
    if (json.error !== 0) throw new Error(json.message || json.error || 'Erreur suppression produit')
    return json
  } catch (e) {
    console.error('deleteProduct error:', e)
    throw e
  }
}

function normalizeProduct(p) {
  const preferredLanguage = getPreferredLanguage()
  const titleI18n = normalizeI18nMap(p.titleI18n || p.title_i18n, p.title)
  const descriptionI18n = normalizeI18nMap(p.descriptionI18n || p.description_i18n, p.description)
  const totalStock = Number(p.stock) || 0
  const sold = Number(p.sold) || 0

  return {
    id: p.id,
    providerId: p.providerId || p.provider_id || null,
    title: resolveLocalizedText(titleI18n, p.title, preferredLanguage),
    description: resolveLocalizedText(descriptionI18n, p.description, preferredLanguage),
    titleI18n,
    descriptionI18n,
    price: Number.parseFloat(p.price),
    stock: Math.max(0, totalStock - sold),
    totalStock,
    sold,
    category: p.category,
    image: p.image,
    tags: Array.isArray(p.tags) ? p.tags : [],
    providerName: p.provider?.name || p.Provider?.name || null,
    providerLogo: p.provider?.logo || p.Provider?.logo || null
  }
}

/* récupère tous les produits publics pour la boutique */
async function getAllProviderProducts() {
  try {
    const json = await get('/api/shop/products')
    if (json.error === 0) {
      const products = (json.data || []).map(normalizeProduct)
      return { error: 0, data: products }
    }
    return { error: 1, data: [] }
  } catch (e) {
    console.error('Erreur getAllProviderProducts:', e)
    return { error: 1, data: [] }
  }
}

async function getAdminProducts() {
  try {
    const json = await get('/api/admin/shop/products')
    if (json.error === 0) {
      const products = (json.data || []).map(normalizeProduct)
      return { error: 0, data: products }
    }
    return { error: 1, data: [] }
  } catch (e) {
    console.error('Erreur getAdminProducts:', e)
    return { error: 1, data: [] }
  }
}

async function updateAdminProduct(productId, productData) {
  try {
    const json = await put(`/api/admin/shop/products/${productId}`, productData)
    if (json.error !== 0) throw new Error(json.message || json.error || 'Erreur modification produit')
    return json
  } catch (e) {
    console.error('updateAdminProduct error:', e)
    throw e
  }
}

async function deleteAdminProduct(productId) {
  try {
    const json = await del(`/api/admin/shop/products/${productId}`)
    if (json.error !== 0) throw new Error(json.message || json.error || 'Erreur suppression produit')
    return json
  } catch (e) {
    console.error('deleteAdminProduct error:', e)
    throw e
  }
}

async function getPublicProductById(productId) {
  try {
    const json = await get(`/api/shop/products/${productId}`)
    if (json.error === 0 && json.data) {
      return { error: 0, data: normalizeProduct(json.data) }
    }
    return { error: 1, data: null, message: json.message }
  } catch (e) {
    console.error('Erreur getPublicProductById:', e)
    return { error: 1, data: null }
  }
}

export default {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProviderProducts,
  getAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
  getPublicProductById
}
