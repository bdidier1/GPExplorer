<template>
  <div class="provider-container">
    <ProviderSidebar />
    
    <main class="main-content">
      <div class="provider-home">
        <section class="hero">
          <div>
            <p class="eyebrow">{{ t('provider_dashboard.location.eyebrow') }}</p>
            <h1>{{ t('provider_dashboard.location.title') }}</h1>
            <p class="subtitle">
              {{ t('provider_dashboard.location.subtitle') }}
            </p>
          </div>
          <div class="hero-card">
            <p class="label">{{ t('provider_dashboard.location.status_label') }}</p>
            <p class="value" v-if="currentAssignment">{{ t('provider_dashboard.location.installed_at', { label: currentAssignment.label }) }}</p>
            <p class="value" v-else>{{ t('provider_dashboard.location.waiting_installation') }}</p>
          </div>
        </section>

        <section class="map-panel">
          <div class="map-column">
            <CircuitMap
              :interactive="true"
              :provider-id="providerMeta?.id || null"
              @spot-selected="handleSpotSelection"
            />
          </div>
          <aside class="side-panel">
            <h2>{{ t('provider_dashboard.location.manage_title') }}</h2>

            <div class="panel-card" v-if="currentAssignment">
              <p class="card-label">{{ t('provider_dashboard.location.occupied_label') }}</p>
              <p class="card-value">{{ currentAssignment.label }}</p>
              <p class="muted">{{ t('provider_dashboard.location.public_maps_notice') }}</p>
            </div>
            <div class="panel-card empty" v-else>
              <p class="card-label">{{ t('provider_dashboard.location.no_reservation') }}</p>
              <p class="muted">{{ t('provider_dashboard.location.click_to_start') }}</p>
            </div>

            <div class="panel-card" v-if="selectedSpot && (!selectedSpot.occupant || selectedSpot.occupant.providerId === providerMeta?.id)">
              <p class="card-label">{{ t('provider_dashboard.location.selected_label') }}</p>
              <p class="card-value">{{ selectedSpot.label }}</p>
              <p class="muted">{{ t('provider_dashboard.location.submit_notice') }}</p>
            </div>

            <div class="panel-card info" v-if="pendingRequest">
              <p class="card-label">{{ t('provider_dashboard.location.pending_request') }}</p>
              <p class="card-value">{{ pendingRequest.spotLabel }}</p>
              <p class="muted">{{ t('provider_dashboard.location.submitted_on', { date: formatDate(pendingRequest.requestedAt) }) }}</p>
            </div>

            <div class="panel-card warning" v-else-if="latestRequest && latestRequest.status === 'rejected'">
              <p class="card-label">{{ t('provider_dashboard.location.rejected_request') }}</p>
              <p class="card-value">{{ latestRequest.spotLabel }}</p>
              <p class="muted">{{ t('provider_dashboard.location.reason', { reason: latestRequest.decisionReason || t('provider_dashboard.location.no_reason_provided') }) }}</p>
            </div>

            <div class="actions">
              <button
                class="primary"
                :disabled="!canSubmitRequest"
                @click="submitSpotRequest"
              >
                {{ requestButtonLabel }}
              </button>
              <button
                class="ghost"
                :disabled="!currentAssignment"
                @click="releaseSpot"
              >
                {{ t('provider_dashboard.location.release_btn') }}
              </button>
            </div>

            <p v-if="feedback.message" :class="['feedback', feedback.type]">
              {{ feedback.message }}
            </p>
          </aside>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import CircuitMap from '@/components/CircuitMap.vue'
import ProviderSidebar from '@/components/Provider/ProviderSidebar.vue'
import { useAuthStore } from '@/stores/login.js'
import { useProvidersStore } from '@/stores/providers.js'
import { useMapStore } from '@/stores/map.js'
import { useMapRequestsStore } from '@/stores/mapRequests.js'
import { useI18n } from '@/composables/useI18n.js'

const { t } = useI18n()
const authStore = useAuthStore()
const providersStore = useProvidersStore()
const mapStore = useMapStore()
const mapRequestsStore = useMapRequestsStore()

const latestRequest = ref(null)
async function refreshLatestRequest() {
  latestRequest.value = await mapRequestsStore.getLatestRequestForProvider()
}

const selectedSpot = ref(null)
const feedback = ref({ type: '', message: '' })

const providerRecord = computed(() => {
  const username = authStore.user?.username
  if (!username) return null
  return providersStore.getProviderByUsername(username)
})

const providerMeta = computed(() => {
  if (!authStore.user || authStore.user.role !== 'provider') return null
  if (!providerRecord.value) return null
  return {
    id: providerRecord.value.id,
    username: authStore.user.username,
    companyName: providerRecord.value.companyName || providerRecord.value.username,
    contactPerson: providerRecord.value.contactPerson
  }
})

const currentAssignment = computed(() => {
  if (!providerMeta.value) return null
  return mapStore.getSpotForProvider(providerMeta.value.id)
})

// latestrequest est chargé via refreshlatestrequest au montage

const pendingRequest = computed(() => {
  if (!latestRequest.value) return null
  return latestRequest.value.status === 'pending' ? latestRequest.value : null
})

const canSubmitRequest = computed(() => {
  if (!selectedSpot.value || !providerMeta.value) return false
  if (selectedSpot.value.occupant && selectedSpot.value.occupant.providerId !== providerMeta.value.id) {
    return false
  }
  if (currentAssignment.value && currentAssignment.value.id === selectedSpot.value.id) {
    return false
  }
  if (pendingRequest.value && pendingRequest.value.spotId === selectedSpot.value.id) {
    return false
  }
  return true
})

const requestButtonLabel = computed(() => (pendingRequest.value ? t('provider_dashboard.location.update_btn') : t('provider_dashboard.location.submit_btn')))

function formatDate(isoString) {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleString('fr-FR')
  } catch (error) {
    console.warn('Date invalide pour affichage:', error)
    return isoString
  }
}

function handleSpotSelection(spot) {
  selectedSpot.value = spot
  feedback.value = { type: '', message: '' }
}

async function submitSpotRequest() {
  if (!canSubmitRequest.value || !selectedSpot.value || !providerMeta.value) return
  const result = await mapRequestsStore.submitRequest(providerMeta.value, selectedSpot.value)
  feedback.value = {
    type: result.success ? 'success' : 'error',
    message: result.success ? t('provider_dashboard.location.request_success') : (result.message || t('provider_dashboard.location.request_error'))
  }
  if (result.success) await refreshLatestRequest()
}

async function releaseSpot() {
  if (!providerMeta.value) return
  const result = await mapStore.releaseProvider(providerMeta.value.id)
  feedback.value = {
    type: result.success ? 'success' : 'error',
    message: result.success ? t('provider_dashboard.location.release_success') : (result.message || t('provider_dashboard.location.release_error'))
  }
  if (result.success) {
    selectedSpot.value = null
  }
}

onMounted(() => {
  refreshLatestRequest()
})
</script>

<style scoped>
.provider-container {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding-top: 72px;
}

.provider-home {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  color: #4caf50;
  margin-bottom: 0.25rem;
}

.hero h1 {
  font-size: 2.2rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  max-width: 600px;
  color: #4a4a4a;
}

.hero-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  min-width: 250px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.hero-card .label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #888;
}

.hero-card .value {
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
}

.map-panel {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.side-panel {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.side-panel h2 {
  margin: 0;
}

.panel-card {
  border: 1px solid #e3e3e3;
  border-radius: 12px;
  padding: 1rem;
  background: #fafafa;
}

.panel-card.empty {
  border-style: dashed;
  color: #888;
}

.panel-card.info {
  border-color: #90caf9;
  background: #e3f2fd;
}

.panel-card.warning {
  border-color: #ffb74d;
  background: #fff3e0;
}

.card-label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  margin: 0 0 0.25rem;
  color: #777;
}

.card-value {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
}

.muted {
  font-size: 0.9rem;
  color: #888;
  margin: 0.25rem 0 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

button {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.primary {
  background: #be123c;
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(190, 18, 60, 0.35);
}

button.primary:not(:disabled):hover {
  background: #9f1239;
  transform: translateY(-2px);
}

button.ghost {
  background: transparent;
  border: 1px solid #888;
  color: #333;
}

button.ghost:not(:disabled):hover {
  border-color: #4caf50;
  color: #4caf50;
}

.feedback {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
}

.feedback.success {
  background: #1b5e20;
  color: #ffffff;
}

.feedback.error {
  background: #8b1f1f;
  color: #ffffff;
}

@media (max-width: 1200px) {
  .map-panel {
    grid-template-columns: 1fr;
  }

  .side-panel {
    order: -1;
  }
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 220px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
  }

  .provider-home {
    padding: 1rem;
  }

  .hero-card {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .hero h1 {
    font-size: 1.9rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .map-panel {
    grid-template-columns: 1fr;
  }

  .side-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .provider-home {
    padding: 1rem 1.25rem;
  }

  .map-panel {
    gap: 1.25rem;
  }

  .actions {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}

@media (max-width: 540px) {
  .main-content {
    padding-top: 82px;
  }

  .hero h1 {
    font-size: 1.6rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .hero {
    gap: 1rem;
  }

  .hero-card {
    padding: 1.1rem;
  }

  .side-panel {
    padding: 1.1rem;
  }
}

html.dark-mode .provider-container {
  background: #111;
}

html.dark-mode .provider-home {
  background: #111;
}

html.dark-mode .side-panel,
html.dark-mode .hero-card,
html.dark-mode .panel-card {
  background: #1c1c1c;
  border-color: #2a2a2a;
  color: #f0f0f0;
}

html.dark-mode .panel-card.info {
  background: #102a43;
  border-color: #1f3b57;
}

html.dark-mode .panel-card.warning {
  background: #402a10;
  border-color: #5c3b16;
}

html.dark-mode .subtitle,
html.dark-mode .muted {
  color: #bbb;
}

html.dark-mode button.ghost {
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
}
</style>
