import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, put } from '@/services/apiClient.js'
import { useI18n } from '@/composables/useI18n.js'

export const useMapStore = defineStore('map', () => {
  const locations = ref([])
  const initializedFromAPI = ref(false)
  const { t } = useI18n()

  async function loadFromStorage() {
    if (initializedFromAPI.value) return
    await fetchLocations()
  }

  async function fetchLocations() {
    try {
      const json = await get('/api/map/locations')
      if (json.error === 0 && json.data) {
        locations.value = json.data.map(loc => ({
          id: loc.id,
          label: loc.name,
          coords: loc.coords || [],
          x: loc.x,
          y: loc.y,
          zone: loc.zone || null,
          description: loc.description || '',
          occupant: loc.provider ? {
            providerId: loc.provider.id,
            username: loc.provider.user?.username || loc.provider.name?.toLowerCase().replaceAll(' ', ''),
            displayName: loc.provider.name,
            contactPerson: loc.provider.user ? `${loc.provider.user.firstName || ''} ${loc.provider.user.lastName || ''}`.trim() : null,
            updatedAt: loc.updatedAt
          } : null
        }))
      }
    } catch (e) {
      console.error('Erreur chargement emplacements:', e)
    } finally {
      initializedFromAPI.value = true
    }
  }

  const vendorSpots = computed(() => locations.value)

  function getSpotForProvider(providerId) {
    if (!providerId) return null
    return locations.value.find(spot => spot.occupant?.providerId === providerId) || null
  }

  async function claimSpot(spotId, providerMeta) {
    if (!spotId) return { success: false, message: t('map_store.no_spot_selected') }
    if (!providerMeta?.id) return { success: false, message: t('map_store.provider_info_missing') }

    const spot = locations.value.find(item => item.id === spotId)
    if (!spot) return { success: false, message: t('map_store.spot_not_found') }

    const occupant = spot.occupant
    if (occupant && occupant.providerId !== providerMeta.id) {
      return { success: false, message: t('map_store.spot_already_occupied') }
    }

    try {
      const json = await put(`/api/map/locations/${spotId}/assign`, {
        providerId: providerMeta.id
      })
      if (json.error === 0) {
        // rafraîchit les données depuis l'api
        await fetchLocations()
        return { success: true }
      }
      return { success: false, message: json.message || t('map_store.assign_error') }
    } catch (e) {
      console.error('Erreur claimSpot:', e)
      return { success: false, message: t('map_store.network_error') }
    }
  }

  async function releaseSpot(spotId, providerId) {
    if (!spotId || !providerId) return { success: false, message: t('map_store.release_missing_info') }

    const spot = locations.value.find(s => s.id === spotId)
    if (!spot?.occupant || spot.occupant.providerId !== providerId) {
      return { success: false, message: t('map_store.not_occupying_spot') }
    }

    try {
      // assigne null pour libérer l'emplacement
      const json = await put(`/api/map/locations/${spotId}/assign`, { providerId: null })
      if (json.error === 0) {
        await fetchLocations()
        return { success: true }
      }
      return { success: false, message: json.message || t('map_store.release_error') }
    } catch (e) {
      console.error('Erreur releaseSpot:', e)
      return { success: false, message: t('map_store.network_error') }
    }
  }

  async function releaseProvider(providerId) {
    if (!providerId) return { success: false, message: t('map_store.no_provider_specified') }

    const spot = locations.value.find(s => s.occupant?.providerId === providerId)
    if (!spot) return { success: false, message: t('map_store.no_spot_to_release') }

    return await releaseSpot(spot.id, providerId)
  }

  loadFromStorage()

  return {
    vendorSpots,
    getSpotForProvider,
    claimSpot,
    releaseSpot,
    releaseProvider,
    loadFromStorage,
    fetchLocations
  }
})

export default useMapStore
