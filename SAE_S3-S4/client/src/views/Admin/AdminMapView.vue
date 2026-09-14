<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <h1>{{ t('admin.map.page_title') }}</h1>
          <p class="section-subtitle">{{ t('admin.map.subtitle') }}</p>
        </div>

        <div v-if="feedback.message" :class="['feedback-banner', feedback.type]">
          {{ feedback.message }}
        </div>

        <div class="map-grid">
          <div class="map-wrapper">
            <div class="map-toolbar">
              <div>
                <p class="toolbar-title">{{ t('admin.map.assign_provider') }}</p>
                <p class="toolbar-subtitle">{{ t('admin.map.assign_desc') }}</p>
              </div>
              <div class="toolbar-actions">
                <select v-model="selectedProviderId" :disabled="!availableProviders.length">
                  <option value="" disabled>{{ t('admin.map.select_provider') }}</option>
                  <option v-for="provider in availableProviders" :key="provider.id" :value="provider.id">
                    {{ provider.companyName || provider.username }}
                  </option>
                </select>
              </div>
            </div>

            <CircuitMap
              :interactive="true"
              :provider-id="selectedProviderId || null"
              @spot-selected="handleAdminSpotSelected"
            />

            <p v-if="selectedProviderAssignment" class="selection-hint">
              {{ t('admin_map_view.positioned_on', { name: selectedProviderName, label: selectedProviderAssignment.label }) }}
            </p>
          </div>

          <aside class="requests-panel">
            <header>
              <div>
                <h2>{{ t('admin.map.pending_requests') }}</h2>
                <p>{{ pendingRequests.length || 0 }} {{ t('admin.map.requests_to_process') }}</p>
              </div>
            </header>

            <div v-if="pendingRequests.length" class="requests-list">
              <article v-for="request in pendingRequests" :key="request.id" class="request-card">
                <div class="request-card-header">
                  <h3>{{ request.providerDisplayName }}</h3>
                  <span class="badge">{{ request.spotLabel }}</span>
                </div>
                <p class="meta">{{ t('admin.map.submitted_on') }} {{ formatDate(request.requestedAt) }}</p>
                <p class="meta">{{ t('admin.map.contact') }} : {{ request.providerContact || t('admin.map.not_provided') }}</p>
                <div class="actions">
                  <button class="approve" @click="handleApprove(request.id)">{{ t('admin.map.validate') }}</button>
                  <button class="reject" @click="handleReject(request.id)">{{ t('admin.map.reject') }}</button>
                </div>
              </article>
            </div>
            <p v-else class="empty-message">{{ t('admin.map.no_pending') }}</p>
          </aside>
        </div>

        <div class="assignments-panel">
          <div class="history-header">
            <h2>{{ t('admin.map.occupied_spots') }}</h2>
            <p>{{ occupiedSpots.length || 0 }} {{ t('admin.map.providers_installed') }}</p>
          </div>

          <div v-if="occupiedSpots.length" class="assignments-list">
            <article v-for="spot in occupiedSpots" :key="spot.id" class="assignment-card">
              <div>
                <p class="history-title">{{ spot.label }}</p>
                <p class="meta">{{ t('admin.map.occupied_by') }} {{ spot.occupant.displayName }}</p>
                <p class="meta small">{{ t('admin.map.last_update') }} {{ formatDate(spot.occupant.updatedAt) }}</p>
              </div>
              <button class="force-release" @click="handleForceRelease(spot.id, spot.occupant.providerId)">
                {{ t('admin.map.remove_provider') }}
              </button>
            </article>
          </div>
          <p v-else class="empty-message">{{ t('admin.map.no_occupied') }}</p>
        </div>

        <div class="history-panel">
          <div class="history-header">
            <h2>{{ t('admin.map.decision_history') }}</h2>
            <p>{{ processedRequests.length || 0 }} {{ t('admin.map.recent_decisions') }}</p>
          </div>

          <div v-if="processedRequests.length" class="history-list">
            <div v-for="request in processedRequests" :key="request.id" class="history-item">
              <div>
                <p class="history-title">{{ request.providerDisplayName }} → {{ request.spotLabel }}</p>
                <p class="meta">
                  {{ capitalize(request.status) }} le {{ formatDate(request.reviewedAt) }}
                  <span v-if="request.decisionReason">— {{ request.decisionReason }}</span>
                </p>
              </div>
              <span :class="['status-pill', request.status]">{{ capitalize(request.status) }}</span>
            </div>
          </div>
          <p v-else class="empty-message">{{ t('admin.map.no_history') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import CircuitMap from '@/components/CircuitMap.vue'
import { useMapRequestsStore } from '@/stores/mapRequests.js'
import { useMapStore } from '@/stores/map.js'
import { useProvidersStore } from '@/stores/providers.js'
import { useI18n } from '@/composables/useI18n.js'

const { t } = useI18n()
const SELECTED_PROVIDER_STORAGE_KEY = 'gp-explorer-admin-selected-provider'

const mapRequestsStore = useMapRequestsStore()
mapRequestsStore.loadRequests()
const mapStore = useMapStore()
const providersStore = useProvidersStore()

const { pendingRequests, processedRequests } = storeToRefs(mapRequestsStore)
const { vendorSpots } = storeToRefs(mapStore)
const { activeProviders } = storeToRefs(providersStore)
const feedback = ref({ type: '', message: '' })
const selectedProviderId = ref('')

onMounted(() => {
  if (!globalThis.window) return
  const stored = localStorage.getItem(SELECTED_PROVIDER_STORAGE_KEY)
  if (stored) {
    selectedProviderId.value = stored
  }
})

const occupiedSpots = computed(() => vendorSpots.value.filter(spot => spot.occupant))
const availableProviders = computed(() => activeProviders.value.filter(provider => provider.isActive !== false))
const selectedProvider = computed(() => availableProviders.value.find(provider => provider.id === selectedProviderId.value) || null)
const selectedProviderAssignment = computed(() => {
  if (!selectedProvider.value) return null
  return mapStore.getSpotForProvider(selectedProvider.value.id)
})
const selectedProviderName = computed(() => selectedProvider.value?.companyName || selectedProvider.value?.username || t('admin.provider.fallback_name'))

watch(availableProviders, providers => {
  if (!selectedProviderId.value && providers.length) {
    selectedProviderId.value = providers[0].id
  }
  if (selectedProviderId.value && !providers.some(provider => provider.id === selectedProviderId.value)) {
    selectedProviderId.value = providers[0]?.id || ''
  }
}, { immediate: true })

watch(selectedProviderId, value => {
  if (!globalThis.window) return
  if (value) {
    localStorage.setItem(SELECTED_PROVIDER_STORAGE_KEY, value)
  } else {
    localStorage.removeItem(SELECTED_PROVIDER_STORAGE_KEY)
  }
})

function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? isoString : date.toLocaleString('fr-FR')
}

function capitalize(text) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

async function handleApprove(requestId) {
  const result = await mapRequestsStore.approveRequest(requestId)
  feedback.value = {
    type: result.success ? 'success' : 'error',
    message: result.success ? t('admin_map_view.request_approved') : (result.message || t('admin_map_view.assign_error'))
  }
}

async function handleReject(requestId) {
  const reason = globalThis.window?.prompt(t('admin_map_view.reject_reason_prompt')) || null
  const result = await mapRequestsStore.rejectRequest(requestId, reason)
  feedback.value = {
    type: result.success ? 'warning' : 'error',
    message: result.success ? t('admin_map_view.request_rejected') : (result.message || t('admin_map_view.assign_error'))
  }
}

async function handleForceRelease(spotId, providerId) {
  const result = await mapStore.releaseSpot(spotId, providerId)
  feedback.value = {
    type: result.success ? 'warning' : 'error',
    message: result.success ? t('admin_map_view.provider_removed') : (result.message || t('admin_map_view.assign_error'))
  }
}

async function handleAdminSpotSelected(spot) {
  if (!spot) {
    return
  }
  if (!selectedProvider.value) {
    if (availableProviders.value.length) {
      selectedProviderId.value = availableProviders.value[0].id
    }
  }
  if (!selectedProvider.value) {
    feedback.value = { type: 'error', message: t('admin_map_view.select_active_provider') }
    return
  }

  const result = await mapStore.claimSpot(spot.id, {
    id: selectedProvider.value.id,
    username: selectedProvider.value.username,
    companyName: selectedProvider.value.companyName,
    contactPerson: selectedProvider.value.contactPerson
  })

  if (result.success) {
    await mapRequestsStore.removeProviderRequests()
    feedback.value = { type: '', message: '' }
  } else {
    feedback.value = { type: 'error', message: result.message || t('admin_map_view.assign_error') }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.admin-container {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
  font-family: 'Inter', sans-serif;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  padding: 2rem 3rem;
  background: #ffffff;
}

.content-section {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

.feedback-banner {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-weight: 500;
}

.feedback-banner.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.feedback-banner.error {
  background: #ffebee;
  color: #c62828;
}

.feedback-banner.warning {
  background: #fff3e0;
  color: #9a3412;
}

.map-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.map-wrapper {
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: none;
}

.map-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0.75rem 0.5rem;
}

.toolbar-title {
  margin: 0;
  font-weight: 700;
  color: #111827;
}

.toolbar-subtitle {
  margin: 0.25rem 0 0;
  color: #4b5563;
  font-size: 0.9rem;
}

.toolbar-actions select {
  min-width: 260px;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  border: 1px solid #0a0a0a;
  background: #ffffff;
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
  cursor: pointer;
  color-scheme: light;
}

.toolbar-actions select:focus {
  outline: none;
  border-color: #0a0a0a;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.35);
}



.selection-hint {
  margin: 0.75rem 0 0;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  color: #1f2937;
}

.map-wrapper #map {
  height: 520px;
}

.requests-panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: none;
}

.requests-panel header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #111827;
}

.requests-panel header p {
  margin: 0;
  color: #4b5563;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  border: none;
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.request-card-header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: baseline;
}

.request-card-header h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #111827;
}

.badge {
  background: #f3f4f6;
  color: #111827;
  border-radius: 999px;
  padding: 0.2rem 0.75rem;
  font-size: 0.85rem;
}

.meta {
  margin: 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.request-card .actions {
  display: flex;
  gap: 0.5rem;
}

.request-card button {
  flex: 1;
  border: none;
  border-radius: 999px;
  padding: 0.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.request-card button:hover {
  transform: translateY(-1px);
}

.request-card button.approve {
  background: linear-gradient(120deg, #2e7d32, #1b5e20);
  color: #ffffff;
}

.request-card button.reject {
  background: #fee2e2;
  color: #c62828;
}

.empty-message {
  margin: 0;
  padding: 2rem 1rem;
  text-align: center;
  color: #6b7280;
  border: none;
  background: #f9fafb;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.history-panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: none;
}

.assignments-panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: none;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.history-list,
.assignments-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item,
.assignment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: none;
  background: #ffffff;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.history-title {
  margin: 0 0 0.25rem;
  font-weight: 600;
  color: #111827;
}

.assignment-card .force-release {
  border: none;
  border-radius: 999px;
  background: #fff7ed;
  color: #c2410c;
  padding: 0.6rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.assignment-card .force-release:hover {
  transform: translateY(-1px);
}

.meta.small {
  font-size: 0.8rem;
}

.status-pill {
  border-radius: 999px;
  padding: 0.25rem 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pill.approved {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-pill.rejected {
  background: #ffebee;
  color: #c62828;
}

/* mode sombre */
html.dark-mode .admin-container {
  background: #1a1a1a;
}

html.dark-mode .main-content {
  background: #222222;
}

html.dark-mode .section-header h1 {
  color: #ffffff;
}

html.dark-mode .section-subtitle,
html.dark-mode .meta,
html.dark-mode .history-header p {
  color: #bbbbbb;
}

html.dark-mode .map-wrapper,
html.dark-mode .requests-panel,
html.dark-mode .history-panel,
html.dark-mode .assignments-panel {
  background: #0a0a0a;
  box-shadow: none;
  border: 1px solid #0a0a0a;
}

html.dark-mode .request-card,
html.dark-mode .history-item,
html.dark-mode .assignment-card {
  border-color: #0a0a0a;
  background: #0a0a0a;
}

html.dark-mode .assignment-card .force-release {
  background: rgba(154, 52, 18, 0.85);
  color: #fff7ed;
}

html.dark-mode .badge {
  background: #111111;
  color: #d1d5db;
}

html.dark-mode .empty-message {
  background: #111111;
  border-color: #0a0a0a;
  color: #ffffff;
}

html.dark-mode .requests-panel header h2,
html.dark-mode .history-header h2,
html.dark-mode .history-title {
  color: #ffffff;
}

html.dark-mode .requests-panel header p,
html.dark-mode .request-card .meta,
html.dark-mode .assignment-card .meta,
html.dark-mode .assignment-card .meta.small,
html.dark-mode .history-item .meta,
html.dark-mode .history-header p {
  color: #e5e7eb;
}

html.dark-mode .toolbar-title {
  color: #e2e8f0;
}

html.dark-mode .toolbar-subtitle {
  color: #cbd5e1;
}

html.dark-mode .toolbar-actions select {
  border-color: #0a0a0a;
  background: #1f1f1f;
  color: #e2e8f0;
  color-scheme: dark;
}

/* responsive */
@media (max-width: 1200px) {
  .main-content {
    margin-left: 220px;
    padding: 1.5rem;
  }

  .content-section {
    gap: 1.4rem;
  }

  .map-grid {
    grid-template-columns: 1fr;
    gap: 1.4rem;
  }

  .requests-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
    padding: 1rem;
  }

  .section-header h1 {
    font-size: 1.55rem;
  }

  .section-subtitle {
    font-size: 0.9rem;
  }

  .map-wrapper,
  .requests-panel,
  .history-panel,
  .assignments-panel {
    padding: 1rem;
    border-radius: 12px;
  }

  .map-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
    padding: 0.25rem 0.1rem 0.75rem;
  }

  .toolbar-actions,
  .toolbar-actions select {
    width: 100%;
  }

  .toolbar-actions select {
    min-width: 0;
  }

  .map-wrapper #map {
    height: 420px;
  }

  .request-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .request-card .actions {
    flex-direction: column;
    gap: 0.45rem;
  }

  .request-card button {
    width: 100%;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .assignment-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .assignment-card .force-release {
    width: 100%;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }

  .map-wrapper #map {
    height: 360px;
  }

  .badge,
  .status-pill {
    font-size: 0.76rem;
  }

  .meta {
    font-size: 0.84rem;
    word-break: break-word;
  }
}
</style>
