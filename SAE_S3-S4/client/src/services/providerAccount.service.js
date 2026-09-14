import { put } from '@/services/apiClient.js'

export async function updateMyProviderProfile(payload) {
  const json = await put('/api/providers/me/profile', payload)

  if (json?.error === 0 && json?.data) {
    return { success: true, data: json.data }
  }

  return {
    success: false,
    message: json?.message || 'Erreur lors de la mise à jour du profil.'
  }
}

export default {
  updateMyProviderProfile
}
