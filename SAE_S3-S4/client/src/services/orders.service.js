/* gère les commandes en mode api */

import { get } from '@/services/apiClient.js'

/* récupère les commandes d'un user */
export async function getUserOrdersService(userId) {
  try {
    const json = await get(`/api/orders/user/${userId}`)
    if (json.error === 0) {
      return { success: true, orders: json.data || [] }
    }
    return { success: false, message: json.message || 'Erreur serveur', orders: [] }
  } catch (error) {
    console.error('Erreur getUserOrders', error)
    return { success: false, message: 'Connexion impossible', orders: [] }
  }
}

