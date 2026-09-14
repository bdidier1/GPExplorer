// gère les tickets en mode api
import { get, post } from '@/services/apiClient.js'

/* récupère tous les tickets disponibles depuis l'api */
async function getAvailableTickets() {
  try {
    const json = await get('/api/tickets')
    if (json.error === 0 && json.data) {
      return json.data.map(t => ({
        id: t.id,
        name: t.name,
        segment: t.segment,
        category: t.category,
        variant: t.variant,
        price: parseFloat(t.price),
        date: t.date,
        description: t.description,
        totalStock: t.totalStock,
        sold: t.sold,
        available: t.available ?? Math.max(0, (t.totalStock || 0) - (t.sold || 0)),
        isActive: t.isActive
      }))
    }
    console.warn('Erreur récupération tickets:', json.message)
    return []
  } catch (e) {
    console.error('Erreur réseau tickets:', e)
    return []
  }
}

/* crée les codes des billets et des produits boutique via /orders/save */
async function createTicketCodes(items, userId = 'anonymous', email = '', holdId = null) {
  try {
    const payload = {
      userId: userId === 'anonymous' ? null : userId,
      email,
      tickets: items.map(item => ({
        ticketId: item.ticketId,
        quantity: item.quantity,
        type: item.type || 'ticket',
        price: item.price || 0,
        name: item.name || item.title || ''
      }))
    }
    if (holdId) {
      payload.holdId = holdId
    }
    
    const json = await post('/api/orders/save', payload)

    if (json.error === 0 && json.data) {
      // transforme les orderitems en codes lisibles côté front
      const order = json.data
      const codes = []
      if (order.OrderItems || order.orderItems || order.items) {
        const orderItems = order.OrderItems || order.orderItems || order.items
        for (const oi of orderItems) {
          const oiType = oi.itemType || oi.item_type || 'ticket'
          const isShop = oiType === 'shop'
          const isMerch = oiType === 'merch'

          let name = 'Article'
          if (isShop) {
            name = oi.product?.title || oi.Product?.title || items.find(i => i.ticketId === (oi.productId || oi.product_id))?.name || 'Article boutique'
          } else if (isMerch) {
            name = items.find(i => i.ticketId === oi.ticketId || i.name === oi.name)?.name || 'Article merch'
          } else {
            name = oi.Ticket?.name || oi.ticket?.name || items.find(i => i.ticketId === oi.ticketId)?.name || 'Billet'
          }

          codes.push({
            code: oi.code,
            ticketId: oi.ticketId || oi.ticket_id || oi.productId || oi.product_id,
            name,
            date: order.orderDate || order.createdAt,
            used: oi.verified || false,
            userId,
            email,
            verified: oi.verified || false,
            type: oiType,
            quantity: oi.quantity || 1
          })
        }
      }
      return codes
    }

    throw new Error(json.message || 'Erreur lors de la commande')
  } catch (e) {
    console.error('Erreur createTicketCodes:', e)
    throw e
  }
}

export { createTicketCodes, getAvailableTickets }
