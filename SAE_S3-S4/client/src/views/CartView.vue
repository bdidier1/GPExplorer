<template>
  <div class="cart-view">
    <div class="cart-container">
      <header class="cart-header">
        <h1>{{ t('cart.header_title') }}</h1>
        <div v-if="cart.isActiveHold" class="expiration-banner">
          <svg class="icon-timer" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
          <div class="timer-info">
            <span class="timer-label">{{ t('cart.timer.label') }}</span>
            <strong class="timer-value">{{ t('cart.timer.expires_in') }} {{ tempsFormate }}</strong>
          </div>
        </div>
      </header>

      <div v-if="cart.items.length === 0" class="empty-cart">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        <h2>{{ t('cart.empty.title') }}</h2>
        <p>{{ t('cart.empty.subtitle') }}</p>
        <router-link to="/tickets" class="btn-back-to-tickets">
          {{ t('cart.empty.cta') }}
        </router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.ticketId" class="cart-item">
            <div class="item-info">
              <h3 class="item-name">
                {{ item.name }}
                <span v-if="item.type === 'shop'" class="badge-shop">{{ t('cart_badges.shop') }}</span>
                <span v-else class="badge-ticket">{{ t('cart_badges.ticket') }}</span>
              </h3>
              <div class="item-meta">
                <span class="item-id">{{ item.ticketId }}</span>
                <span class="item-price">{{ (item.price * item.quantity).toFixed(2) }}€</span>
              </div>
            </div>
            <div class="item-quantity">
              <button class="qty-btn" @click="decreaseQty(item)" :disabled="cart.isActiveHold">−</button>
              <span class="qty-value">{{ item.quantity }}</span>
              <button class="qty-btn" @click="increaseQty(item)" :disabled="cart.isActiveHold">+</button>
            </div>
            <button class="btn-remove" @click="removeItem(item.ticketId)" :disabled="cart.isActiveHold" :title="t('cart.actions.remove_tooltip')">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-card">
            <h3>{{ t('cart.summary.title') }}</h3>
            <div class="summary-line">
              <span>{{ t('cart.summary.ticket_count') }}</span>
              <strong>{{ totalQuantity }}</strong>
            </div>
            <div class="summary-line">
              <span>{{ t('cart.summary.item_types') }}</span>
              <strong>{{ cart.items.length }} {{ t('cart.summary.type_suffix') }}</strong>
            </div>
            <div class="summary-line total-price">
              <span>{{ t('cart.summary.total') }}</span>
              <strong>{{ totalPrice.toFixed(2) }}€</strong>
            </div>

            <!-- formulaire d envoi d email apres reservation -->
            <div v-if="cart.showEmailForm && cart.isActiveHold" class="email-form">

              <!-- option cadeau -->
              <div class="gift-toggle">
                <label class="gift-label">
                  <input type="checkbox" v-model="isGift" class="gift-checkbox" />
                  <span>{{ t('cart.gift.label') }}</span>
                </label>
              </div>

              <!-- email destinataire cadeau -->
              <div v-if="isGift" class="form-group">
                <label for="gift-email-input">{{ t('cart.gift.email_label') }}</label>
                <input
                  id="gift-email-input"
                  v-model="giftEmail"
                  type="email"
                  :placeholder="t('cart.gift.email_placeholder')"
                  class="email-input"
                />
              </div>

              <div class="form-group">
                <label for="email-input">{{ t('cart.email.label') }}</label>
                <input 
                  id="email-input"
                  v-model="emailInput" 
                  type="email" 
                  :placeholder="t('cart.email.placeholder')"
                  class="email-input"
                  @keyup.enter="sendEmail"
                />
              </div>
              <button 
                class="btn-send-email" 
                @click="sendEmail"
                :disabled="sendingEmail || !emailInput"
              >
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                {{ sendingEmail ? t('cart.email.sending') : t('cart.email.send') }}
              </button>
              <p v-if="emailError" class="email-error">{{ emailError }}</p>
              <p v-if="emailSuccess" class="email-success">{{ emailSuccess }}</p>
            </div>

            <div class="actions-group">
              <button 
                v-if="!cart.isActiveHold" 
                class="btn-reserve" 
                :disabled="cart.loading || cart.items.length === 0"
                @click="reserve"
              >
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                {{ cart.loading ? t('cart.actions.reserve_busy') : t('cart.actions.reserve') }}
              </button>
              
              <button 
                v-else 
                class="btn-cancel" 
                @click="cancel"
              >
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                {{ t('cart.actions.cancel') }}
              </button>

              <button v-if="!cart.isActiveHold" class="btn-clear" @click="clear" :disabled="cart.loading">
                {{ t('cart.actions.clear') }}
              </button>
            </div>

            <p v-if="cart.error" class="error-message">{{ cart.error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { useAuthStore } from '@/stores/login.js'
import { useI18n } from '@/composables/useI18n.js'
import { createTicketCodes } from '@/services/ticket.service.js'
import { initEmailJS, sendTicketEmail } from '@/services/email.service.js'
import { useQRCode } from '@/composables/useQRCode.js'

const cart = useCartStore()
const auth = useAuthStore()
const { t } = useI18n()
const { generateQRCode } = useQRCode()
let tickInterval = null

const emailInput = ref('')
const sendingEmail = ref(false)
const emailError = ref('')
const emailSuccess = ref('')
const isGift = ref(false)
const giftEmail = ref('')

// formatage du temps restant en minutes secondes
const tempsFormate = computed(() => {
  const remainingSeconds = cart.remainingSeconds || 0
  
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const totalQuantity = computed(() => {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return cart.items.reduce((sum, item) => {
    // le prix arrive deja en numerique
    const price = item.price || 0
    return sum + (price * item.quantity)
  }, 0)
})

onMounted(() => {
  initEmailJS()
  tickInterval = setInterval(() => {
    cart.checkExpiration()
  }, 1000)
})

onUnmounted(() => {
  if (tickInterval) clearInterval(tickInterval)
})

function increaseQty(item) {
  cart.incrementItem(item.ticketId)
}

function decreaseQty(item) {
  cart.decrementItem(item.ticketId)
}

function removeItem(ticketId) {
  cart.removeItem(ticketId)
}

async function reserve() {
  // si l utilisateur n est pas connecte on stoppe ici
  if (!auth.user) {
    cart.error = t('cart.errors.login_required')
    return
  }

  const userId = auth.user._id || auth.user.id
  if (!userId) {
    cart.error = t('cart.errors.login_required')
    return
  }

  // on vide l erreur avant de relancer la reservation
  cart.error = ''
  await cart.reserveCart(userId)
  // on pre remplit l email si dispo
  if (auth.user?.email) {
    emailInput.value = auth.user.email
  }
}

async function sendEmail() {
  if (!emailInput.value) {
    emailError.value = t('cart.email.error_empty')
    return
  }

  // si cadeau on controle l email destinataire
  if (isGift.value && !giftEmail.value) {
    emailError.value = t('cart.gift.error_empty')
    return
  }
  
  emailError.value = ''
  emailSuccess.value = ''
  sendingEmail.value = true
  
  try {
    const userId = cart.currentUserId || auth.user?._id || auth.user?.id

    // email cible selon le mode cadeau ou non
    const targetEmail = isGift.value ? giftEmail.value : emailInput.value

    // on genere un qr unique pour cette commande
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const qrCodeDataURL = await generateQRCode(orderId)

    // on genere les codes pour tous les articles
    let codes = []
    if (cart.items.length > 0) {
      codes = await createTicketCodes(cart.items, isGift.value ? 'gift' : userId, targetEmail, cart.holdId)
    }

    const allItems = codes

    const result = await sendTicketEmail(
      targetEmail,
      allItems,
      qrCodeDataURL,
      isGift.value ? emailInput.value : null
    )
    
    if (result.success) {
      if (isGift.value) {
        // mode cadeau sans ajout dans les commandes perso
        emailSuccess.value = t('cart.gift.success', { email: giftEmail.value })
      } else {
        // mode classique deja persiste en base
        emailSuccess.value = t('cart.email.success', { email: emailInput.value })
      }

      // on force la mise a jour du stock affiche
      cart.needsRefresh++
    } else {
      emailError.value = t('cart.email.error_send')
    }
    
    if (emailSuccess.value) {
      setTimeout(() => {
        cart.clearCart()
        emailInput.value = ''
        giftEmail.value = ''
        isGift.value = false
        emailError.value = ''
        emailSuccess.value = ''
      }, 2000)
    }
  } catch (e) {
    console.error('Erreur envoi email:', e)
    emailError.value = e?.message || t('cart.email.error_send')
  } finally {
    sendingEmail.value = false
  }
}

async function cancel() {
  await cart.cancelHold()
}

function clear() {
  cart.clearCart()
}
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
  background: linear-gradient(145deg, var(--surface-gradient-start) 0%, var(--surface-gradient-end) 60%, var(--surface-gradient-start) 100%);
  padding: 7rem 1rem 3rem;
  scroll-margin-top: 90px;
  color: var(--text-strong);
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cart-header {
  margin-bottom: 2rem;
}

.cart-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-strong);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.expiration-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(231, 45, 85, 0.18) 0%, var(--surface-panel) 100%);
  border: 2px solid var(--border-accent);
  border-radius: 12px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.icon-timer {
  width: 32px;
  height: 32px;
  color: #ff7a9f;
}

.timer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timer-label {
  font-size: 0.85rem;
  color: var(--text-soft);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer-value {
  font-size: 1.2rem;
  color: var(--text-strong);
  font-weight: 800;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-soft);
}

.empty-icon {
  width: 120px;
  height: 120px;
  opacity: 0.3;
  margin-bottom: 2rem;
}

.empty-cart h2 {
  font-size: 1.8rem;
  color: var(--text-strong);
  margin: 0 0 0.5rem 0;
}

.empty-cart p {
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
}

.btn-back-to-tickets {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--accent-gradient);
  color: #0b0c14;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px var(--accent-shadow);
}

.btn-back-to-tickets:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px var(--accent-shadow);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: 0 10px 30px var(--card-shadow);
  transition: all 0.3s ease;
}

.cart-item:hover {
  border-color: var(--border-accent);
  box-shadow: 0 12px 32px var(--accent-shadow);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-shop, .badge-ticket {
  font-size: 0.9rem;
}

.item-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.item-id {
  font-size: 0.85rem;
  color: var(--text-soft);
  font-family: monospace;
  background: var(--surface-chip);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.item-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent);
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface-muted);
  padding: 0.5rem;
  border-radius: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--control-text);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 700;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover:not(:disabled) {
  background: var(--surface-chip);
  transform: scale(1.1);
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-strong);
  min-width: 40px;
  text-align: center;
}

.btn-remove {
  width: 40px;
  height: 40px;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--control-text);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove svg {
  width: 20px;
  height: 20px;
}

.btn-remove:hover:not(:disabled) {
  background: var(--surface-chip);
  transform: scale(1.1);
}

.btn-remove:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cart-summary {
  position: sticky;
  top: 2rem;
}

.summary-card {
  background: var(--surface-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--card-shadow);
}

.summary-card h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  margin: 0 0 1.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--border-accent);
  padding-bottom: 0.75rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  color: var(--text-soft);
  font-size: 1rem;
}

.summary-line strong {
  color: var(--text-strong);
  font-weight: 700;
}

.summary-line.total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-line.total-price {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--border-accent);
  font-size: 1.3rem;
  font-weight: 700;
}

.summary-line.total-price strong {
  color: var(--accent-gradient);
  font-size: 1.5rem;
}

.actions-group {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-reserve {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--accent-gradient);
  color: #0b0c14;
  border: none;
  border-radius: 10px;
  font-weight: 800;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px var(--accent-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-reserve:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px var(--accent-shadow);
}

.btn-reserve:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #0b0c14;
  border: none;
  border-radius: 10px;
  font-weight: 800;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
}

.btn-clear {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: var(--control-bg);
  color: var(--control-text);
  border: 1px solid var(--control-border);
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear:hover:not(:disabled) {
  background: var(--surface-chip);
  color: var(--text-strong);
  border-color: var(--border-accent);
}

.btn-clear:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.email-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(231, 45, 85, 0.08) 0%, var(--surface-panel) 100%);
  border: 2px solid var(--border-accent);
  border-radius: 12px;
}

/* zone cadeau */
.gift-toggle {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.gift-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-strong);
}

.gift-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #E72D55;
  cursor: pointer;
}

.gift-icon {
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.email-input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-strong);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.email-input:focus {
  outline: none;
  background: var(--surface-muted);
  border-color: var(--border-accent);
  box-shadow: 0 0 0 3px rgba(231, 45, 85, 0.1);
}

.email-input::placeholder {
  color: var(--text-soft);
}

.btn-send-email {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 800;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-send-email:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(4, 120, 87, 0.45);
}

.btn-send-email:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.email-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-left: 3px solid #ef4444;
  border-radius: 6px;
  color: var(--warning-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.email-success {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #065f46;
  border: 1px solid #047857;
  border-left: 3px solid #34d399;
  border-radius: 6px;
  color: #ecfdf5;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-left: 3px solid #e72d55;
  border-radius: 6px;
  color: var(--warning-text);
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 968px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-header h1 {
    font-size: 1.8rem;
  }
  
  .cart-item {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .item-quantity {
    justify-content: center;
  }
  
  .btn-remove {
    width: 100%;
  }
}
</style>
