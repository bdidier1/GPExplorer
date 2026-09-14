import emailjs from '@emailjs/browser'

// config emailjs
let SERVICE_ID = 'service_aqxcjp2'
let TEMPLATE_ID = 'template_8z0fywj'
let PUBLIC_KEY = 'Lvf8YJXusWCvZ9cfE'

// initialise emailjs
function initEmailJS() {
  emailjs.init(PUBLIC_KEY)
}

async function sendTicketEmail(email, codes, qrCodeDataURL, giftFrom = null) {
  try {
    let codesText = ''

    // si c'est un cadeau ajoute un message en haut
    if (giftFrom) {
      codesText += `Vous avez reçu un cadeau de la part de ${giftFrom} !\n\n`
    }

    // sépare les billets et les articles boutique
    const tickets = codes.filter(c => c.type !== 'shop')
    const shopItems = codes.filter(c => c.type === 'shop')

    if (tickets.length > 0) {
      codesText += `Vos billets :\n`
      for (let i = 0; i < tickets.length; i++) {
        codesText += `  ${tickets[i].name}: ${tickets[i].code}\n`
      }
      codesText += `\n`
    }

    if (shopItems.length > 0) {
      codesText += `Vos articles boutique :\n`
      for (let i = 0; i < shopItems.length; i++) {
        const qty = shopItems[i].quantity || 1
        const price = shopItems[i].price ? ` - ${(shopItems[i].price * qty).toFixed(2)}€` : ''
        codesText += `  ${shopItems[i].name} x${qty}${price}\n`
      }
      codesText += `\n`
    }

    if (giftFrom) {
      codesText += `Profitez bien de l'événement !`
    }

    let params = {
      to_email: email,
      items: codesText,  
      total: codes.length,
      qrCodeImage: qrCodeDataURL
    }

    let response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params)
    
    return { success: true, response: response }
  } catch (error) {
    return { success: false, error: error }
  }
}

export { initEmailJS, sendTicketEmail }
