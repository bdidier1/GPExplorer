/* gère les messages privés envoyés aux prestataires */
import { get, post, patch, del } from '@/services/apiClient.js'

/* envoie un message privé à un prestataire */
export async function sendMessageToProvider(providerId, messageData) {
  const json = await post(`/api/providers/${providerId}/messages`, {
    author: messageData.author,
    email: messageData.email,
    content: messageData.content
  })
  if (json.error !== 0) throw new Error(json.message || 'Erreur envoi message')
  return json.data
}

/* récupère tous les messages d'un prestataire */
export async function getProviderMessages(providerId) {
  const json = await get(`/api/providers/${providerId}/messages`)
  if (json.error !== 0) throw new Error(json.message || 'Erreur récupération messages')
  return json.data
}

/* marque un message comme lu */
export async function markAsRead(providerId, messageId) {
  const json = await patch(`/api/providers/${providerId}/messages/${messageId}/read`, {})
  if (json.error !== 0) throw new Error(json.message || 'Erreur mise à jour')
  return json.data
}

/* supprime un message */
export async function deleteMessage(providerId, messageId) {
  const json = await del(`/api/providers/${providerId}/messages/${messageId}`)
  if (json.error !== 0) throw new Error(json.message || 'Erreur suppression')
  return true
}

/* compte les messages non lus d'un prestataire */
export async function getUnreadCount(providerId) {
  const json = await get(`/api/providers/${providerId}/messages/unread-count`)
  if (json.error !== 0) return 0
  return json.data?.count ?? 0
}
