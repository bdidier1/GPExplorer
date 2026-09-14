/* gère les messages envoyés à l'admin via l'api */
import { get, post, patch, del } from '@/services/apiClient.js'

/* envoie un message depuis la page contact */
export async function sendMessageToAdmin(messageData) {
  const json = await post('/api/contact', {
    name: messageData.name,
    email: messageData.email,
    phone: messageData.phone || '',
    subject: messageData.subject,
    message: messageData.message
  })
  if (json.error !== 0) throw new Error(json.message || 'Erreur envoi message')
  return json.data
}

/* récupère les messages admin triés du plus récent au plus ancien */
export async function getAdminMessages() {
  const json = await get('/api/admin/messages')
  if (json.error !== 0) throw new Error(json.message || 'Erreur récupération messages')
  return json.data
}

/* marque un message comme lu */
export async function markAsRead(messageId) {
  const json = await patch(`/api/admin/messages/${messageId}/read`, {})
  if (json.error !== 0) throw new Error(json.message || 'Erreur mise à jour')
  return json.data
}

/* supprime un message */
export async function deleteMessage(messageId) {
  const json = await del(`/api/admin/messages/${messageId}`)
  if (json.error !== 0) throw new Error(json.message || 'Erreur suppression')
  return true
}
