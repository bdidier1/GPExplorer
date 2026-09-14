<template>
  <div class="ticket-catalogue">
    <div class="ticket-inner">
      <div class="header-bar">
        <h2>{{ t('ticketing.title') }}</h2>
        <div v-if="cart.isActiveHold" class="countdown-bar">
          <span>{{ t('ticketing.locked') }}</span>
          <strong>{{ formattedCountdown }}</strong>
        </div>
      </div>

      <div v-if="isRestrictedRole" class="restricted-banner">
        <strong>{{ t('ticketing.access_limited') }}</strong>
        <p>{{ t('ticketing.access_limited_msg') }}</p>
      </div>

      <div v-if="listingsVisible && loadError" class="error-banner">{{ loadError }}</div>

      <div v-if="grandPrixMeta" class="segment-hero" :style="{ backgroundImage: grandPrixMeta.background, borderColor: grandPrixMeta.accent }">
        <div class="hero-info">
          <span class="hero-badge">{{ grandPrixMeta.badge }}</span>
          <h1>{{ grandPrixMeta.title }}</h1>
          <p>{{ grandPrixMeta.description }}</p>
          <div class="hero-actions">
            <button class="btn-primary" @click="navigateSegment('grand_prix')">{{ t('ticketing.view_offers') }}</button>
          </div>
        </div>
        <div v-if="grandPrixMeta.heroImage" class="hero-media">
          <img :src="grandPrixMeta.heroImage" :alt="grandPrixMeta.title" loading="lazy" />
        </div>
      </div>

      <div v-if="availableSegments.length" class="segment-selector">
        <!-- Segments Grid -->
        <div class="other-segments-grid">
          <button
            v-for="segmentKey in availableSegments.filter(s => s !== 'grand_prix')"
            :key="segmentKey"
            type="button"
            class="segment-card small-segment-card"
            :class="{ active: activeSegment === segmentKey }"
            :aria-pressed="activeSegment === segmentKey"
            @click="navigateSegment(segmentKey)"
          >
            <div class="card-content">
              <span class="card-badge">{{ segmentsMeta[segmentKey]?.badge }}</span>
              <h4>{{ segmentsMeta[segmentKey]?.title }}</h4>
              <p>{{ segmentsMeta[segmentKey]?.summary }}</p>
              <div class="card-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div v-if="listingsVisible" class="filter-bar">
        <div class="filter-group">
          <label for="filter-date">{{ t('ticketing.filters.date_label') }}</label>
          <select id="filter-date" v-model="filterDate">
            <option value="">{{ t('ticketing.filters.all_dates') }}</option>
            <option v-for="d in dateOptions" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <!-- Type filter removed as requested -->
        <div class="filter-group range-group">
          <label>{{ t('ticketing.filters.price_label') }}</label>
          <div class="range-inputs">
            <input type="number" :min="minPrice" :max="maxPrice" step="1" v-model.number="priceMin" />
            <span>-</span>
            <input type="number" :min="minPrice" :max="maxPrice" step="1" v-model.number="priceMax" />
          </div>
          <small>{{ priceRange[0] }}€ - {{ priceRange[1] }}€</small>
        </div>
        <button class="btn-reset" type="button" @click="resetFilters">{{ t('ticketing.filters.reset_btn') }}</button>
      </div>

      <p v-if="!listingsVisible" class="redirect-hint">{{ t('ticketing.redirect_hint') }}</p>

      <div
        v-if="listingsVisible"
        class="tickets-container"
        ref="ticketsSectionEl"
        :class="{ 'is-loading': initialLoading }"
      >
        <transition-group
          v-if="!initialLoading && hasTicketsForActiveSegment"
          name="fade"
          tag="div"
        >
          <div v-for="category in ticketsByCategory" :key="category.name" class="category-section">
            <h3 class="category-title">{{ labelCategory(category.name) }}</h3>
            <div class="tickets-grid">
              <div v-for="ticket in category.tickets" :key="ticket.id" class="ticket-card" :class="ticket.category">
                <div class="ticket-image">
                  <img :src="getTicketImage(ticket.category, ticket.segment)" :alt="labelCategory(ticket.category)" loading="lazy" />
                </div>
                <div class="ticket-content">
                  <header>
                    <div class="header-row">
                      <div class="badge" :class="ticket.category">{{ shortCategory(ticket.category) }}</div>
                      <small class="variant">{{ labelVariant(ticket.variant) }}</small>
                    </div>
                    <h3>{{ ticket.name }}</h3>
                  </header>
                  <div class="price-stock-line">
                    <span class="price">{{ getTicketPrice(ticket) }}€</span>
                    <span class="stock-value" :class="{ low: ticket.available <= 100 && ticket.available > 0, empty: ticket.available === 0 }">
                      <template v-if="ticket.available > 0">{{ ticket.available }} {{ t('ticketing.available_short') }}</template>
                      <template v-else>{{ t('ticketing.sold_out') }}</template>
                    </span>
                  </div>
                  <div class="actions-row">
                    <button class="btn-add" :disabled="ticket.available === 0 || (localQty[ticket.id] >= ticket.available) || cart.isActiveHold || isRestrictedRole" @click="add(ticket)">{{ t('ticketing.add') }}</button>
                    <button
                      v-if="localQty[ticket.id]"
                      class="btn-remove"
                      :disabled="cart.isActiveHold || isRestrictedRole"
                      @click="removeOne(ticket)"
                    >
                      {{ t('ticketing.remove') }}
                    </button>
                    <div class="qty" v-if="localQty[ticket.id]">x {{ localQty[ticket.id] }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition-group>

        <div v-else-if="!initialLoading" class="empty-state">{{ t('ticketing.segment_empty') }}</div>

        <div v-if="initialLoading" class="skeleton-container">
          <div class="skeleton-grid">
            <div class="skeleton-card" v-for="n in 6" :key="n" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { useAuthStore } from '@/stores/login.js'
import { useI18n } from '@/composables/useI18n.js'
import { getAvailableTickets } from '@/services/ticket.service.js'

const segmentOrder = ['grand_prix', 'concert', 'karting', 'playseat', 'food', 'beverage', 'decathlon', 'cashless']

const props = defineProps({
  showListings: {
    type: Boolean,
    default: true
  },
  initialSegment: {
    type: String,
    default: 'grand_prix'
  }
})

const cart = useCartStore()
const auth = useAuthStore()
const { t } = useI18n()
const listingsVisible = ref(props.showListings)
const activeSegment = ref(segmentOrder.includes(props.initialSegment) ? props.initialSegment : 'grand_prix')
const tickets = ref([])
const initialLoading = ref(listingsVisible.value)
const loadError = ref('')
const ticketsSectionEl = ref(null)
let tickInterval = null
const filterDate = ref('')
const priceRange = ref([0, 0])

// proxy computed pour garder un v-model réactif
const priceMin = computed({
  get() {
    return Array.isArray(priceRange.value) && priceRange.value.length > 0 ? priceRange.value[0] : minPrice.value
  },
  set(v) {
    const maxV = Array.isArray(priceRange.value) && priceRange.value.length > 1 ? priceRange.value[1] : maxPrice.value
    priceRange.value = [Number(v || 0), Number(maxV || 0)]
  }
})

const priceMax = computed({
  get() {
    return Array.isArray(priceRange.value) && priceRange.value.length > 1 ? priceRange.value[1] : maxPrice.value
  },
  set(v) {
    const minV = Array.isArray(priceRange.value) && priceRange.value.length > 0 ? priceRange.value[0] : minPrice.value
    priceRange.value = [Number(minV || 0), Number(v || 0)]
  }
})

const segmentsMeta = computed(() => {
  return {
    grand_prix: {
      key: 'grand_prix',
      title: t('ticketing.segments.grand_prix.title'),
      description: t('ticketing.segments.grand_prix.description'),
      badge: t('ticketing.segments.grand_prix.badge'),
      summary: t('ticketing.segments.grand_prix.summary'),
      background: "linear-gradient(120deg, rgba(10,10,10,0.9), rgba(46,10,70,0.88)), url('/img/billet-gp.jpg')",
      accent: '#E72D55',
      heroImage: '/img/billet-gp.jpg',
      categoryOrder: ['general', 'tribune', 'vip']
    },
    concert: {
      key: 'concert',
      title: t('ticketing.segments.concert.title'),
      description: t('ticketing.segments.concert.description'),
      badge: t('ticketing.segments.concert.badge'),
      summary: t('ticketing.segments.concert.summary'),
      background: "linear-gradient(120deg, rgba(60,20,0,0.9), rgba(10,10,10,0.82)), url('/img/billet-tribune.jpg')",
      accent: '#ff7a00',
      heroImage: '/img/billet-tribune.jpg',
      categoryOrder: ['general', 'tribune', 'vip']
    },
    karting: {
      key: 'karting',
      title: t('ticketing.segments.karting.title'),
      description: t('ticketing.segments.karting.description'),
      badge: t('ticketing.segments.karting.badge'),
      summary: t('ticketing.segments.karting.summary'),
      background: "linear-gradient(120deg, rgba(5,57,94,0.92), rgba(10,10,10,0.82)), url('/img/billet-sodikart.jpg')",
      accent: '#3ddcff',
      heroImage: '/img/billet-sodikart.jpg',
      categoryOrder: ['karting']
    },
    playseat: {
      key: 'playseat',
      title: t('ticketing.segments.playseat.title'),
      description: t('ticketing.segments.playseat.description'),
      badge: t('ticketing.segments.playseat.badge'),
      summary: t('ticketing.segments.playseat.summary'),
      background: "linear-gradient(120deg, rgba(7,16,45,0.94), rgba(3,3,3,0.86)), url('/img/billet-playseat.jpg')",
      accent: '#7c5dff',
      heroImage: '/img/billet-playseat.jpg',
      categoryOrder: ['simulation']
    },
    food: {
      key: 'food',
      title: t('ticketing.segments.food.title'),
      description: t('ticketing.segments.food.description'),
      badge: t('ticketing.segments.food.badge'),
      summary: t('ticketing.segments.food.summary'),
      background: "linear-gradient(120deg, rgba(67,15,7,0.9), rgba(10,10,10,0.85)), url('/img/billet-burgouzz.jpg')",
      accent: '#ffb347',
      heroImage: '/img/billet-burgouzz.jpg',
      categoryOrder: ['burger']
    },
    beverage: {
      key: 'beverage',
      title: t('ticketing.segments.beverage.title'),
      description: t('ticketing.segments.beverage.description'),
      badge: t('ticketing.segments.beverage.badge'),
      summary: t('ticketing.segments.beverage.summary'),
      background: "linear-gradient(120deg, rgba(16,66,36,0.92), rgba(0,0,0,0.8)), url('/img/billet-ciao.jpg')",
      accent: '#7dd56f',
      heroImage: '/img/billet-ciao.jpg',
      categoryOrder: ['drink']
    },
    decathlon: {
      key: 'decathlon',
      title: t('ticketing.segments.decathlon.title'),
      description: t('ticketing.segments.decathlon.description'),
      badge: t('ticketing.segments.decathlon.badge'),
      summary: t('ticketing.segments.decathlon.summary'),
      background: "linear-gradient(120deg, rgba(13,62,94,0.92), rgba(0,0,0,0.82)), url('/img/billet-decathlon.jpg')",
      accent: '#4cc9f0',
      heroImage: '/img/billet-decathlon.jpg',
      categoryOrder: ['rental']
    },
    cashless: {
      key: 'cashless',
      title: t('ticketing.segments.cashless.title'),
      description: t('ticketing.segments.cashless.description'),
      badge: t('ticketing.segments.cashless.badge'),
      summary: t('ticketing.segments.cashless.summary'),
      background: "linear-gradient(120deg, rgba(3,52,60,0.92), rgba(5,5,5,0.85)), url('/img/billet-entree.jpg')",
      accent: '#00c7b7',
      heroImage: '/img/billet-entree.jpg',
      categoryOrder: ['cashless']
    }
  }
})

// formate le temps restant du countdown
const formattedCountdown = computed(() => {
  const remainingSeconds = cart.remainingSeconds || 0
  
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})



const grandPrixMeta = computed(() => segmentsMeta.value.grand_prix)

const ticketVisuals = {
  general: '/img/billet-entree.jpg',
  tribune: '/img/billet-tribune.jpg',
  vip: '/img/billet-vip.jpg',
  karting: '/img/billet-sodikart.jpg',
  simulation: '/img/billet-playseat.jpg',
  burger: '/img/billet-burgouzz.jpg',
  drink: '/img/billet-ciao.jpg',
  rental: '/img/billet-decathlon.jpg',
  cashless: '/img/billet-entree.jpg'
}

const segmentVisualFallback = {
  grand_prix: '/img/billet-gp.jpg',
  concert: '/img/billet-tribune.jpg',
  karting: '/img/billet-sodikart.jpg',
  playseat: '/img/billet-playseat.jpg',
  food: '/img/billet-burgouzz.jpg',
  beverage: '/img/billet-ciao.jpg',
  decathlon: '/img/billet-decathlon.jpg',
  cashless: '/img/billet-entree.jpg'
}

const availableSegments = computed(() => {
  if (tickets.value.length) {
    const present = new Set(tickets.value.map(ticket => ticket.segment || 'grand_prix'))
    return segmentOrder.filter(key => present.has(key))
  }
  return segmentOrder.slice()
})

const segmentTickets = computed(() =>
  tickets.value.filter(ticket => (ticket.segment || 'grand_prix') === activeSegment.value)
)

const minPrice = computed(() => {
  if (!segmentTickets.value.length) return 0
  return Math.min(...segmentTickets.value.map(t => t.price || 0))
})

const maxPrice = computed(() => {
  if (!segmentTickets.value.length) return 0
  return Math.max(...segmentTickets.value.map(t => t.price || 0))
})

watch([segmentTickets, () => activeSegment.value], () => {
  priceRange.value = [minPrice.value, maxPrice.value]
  filterDate.value = ''
}, { immediate: true })

const localQty = computed(() => {
  const map = {}
  for (const item of cart.items) {
    map[item.ticketId] = item.quantity
  }
  return map
})

const dateOptions = computed(() => {
  const dates = new Set()
  for (const t of segmentTickets.value) {
    if (t.date) dates.add(t.date)
  }
  return Array.from(dates).sort()
})

const displayedTickets = computed(() => {
  return segmentTickets.value.filter(t => {
    const matchDate = filterDate.value ? t.date === filterDate.value : true
    const matchPrice = priceRange.value.length === 2 ? (t.price || 0) >= priceRange.value[0] && (t.price || 0) <= priceRange.value[1] : true
    return matchDate && matchPrice
  })
})

const ticketsByCategory = computed(() => {
  const categories = {}

  for (const ticket of displayedTickets.value) {
    if (!categories[ticket.category]) {
      categories[ticket.category] = []
    }
    categories[ticket.category].push(ticket)
  }

  const preferredOrder = segmentsMeta.value[activeSegment.value]?.categoryOrder || []
  const fallback = Object.keys(categories)
  const order = preferredOrder.length
    ? [...preferredOrder, ...fallback.filter(name => !preferredOrder.includes(name))]
    : fallback

  return order
    .filter(cat => categories[cat] && categories[cat].length > 0)
    .map(cat => ({
      name: cat,
      tickets: categories[cat]
    }))
})

const hasTicketsForActiveSegment = computed(() => displayedTickets.value.length > 0)

watch(availableSegments, (segments) => {
  if (!segments.length) {
    activeSegment.value = 'grand_prix'
    return
  }
  if (!segments.includes(activeSegment.value)) {
    activeSegment.value = segments[0]
  }
}, { immediate: true })

watch(() => props.initialSegment, (segment) => {
  if (segmentOrder.includes(segment)) {
    activeSegment.value = segment
  }
})

watch(() => props.showListings, (val) => {
  listingsVisible.value = val
  if (val && tickets.value.length === 0) {
    initialLoading.value = true
    loadTickets()
  }
  if (!val) {
    initialLoading.value = false
  }
})

const restrictedRoles = ['organizer', 'provider']
const isRestrictedRole = computed(() => {
  if (!auth.isAuthenticated || !auth.user?.role) return false
  return restrictedRoles.includes(auth.user.role)
})

function labelCategory(c) {
  return t(`ticketing.categories.${c}`) !== `ticketing.categories.${c}` 
    ? t(`ticketing.categories.${c}`) 
    : c
}

function labelVariant(v) {
  return t(`ticketing.variants.${v}`) !== `ticketing.variants.${v}`
    ? t(`ticketing.variants.${v}`)
    : v
}

function shortCategory(c) {
  switch (c) {
    case 'general': return t('ticketing.short_categories.general')
    case 'tribune': return t('ticketing.short_categories.tribune')
    case 'vip': return t('ticketing.short_categories.vip')
    case 'karting': return t('ticketing.short_categories.karting')
    case 'simulation': return t('ticketing.short_categories.simulation')
    case 'drink': return t('ticketing.short_categories.drink')
    case 'burger': return t('ticketing.short_categories.burger')
    case 'rental': return t('ticketing.short_categories.rental')
    case 'cashless': return t('ticketing.short_categories.cashless')
    default: return c.toUpperCase()
  }
}

function previewSegment(segmentKey) {
  if (segmentKey) {
    activeSegment.value = segmentKey
  }
}

function navigateSegment(segmentKey) {
  previewSegment(segmentKey)
  revealTicketsSection()
  scrollToTickets()
}

function revealTicketsSection() {
  if (!listingsVisible.value) {
    listingsVisible.value = true
  }

  if (!tickets.value.length) {
    initialLoading.value = true
    loadTickets()
  }
}

function scrollToTickets() {
  nextTick(() => {
    if (ticketsSectionEl.value) {
      ticketsSectionEl.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function getTicketImage(category, segment = 'grand_prix') {
  // priorité à l'image du segment
  if (segment && segmentVisualFallback[segment]) {
    return segmentVisualFallback[segment]
  }

  // sinon on prend l'image de catégorie
  if (category && ticketVisuals[category]) {
    return ticketVisuals[category]
  }

  // fallback final
  return '/img/billet-entree.jpg'
}

function getTicketPrice(ticket) {
  return ticket.price
}

function resetFilters() {
  filterDate.value = ''
  priceRange.value = [minPrice.value, maxPrice.value]
}

// garde un intervalle de prix cohérent
watch(priceRange, (newVal) => {
  if (!Array.isArray(newVal) || newVal.length < 2) return
  let [minV, maxV] = newVal
  const absMin = minPrice.value || 0
  const absMax = maxPrice.value || 0
  if (minV == null) minV = absMin
  if (maxV == null) maxV = absMax
  if (minV < absMin) minV = absMin
  if (maxV > absMax) maxV = absMax
  if (minV > maxV) {
    maxV = minV
  }
  if (minV !== priceRange.value[0] || maxV !== priceRange.value[1]) {
    priceRange.value = [minV, maxV]
  }
}, { deep: true })

async function loadTickets() {
  if (!listingsVisible.value) return
  const refreshing = !initialLoading.value

  try {
    await new Promise(resolve => setTimeout(resolve, refreshing ? 200 : 400))
    
    const result = await getAvailableTickets()
    tickets.value = (Array.isArray(result) ? result : (result.data || [])).map(t => ({ ...t }))
    loadError.value = ''
    initialLoading.value = false
  } catch (error) {
    console.warn('[Billetterie] Erreur chargement tickets', error)
    loadError.value = 'Impossible de charger la billetterie'
    initialLoading.value = false
  }

}

function add(t) {
  if (isRestrictedRole.value) return
  cart.addItem(t)
}

function removeOne(t) {
  if (isRestrictedRole.value) return
  cart.decrementItem(t.id)
}

watch(() => cart.needsRefresh, () => {
  if (listingsVisible.value) {
    loadTickets()
  }
})

onMounted(() => {
  if (listingsVisible.value) {
    loadTickets()
  }
  tickInterval = setInterval(() => {
    cart.checkExpiration()
  }, 1000)
})

onUnmounted(() => {
  if (tickInterval) {
    clearInterval(tickInterval)
    tickInterval = null
  }
})
</script>

<style scoped>
.ticket-catalogue {
  background: linear-gradient(135deg, var(--surface-gradient-start), var(--surface-gradient-end));
    /* full bleed sans scroll horizontal */
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  width: 100vw;
    overflow-x: hidden; /* évite le scroll horizontal */
}

html.dark-mode .ticket-catalogue {
  background: var(--surface-gradient-start);
}

.ticket-inner {
  min-height: 100vh;
  padding: 6rem 2rem 3rem;
  color: var(--text-strong);
  max-width: 1200px;
  margin: 0 auto;
}

.segment-hero {
  margin: 2rem 0 1.5rem;
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(231, 45, 85, 0.2);
  display: flex;
  align-items: center;
  gap: 2.5rem;
  color: #ffffff;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-blend-mode: overlay;
}

.hero-info {
  flex: 1;
}

.hero-badge {
  display: inline-flex;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.segment-hero h1 {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.segment-hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

.hero-actions {
  margin-top: 1.25rem;
}

.btn-primary {
  border: none;
  background: var(--accent-gradient);
  color: #ffffff;
  font-weight: 700;
  padding: 0.7rem 1.6rem;
  border-radius: 999px;
  cursor: pointer;
  letter-spacing: 0.05em;
  box-shadow: 0 10px 25px rgba(231, 45, 85, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(231, 45, 85, 0.5);
}

.hero-media img {
  width: 220px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
}

/* masque la vignette du hero */
.hero-media {
  display: none;
}

.segment-selector {
  margin-bottom: 2rem;
}

.filter-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-group label {
  font-weight: 600;
  font-size: 0.9rem;
}

.filter-group select,
.filter-group input[type='number'] {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  color: var(--control-text);
}

.filter-group select {
  -webkit-appearance: none;
  appearance: none;
  background: var(--surface-card);
  border: 1px solid var(--control-border);
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  color: var(--text-strong);
}

/* force les couleurs d'options quand le navigateur le permet */
.filter-group option {
  background: var(--surface-card) !important;
  color: var(--text-strong) !important;
}

.range-group .range-inputs {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.range-group input[type='number'] {
  width: 100%;
}

.btn-reset {
  align-self: center;
  justify-self: center;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: var(--text-strong);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  border-color: var(--border-accent);
}

.other-segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.small-segment-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 140px;
}

.small-segment-card .card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.small-segment-card .card-badge {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin-bottom: 0.5rem;
}

.small-segment-card h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1.3;
}

.small-segment-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.4;
  flex: 1;
}

.small-segment-card .card-arrow {
  color: var(--text-soft);
  align-self: flex-end;
  margin-top: 1rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.small-segment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-hover);
  border-color: var(--border-accent);
}

.small-segment-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.small-segment-card.active {
  border-color: var(--border-accent);
  background: var(--surface-active);
}

html.dark-mode .small-segment-card {
  background: #111111;
  border-color: rgba(255, 255, 255, 0.12);
}

html.dark-mode .small-segment-card:hover {
  border-color: var(--border-accent);
}

.redirect-hint {
  margin: 0 auto 2rem;
  max-width: 520px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* responsive */
@media (max-width: 768px) {
  .other-segments-grid {
    grid-template-columns: 1fr;
  }
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  color: var(--text-strong);
}

.header-bar h2 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.08em;
  color: #000000;
  text-transform: uppercase;
}

html.dark-mode .header-bar h2 {
  color: #ffffff;
}

.countdown-bar {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  background: var(--surface-chip);
  color: var(--text-strong);
  padding: 0.5rem 0.85rem;
  border-radius: 12px;
  border: 1px solid var(--border-accent);
  font-weight: 600;
}

.countdown-bar strong {
  color: var(--text-strong);
}

.restricted-banner {
  background: rgba(231, 45, 85, 0.1);
  border: 1px solid rgba(231, 45, 85, 0.4);
  color: #E72D55;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.restricted-banner strong {
  display: block;
  font-size: 1rem;
  letter-spacing: 0.05em;
}

.restricted-banner p {
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  color: inherit;
}

.tickets-container {
  position: relative;
}

.tickets-container.is-loading {
  opacity: 0.6;
}

.category-section {
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
}

.category-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #E72D55;
  border-radius: 2px;
}

html.dark-mode .category-title {
  color: #ffffff;
}

.tickets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  width: 100%;
  max-width: 1000px;
}

.tickets-grid .ticket-card {
  flex: 0 0 auto;
  width: 300px;
}

.ticket-card {
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  background: var(--surface-card);
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px var(--card-shadow);
  backdrop-filter: blur(6px);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
}

html.dark-mode .ticket-card {
  background: #1a1a1a;
  border-color: rgba(255, 255, 255, 0.1);
}

.ticket-card:hover {
  transform: translateY(-6px);
  border-color: var(--border-accent);
  box-shadow: 0 18px 34px var(--accent-shadow);
}

.ticket-image {
  height: 120px;
  overflow: hidden;
  position: relative;
}

.ticket-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ticket-card:hover .ticket-image img {
  transform: scale(1.05);
}

.ticket-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.ticket-card header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}

.ticket-card header .header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}

.ticket-card header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-strong);
  line-height: 1.3;
  height: 2.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: rgba(231, 45, 85, 0.15);
  color: var(--text-strong);
  font-weight: 700;
  border: 1px solid rgba(231, 45, 85, 0.4);
}

.badge.general {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.3);
  color: #000000;
}

.badge.tribune {
  background: rgba(231, 45, 85, 0.15);
  border-color: rgba(231, 45, 85, 0.4);
  color: #E72D55;
}

.badge.vip {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(0, 0, 0, 1);
  color: #ffffff;
}

.variant {
  color: var(--text-soft);
  font-size: 0.85rem;
  font-weight: 600;
}

.price-stock-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.price {
  font-size: 1.4rem;
  font-weight: 900;
  color: #E72D55;
}

.stock-value.low {
  color: #E72D55;
  font-weight: 700;
}

.stock-value.empty {
  color: #000000;
  font-weight: 700;
}

.actions-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}

.btn-add {
  background: var(--accent-gradient);
  color: #fff;
  border: none;
  padding: 0.55rem 0.95rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.03em;
  box-shadow: 0 8px 20px var(--accent-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px var(--accent-shadow);
  filter: brightness(1.05);
}

.btn-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-remove {
  background: var(--control-bg);
  color: var(--control-text);
  border: 1px solid var(--control-border);
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-remove:hover:not(:disabled) {
  background: var(--surface-muted);
  border-color: var(--border-accent);
}

.btn-remove:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.qty {
  color: var(--text-strong);
  font-weight: 700;
  min-width: 48px;
  text-align: center;
}

.skeleton-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.skeleton-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  max-width: 1000px;
}

.skeleton-card {
  height: 320px;
  width: 300px;
  background: linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-mid) 37%, var(--skeleton-start) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 12px;
  flex: 0 0 auto;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.error-banner {
  background: var(--warning-bg);
  color: var(--warning-text);
  padding: 0.85rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  border: 1px solid var(--warning-border);
}

.empty-state {
  padding: 1rem;
  color: var(--text-soft);
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .segment-hero {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .hero-info {
    width: 100%;
  }

  .hero-actions {
    display: flex;
    justify-content: center;
  }

  .segment-selector {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .tickets-grid .ticket-card {
    width: 280px;
  }
  
  .skeleton-card {
    width: 280px;
  }
  
  .ticket-card header h3 {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .tickets-grid .ticket-card {
    width: 100%;
    max-width: 320px;
  }
  
  .skeleton-card {
    width: 100%;
    max-width: 320px;
  }
}

</style>
