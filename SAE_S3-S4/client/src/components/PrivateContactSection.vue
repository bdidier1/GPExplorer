<template>
  <section :id="sectionId" class="private-contact">
    <div class="private-contact__container">
      <div class="private-contact__header">
        <div>
          <h3 class="private-contact__title">{{ t('private_contact.title', { provider: providerLabel }) }}</h3>
          <p class="private-contact__subtitle">{{ t('private_contact.subtitle') }}</p>
        </div>
      </div>

      <div class="private-contact__card">
        <div v-if="!isAuthenticated" class="private-contact__notice">
          {{ t('private_contact.notice_login') }}
        </div>
        <div v-else-if="isCurrentProvider" class="private-contact__messages-section">
          <div class="private-contact__messages-header">
            <h4>{{ t('private_contact.messages_title') }}</h4>
            <span class="private-contact__count">
              {{ t('private_contact.messages_count', { count: messages.length }) }}
              <span v-if="unreadCount > 0" class="private-contact__badge">{{ t('private_contact.messages_unread', { count: unreadCount }) }}</span>
            </span>
          </div>
          
          <div v-if="messages.length === 0" class="private-contact__empty">
            {{ t('private_contact.empty_messages') }}
          </div>
          
          <article v-for="msg in messages" :key="msg.id" class="private-contact__message">
            <div class="private-contact__message-head">
              <div class="private-contact__message-meta">
                <div class="private-contact__message-author">{{ msg.author }}</div>
                <div class="private-contact__message-email">{{ msg.email }}</div>
                <div class="private-contact__message-date">{{ formatDate(msg.createdAt) }}</div>
                <span v-if="!msg.isRead" class="private-contact__pill private-contact__pill--new">{{ t('private_contact.badge_new') }}</span>
              </div>
              <div class="private-contact__message-actions">
                <button v-if="!msg.isRead" type="button" class="btn ghost small" @click="markRead(msg.id)">
                  {{ t('private_contact.btn_mark_read') }}
                </button>
                <button type="button" class="btn danger small" @click="deleteMsg(msg.id)">
                  {{ t('private_contact.btn_delete') }}
                </button>
              </div>
            </div>
            <p class="private-contact__message-content">{{ msg.content }}</p>
          </article>
        </div>
        <div v-else class="private-contact__form">
          <label class="private-contact__label" for="contact-message">{{ t('private_contact.label_message') }}</label>
          <textarea
            id="contact-message"
            v-model="messageContent"
            rows="5"
            :placeholder="t('private_contact.placeholder_message', { provider: providerLabel })"
          ></textarea>

          <div class="private-contact__info">
            <p class="private-contact__muted">
              <strong>{{ t('private_contact.label_name') }}</strong> {{ currentUser?.firstName }} {{ currentUser?.lastName }}
            </p>
            <p class="private-contact__muted">
              <strong>{{ t('private_contact.label_email') }}</strong> {{ currentUser?.email }}
            </p>
          </div>

          <div class="private-contact__actions">
            <button 
              type="button" 
              class="btn" 
              @click="sendMessage" 
              :disabled="submitting || !messageContent.trim()"
            >
              {{ t('private_contact.btn_send') }}
            </button>
          </div>
          <p v-if="feedback" class="private-contact__feedback" :class="{ 'success': feedbackSuccess }">
            {{ feedback }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/login.js'
import { useProvidersStore } from '@/stores/providers.js'
import * as messageService from '@/services/providerMessage.service.js'
import { useI18n } from '@/composables/useI18n.js'

const props = defineProps({
  providerId: {
    type: [String, Number],
    required: true
  },
  providerName: {
    type: String,
    default: 'ce prestataire'
  },
  sectionId: {
    type: String,
    default: 'contact-prive'
  }
})

const authStore = useAuthStore()
const providersStore = useProvidersStore()
const { t, locale } = useI18n()

const messageContent = ref('')
const submitting = ref(false)
const feedback = ref('')
const feedbackSuccess = ref(false)
const messages = ref([])
const unreadCount = ref(0)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.user)
const providerLabel = computed(() => props.providerName || 'ce prestataire')

// vérifie si le user connecté est le propriétaire
const isCurrentProvider = computed(() => {
  if (!isAuthenticated.value || !currentUser.value) return false
  if (currentUser.value.role !== 'provider') return false
  
  // retrouve l'id provider depuis le username
  const providerRecord = providersStore.getProviderByUsername(currentUser.value.username)
  return providerRecord?.id === props.providerId
})

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('private_contact.time_just_now')
  if (diffMins < 60) return t('private_contact.time_min_ago', { min: diffMins })
  if (diffHours < 24) return t('private_contact.time_hour_ago', { hour: diffHours })
  if (diffDays < 7) return t('private_contact.time_day_ago', { day: diffDays })
  
  return date.toLocaleDateString(locale.value, { 
    day: 'numeric', 
    month: 'short', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  })
}

async function sendMessage() {
  if (!messageContent.value.trim()) {
    feedback.value = t('private_contact.feedback_empty')
    feedbackSuccess.value = false
    return
  }

  submitting.value = true
  feedback.value = ''

  try {
    const messageData = {
      author: `${currentUser.value.firstName} ${currentUser.value.lastName}`,
      email: currentUser.value.email,
      content: messageContent.value.trim()
    }

    await messageService.sendMessageToProvider(props.providerId, messageData)

    messageContent.value = ''
    feedback.value = t('private_contact.feedback_success')
    feedbackSuccess.value = true
    loadMessages()
    setTimeout(() => {
      feedback.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erreur envoi message:', error)
    feedback.value = t('private_contact.feedback_error')
    feedbackSuccess.value = false
  } finally {
    submitting.value = false
  }
}

async function loadMessages() {
  if (isCurrentProvider.value) {
    try {
      messages.value = await messageService.getProviderMessages(props.providerId)
      unreadCount.value = await messageService.getUnreadCount(props.providerId)
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    }
  }
}

async function markRead(messageId) {
  await messageService.markAsRead(props.providerId, messageId)
  loadMessages()
}

async function deleteMsg(messageId) {
  if (confirm(t('private_contact.confirm_delete'))) {
    await messageService.deleteMessage(props.providerId, messageId)
    loadMessages()
  }
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.private-contact {
  margin: 3rem 0;
  padding: 2rem 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--text-strong);
}

.private-contact__container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* mode sombre */
html.dark-mode section#contact-prive {
  background: #0a0a0a;
}

html.dark-mode section#contact-prive .private-contact__card {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  margin-bottom: 0;
  border-radius: 0;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

html.dark-mode section#contact-prive .private-contact__message {
  border-top-color: rgba(255,255,255,0.03);
}

html.dark-mode section#contact-prive,
html.dark-mode section#contact-prive .private-contact__container,
html.dark-mode section#contact-prive .private-contact__card {
  color: #e6e6e6;
}

.private-contact__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.private-contact__title {
  margin: 0;
  font-size: 1.6rem;
  color: var(--text-strong);
  font-weight: 900;
}

.private-contact__subtitle {
  color: var(--text-muted);
  margin: 0.4rem 0 0;
}

.private-contact__card {
  background: var(--surface-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px var(--card-shadow);
}

.private-contact__notice {
  padding: 0.9rem 1rem;
  background: var(--surface-muted);
  border: 1px dashed var(--border-subtle);
  border-radius: 12px;
  color: var(--text-soft);
}

.private-contact__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.private-contact__label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--text-soft);
}

textarea {
  width: 100%;
  background: var(--control-bg);
  color: var(--control-text);
  border: 1px solid var(--control-border);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  resize: vertical;
  font-family: inherit;
}

textarea:focus {
  outline: none;
  border-color: var(--border-accent);
}

.private-contact__info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem 1rem;
  background: var(--surface-muted);
  border: 1px dashed var(--border-subtle);
  border-radius: 12px;
}

.private-contact__muted {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}

.private-contact__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  align-items: center;
}

.btn {
  background: var(--accent-gradient);
  color: #fff;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn:hover:not(:disabled) {
  background: var(--accent-gradient-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--accent-shadow);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.ghost {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-soft);
}

.btn.ghost:hover:not(:disabled) {
  background: var(--surface-muted);
  border-color: var(--border-strong);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--card-shadow);
}

.btn.danger {
  background: transparent;
  border: 1px solid var(--warning-border);
  color: var(--warning-text);
}

.btn.danger:hover:not(:disabled) {
  background: var(--warning-bg);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(231,45,85,0.2);
}

.btn.small {
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
}

.private-contact__feedback {
  color: var(--text-soft);
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
}

.private-contact__feedback.success {
  color: var(--success-text);
}

/* section messages côté prestataire */
.private-contact__messages-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.private-contact__messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.private-contact__messages-header h4 {
  margin: 0;
  color: var(--text-strong);
  font-weight: 700;
}

.private-contact__count {
  color: var(--text-muted);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.private-contact__badge {
  background: #e72d55;
  color: white;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.private-contact__empty {
  color: var(--text-muted);
  text-align: center;
  padding: 2rem 0;
}

.private-contact__message {
  border-top: 1px solid var(--border-subtle);
  padding: 1rem 0;
  transition: background 0.2s ease;
}

.private-contact__message:hover {
  background: var(--surface-muted);
  border-radius: 8px;
  margin: 0 -0.5rem;
  padding: 1rem 0.5rem;
}

.private-contact__message:first-of-type {
  border-top: none;
}

.private-contact__message-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.private-contact__message-meta {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}

.private-contact__message-author {
  font-weight: 700;
  color: var(--text-strong);
}

.private-contact__message-email {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.private-contact__message-date {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.private-contact__pill {
  background: var(--surface-chip);
  color: #e72d55;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  border: 1px solid var(--border-accent);
  font-weight: 600;
}

.private-contact__pill--new {
  background: #e72d55;
  color: white;
  border-color: #e72d55;
}

.private-contact__message-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.private-contact__message-content {
  margin: 0.4rem 0 0;
  line-height: 1.5;
  color: var(--text-soft);
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .private-contact {
    padding: 1.25rem 0;
  }
  .private-contact__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .private-contact__message-head {
    align-items: flex-start;
  }
  .private-contact__actions {
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
}
</style>
