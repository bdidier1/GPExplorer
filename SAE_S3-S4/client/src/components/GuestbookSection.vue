<template>
  <section :id="sectionId" class="guestbook">
    <div class="guestbook__container">
      <div class="guestbook__header">
        <div>
        <h3 class="guestbook__title">
          {{ t('guestbook.title', { provider: providerLabel }) }}
          <span v-if="averageRating > 0" class="guestbook__average">
            <span class="guestbook__average-value">{{ averageRating.toFixed(1) }}</span>
            <span class="guestbook__average-stars">
              <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= Math.round(averageRating) }">★</span>
            </span>
            <span class="guestbook__average-count">({{ entries.length }} {{ t('guestbook_extra.reviews_label') }})</span>
          </span>
        </h3>
        <p v-if="!guestbookEnabled && !isOrganizer" class="guestbook__muted">{{ t('guestbook.disabled_msg') }}</p>
      </div>
    </div>

    <div class="guestbook__card">
      <div v-if="!guestbookEnabled && !isOrganizer" class="guestbook__notice guestbook__notice--warning">
        {{ t('guestbook.notice_disabled') }}
      </div>
      <div v-else-if="!isAuthenticated" class="guestbook__notice">
        {{ t('guestbook.notice_login') }}
      </div>
      <div v-else-if="isProvider" class="guestbook__notice">
        {{ t('guestbook.notice_provider') }}
      </div>
      <div v-else-if="userEntry && !editingId" class="guestbook__notice guestbook__notice--info">
        {{ t('guestbook.notice_already_posted') }}
      </div>
      <div v-else class="guestbook__form">
        <div class="guestbook__rating">
          <span class="guestbook__label">{{ t('guestbook.label_rating') }}</span>
          <div class="guestbook__stars">
            <button
              v-for="value in 5"
              :key="value"
              type="button"
              class="star"
              :class="{ active: rating >= value }"
              @click="rating = value"
              :aria-label="t('guestbook.aria_choose_rating')"
            >
              ★
            </button>
          </div>
        </div>

        <label class="guestbook__label" for="guestbook-message">{{ t('guestbook.label_message') }}</label>
        <textarea
          id="guestbook-message"
          v-model="message"
          rows="4"
          :placeholder="t('guestbook.placeholder_message', { provider: providerLabel })"
        ></textarea>

        <div class="guestbook__actions">
          <button type="button" class="btn" @click="saveEntry" :disabled="submitting || !rating || !message.trim()">
            {{ editingId ? t('guestbook.btn_update') : t('guestbook.btn_submit') }}
          </button>
          <button v-if="editingId" type="button" class="btn ghost" @click="resetForm">{{ t('guestbook.btn_cancel') }}</button>
        </div>
        <p v-if="feedback" class="guestbook__feedback">{{ feedback }}</p>
        <p v-if="userEntry && !editingId" class="guestbook__muted">{{ t('guestbook.single_entry_notice') }}</p>
      </div>
    </div>

    <div class="guestbook__list">
      <div class="guestbook__list-header">
        <h4>{{ t('guestbook.list_title') }}</h4>
        <span class="guestbook__count">{{ t('guestbook.list_count', { count: entries.length }) }}</span>
      </div>
      <div v-if="entries.length === 0" class="guestbook__empty">{{ t('guestbook.list_empty') }}</div>
      <article v-for="entry in entries" :key="entry.id" class="guestbook__entry">
        <div class="guestbook__entry-head">
          <div class="guestbook__entry-meta">
            <div class="guestbook__stars small">
              <span v-for="value in 5" :key="value" class="star" :class="{ active: entry.rating >= value }">★</span>
            </div>
            <div class="guestbook__author">{{ entry.authorName }}</div>
            <div class="guestbook__date">{{ formatDate(entry.updatedAt || entry.createdAt) }}</div>
            <span v-if="entry.userId === currentUserId" class="guestbook__pill">{{ t('guestbook.your_review') }}</span>
          </div>
          <div class="guestbook__actions" v-if="canManage(entry)">
            <button v-if="entry.userId === currentUserId" type="button" class="btn ghost" @click="startEdit(entry)">{{ t('guestbook.btn_edit') }}</button>
            <button type="button" class="btn danger" @click="removeEntry(entry)">{{ t('guestbook.btn_delete') }}</button>
          </div>
        </div>
        <p class="guestbook__message">{{ entry.message }}</p>
      </article>
    </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/login.js'
import { useGuestbookStore } from '@/stores/guestbook.js'
import { useProvidersStore } from '@/stores/providers.js'
import { useI18n } from '@/composables/useI18n.js'

const props = defineProps({
  providerId: {
    type: [String, Number],
    default: null
  },
  providerName: {
    type: String,
    default: 'ce prestataire'
  },
  providerUsername: {
    type: String,
    default: null
  },
  sectionId: {
    type: String,
    default: 'guestbook-section'
  }
})

const authStore = useAuthStore()
const guestbookStore = useGuestbookStore()
const providersStore = useProvidersStore()
const { t, locale } = useI18n()

onMounted(() => {
  if (!guestbookStore.hydrated) {
    guestbookStore.loadFromStorage()
  }
  if (props.providerId) {
    guestbookStore.fetchEntries(props.providerId)
  }
})

const providerKey = computed(() => props.providerId || 'global')
const providerLabel = computed(() => props.providerName || t('guestbook_extra.default_provider'))

const entries = computed(() => guestbookStore.list(providerKey.value))

// calcule la moyenne des notes
const averageRating = computed(() => {
  const validEntries = entries.value.filter(entry => entry.rating && entry.rating > 0)
  if (validEntries.length === 0) return 0
  const sum = validEntries.reduce((acc, entry) => acc + entry.rating, 0)
  return sum / validEntries.length
})

// active ou non le livre d'or selon les réglages prestataire
const guestbookEnabled = computed(() => {
  if (!props.providerUsername) return true
  const providerContent = providersStore.getProviderContent(props.providerUsername)
  return providerContent?.settings?.hasGuestbookAccess !== false
})

const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUserId = computed(() => user.value?._id || null)
const userRole = computed(() => user.value?.role || 'visitor')
const isOrganizer = computed(() => userRole.value === 'organizer')
const isProvider = computed(() => userRole.value === 'provider')

const userEntry = computed(() => guestbookStore.findUserEntry(providerKey.value, currentUserId.value))

const rating = ref(userEntry.value?.rating || 0)
const message = ref(userEntry.value?.message || '')
const editingId = ref(null)
const feedback = ref('')
const submitting = ref(false)

watch(userEntry, (entry) => {
  if (entry && !editingId.value) {
    rating.value = entry.rating
    message.value = entry.message
  }
})

function resetForm() {
  editingId.value = null
  rating.value = userEntry.value?.rating || 0
  message.value = userEntry.value?.message || ''
  feedback.value = ''
}

function saveEntry() {
  if (!guestbookEnabled.value && !isOrganizer.value) {
    feedback.value = t('guestbook.feedback_disabled')
    return
  }

  if (!isAuthenticated.value || isProvider.value) {
    feedback.value = t('guestbook.feedback_provider')
    return
  }

  if (!rating.value || !message.value.trim()) {
    feedback.value = t('guestbook.feedback_required')
    return
  }

  submitting.value = true
  const payload = { rating: rating.value, message: message.value }
  let result

  if (editingId.value) {
    result = guestbookStore.updateEntry(providerKey.value, editingId.value, payload, user.value)
  } else {
    result = guestbookStore.addEntry(providerKey.value, payload, user.value)
  }

  submitting.value = false
  if (!result.success) {
    feedback.value = result.message || t('guestbook.feedback_error')
    return
  }

  feedback.value = editingId.value ? t('guestbook.feedback_updated') : t('guestbook.feedback_published')
  editingId.value = null
  rating.value = result.entry?.rating || rating.value
  message.value = result.entry?.message || message.value
}

function startEdit(entry) {
  editingId.value = entry.id
  rating.value = entry.rating
  message.value = entry.message
  feedback.value = ''
}

function removeEntry(entry) {
  const result = guestbookStore.deleteEntry(providerKey.value, entry.id, user.value)
  if (!result.success) {
    feedback.value = result.message || t('guestbook.feedback_delete_error')
    return
  }
  if (editingId.value === entry.id) {
    resetForm()
  }
  feedback.value = t('guestbook.feedback_deleted')
}

function canManage(entry) {
  if (!user.value) return false
  return entry.userId === currentUserId.value || userRole.value === 'organizer'
}

function formatDate(value) {
  if (!value) return ''
  try {
    const date = new Date(value)
    return date.toLocaleDateString(locale.value, { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (e) {
    console.warn('[Guestbook] Date parse fallback', e)
    return value
  }
}
</script>

<style scoped>
.guestbook {
  margin: 3rem 0;
  padding: 2rem 0; /* vertical spacing only; inner container holds card styles */
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--text-strong);
}

.guestbook__container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* en dark mode le fond de la section reste bien sombre */
html.dark-mode section#guestbook {
  background: #0a0a0a;
}

/* en dark mode on fusionne les cartes avec le fond */
html.dark-mode section#guestbook .guestbook__card,
html.dark-mode section#guestbook .guestbook__list {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

/* légère séparation entre les lignes de la liste */
html.dark-mode section#guestbook .guestbook__entry {
  border-top-color: rgba(255,255,255,0.03);
}

/* enlève les espacements pour un rendu plus uniforme en dark mode */
html.dark-mode section#guestbook .guestbook__card {
  margin-bottom: 0;
  border-radius: 0;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

html.dark-mode section#guestbook .guestbook__list {
  margin-top: 0.75rem;
  border-radius: 0;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

/* garde un bon contraste de texte sur le fond sombre */
html.dark-mode section#guestbook,
html.dark-mode section#guestbook .guestbook__container,
html.dark-mode section#guestbook .guestbook__card,
html.dark-mode section#guestbook .guestbook__list {
  color: #e6e6e6;
}

html.dark-mode section#guestbook .guestbook__average-stars .star {
  color: #555;
}

html.dark-mode section#guestbook .guestbook__average-stars .star.active {
  color: #FFD700;
}

.guestbook__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.guestbook__title {
  margin: 0;
  font-size: 1.6rem;
  color: var(--text-strong);
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.guestbook__average {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
}

.guestbook__average-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: #b45309;
}

.guestbook__average-stars {
  display: inline-flex;
  gap: 2px;
  font-size: 1rem;
}

.guestbook__average-stars .star {
  color: #ddd;
}

.guestbook__average-stars .star.active {
  color: #FFD700;
}

.guestbook__average-count {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.guestbook__muted {
  color: var(--text-muted);
  margin: 0.4rem 0 0;
}

.guestbook__card {
  background: var(--surface-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px var(--card-shadow);
}

.guestbook__notice {
  padding: 0.9rem 1rem;
  background: var(--surface-muted);
  border: 1px dashed var(--border-subtle);
  border-radius: 12px;
  color: var(--text-soft);
}

.guestbook__notice--warning {
  background: var(--warning-bg);
  border-color: var(--warning-border);
  color: var(--warning-text);
}

.guestbook__notice--info {
  background: var(--success-bg);
  border: 1px dashed var(--border-accent);
  color: var(--success-text);
}

.guestbook__form textarea {
  width: 100%;
  background: var(--control-bg);
  color: var(--control-text);
  border: 1px solid var(--control-border);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  resize: vertical;
  font-family: inherit;
}

.guestbook__form textarea:focus {
  outline: none;
  border-color: var(--border-accent);
}

.guestbook__label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--text-soft);
}

.guestbook__rating {
  margin-bottom: 0.75rem;
}

.guestbook__stars {
  display: inline-flex;
  gap: 0.35rem;
}

.guestbook__stars.small {
  gap: 0.25rem;
}

.star {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.star.active {
  color: #fbbf24;
}

.star:hover {
  color: #fde047;
}

.guestbook__actions {
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

.guestbook__feedback {
  color: var(--text-soft);
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
}

.guestbook__list {
  background: var(--surface-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px var(--card-shadow);
}

.guestbook__list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.guestbook__list-header h4 {
  margin: 0;
  color: var(--text-strong);
  font-weight: 700;
}

.guestbook__count {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.guestbook__empty {
  color: var(--text-muted);
  text-align: center;
  padding: 2rem 0;
}

.guestbook__entry {
  border-top: 1px solid var(--border-subtle);
  padding: 1rem 0;
  transition: background 0.2s ease;
}

.guestbook__entry:hover {
  background: var(--surface-muted);
  border-radius: 8px;
  margin: 0 -0.5rem;
  padding: 1rem 0.5rem;
}

.guestbook__entry:first-of-type {
  border-top: none;
}

.guestbook__entry-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.guestbook__entry-meta {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}

.guestbook__author {
  font-weight: 700;
  color: var(--text-strong);
}

.guestbook__date {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.guestbook__pill {
  background: var(--surface-chip);
  color: #e72d55;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  border: 1px solid var(--border-accent);
  font-weight: 600;
}

.guestbook__message {
  margin: 0.4rem 0 0;
  line-height: 1.5;
  color: var(--text-soft);
}

@media (max-width: 768px) {
  .guestbook {
    padding: 1.25rem 0;
  }
  .guestbook__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .guestbook__entry-head {
    align-items: flex-start;
  }
}
</style>
