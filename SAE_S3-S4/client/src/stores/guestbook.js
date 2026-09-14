import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { get, post, put, del } from '@/services/apiClient.js'

export const useGuestbookStore = defineStore('guestbook', () => {
  const entriesByProvider = ref({})
  const enabled = ref(true)
  const hydrated = ref(false)

  const isEnabled = computed(() => enabled.value)

  function setEnabled(value) {
    enabled.value = Boolean(value)
  }

  async function loadFromStorage() {
    // pas de chargement global les entrées arrivent par prestataire via fetchEntries
    hydrated.value = true
  }

  async function fetchEntries(providerId) {
    if (!providerId) return
    try {
      const json = await get(`/api/providers/${providerId}/guestbook`)
      if (json.error === 0 && json.data) {
        entriesByProvider.value[providerId] = json.data.map(e => ({
          id: e.id,
          providerId: e.providerId,
          userId: e.userId || null,
          authorName: e.authorName,
          message: e.message,
          rating: e.rating,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt
        }))
      }
    } catch (e) {
      console.error('Erreur chargement livre d\'or:', e)
    }
  }

  function list(providerId = 'global') {
    const entries = entriesByProvider.value[providerId] || []
    return [...entries].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
  }

  function findUserEntry(providerId, userId) {
    if (!userId) return null
    const resolvedProviderId = providerId ?? 'global'
    const entries = entriesByProvider.value[resolvedProviderId] || []
    return entries.find(entry => entry.userId === userId) || null
  }

  async function addEntry(providerId, payload, user) {
    if (!providerId) {
      return { success: false, message: 'Identifiant prestataire manquant' }
    }
    if (!user?._id) {
      return { success: false, message: 'Utilisateur requis' }
    }

    const trimmedMessage = (payload.message || '').trim()
    const ratingValue = Number(payload.rating)
    if (!trimmedMessage || Number.isNaN(ratingValue)) {
      return { success: false, message: 'Message et note requis' }
    }

    try {
      const json = await post(`/api/providers/${providerId}/guestbook`, {
        authorName: user.username || user.email || 'Invité',
        authorEmail: user.email || '',
        message: trimmedMessage,
        rating: Math.min(Math.max(ratingValue, 1), 5)
      })

      if (json.error === 0 && json.data) {
        const entry = json.data
        if (!entriesByProvider.value[providerId]) {
          entriesByProvider.value[providerId] = []
        }
        entriesByProvider.value[providerId].push(entry)
        return { success: true, entry }
      }

      return { success: false, message: json.message || 'Erreur ajout avis' }
    } catch (e) {
      console.error('Erreur ajout avis:', e)
      return { success: false, message: 'Erreur réseau' }
    }
  }

  async function updateEntry(providerId, entryId, payload, user) {
    if (!providerId || !entryId) {
      return { success: false, message: 'Identifiants invalides' }
    }
    if (!user?._id) {
      return { success: false, message: 'Utilisateur requis' }
    }

    const trimmedMessage = (payload.message || '').trim()
    const ratingValue = Number(payload.rating)
    if (!trimmedMessage || Number.isNaN(ratingValue)) {
      return { success: false, message: 'Message et note requis' }
    }

    try {
      const json = await put(`/api/providers/${providerId}/guestbook/${entryId}`, {
        message: trimmedMessage,
        rating: Math.min(Math.max(ratingValue, 1), 5)
      })

      if (json.error !== 0 || !json.data) {
        return { success: false, message: json.message || 'Erreur modification avis' }
      }

      const key = providerId || 'global'
      const entries = entriesByProvider.value[key] ? [...entriesByProvider.value[key]] : []
      const idx = entries.findIndex(entry => entry.id === entryId)
      if (idx !== -1) {
        entries[idx] = json.data
        entriesByProvider.value[key] = entries
      }

      return { success: true, entry: json.data }
    } catch (e) {
      console.error('Erreur modification avis:', e)
      return { success: false, message: 'Erreur réseau' }
    }
  }

  async function deleteEntry(providerId, entryId, user) {
    if (!providerId || !entryId) {
      return { success: false, message: 'Identifiants invalides' }
    }
    if (!user?._id) {
      return { success: false, message: 'Utilisateur requis' }
    }

    try {
      const json = await del(`/api/providers/${providerId}/guestbook/${entryId}`)
      if (json.error !== 0) {
        return { success: false, message: json.message || 'Erreur suppression' }
      }

      const key = providerId || 'global'
      const entries = entriesByProvider.value[key] || []
      entriesByProvider.value[key] = entries.filter(e => e.id !== entryId)

      return { success: true }
    } catch (e) {
      console.error('Erreur suppression avis:', e)
      return { success: false, message: 'Erreur réseau' }
    }
  }

  return {
    hydrated,
    isEnabled,
    loadFromStorage,
    fetchEntries,
    setEnabled,
    list,
    findUserEntry,
    addEntry,
    updateEntry,
    deleteEntry
  }
})
