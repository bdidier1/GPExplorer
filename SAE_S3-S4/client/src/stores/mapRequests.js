import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMapStore } from '@/stores/map.js'
import { get, post, patch, del } from '@/services/apiClient.js'

export const useMapRequestsStore = defineStore('mapRequests', () => {
  const requests = ref([])
  const mapStore = useMapStore()

  async function loadRequests() {
    try {
      const json = await get('/api/admin/map-requests')
      if (json.error === 0) requests.value = json.data || []
    } catch (e) {
      console.warn('[MapRequests] Impossible de charger les demandes:', e)
    }
  }

  async function submitRequest(providerMeta, spot) {
    if (!providerMeta?.id) return { success: false, message: "Impossible d'identifier le prestataire." }
    if (!spot?.id) return { success: false, message: 'Aucun emplacement sélectionné.' }

    try {
      const json = await post('/api/map-requests', { spot: { id: spot.id, label: spot.label } })
      if (json.error !== 0) return { success: false, message: json.message }
      // recharge localement les demandes quand c'est utile
      return { success: true, request: json.data }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }

  async function approveRequest(requestId) {
    try {
      const json = await patch(`/api/admin/map-requests/${requestId}/approve`, {})
      if (json.error !== 0) return { success: false, message: json.message }
      // met à jour la liste locale
      const idx = requests.value.findIndex(r => r.id === requestId)
      if (idx !== -1) requests.value[idx] = json.data
      // synchronise la carte
      await mapStore.fetchLocations()
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }

  async function rejectRequest(requestId, reason = null) {
    try {
      const json = await patch(`/api/admin/map-requests/${requestId}/reject`, { reason })
      if (json.error !== 0) return { success: false, message: json.message }
      const idx = requests.value.findIndex(r => r.id === requestId)
      if (idx !== -1) requests.value[idx] = json.data
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }

  async function removeProviderRequests() {
    try {
      await del('/api/map-requests/my')
    } catch (e) {
      console.warn('[MapRequests] removeProviderRequests:', e)
    }
  }

  async function getLatestRequestForProvider() {
    try {
      const json = await get('/api/map-requests/my')
      if (json.error === 0) return json.data
      return null
    } catch (e) {
      return null
    }
  }

  const pendingRequests = computed(() =>
    requests.value
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(b.createdAt || b.requestedAt || 0) - new Date(a.createdAt || a.requestedAt || 0))
  )

  const processedRequests = computed(() =>
    requests.value
      .filter(r => r.status !== 'pending')
      .sort((a, b) => new Date(b.reviewedAt || 0) - new Date(a.reviewedAt || 0))
  )

  return {
    requests,
    pendingRequests,
    processedRequests,
    loadRequests,
    submitRequest,
    approveRequest,
    rejectRequest,
    removeProviderRequests,
    getLatestRequestForProvider
  }
})

export default useMapRequestsStore
