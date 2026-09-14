<template>
  <div class="ticket-segment-view">
    <div class="segment-header">
      <button class="back-btn" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        {{ tr.backToHub }}
      </button>
      
      <div class="segment-info">
        <h1>{{ segmentMeta?.title || tr.defaultTitle }}</h1>
        <p>{{ segmentMeta?.description || tr.defaultDescription }}</p>
      </div>
    </div>

    <div class="filter-bar" v-if="tickets.length">
      <div class="filter-group">
        <label for="filter-date">{{ t('ticket_segment.filter_date') }}</label>
        <select id="filter-date" v-model="filterDate">
          <option value="">{{ t('ticket_segment.filter_all') }}</option>
          <option v-for="d in dateOptions" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>

      <!-- Type filter removed as requested -->

      <div class="filter-group range-group">
        <label for="filter-price-min">{{ t('ticket_segment.filter_price') }}</label>
        <div class="range-inputs">
          <input id="filter-price-min" type="number" :min="minPrice" :max="maxPrice" step="1" v-model.number="priceMin" />
          <span>-</span>
          <input id="filter-price-max" type="number" :min="minPrice" :max="maxPrice" step="1" v-model.number="priceMax" />
        </div>
        <small>{{ priceRange[0] }}€ - {{ priceRange[1] }}€</small>
      </div>

      <button class="btn-reset" type="button" @click="resetFilters">{{ t('ticket_segment.filter_reset') }}</button>
    </div>

    <div v-if="loadError" class="error-banner">{{ loadError }}</div>

    <div v-if="!initialLoading && tickets.length === 0" class="empty-state">
      {{ tr.empty }}
    </div>

    <div
      class="tickets-container"
      :class="{ 'is-loading': initialLoading }"
    >
      <transition-group
        v-if="!initialLoading && hasTicketsForSegment"
        name="fade"
        tag="div"
      >
        <div v-for="category in ticketsByCategory" :key="category.name" class="category-section">
          <h3 class="category-title">{{ labelCategory(category.name) }}</h3>
          <div class="tickets-grid">
            <div v-for="t in category.tickets" :key="t.id" class="ticket-card" :class="t.category">
              <div class="ticket-image">
                <img :src="getTicketImage(t.category, t.segment)" :alt="labelCategory(t.category)" />
              </div>
              <div class="ticket-content">
                <header>
                  <div class="header-row">
                    <div class="badge" :class="t.category">{{ shortCategory(t.category) }}</div>
                    <small class="variant">{{ labelVariant(t.variant) }}</small>
                  </div>
                  <h3>{{ t.name }}</h3>
                </header>
                <div class="price-stock-line">
                  <span class="price">{{ t.price }}€</span>
                  <span class="stock-value" :class="{ low: t.available <= 100 && t.available > 0, empty: t.available === 0 }">
                    <template v-if="t.available > 0">{{ t.available }} {{ tr.available }}</template>
                    <template v-else>{{ tr.soldOut }}</template>
                  </span>
                </div>
                <div class="actions-row">
                  <button class="btn-add" :disabled="t.available === 0 || (localQty[t.id] >= t.available) || cart.isActiveHold || isRestrictedRole" @click="add(t)">{{ tr.add }}</button>
                  <button
                    v-if="localQty[t.id]"
                    class="btn-remove"
                    :disabled="cart.isActiveHold || isRestrictedRole"
                    @click="removeOne(t)"
                  >
                    {{ tr.remove }}
                  </button>
                  <div class="qty" v-if="localQty[t.id]">x {{ localQty[t.id] }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <div v-else-if="!initialLoading" class="empty-state">{{ tr.segmentEmpty }}</div>

      <div v-if="initialLoading" class="skeleton-container">
        <div class="skeleton-grid">
          <div class="skeleton-card" v-for="n in 6" :key="n" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'
import { useAuthStore } from '@/stores/login.js'
import { useLanguage } from '@/composables/useLanguage.js'
import { useI18n } from '@/composables/useI18n.js'
import { getAvailableTickets } from '@/services/ticket.service.js'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const { currentLanguage } = useLanguage()
const { t } = useI18n()

const tickets = ref([])
const initialLoading = ref(true)
const loadError = ref('')
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

const props = defineProps({
  segment: {
    type: String,
    required: true
  }
})

const allowedSegments = new Set(['grand_prix', 'concert', 'karting', 'playseat', 'food', 'beverage', 'decathlon', 'cashless'])
const segmentKey = computed(() => allowedSegments.has(props.segment) ? props.segment : 'grand_prix')

const translations = {
  fr: {
    backToHub: 'Retour à la billetterie',
    defaultTitle: 'Billetterie',
    defaultDescription: 'Découvrez nos offres de billets',
    locked: 'Réservation verrouillée :',
    accessLimited: 'Accès limité',
    accessLimitedMsg: 'Les comptes administrateur et prestataire ne peuvent pas réserver de billets.',
    empty: 'Aucun billet disponible pour le moment.',
    add: 'Ajouter',
    remove: 'Retirer',
    available: 'dispo',
    soldOut: 'Complet',
    segmentEmpty: 'Aucun billet n\'est disponible pour cette catégorie.',
    categories: {
      general: 'Accès Festival',
      tribune: 'Placement Tribune',
      vip: 'VIP',
      karting: 'Sessions Karting',
      simulation: 'Simulation Playseat',
      drink: 'Bar & Boissons',
      burger: 'Restauration Burgouzz',
      rental: 'Camping & logistique',
      cashless: 'Cashless'
    },
    variants: {
      day: 'Journée',
      weekend: 'Weekend',
      week: 'Semaine',
      event: 'Événement',
      session: 'Session',
      session_long: 'Endurance',
      family: 'Famille',
      experience: 'Expérience',
      combo: 'Combo',
      pack: 'Pack',
      location: 'Location',
      credit: 'Crédit cashless'
    },
    segments: {
      grand_prix: {
        title: 'Pass Festival 8-10 oct 2026',
        description: 'Accès journée, 2 jours ou 3 jours pour toutes les zones.',
      },
      concert: {
        title: 'Concerts en soirée',
        description: 'Pelouse, Golden Circle ou Carré Prestige selon la date.',
      },
      karting: {
        title: 'Sessions Karting',
        description: 'Chronos 12 min, endurance 40 min et format junior datés.',
      },
      playseat: {
        title: 'Simulateurs Playseat',
        description: 'Qualifs ou relais F1 chaque jour sur simulateurs officiels.',
      },
      food: {
        title: 'Menus Burgouzz',
        description: 'Menus fast track et brunch planifiés par jour.',
      },
      beverage: {
        title: 'Pass Boissons',
        description: 'Dégustations et refill 4h pour chaque journée.',
      },
      decathlon: {
        title: 'Camping & logistique',
        description: 'Kits camping, casiers journaliers et emplacements caravane.',
      },
      cashless: {
        title: 'Cashless préchargé',
        description: 'Bracelets et packs crédit valables sur tout le site.',
      }
    }
  },
  en: {
    backToHub: 'Back to ticketing',
    defaultTitle: 'Ticketing',
    defaultDescription: 'Discover our ticket offers',
    locked: 'Reservation locked:',
    accessLimited: 'Limited Access',
    accessLimitedMsg: 'Administrator and provider accounts cannot reserve tickets.',
    empty: 'No tickets available at the moment.',
    add: 'Add',
    remove: 'Remove',
    available: 'avail.',
    soldOut: 'Sold Out',
    segmentEmpty: 'No offers found for this category.',
    categories: {
      general: 'Festival Access',
      tribune: 'Grandstand / Reserved',
      vip: 'VIP',
      karting: 'Karting Sessions',
      simulation: 'Playseat Simulation',
      drink: 'Beverage Pass',
      burger: 'Burgouzz Dining',
      rental: 'Camping & logistics',
      cashless: 'Cashless'
    },
    variants: {
      day: 'Day',
      weekend: 'Weekend',
      week: 'Week',
      event: 'Event',
      session: 'Session',
      session_long: 'Endurance',
      family: 'Family',
      experience: 'Experience',
      combo: 'Combo',
      pack: 'Pack',
      location: 'Rental',
      credit: 'Cashless credit'
    },
    segments: {
      grand_prix: {
        title: 'Festival Passes Oct 8-10, 2026',
        description: 'Day, 2-day or 3-day access to all stages and activities.',
      },
      concert: {
        title: 'Evening Concerts',
        description: 'Lawn, Golden Circle or Prestige seats for each date.',
      },
      karting: {
        title: 'Karting Track Sessions',
        description: 'Timed 12-min runs, 40-min endurance and junior discovery.',
      },
      playseat: {
        title: 'Playseat Sim Experiences',
        description: 'Qualifying attempts or 60-min relay each day on official rigs.',
      },
      food: {
        title: 'Burgouzz Dining',
        description: 'Fast-track menus and brunch slots on each day.',
      },
      beverage: {
        title: 'Drinks & Refills',
        description: 'Tasting packs and 4h refills for every date.',
      },
      decathlon: {
        title: 'Camping & logistics',
        description: 'Camping kits, daily lockers and caravan spots.',
      },
      cashless: {
        title: 'Preloaded Cashless',
        description: 'Bracelets and credit packs usable everywhere on site.',
      }
    }
  },
  es: {
    backToHub: 'Volver a la taquilla',
    defaultTitle: 'Taquilla',
    defaultDescription: 'Descubra nuestras ofertas de entradas',
    locked: 'Reserva bloqueada:',
    accessLimited: 'Acceso Limitado',
    accessLimitedMsg: 'Las cuentas de administrador y proveedor no pueden reservar entradas.',
    empty: 'No hay entradas disponibles en este momento.',
    add: 'Añadir',
    remove: 'Quitar',
    available: 'disp.',
    soldOut: 'Agotado',
    segmentEmpty: 'No hay ofertas para esta categoría.',
    categories: {
      general: 'Acceso Festival',
      tribune: 'Tribuna / Reservado',
      vip: 'VIP',
      karting: 'Sesiones de Karting',
      simulation: 'Simulación Playseat',
      drink: 'Bebidas',
      burger: 'Restauración Burgouzz',
      rental: 'Camping y logística',
      cashless: 'Cashless'
    },
    variants: {
      day: 'Día',
      weekend: 'Fin de semana',
      week: 'Semana',
      event: 'Evento',
      session: 'Sesión',
      session_long: 'Endurance',
      family: 'Familiar',
      experience: 'Experiencia',
      combo: 'Combo',
      pack: 'Pack',
      location: 'Alquiler',
      credit: 'Crédito cashless'
    },
    segments: {
      grand_prix: {
        title: 'Pases Festival 8-10 oct 2026',
        description: 'Pases de 1, 2 o 3 días para todas las zonas.',
      },
      concert: {
        title: 'Conciertos nocturnos',
        description: 'Césped, Golden Circle o Carré Prestige según fecha.',
      },
      karting: {
        title: 'Sesiones de Karting',
        description: 'Cronos 12 min, endurance 40 min y junior por día.',
      },
      playseat: {
        title: 'Simuladores Playseat',
        description: 'Clasificatorias o relevo 60 min cada día en simuladores oficiales.',
      },
      food: {
        title: 'Burgouzz Dining',
        description: 'Menús fast track y brunch fechados para evitar esperas.',
      },
      beverage: {
        title: 'Bebidas y refill',
        description: 'Packs degustación y refill 4h cada día.',
      },
      decathlon: {
        title: 'Camping y logística',
        description: 'Kits de camping, casilleros diarios y plazas de caravana.',
      },
      cashless: {
        title: 'Cashless recargado',
        description: 'Pulseras y créditos para pagar en todo el recinto.',
      }
    }
  }
}

const tr = computed(() => translations[currentLanguage.value] || translations.fr)

const segmentMeta = computed(() => {
  return tr.value.segments[segmentKey.value] || null
})

const restrictedRoles = new Set(['organizer', 'provider'])
const isRestrictedRole = computed(() => {
  if (!auth.isAuthenticated || !auth.user?.role) return false
  return restrictedRoles.has(auth.user.role)
})

const localQty = computed(() => {
  const map = {}
  for (const item of cart.items) {
    map[item.ticketId] = item.quantity
  }
  return map
})

const displayedTickets = computed(() => 
  tickets.value
    .filter(ticket => (ticket.segment || 'grand_prix') === segmentKey.value)
    .filter(ticket => {
      const matchDate = filterDate.value ? ticket.date === filterDate.value : true
      const matchPrice = priceRange.value.length === 2 ? (ticket.price || 0) >= priceRange.value[0] && (ticket.price || 0) <= priceRange.value[1] : true
      return matchDate && matchPrice
    })
)

const ticketsByCategory = computed(() => {
  const categories = {}

  for (const ticket of displayedTickets.value) {
    if (!categories[ticket.category]) {
      categories[ticket.category] = []
    }
    categories[ticket.category].push(ticket)
  }

  return Object.keys(categories)
    .filter(cat => categories[cat] && categories[cat].length > 0)
    .map(cat => ({
      name: cat,
      tickets: categories[cat]
    }))
})

const dateOptions = computed(() => {
  const dates = new Set()
  for (const t of tickets.value) {
    if ((t.segment || 'grand_prix') !== segmentKey.value) continue
    if (t.date) dates.add(t.date)
  }
  return Array.from(dates).sort()
})

// le filtre type a été retiré

const minPrice = computed(() => {
  const prices = tickets.value.filter(t => (t.segment || 'grand_prix') === segmentKey.value).map(t => t.price || 0)
  return prices.length ? Math.min(...prices) : 0
})

const maxPrice = computed(() => {
  const prices = tickets.value.filter(t => (t.segment || 'grand_prix') === segmentKey.value).map(t => t.price || 0)
  return prices.length ? Math.max(...prices) : 0
})

const hasTicketsForSegment = computed(() => displayedTickets.value.length > 0)

function labelCategory(c) {
  return tr.value.categories[c] || c
}

function labelVariant(v) {
  return tr.value.variants[v] || v
}

function shortCategory(c) {
  switch (c) {
    case 'general': return 'GEN'
    case 'tribune': return 'TRIB'
    case 'vip': return 'VIP'
    case 'karting': return 'KART'
    case 'simulation': return 'SIM'
    case 'drink': return 'BAR'
    case 'burger': return 'FOOD'
    case 'rental': return 'RENT'
    case 'cashless': return 'CASH'
    default: return c.toUpperCase()
  }
}

function resetFilters() {
  filterDate.value = ''
  priceRange.value = [minPrice.value, maxPrice.value]
}

// garde un intervalle de prix valide
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
    // si min dépasse max on aligne max sur min
    maxV = minV
  }
  if (minV !== priceRange.value[0] || maxV !== priceRange.value[1]) {
    priceRange.value = [minV, maxV]
  }
}, { deep: true })

watch(() => segmentKey.value, () => {
  priceRange.value = [minPrice.value, maxPrice.value]
  filterDate.value = ''
  // filtre catégorie retiré
})

function getTicketImage(category, segment = 'grand_prix') {
  const key = category || segment
  switch (key) {
    case 'general':
      return '/img/billet-entree.jpg'
    case 'tribune':
    case 'karting':
      return '/img/billet-tribune.jpg'
    case 'vip':
    case 'simulation':
      return '/img/billet-vip.jpg'
    case 'rental':
      return '/img/camping.png'
    case 'burger':
    case 'drink':
      return '/img/billet-entree.jpg'
    case 'cashless':
      return '/img/billet-entree.jpg'
    default:
      if (segment === 'decathlon') return '/img/camping.png'
      if (segment === 'concert') return '/img/billet-tribune.jpg'
      if (segment === 'playseat') return '/img/billet-vip.jpg'
      if (segment === 'cashless') return '/img/billet-entree.jpg'
      return '/img/billet-entree.jpg'
  }
}

async function loadTickets() {
  try {
    const result = await getAvailableTickets()
    tickets.value = (Array.isArray(result) ? result : (result.data || [])).map(t => ({ ...t }))
    priceRange.value = [minPrice.value, maxPrice.value]
    loadError.value = ''
    initialLoading.value = false
  } catch (error) {
    console.warn('[Billetterie] Erreur chargement tickets', error)
    loadError.value = t('ticket_segment.load_error')
    initialLoading.value = false
  }
}

function add(ticket) {
  if (isRestrictedRole.value) return
  cart.addItem(ticket)
}

function removeOne(ticket) {
  if (isRestrictedRole.value) return
  cart.decrementItem(ticket.id)
}

function goBack() {
  router.push('/tickets')
}

watch(() => cart.needsRefresh, () => {
  loadTickets()
})

onMounted(() => {
  loadTickets()
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
.ticket-segment-view {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, var(--surface-gradient-start), var(--surface-gradient-end));
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
}

.filter-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin: 1rem auto 1.5rem;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  max-width: 1200px;
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

/* meilleure lisibilité des options selon le navigateur */
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
  border: 1px solid var(--control-border);
  background: transparent;
  color: var(--control-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  border-color: var(--border-accent);
}

.filter-group select:focus,
.filter-group input[type='number']:focus {
  outline: 2px solid rgba(231,45,85,0.12);
  outline-offset: 2px;
}

.segment-header {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-subtle);
  background: var(--surface-card);
  color: var(--text-strong);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-btn:hover {
  background: var(--surface-hover);
  border-color: var(--border-accent);
}

.segment-info h1 {
  margin: 0 0 0.5rem;
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-strong);
}

.segment-info p {
  margin: 0;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.restricted-banner, .error-banner {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--accent-primary);
  background: var(--surface-card);
  color: var(--text-strong);
}

.countdown-banner {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: var(--surface-warning);
  color: var(--text-strong);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-timer {
  width: 24px;
  height: 24px;
  color: var(--accent-warning);
}

.tickets-container {
  max-width: 1200px;
  margin: 0 auto;
  transition: opacity 0.3s ease;
}

.tickets-container.is-loading {
  opacity: 0.6;
}

.category-section {
  margin-bottom: 3rem;
}

.category-title {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.ticket-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px var(--shadow-hover);
  border-color: var(--border-accent);
}

.ticket-image img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.ticket-content {
  padding: 1.25rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--accent-secondary);
  color: var(--text-invert);
}

.variant {
  font-size: 0.8rem;
  color: var(--text-soft);
  font-weight: 500;
}

.ticket-content h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-strong);
  line-height: 1.3;
}

.price-stock-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--accent-primary);
}

.stock-value {
  font-size: 0.8rem;
  color: var(--text-soft);
  font-weight: 600;
}

.stock-value.low {
  color: var(--accent-warning);
}

.stock-value.empty {
  color: var(--accent-error);
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-add, .btn-remove {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add {
  background: var(--accent-gradient);
  color: var(--text-invert);
  flex: 1;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--accent-shadow);
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-remove {
  background: var(--surface-secondary);
  color: var(--text-strong);
  border: 1px solid var(--border-subtle);
}

.btn-remove:hover {
  background: var(--surface-hover);
}

.qty {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-strong);
  padding: 0.25rem 0.5rem;
  background: var(--surface-chip);
  border-radius: 6px;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.skeleton-container {
  opacity: 0.6;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  height: 280px;
  background: var(--surface-skeleton);
  border-radius: 16px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ajustements mode sombre */
html.dark-mode .ticket-segment-view {
  background: var(--surface-gradient-start);
}

html.dark-mode .back-btn {
  background: var(--surface-card);
  border-color: var(--border-subtle);
}

html.dark-mode .ticket-card {
  background: var(--surface-card);
  border-color: var(--border-subtle);
}

@media (max-width: 768px) {
  .segment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .segment-info h1 {
    font-size: 2rem;
  }

  .tickets-grid {
    grid-template-columns: 1fr;
  }

  .ticket-segment-view {
    padding: 1rem;
  }
}
</style>