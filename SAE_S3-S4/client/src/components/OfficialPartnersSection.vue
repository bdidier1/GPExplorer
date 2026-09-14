<template>
  <div :class="['partners-page', { 'partners-page--full': fullPage || !sectionId || sectionId === 'providers-page' }]">
    <!-- section hero -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="section-header">
          <div class="title-with-lines">
            <div class="header-stripe left"></div>
            <h1 class="main-title">{{ localizedCopy.title }}</h1>
            <div class="header-stripe right"></div>
          </div>
          <h2 class="subtitle-red">{{ localizedCopy.subtitle }}</h2>
          <p class="description">{{ localizedCopy.intro }}</p>
        </div>
      </div>
    </section>

    <!-- contenu partenaires -->
    <section :id="sectionId || undefined" class="partners-content">
      <div class="providers-container">

      <div v-if="showSearch" class="search-bars-container">
        <div class="search-bar-wrapper">
          <div class="search-bar">
            <svg
              class="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              v-model="nameQuery"
              type="text"
              :placeholder="localizedCopy.searchByName"
              class="search-input"
            />
            <button
              v-if="nameQuery"
              type="button"
              @click="clearName"
              class="clear-btn"
              :title="localizedCopy.clearSearch"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="search-bar-wrapper">
          <div class="search-bar">
            <svg
              class="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
            </svg>
            <select v-model="categoryFilter" class="search-input search-select">
              <option value="">{{ localizedCopy.allCategories }}</option>
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <button
              v-if="categoryFilter"
              type="button"
              @click="clearCategory"
              class="clear-btn"
              :title="localizedCopy.clearSearch"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="showSearch && hasFiltersApplied" class="search-results-info">
        <p>{{ filteredProviders.length }} {{ localizedCopy.resultsFound }}</p>
      </div>

      <div v-if="hasLoadedProviders && filteredProviders.length === 0" class="no-results-message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <p>{{ localizedCopy.noResults }}</p>
      </div>

      <div v-else-if="hasLoadedProviders" class="providers-grid">
        <RouterLink
          v-for="provider in filteredProviders"
          :key="provider.id"
          class="provider-card-link"
          :to="{ name: 'dynamic-provider', params: { username: provider.username } }"
        >
          <div class="provider-card" :class="{ 'provider-card--highlight': provider.username === highlightProvider }">
            <div class="provider-logo-container">
              <img
                class="provider-logo logo-light"
                :src="provider.imageLink"
                :alt="`Logo ${provider.displayName}`"
                @error="handleImageError($event, provider.fallbackImage)"
              />
              <img
                class="provider-logo logo-dark"
                :src="provider.imageLinkDark || provider.imageLink"
                :alt="`Logo ${provider.displayName}`"
                @error="handleImageError($event, provider.fallbackImage)"
              />
            </div>
            <div class="provider-content">
              <h3>{{ provider.displayName }}</h3>
              <span class="provider-category">{{ resolveCategoryLabel(provider.category) }}</span>
              <p>{{ provider.blurb }}</p>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-else class="providers-loading">
        <p>{{ t('common.loading') }}</p>
      </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProvidersStore } from '@/stores/providers.js'
import { useI18n } from '@/composables/useI18n.js'

const props = defineProps({
  copy: {
    type: Object,
    default: () => ({})
  },
  sectionId: {
    type: String,
    default: null
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  highlightProvider: {
    type: String,
    default: null
  },
  fullPage: {
    type: Boolean,
    default: false
  }
})

const providersStore = useProvidersStore()
const { partnersCatalog, contentHydrated } = storeToRefs(providersStore)
const { t } = useI18n()

const nameQuery = ref('')
const categoryFilter = ref('')

const localizedCopy = computed(() => ({
  title: props.copy?.providersTitle || t('partners.title'),
  subtitle: props.copy?.providers?.subtitle || t('partners.subtitle'),
  intro: props.copy?.providers?.intro || t('partners.intro'),
  searchByName: props.copy?.searchByName || t('partners.search_placeholder'),
  allCategories: props.copy?.allCategories || t('partners.all_categories'),
  clearSearch: props.copy?.clearSearch || t('partners.clear_search'),
  resultsFound: props.copy?.resultsFound || t('partners.results_found'),
  noResults: props.copy?.noResults || t('partners.no_results'),
  categories: {
    organizer: props.copy?.providers?.organizer || t('partners.categories.organizer'),
    gaming: props.copy?.providers?.gaming || t('partners.categories.gaming'),
    beverages: props.copy?.providers?.beverages || t('partners.categories.beverages'),
    karting: props.copy?.providers?.karting || t('partners.categories.karting'),
    camping: props.copy?.providers?.camping || t('partners.categories.camping'),
    food: props.copy?.providers?.food || t('partners.categories.food'),
    music: props.copy?.providers?.music || t('partners.categories.music'),
    merch: props.copy?.providers?.merch || t('partners.categories.merch')
  }
}))

const providerCards = computed(() => partnersCatalog.value || [])
const hasLoadedProviders = computed(() => contentHydrated.value || providerCards.value.length > 0)

const filteredProviders = computed(() =>
  providerCards.value.filter(provider => {
    const matchesName = !nameQuery.value || provider.displayName.toLowerCase().includes(nameQuery.value.trim().toLowerCase())
    const matchesCategory = !categoryFilter.value || provider.category === categoryFilter.value
    return matchesName && matchesCategory
  })
)

const hasFiltersApplied = computed(() => Boolean(nameQuery.value || categoryFilter.value))

const categoryOptions = computed(() => {
  const labels = new Map()
  providerCards.value.forEach(provider => {
    if (!labels.has(provider.category)) {
      labels.set(provider.category, resolveCategoryLabel(provider.category))
    }
  })
  return Array.from(labels, ([value, label]) => ({ value, label }))
})

function resolveCategoryLabel(category) {
  if (!category) {
    return localizedCopy.value.allCategories
  }
  return localizedCopy.value.categories[category] || category
}

function clearName() {
  nameQuery.value = ''
}

function clearCategory() {
  categoryFilter.value = ''
}

function handleImageError(event, fallback) {
  const target = event?.target
  if (!target) {
    return
  }
  const defaultFallback = '/logos/default-provider.png'
  const currentSrc = target.getAttribute('src') || ''

  // premier échec on essaie un fallback
  if (!target.dataset.fallbackTried) {
    target.dataset.fallbackTried = '1'
    const nextSrc = fallback || defaultFallback
    if (nextSrc && currentSrc !== nextSrc) {
      target.src = nextSrc
      return
    }
  }

  // deuxième échec on met un svg inline
  target.onerror = null
  target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120"><rect width="240" height="120" fill="%230b0b0b"/><text x="120" y="68" text-anchor="middle" fill="%23ffffff" font-family="Arial,sans-serif" font-size="18">LOGO</text></svg>'
}
</script>

<style scoped>
.partners-page {
  min-height: 100vh;
  background: var(--surface-gradient-start);
  color: var(--text-strong);
  font-family: 'Inter', sans-serif;
}

/* section hero */
.hero-section {
  margin-top: 0;
  background: #0a0a0a;
  padding: 4rem 2rem 2rem;
  text-align: center;
}

.partners-page--full .hero-section {
  margin-top: 70px;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.title-with-lines {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  width: 100%;
  max-width: 1000px;
}

.header-stripe {
  flex: 1;
  height: 3px;
  background: #E72D55;
}

.header-stripe.left {
  background: linear-gradient(to right, transparent, #E72D55);
}

.header-stripe.right {
  background: linear-gradient(to left, transparent, #E72D55);
}

.main-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

.subtitle-red {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 900;
  color: #E72D55;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.description {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: #b0b0b0;
  margin: 0;
  max-width: 800px;
  line-height: 1.6;
}

/* contenu partenaires */
.partners-content {
  background: #ffffff;
  padding: 4rem 0;
}

.providers-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}


.search-bars-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 3rem auto;
  max-width: 1000px;
  padding: 0 2rem;
}

.search-bar-wrapper {
  position: relative;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 14px 18px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar:focus-within {
  border-color: #e72d55;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(231, 45, 85, 0.15);
  transform: translateY(-2px);
}

.search-icon {
  width: 22px;
  height: 22px;
  color: #666;
  margin-right: 12px;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.search-bar:focus-within .search-icon {
  color: #e72d55;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  outline: none;
  color: #333;
  width: 100%;
}

.search-input::placeholder {
  color: #999;
}

.search-select {
  cursor: pointer;
  appearance: none;
  background: transparent;
  padding-right: 40px;
  font-weight: 500;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 24px;
}

.search-select option {
  padding: 10px;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.2s;
  margin-left: 8px;
  border-radius: 50%;
}

.clear-btn svg {
  width: 20px;
  height: 20px;
}

.clear-btn:hover {
  color: #ffffff;
  background: #be123c;
}

.search-results-info {
  text-align: center;
  color: #ffffff;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  margin: 1.5rem 0;
  padding: 0.75rem 1.5rem;
  background: #be123c;
  border-radius: 8px;
  display: inline-block;
  left: 50%;
  position: relative;
  transform: translateX(-50%);
}

.no-results-message {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.no-results-message svg {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  opacity: 0.3;
  stroke: #e72d55;
}

.no-results-message p {
  font-size: 1.25rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #666;
  margin: 0;
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
}

.provider-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.provider-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid rgba(231, 45, 85, 0.15);
  overflow: hidden;
  position: relative;
}

.provider-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, #e72d55, transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.provider-card:hover::before,
.provider-card--highlight::before {
  opacity: 1;
}

.provider-card:hover,
.provider-card--highlight {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 60px rgba(231, 45, 85, 0.25);
  border-color: #e72d55;
}

.provider-logo-container {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-bottom: 2px solid rgba(231, 45, 85, 0.1);
  padding: 2rem;
  transition: all 0.3s ease;
}

.provider-card:hover .provider-logo-container,
.provider-card--highlight .provider-logo-container {
  background: rgba(231, 45, 85, 0.05);
  border-bottom-color: rgba(231, 45, 85, 0.2);
}

.provider-logo {
  max-width: 180px;
  max-height: 100px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: all 0.3s ease;
}

.provider-card:hover .provider-logo,
.provider-card--highlight .provider-logo {
  transform: scale(1.05);
  filter: drop-shadow(0 0 10px rgba(231, 45, 85, 0.5));
}

html.dark-mode .provider-logo.logo-dark[src="/gp_logo.png"] {
  filter: brightness(0) invert(1);
}

html.dark-mode .provider-card:hover .provider-logo.logo-dark[src="/gp_logo.png"],
html.dark-mode .provider-card--highlight .provider-logo.logo-dark[src="/gp_logo.png"] {
  filter: brightness(0) invert(1) drop-shadow(0 0 10px rgba(231, 45, 85, 0.5));
}

.provider-content {
  padding: 2rem;
}

.provider-content h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1.6rem;
  font-weight: 900;
  color: #000;
  margin-bottom: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.provider-category {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background: #be123c;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 15px;
  margin-bottom: 1rem;
  border: 1px solid rgba(231, 45, 85, 0.2);
}

.provider-content p {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: #555;
}

.providers-loading {
  text-align: center;
  padding: 4rem 0;
  color: #666;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .title-with-lines {
    gap: 1.5rem;
  }

  .providers-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .title-with-lines {
    gap: 1rem;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .partners-content {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 1.5rem 1rem;
  }

  .main-title {
    font-size: 1.8rem;
  }

  .subtitle-red {
    font-size: 1rem;
  }

  .search-bars-container {
    grid-template-columns: 1fr;
  }
}

/* mode sombre */
html:not(.dark-mode) .hero-section {
  background: #ffffff;
}

html:not(.dark-mode) .main-title {
  color: #000000;
}

html.dark-mode .partners-page {
  background: var(--surface-gradient-start);
}

html.dark-mode .hero-section {
  background: var(--surface-gradient-start);
}

html.dark-mode .main-title {
  color: #ffffff;
}

html.dark-mode .partners-content {
  background: var(--surface-gradient-start);
}

html.dark-mode .search-bar {
  background: #1a1a1a;
  border-color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

html.dark-mode .search-bar:focus-within {
  border-color: #e72d55;
  background: #222;
  box-shadow: 0 4px 16px rgba(231, 45, 85, 0.25);
}

html.dark-mode .search-icon {
  color: #999;
}

html.dark-mode .search-input {
  color: #fff;
}

html.dark-mode .search-input::placeholder {
  color: #666;
}

html.dark-mode .search-select {
  color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
}

html.dark-mode .search-select option {
  background: #1a1a1a;
  color: #fff;
}

html.dark-mode .clear-btn {
  color: #666;
}

html.dark-mode .clear-btn:hover {
  color: #1b0409;
  background: #e72d55;
}

html.dark-mode .search-results-info {
  color: #ffffff;
  background: #be123c;
}

html.dark-mode .no-results-message p {
  color: #999;
}

html.dark-mode .provider-card {
  background: #1a1a1a;
  border-color: rgba(231, 45, 85, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

html.dark-mode .provider-card:hover,
html.dark-mode .provider-card--highlight {
  box-shadow: 0 20px 60px rgba(231, 45, 85, 0.4);
}

html.dark-mode .provider-logo-container {
  background: rgba(7, 10, 18, 0.95);
  border-bottom-color: rgba(231, 45, 85, 0.35);
}

html.dark-mode .provider-content h3 {
  color: #ffffff;
}

html.dark-mode .provider-content p {
  color: #d5ddff;
}

html.dark-mode .provider-category {
  background: #be123c;
  color: #ffffff;
  border-color: rgba(231, 45, 85, 0.6);
}

html.dark-mode .providers-loading {
  color: #b0b0b0;
}

/* logo clair sombre */
.logo-dark { display: none; }
html.dark-mode .logo-light { display: none; }
html.dark-mode .logo-dark { display: block; }
</style>
