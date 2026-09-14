import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { post } from '@/services/apiClient.js'

// store pinia du panier avec compte à rebours lié à la réservation serveur
export const useCartStore = defineStore('cart', () => {
  const CART_STORAGE_PREFIX = 'gp_cart_v1:'

  function toTimestamp(value) {
    if (!value) return null
    if (typeof value === 'number') return value
    const parsed = new Date(value).getTime()
    return Number.isFinite(parsed) ? parsed : null
  }

  // articles dans le panier { ticketId name quantity }
  const items = ref([])
  const holdId = ref(null)
  const expiresAt = ref(null) // horodatage en millisecondes via date now
  const ttlSeconds = ref(0)
  const error = ref('')
  const loading = ref(false)
  const _tick = ref(0) // trigger pour forcer le recalcul du countdown
  const needsRefresh = ref(0) // trigger pour dire aux composants de recharger
  const showEmailForm = ref(false) // affiche le formulaire d'envoi d'email
  const currentUserId = ref(null) // id de l'utilisateur qui a fait la réservation

  function getActiveUserId() {
    return currentUserId.value || 'anonymous'
  }

  function getStorageKey(userId) {
    return `${CART_STORAGE_PREFIX}${userId || 'anonymous'}`
  }

  function persistState() {
    const userId = currentUserId.value || getActiveUserId()
    const payload = {
      items: items.value,
      holdId: holdId.value,
      expiresAt: expiresAt.value,
      ttlSeconds: ttlSeconds.value,
      showEmailForm: showEmailForm.value,
      currentUserId: userId
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(payload))
  }

  function loadStateForUser(userId) {
    const parsedUserId = userId || getActiveUserId()
    currentUserId.value = parsedUserId
    error.value = ''

    const raw = localStorage.getItem(getStorageKey(parsedUserId))
    if (!raw) {
      items.value = []
      holdId.value = null
      expiresAt.value = null
      ttlSeconds.value = 0
      showEmailForm.value = false
      return
    }

    try {
      const data = JSON.parse(raw)
      items.value = Array.isArray(data.items) ? data.items : []
      holdId.value = data.holdId || null
      expiresAt.value = toTimestamp(data.expiresAt)
      ttlSeconds.value = data.ttlSeconds || 0
      showEmailForm.value = Boolean(data.showEmailForm)
    } catch {
      items.value = []
      holdId.value = null
      expiresAt.value = null
      ttlSeconds.value = 0
      showEmailForm.value = false
    }
  }

  function resetInMemoryCart() {
    items.value = []
    holdId.value = null
    expiresAt.value = null
    ttlSeconds.value = 0
    showEmailForm.value = false
    error.value = ''
    _tick.value = 0
  }

  function setLoggedOutView() {
    currentUserId.value = null
    resetInMemoryCart()
  }

  function restoreCartForUser(userId) {
    loadStateForUser(userId)
  }

  function syncUserCart() {
    const activeUserId = getActiveUserId()
    if (currentUserId.value !== activeUserId) {
      loadStateForUser(activeUserId)
    }
  }

  const remainingMs = computed(() => {
    // eslint-disable-next-line no-unused-expressions
    _tick.value // force le suivi de dépendance
    if (!expiresAt.value) return 0
    const diff = expiresAt.value - Date.now()
    return Math.max(diff, 0)
  })
  const remainingSeconds = computed(() => Math.floor(remainingMs.value / 1000))
  const isActiveHold = computed(() => !!holdId.value && remainingMs.value > 0)

  function clearCart() {
    syncUserCart()
    resetInMemoryCart()
    persistState()
  }

  async function reserveCart(userId = null) {
    syncUserCart()
    const resolvedUserId = userId || currentUserId.value || 'anonymous'
    currentUserId.value = resolvedUserId
    if (items.value.length === 0) return
    loading.value = true
    error.value = ''
    
    try {
      const body = { items: items.value.map(i => ({ ticketId: i.ticketId, quantity: i.quantity, type: i.type || 'ticket' })) }
      const json = await post('/api/panier/reserver', body)
      if (json.error === 0) {
        const payload = json.data || json
        holdId.value = payload.holdId || null
        expiresAt.value = toTimestamp(payload.expiresAt)
        ttlSeconds.value = payload.ttlSeconds || 0

        if (!holdId.value || !expiresAt.value) {
          error.value = 'Reservation invalide: donnees serveur incompletes'
          return
        }

        currentUserId.value = resolvedUserId
        showEmailForm.value = true
        needsRefresh.value++
        persistState()
      } else {
        error.value = json.message || 'Réservation impossible'
      }
    } catch (e) {
      error.value = 'Erreur réseau: ' + (e?.message || 'inconnue')
    } finally {
      loading.value = false
    }
  }

  async function cancelHold() {
    syncUserCart()
    if (!holdId.value) return
    
    try {
      await post('/api/panier/annuler', { holdId: holdId.value })
    } catch(e) {
      console.warn('Annulation échouée', e)
    }
    clearCart()
    needsRefresh.value++
  }

  // vérifie l'expiration avec l'interval du composant
  function checkExpiration() {
    syncUserCart()
    _tick.value++ // force la mise à jour réactive du countdown
    if (holdId.value && remainingMs.value === 0) {
      clearCart()
    }
  }

  function addItem(ticket) {
    syncUserCart()
    const maxStock = ticket.available ?? ticket.stock ?? 999
    const existing = items.value.find(i => i.ticketId === ticket.id)
    if (existing) {
      if (existing.quantity >= maxStock) {
        error.value = `Stock maximum atteint pour ${existing.name}`
        setTimeout(() => { error.value = '' }, 3000)
        return false
      }
      existing.quantity += 1
      // met à jour le stock si on a des données plus récentes
      existing.stock = maxStock
    } else {
      items.value.push({ 
        ticketId: ticket.id, 
        name: ticket.name || ticket.title, 
        price: ticket.price,
        quantity: 1,
        type: ticket.type || 'ticket', // ticket ou shop
        stock: maxStock // stock disponible
      })
    }
    persistState()
    return true
  }
  function removeItem(ticketId) {
    syncUserCart()
    const idx = items.value.findIndex(i => i.ticketId === ticketId)
    if (idx >= 0) items.value.splice(idx, 1)
    persistState()
  }
  function incrementItem(ticketId) {
    syncUserCart()
    const entry = items.value.find(i => i.ticketId === ticketId)
    if (!entry) return
    // vérifie le stock pour tous les types d'articles
    if (entry.stock && entry.quantity >= entry.stock) {
      error.value = `Stock maximum atteint pour ${entry.name}`
      setTimeout(() => { error.value = '' }, 3000)
      return false
    }
    entry.quantity += 1
    persistState()
    return true
  }
  function decrementItem(ticketId) {
    syncUserCart()
    const entry = items.value.find(i => i.ticketId === ticketId)
    if (!entry) return
    if (entry.quantity > 1) {
      entry.quantity -= 1
    } else {
      removeItem(ticketId)
    }
    persistState()
  }

  // charge le panier du user actif au démarrage du store
  loadStateForUser(getActiveUserId())

  return { 
    items, 
    holdId, 
    expiresAt, 
    ttlSeconds, 
    remainingSeconds, 
    isActiveHold, 
    error, 
    loading, 
    needsRefresh, 
    showEmailForm,
    currentUserId,
    syncUserCart,
    setLoggedOutView,
    restoreCartForUser,
    addItem, 
    incrementItem,
    decrementItem, 
    removeItem, 
    reserveCart, 
    cancelHold, 
    checkExpiration, 
    clearCart 
  }
})

export default useCartStore
