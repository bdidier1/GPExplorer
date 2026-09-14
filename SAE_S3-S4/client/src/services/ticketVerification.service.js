import { get } from '@/services/apiClient.js'

export async function getUserOrders(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'ID utilisateur manquant', orders: [] }
    }

    const json = await get(`/api/orders/user/${userId}`)

    if (json.error !== 0) {
      return { success: false, message: json.message || 'Erreur serveur', orders: [] }
    }

    return { success: true, orders: json.data || [] }
  } catch (error) {
    console.warn('Erreur récupération commandes', error)
    return { success: false, message: 'Erreur connexion', orders: [] }
  }
}
