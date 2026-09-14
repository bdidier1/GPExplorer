<template>
  <div class="shop-view">

    <!-- section hero -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="section-header">
          <div class="title-with-lines">
            <div class="header-stripe left"></div>
            <h1 class="main-title">{{ t('shop_view.title') }}</h1>
            <div class="header-stripe right"></div>
          </div>
          <h2 class="subtitle-red">{{ t('shop_view.subtitle') }}</h2>
          <p class="description">{{ t('shop_view.description') }}</p>
        </div>
      </div>
    </section>

    <section class="shop-section">
      <div class="container">
        <div class="shop-layout">

          <!-- sidebar filtres -->
          <aside class="filter-sidebar">

            <!-- recherche -->
            <div class="search-box">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input v-model="searchModel" type="search" :placeholder="t('shop_view.search_placeholder')">
            </div>

            <!-- compteur et reset -->
            <div class="filter-meta">
              <span class="results-count">{{ totalVisible }} {{ totalVisible !== 1 ? t('shop_view.results_count').split('|')[1] : t('shop_view.results_count').split('|')[0] }}</span>
              <button class="btn-clear" @click="resetFilters">{{ t('shop_view.show_all') }}</button>
            </div>

            <!-- boutique officielle -->
            <div class="acc-section">
              <button class="acc-toggle" @click="toggle('boutique')">
                <span>{{ t('shop_view.official_shop') }}</span>
                <svg class="chevron" :class="{ open: open.boutique }" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
              </button>

              <div v-show="open.boutique" class="acc-body">
                <!-- evenement -->
                <label class="check-row">
                  <input type="checkbox" :checked="isSelected('evenement')" @change="toggleSel('evenement')">
                  <span class="check-label">{{ t('shop_view.event_gpx') }}</span>
                </label>

                <!-- sous menu ecuries -->
                <div class="sub-acc">
                  <button class="sub-toggle" @click="toggle('teams')">
                    <svg class="chevron small" :class="{ open: open.teams }" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                    <span>{{ t('shop_view.teams') }}</span>
                    <span class="badge">{{ teamList.length }}</span>
                  </button>
                  <div v-show="open.teams" class="sub-body">
                    <label v-for="team in teamList" :key="team" class="check-row indent">
                      <input type="checkbox" :checked="isSelected(team)" @change="toggleSel(team)">
                      <span class="check-label">{{ team }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- prestataires -->
            <div v-if="providersStore.activeProviders.length > 0" class="acc-section">
              <button class="acc-toggle" @click="toggle('providers')">
                <span>{{ t('shop_view.providers') }}</span>
                <svg class="chevron" :class="{ open: open.providers }" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
              </button>
              <div v-show="open.providers" class="acc-body">
                <label v-for="p in providersStore.activeProviders" :key="p.id" class="check-row">
                  <input type="checkbox" :checked="isSelected(p.id)" @change="toggleSel(p.id)">
                  <span class="check-label">{{ p.companyName }}</span>
                </label>
              </div>
            </div>

          </aside>

          <!-- grille principale -->
          <div class="shop-main">

            <div v-if="groupedItems.length === 0" class="empty-state">
              <p>{{ t('shop_view.no_results') }}</p>
              <button class="btn-reset" @click="resetFilters">{{ t('shop_view.view_all') }}</button>
            </div>

            <template v-else>
              <div v-for="group in groupedItems" :key="group.key" class="item-group">
                <div class="group-header">
                  <div class="group-line short"></div>
                  <span class="group-title">{{ group.label }}</span>
                  <div class="group-line"></div>
                </div>

                <div class="cards-grid">
                  <article
                    v-for="item in group.items"
                    :key="item.id"
                    class="item-card"
                    @click="$router.push({ name: 'shop-item', params: { id: item.id } })"
                  >
                    <div class="item-image">
                      <img :src="item.image" :alt="item.title" />
                      <div class="stock-badge">{{ t('shop_view.stock_label', { stock: item.stock }) }}</div>
                    </div>
                    <div class="item-content">
                      <header>
                        <p class="item-category">{{ formatCategory(item.category) }}</p>
                        <h3>{{ item.title }}</h3>
                      </header>
                      <div class="item-footer">
                        <div v-if="item.tags?.length" class="tags">
                          <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
                        </div>
                        <div class="price">{{ item.price.toFixed(2) }}€</div>
                      </div>
                      <button
                        class="btn-add-cart"
                        @click.stop="addToCart(item)"
                        :disabled="getCartQty(item.id) >= item.stock"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/>
                        </svg>
                        {{ getCartQty(item.id) >= item.stock ? t('shop_view.stock_max') : t('shop_view.add_to_cart') }}
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            </template>

          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import providerProductService from '@/services/providerProduct.service.js'
import { useCartStore } from '@/stores/cart.js'
import { useProvidersStore } from '@/stores/providers.js'
import { useI18n } from '@/composables/useI18n.js'
import { useLanguage } from '@/composables/useLanguage.js'

const { t } = useI18n()
const { currentLanguage } = useLanguage()

const cartStore = useCartStore()
const providersStore = useProvidersStore()

const searchModel   = ref('')
const catalogItems = ref([])
// etat des accordeons ouverts
const open = reactive({ boutique: true, teams: true, providers: true })
// selections actives dans les filtres
const selected = ref([])

function toggle(key) { open[key] = !open[key] }
function isSelected(key) { return selected.value.includes(key) }
function toggleSel(key) {
  const idx = selected.value.indexOf(key)
  if (idx >= 0) selected.value.splice(idx, 1)
  else selected.value.push(key)
}

onMounted(async () => {
  providersStore.initializeProviders()
  const result = await providerProductService.getAllProviderProducts()
  if (result.error === 0) {
    catalogItems.value = result.data || []
  } else {
    catalogItems.value = []
  }
})

const allItems = computed(() => catalogItems.value)

function resolveLocalizedField(item, fieldName) {
  const i18nMap = item?.[`${fieldName}I18n`] || {}
  const lang = currentLanguage.value || 'fr'

  if (typeof i18nMap[lang] === 'string' && i18nMap[lang].trim()) {
    return i18nMap[lang].trim()
  }

  for (const fallbackLang of ['fr', 'en', 'es']) {
    if (typeof i18nMap[fallbackLang] === 'string' && i18nMap[fallbackLang].trim()) {
      return i18nMap[fallbackLang].trim()
    }
  }

  const raw = item?.[fieldName]
  return typeof raw === 'string' ? raw : ''
}

const localizedItems = computed(() =>
  allItems.value.map(item => ({
    ...item,
    title: resolveLocalizedField(item, 'title'),
    description: resolveLocalizedField(item, 'description')
  }))
)

const TYPE_TAGS = new Set(['drapeau', 'maillot'])

function getTeamTag(item) {
  return item.tags?.find(tag => !TYPE_TAGS.has(tag.toLowerCase())) || null
}

function matchesSelection(item, hasSel) {
  if (!hasSel) return true

  if (item.category === 'merch-evenement') {
    return isSelected('evenement')
  }

  if (item.category === 'merch-equipe') {
    const tag = getTeamTag(item)
    return tag ? isSelected(tag) : false
  }

  if (item.providerId) {
    return isSelected(item.providerId)
  }

  return false
}

function matchesQuery(item, query) {
  if (!query) return true
  return (
    item.title?.toLowerCase().includes(query) ||
    item.description?.toLowerCase().includes(query) ||
    item.tags?.some(tag => tag.toLowerCase().includes(query))
  )
}

function resolveGroup(item) {
  if (item.category === 'merch-evenement') {
    return { key: 'evenement', label: t('shop_view.group_event') }
  }

  if (item.category === 'merch-equipe') {
    const tag = getTeamTag(item)
    return {
      key: tag || 'unknown',
      label: tag || t('shop_view.group_unknown_team')
    }
  }

  if (item.providerId) {
    const provider = providersStore.activeProviders.find(p => p.id === item.providerId)
    return {
      key: item.providerId,
      label: provider?.companyName || t('shop_view.group_provider')
    }
  }

  return { key: 'other', label: t('shop_view.group_other') }
}

const teamList = computed(() => {
  const teams = []
  for (const item of localizedItems.value) {
    if (item.category === 'merch-equipe') {
      const tag = getTeamTag(item)
      if (tag && !teams.includes(tag)) teams.push(tag)
    }
  }
  return teams
})

const groupedItems = computed(() => {
  const query   = searchModel.value.trim().toLowerCase()
  const hasSel  = selected.value.length > 0

  const filtered = localizedItems.value.filter(item => matchesSelection(item, hasSel) && matchesQuery(item, query))

  const map = new Map()
  for (const item of filtered) {
    const { key, label } = resolveGroup(item)
    if (!map.has(key)) map.set(key, { key, label, items: [] })
    map.get(key).items.push(item)
  }
  return Array.from(map.values())
})

const totalVisible = computed(() =>
  groupedItems.value.reduce((s, g) => s + g.items.length, 0)
)

function resetFilters() {
  searchModel.value = ''
  selected.value = []
}

function formatCategory(cat) {
  if (!cat) return t('shop_view.group_other')
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function addToCart(item) {
  cartStore.addItem({
    id: item.id, title: item.title, name: item.title,
    price: item.price, image: item.image,
    category: item.category, stock: item.stock,
    type: 'shop'
  })
}

function getCartQty(itemId) {
  const entry = cartStore.items.find(i => i.ticketId === itemId)
  return entry ? entry.quantity : 0
}
</script>

<style scoped>
.shop-view {
  min-height: 100vh;
  background: var(--surface-gradient-start);
  color: var(--text-strong);
}

/* section hero */
.hero-section {
  margin-top: 70px;
  background: var(--surface-gradient-start);
  padding: 4rem 2rem;
  text-align: center;
}
.hero-container { max-width: 1200px; margin: 0 auto; }
.section-header  { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }

.title-with-lines {
  display: flex; align-items: center; justify-content: center;
  gap: 3rem; width: 100%; max-width: 1000px;
}
.header-stripe          { flex: 1; height: 3px; }
.header-stripe.left     { background: linear-gradient(to right, transparent, #E72D55); }
.header-stripe.right    { background: linear-gradient(to left,  transparent, #E72D55); }

.main-title {
  font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; color: var(--text-strong);
  margin: 0; text-transform: uppercase; letter-spacing: .05em;
  white-space: nowrap; flex-shrink: 0;
}
.subtitle-red {
  font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 900; color: #E72D55;
  margin: 0; text-transform: uppercase; letter-spacing: .03em;
}
.description { font-size: clamp(1rem, 2vw, 1.15rem); color: var(--text-soft); margin: 0; max-width: 700px; }

/* layout */
.shop-section { background: var(--surface-gradient-start); padding: 3rem 0 5rem; }
.container    { max-width: 1300px; margin: 0 auto; padding: 0 1.5rem; }

.shop-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* sidebar */
.filter-sidebar {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 90px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* recherche */
.search-box {
  display: flex; align-items: center; gap: .6rem;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: .7rem 1rem;
  box-shadow: 0 4px 16px var(--card-shadow);
  margin-bottom: .25rem;
}
.search-box svg  { width: 16px; height: 16px; fill: var(--text-muted); flex-shrink: 0; }
.search-box input {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--text-strong); font-size: .95rem;
}
.search-box input::placeholder { color: var(--text-muted); }

/* meta */
.filter-meta {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 .25rem .5rem;
}
.results-count { font-size: .82rem; color: var(--text-muted); font-weight: 600; }
.btn-clear {
  font-size: .78rem; color: #E72D55; background: none; border: none;
  cursor: pointer; font-weight: 700; padding: 0;
  text-decoration: underline; text-underline-offset: 2px;
}
.btn-clear:hover { color: #c91f45; }

/* accordéon principal */
.acc-section {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px var(--card-shadow);
}

.acc-toggle {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: .85rem 1rem; background: none; border: none; cursor: pointer;
  font-size: .92rem; font-weight: 800; color: var(--text-strong);
  text-align: left;
}
.acc-toggle:hover { background: var(--surface-muted); }

.acc-body {
  padding: .25rem .75rem .75rem;
  display: flex; flex-direction: column; gap: .1rem;
  border-top: 1px solid var(--border-subtle);
}

/* sous accordéon ecuries */
.sub-acc {
  margin-top: .35rem;
}
.sub-toggle {
  width: 100%; display: flex; align-items: center; gap: .4rem;
  padding: .45rem .5rem; background: none; border: none; cursor: pointer;
  font-size: .85rem; font-weight: 700; color: var(--text-muted);
  border-radius: 8px; text-align: left;
}
.sub-toggle:hover { background: var(--surface-muted); color: var(--text-strong); }

.badge {
  margin-left: auto;
  background: var(--surface-chip); color: var(--text-strong);
  font-size: .72rem; font-weight: 800;
  padding: .1rem .45rem; border-radius: 20px;
}

.sub-body {
  display: flex; flex-direction: column; gap: .05rem;
  padding-left: .25rem;
}

/* chevron animé */
.chevron {
  width: 20px; height: 20px; fill: var(--text-muted);
  transition: transform .2s ease; transform: rotate(0deg); flex-shrink: 0;
}
.chevron.open  { transform: rotate(180deg); }
.chevron.small { width: 17px; height: 17px; }

/* cases a cocher */
.check-row {
  display: flex; align-items: center; gap: .55rem;
  padding: .42rem .5rem; border-radius: 8px; cursor: pointer;
  font-size: .88rem; transition: background .15s;
}
.check-row:hover { background: var(--surface-muted); }
.check-row.indent { padding-left: .9rem; }

.check-row input[type="checkbox"] {
  width: 15px; height: 15px; accent-color: #E72D55;
  cursor: pointer; flex-shrink: 0;
}
.check-label { color: var(--text-soft); font-weight: 600; }
.check-row:hover .check-label { color: var(--text-strong); }

/* contenu principal */
.shop-main { flex: 1; min-width: 0; }

.item-group  { margin-bottom: 3rem; }

.group-header {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.25rem;
}
.group-line { flex: 1; height: 2px; background: var(--border-subtle); border-radius: 2px; }
.group-line.short { max-width: 40px; flex: none; }
.group-title {
  font-size: 1rem; font-weight: 900; color: var(--text-strong);
  text-transform: uppercase; letter-spacing: .07em; white-space: nowrap;
  padding: .35rem 1rem; border-radius: 8px;
  background: var(--surface-muted); border: 1px solid var(--border-subtle);
  border-left: 3px solid #E72D55;
}

/* grille */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.25rem;
}

.item-card {
  background: var(--surface-card); border: 1px solid var(--border-subtle);
  border-radius: 18px; display: flex; flex-direction: column;
  overflow: hidden; box-shadow: 0 6px 20px var(--card-shadow);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  cursor: pointer;
}
.item-card:hover {
  transform: translateY(-4px);
  border-color: rgba(231,45,85,.35);
  box-shadow: 0 12px 30px var(--accent-shadow);
}

.item-image {
  width: 100%; aspect-ratio: 16/9; overflow: hidden;
  background: var(--surface-muted); position: relative;
  display: flex; align-items: center; justify-content: center;
}
.item-image img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
.item-card:hover .item-image img { transform: scale(1.05); }

.stock-badge {
  position: absolute; top: .6rem; right: .6rem;
  background: var(--surface-card-strong); backdrop-filter: blur(8px);
  padding: .3rem .65rem; border-radius: 8px;
  font-size: .75rem; font-weight: 700; color: var(--text-strong);
  border: 1px solid var(--border-accent); box-shadow: 0 2px 8px var(--card-shadow);
}

.item-content {
  padding: 1.1rem; display: flex; flex-direction: column;
  gap: .65rem; flex: 1;
}
.item-category {
  display: inline-flex; padding: .2rem .55rem; border-radius: 8px;
  background: var(--surface-chip); color: var(--text-strong);
  font-size: .78rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; margin: 0;
}
.item-card h3 { margin: .25rem 0 0; font-size: 1.05rem; font-weight: 800; color: var(--text-strong); }

.item-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: .5rem; flex-wrap: wrap; margin-top: auto;
}
.tags  { display: flex; flex-wrap: wrap; gap: .3rem; flex: 1; }
.tag   { padding: .15rem .45rem; border-radius: 6px; background: var(--surface-muted); border: 1px solid var(--border-subtle); color: var(--text-muted); font-size: .72rem; }
.price {
  font-weight: 800; font-size: 1rem; color: var(--text-strong); white-space: nowrap;
  padding: .3rem .6rem; border-radius: 8px;
  background: linear-gradient(135deg, rgba(231,45,85,.15), rgba(231,45,85,.04));
  border: 1px solid rgba(231,45,85,.3);
}

.btn-add-cart {
  width: 100%; margin-top: .4rem; padding: .7rem 1rem;
  background: linear-gradient(135deg, #e72d55, #c91f45);
  color: var(--text-invert); border: none; border-radius: 12px;
  font-weight: 700; font-size: .9rem; cursor: pointer;
  transition: all .18s ease;
  display: flex; align-items: center; justify-content: center; gap: .45rem;
  box-shadow: 0 4px 12px rgba(231,45,85,.28);
}
.btn-add-cart svg { width: 18px; height: 18px; flex-shrink: 0; }
.btn-add-cart:hover:not(:disabled) {
  background: linear-gradient(135deg, #c91f45, #a81a38);
  transform: translateY(-2px); box-shadow: 0 6px 16px rgba(231,45,85,.4);
}
.btn-add-cart:disabled { opacity: .5; cursor: not-allowed; }

.btn-reset {
  padding: .7rem 1.4rem; border-radius: 12px;
  border: 1px solid rgba(231,45,85,.4); background: transparent;
  color: #E72D55; font-weight: 700; cursor: pointer;
}
.btn-reset:hover { background: rgba(231,45,85,.08); }

.empty-state {
  text-align: center; padding: 3rem;
  border: 2px dashed var(--border-subtle); border-radius: 18px;
  background: var(--surface-card); color: var(--text-muted);
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}

/* mode sombre */
html.dark-mode .shop-section { background: var(--surface-gradient-start); }

/* responsive */
@media (max-width: 900px) {
  .shop-layout { flex-direction: column; }
  .filter-sidebar { width: 100%; position: static; flex-direction: row; flex-wrap: wrap; gap: .75rem; }
  .acc-section { flex: 1; min-width: 220px; }
  .search-box { flex: 1 1 100%; }
  .filter-meta { flex: 1 1 100%; padding-bottom: 0; }
}
@media (max-width: 500px) {
  .cards-grid { grid-template-columns: 1fr 1fr; }
}
</style>
