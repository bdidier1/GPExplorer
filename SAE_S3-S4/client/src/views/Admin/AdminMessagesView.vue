<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <h1>{{ t('admin.contact_messages.page_title') }}</h1>
          <p class="section-subtitle">{{ t('admin.contact_messages.subtitle') }}</p>
        </div>

        <!-- stats rapides -->
        <div class="stats-bar">
          <span class="stat-item">
            <strong>{{ messages.length }}</strong> {{ t('admin.contact_messages.total') }}
          </span>
          <span class="stat-item unread">
            <strong>{{ unreadCount }}</strong> {{ t('admin.contact_messages.unread') }}
          </span>
        </div>

        <!-- liste des messages -->
        <div v-if="messages.length === 0" class="empty-content">
          <p>{{ t('admin.contact_messages.no_messages') }}</p>
        </div>

        <div v-else class="messages-list">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-card"
            :class="{ unread: !msg.isRead }"
          >
            <div class="message-header">
              <div class="message-author">
                <strong>{{ msg.name }}</strong>
                <span class="message-email">{{ msg.email }}</span>
                <span v-if="msg.phone" class="message-phone">{{ msg.phone }}</span>
              </div>
              <div class="message-meta">
                <span class="message-subject badge">{{ getSubjectLabel(msg.subject) }}</span>
                <span class="message-date">{{ formatDate(msg.createdAt) }}</span>
              </div>
            </div>

            <div class="message-body">
              <p>{{ msg.message }}</p>
            </div>

            <div class="message-actions">
              <button v-if="!msg.isRead" class="btn-action read-btn" @click="markRead(msg.id)">
                {{ t('admin.contact_messages.mark_read') }}
              </button>
              <button class="btn-action delete-btn" @click="removeMessage(msg.id)">
                {{ t('admin.contact_messages.delete') }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n.js'
import { getAdminMessages, markAsRead, deleteMessage } from '@/services/adminMessage.service.js'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'

const { t } = useI18n()

const messages = ref([])

const unreadCount = computed(() => messages.value.filter(m => !m.isRead).length)

async function loadMessages() {
  messages.value = await getAdminMessages()
}

async function markRead(id) {
  await markAsRead(id)
  loadMessages()
}

async function removeMessage(id) {
  await deleteMessage(id)
  loadMessages()
}

function getSubjectLabel(subject) {
  const key = `contact.subjects.${subject}`
  return t(key) || subject
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.admin-container {
  display: flex;
  min-height: 100vh;
  background: var(--surface-gradient-start);
  font-family: 'Inter', sans-serif;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  padding: 2rem 3rem;
  background: var(--surface-gradient-end);
}

.content-section {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h1 {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 0.5rem;
}

.section-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

/* barre de stats */
.stats-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: var(--surface-card-strong);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--text-soft);
  border: 1px solid var(--border-subtle);
}

.stat-item.unread {
  color: #ffffff;
  border-color: rgba(231, 45, 85, 0.3);
  background: #7f1d3a;
}

.stat-item strong {
  font-weight: 800;
}

/* état vide */
.empty-content {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1rem;
}

/* liste des messages */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-card {
  background: var(--surface-card-strong);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.message-card.unread {
  border-left: 4px solid #E72D55;
}

.message-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.message-author {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-author strong {
  font-size: 1.05rem;
  color: var(--text-strong);
}

.message-email {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.message-phone {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.badge {
  background: #7f1d3a;
  color: #ffffff;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.message-date {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.message-body {
  padding: 1.25rem 1.5rem;
}

.message-body p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-soft);
  line-height: 1.6;
}

.message-actions {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.read-btn {
  background: #7f1d3a;
  color: #ffffff;
}

.read-btn:hover {
  background: #9f1239;
}

.delete-btn {
  background: #f5f5f5;
  color: #666;
}

.delete-btn:hover {
  background: #e0e0e0;
  color: #333;
}

/* mode sombre */
html.dark-mode .admin-container {
  background: var(--surface-gradient-start);
}

html.dark-mode .main-content {
  background: var(--surface-gradient-end);
}

html.dark-mode .section-header h1 {
  color: #ffffff;
}

html.dark-mode .section-subtitle {
  color: var(--text-muted);
}

html.dark-mode .stat-item {
  background: #1a1a1a;
  border-color: #333;
  color: #ccc;
}

html.dark-mode .message-card {
  background: #1a1a1a;
  border-color: #222;
}

html.dark-mode .message-header {
  border-bottom-color: #2a2a2a;
}

html.dark-mode .message-author strong {
  color: #fff;
}

html.dark-mode .message-email,
html.dark-mode .message-phone {
  color: #888;
}

html.dark-mode .message-body p {
  color: #ccc;
}

html.dark-mode .message-actions {
  border-top-color: #2a2a2a;
}

html.dark-mode .delete-btn {
  background: #2a2a2a;
  color: #d1d5db;
}

/* responsive */
@media (max-width: 992px) {
  .main-content {
    margin-left: 70px;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .section-header {
    margin-bottom: 1.25rem;
  }

  .section-header h1 {
    font-size: 1.45rem;
  }

  .section-subtitle {
    font-size: 0.9rem;
  }

  .message-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .message-meta {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .message-body {
    padding: 1rem;
  }

  .message-actions {
    padding: 0.9rem 1rem;
    justify-content: stretch;
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .stats-bar {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 420px) {
  .main-content {
    padding: 0.75rem;
  }

  .message-author strong {
    font-size: 0.98rem;
  }

  .message-email,
  .message-phone,
  .message-date {
    font-size: 0.8rem;
  }

  .badge {
    font-size: 0.72rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
