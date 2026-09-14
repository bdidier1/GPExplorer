<template>
  <!-- état de chargement -->
  <div v-if="loading" class="loading-container">
    <div class="loading-content">
      <div class="spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>
  </div>

  <!-- contenu normal si prestataire trouvé -->
  <div v-else-if="currentProvider">
    <!-- section hero -->
    <section class="hero-section" :class="{ 'has-toolbar': canEdit }">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-text">
            <h2>{{ pageTitle }}</h2>
            <p class="hero-subtitle">{{ titleDescription }}</p>
            <div class="hero-badge">
              <span class="badge-text">{{ t('provider.dashboard.official_partner') }}</span>
            </div>
          </div>
          <div class="hero-image">
            <img :src="imageLink" :alt="pageTitle" class="logo-light">
            <img :src="imageLinkDark || imageLink" :alt="pageTitle" class="logo-dark">
          </div>
        </div>

        <!-- barre dashboard visible seulement pour le propriétaire -->
        <div v-if="canEdit" class="dashboard-toolbar">
          <div class="toolbar-content">
            <span class="toolbar-label">{{ t('provider.dashboard.mode_management') }}</span>
            <div class="toolbar-actions">
              <div class="mode-switch">
                <button 
                  class="switch-btn" 
                  :class="{ active: showEditor }"
                  @click="showEditor = true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  {{ t('provider.dashboard.edit_mode') }}
                </button>
                <button 
                  class="switch-btn" 
                  :class="{ active: !showEditor }"
                  @click="showEditor = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  {{ t('provider.dashboard.preview_mode') }}
                </button>
              </div>
              <div class="separator"></div>
              <router-link to="/provider/home" class="toolbar-btn secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                {{ t('provider.dashboard.manage_location') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- drapeau à damier -->
    <div class="checkered-flag">
      <div 
        v-for="row in 3" 
        :key="row" 
        class="checkered-row"
      >
        <div 
          v-for="col in numberOfColumns" 
          :key="col" 
          class="checkered-square"
          :class="{ 'black': (row + col) % 2 === 1, 'white': (row + col) % 2 === 0 }"
        ></div>
      </div>
    </div>

    <!-- section services -->
    <section class="services-section">
      <div class="section-header">
        <div class="title">
          <div class="header-stripe red"></div>
          <h3>{{ t('provider.dashboard.our_services') }}</h3>
          <div class="header-stripe"></div>
        </div>
        <p>{{ servicesSubtitle }}</p>
      </div>
      
      <div class="services-grid">
        <div 
          class="service-card"
          v-for="(service, index) in visibleServices" 
          :key="service.key || index"
          :class="{ 'is-clickable': Boolean(service.url) }"
          :tabindex="service.url ? 0 : null"
          :role="service.url ? 'button' : null"
          @click="handleServiceNavigation(service)"
          @keydown.enter.prevent="handleServiceNavigation(service)"
          @keydown.space.prevent="handleServiceNavigation(service)"
        >
          <div class="service-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div 
            class="service-card-badge" 
            v-if="canEdit && service.visibility === 'private'"
          >
            {{ t('provider.editor.service_private_badge') }}
          </div>
          <h4>{{ service.title }}</h4>
          <p>{{ service.description }}</p>
        </div>
      </div>
    </section>

    <!-- drapeau à damier -->
    <div class="checkered-flag">
      <div 
        v-for="row in 3" 
        :key="`b-${row}`" 
        class="checkered-row"
      >
        <div 
          v-for="col in numberOfColumns" 
          :key="`b-${col}`" 
          class="checkered-square"
          :class="{ 'black': (row + col) % 2 === 1, 'white': (row + col) % 2 === 0 }"
        ></div>
      </div>
    </div>


    <!-- Info Section -->
    <section class="info-section">
      <div class="info-container">
        <div class="info-content">
          <div class="info-text">
          <h3>{{ t('provider.dashboard.about', { name: cleanPageTitle }) }}</h3>
          <p>{{ aboutDescription }}</p>  
            <div class="info-highlights">
              <div class="highlight-item" v-for="(h, idx) in highlights" :key="idx">
                <span class="highlight-number">{{ h.number }}</span>
                <span class="highlight-text">{{ h.text }}</span>
              </div>
            </div>
          </div>
          
          <div class="info-visual">
            <div class="visual-card">
              <h4>{{ t('provider.dashboard.opening_hours') }}</h4>
              <div class="schedule">
                <div class="schedule-item" v-for="(s, idx) in schedule" :key="idx">
                  <span class="day">{{ s.day }}</span>
                  <span class="hours">{{ s.hours }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Editeur -->
    <section v-if="showEditor" class="editor-panel">
      <div class="editor-container">
        <h3>{{ t('provider.editor.title') }}</h3>
        <!-- Section Identité Visuelle -->
        <div class="editor-section">
          <h3>{{ t('provider.editor.visual_identity') }}</h3>
          <div class="form-row">
            <p class="form-group-label">{{ t('provider.editor.logos') }}</p>
            <div class="logos-grid">
              <div class="logo-input">
                <span>{{ t('provider.editor.normal_logo') }}</span>
                <div class="image-inline">
                  <img :src="ModImageLink || imageLink" alt="Normal" class="imageForm">
                  <input type="file" accept=".png, .jpg, .jpeg" @change="(e) => changeImage(e, 'normal')">
                </div>
              </div>
              <div class="logo-input" :class="{ disabled: useSingleLogo }">
                <span>{{ t('provider.editor.dark_mode_logo') }}</span>
                <div class="image-inline">
                  <img :src="useSingleLogo ? (ModImageLink || imageLink) : (ModImageLinkDark || imageLinkDark || ModImageLink || imageLink)" alt="Dark" class="imageForm dark-preview">
                  <input type="file" accept=".png, .jpg, .jpeg" @change="(e) => changeImage(e, 'dark')" :disabled="useSingleLogo">
                </div>
              </div>
            </div>
            <div class="checkbox-row">
              <input type="checkbox" id="singleLogo" v-model="useSingleLogo">
              <label for="singleLogo">{{ t('provider.editor.same_logo') }}</label>
            </div>
          </div>
        </div>

        <!-- Section Contenu Textuel -->
        <div class="editor-section">
          <h3>{{ t('provider.editor.text_content') }}</h3>
          <div class="editor-tabs">
            <button 
              v-for="lang in ['fr', 'en', 'es']" 
              :key="lang"
              :class="{ active: currentLangTab === lang }"
              @click="currentLangTab = lang"
            >
              {{ lang.toUpperCase() }}
            </button>
          </div>

          <div class="form-row">
            <label :for="`page-title-${currentLangTab}`">{{ t('provider.editor.page_title') }} ({{ currentLangTab.toUpperCase() }})</label>
            <input 
              :id="`page-title-${currentLangTab}`"
              v-model="ModContent[currentLangTab].pageTitle"
              type="text"
              class="simple-input"
              :placeholder="t('provider.editor.enter_title')"
            />
          </div>  

          <div class="form-row">
            <label :for="`title-description-${currentLangTab}`">{{ t('provider.editor.title_desc') }} ({{ currentLangTab.toUpperCase() }})</label>
            <textarea 
              :id="`title-description-${currentLangTab}`"
              v-model="ModContent[currentLangTab].titleDescription"
              class="simple-textarea"
              rows="2"
              :placeholder="t('provider.editor.enter_desc')"
            ></textarea>
          </div>

          <div class="form-row">
            <label :for="`services-subtitle-${currentLangTab}`">{{ t('provider.editor.services_subtitle') }} ({{ currentLangTab.toUpperCase() }})</label>
            <input 
              :id="`services-subtitle-${currentLangTab}`"
              v-model="ModContent[currentLangTab].servicesSubtitle"
              type="text"
              class="simple-input"
              :placeholder="t('provider.editor.enter_subtitle')"
            /> 
         </div>
         <div class="form-row">
            <label :for="`about-description-${currentLangTab}`">{{ t('provider.editor.about_desc') }} ({{ currentLangTab.toUpperCase() }})</label>
            <textarea
              :id="`about-description-${currentLangTab}`"
              class="simple-textarea"
              rows="3"
              v-model="ModContent[currentLangTab].aboutDescription"
              :placeholder="t('provider.editor.enter_desc')"
            />
          </div>

          <!-- Chiffres clés -->
          <div class="services-editor">
            <h4>{{ t('provider.editor.highlights') }} ({{ currentLangTab.toUpperCase() }})</h4>
            <div 
              class="service-edit-item"
              v-for="(h, i) in ModContent[currentLangTab].highlights" 
              :key="i"
            >
              <div class="service-edit-fields">
                <input 
                  type="text" 
                  v-model="h.number" 
                  :placeholder="t('provider.editor.highlight_number_placeholder')" 
                />
                <input 
                  type="text" 
                  v-model="h.text" 
                  :placeholder="t('provider.editor.highlight_text_placeholder')" 
                />
              </div>
              <button class="service-delete" @click="removeHighlight(i)">{{ t('common.delete') }}</button>
            </div>
            <button @click="addHighlight">{{ t('provider.editor.add_highlight') }}</button>
          </div>

          <!-- Horaires -->
          <div class="services-editor">
            <h4>{{ t('provider.editor.schedule') }} ({{ currentLangTab.toUpperCase() }})</h4>
            <div 
              class="service-edit-item"
              v-for="(s, i) in ModContent[currentLangTab].schedule" 
              :key="i"
            >
              <div class="service-edit-fields">
                <input 
                  type="text" 
                  v-model="s.day" 
                  :placeholder="t('provider.editor.schedule_day_placeholder')" 
                />
                <input 
                  type="text" 
                  v-model="s.hours" 
                  :placeholder="t('provider.editor.schedule_hours_placeholder')" 
                />
              </div>
              <button class="service-delete" @click="removeScheduleItem(i)">{{ t('common.delete') }}</button>
            </div>
            <button @click="addScheduleItem">{{ t('provider.editor.add_schedule') }}</button>
          </div>

          <div class="services-editor">
            <h4>{{ t('provider.editor.services') }} ({{ currentLangTab.toUpperCase() }})</h4>
            <div 
              class="service-edit-item"
              v-for="(s, i) in ModContent[currentLangTab].services" 
              :key="i"
            >
                <div class="service-edit-fields">
                  <input type="text" v-model="s.title" :placeholder="t('provider.editor.service_name_placeholder')" />
                  <input type="text" v-model="s.description" :placeholder="t('provider.editor.service_desc_placeholder')" />
                  <label class="service-url-field">
                    <span>{{ t('provider.editor.service_url_label') }}</span>
                    <input type="text" v-model="s.url" :placeholder="t('provider.editor.service_url_placeholder')" />
                  </label>
                </div>
                <div class="service-meta">
                  <label class="service-toggle">
                    <input type="checkbox" v-model="s.enabled" />
                    <span>{{ t('provider.editor.service_active_label') }}</span>
                  </label>
                  <label class="service-visibility">
                    <span>{{ t('provider.editor.service_visibility') }}</span>
                    <select v-model="s.visibility">
                      <option value="public">{{ t('provider.editor.visibility_public') }}</option>
                      <option value="private">{{ t('provider.editor.visibility_private') }}</option>
                    </select>
                  </label>
                </div>
                <button class="service-delete" @click="removeService(i)">{{ t('common.delete') }}</button>
            </div>

            <button @click="addService">{{ t('provider.editor.add_service') }}</button>
          </div>
        </div>

        <div class="editor-actions">
          <button @click="saveChanges">{{ t('common.save') }}</button>
          <button @click="cancelEdit">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </section>

    <GuestbookSection
      :provider-id="currentProvider.id"
      :provider-name="currentProvider.companyName || currentProvider.username"
      :provider-username="currentProvider.username"
      section-id="guestbook"
    />

    <PrivateContactSection
      :provider-id="currentProvider.id"
      :provider-name="currentProvider.companyName || currentProvider.username"
      section-id="contact-prive"
    />
  </div> <!-- Fermeture de la div conditionnelle -->
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/login.js';
import { useProvidersStore } from '@/stores/providers.js';
import { useLanguage } from '@/composables/useLanguage.js';
import { useI18n } from '@/composables/useI18n.js';
import { useRoute, useRouter } from 'vue-router';
import { trackProviderVisit } from '@/services/analytics.service.js';
import GuestbookSection from '@/components/GuestbookSection.vue';
import PrivateContactSection from '@/components/PrivateContactSection.vue';

const authStore = useAuthStore();
const providersStore = useProvidersStore();
const { currentLanguage } = useLanguage();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Données dynamiques basées sur le prestataire
const loading = ref(true);
const currentProvider = ref(null);
const pageTitle = ref(t('provider.defaults.page_title'));
const imageLink = ref(`/logos/${route.params.username}-logo.png`)
const imageLinkDark = ref('')
const titleDescription = ref(t('provider.defaults.title_desc'));
const servicesSubtitle = ref(t('provider.defaults.services_subtitle'));
const aboutDescription = ref(t('provider.defaults.about_desc'));

function getDefaultHighlights() {
  return [
    { number: '100%', text: t('provider.dashboard.fresh_ingredients') },
    { number: '24/7', text: t('provider.dashboard.continuous_service') },
    { number: '1000+', text: t('provider.dashboard.satisfied_clients') }
  ];
}

function getDefaultSchedule() {
  return [
    { day: t('provider.days.friday'), hours: '10h00 - 22h00' },
    { day: t('provider.days.saturday'), hours: '08h00 - 23h00' },
    { day: t('provider.days.sunday'), hours: '08h00 - 20h00' }
  ];
}

const highlights = ref(getDefaultHighlights());
const schedule = ref(getDefaultSchedule());

const changeImage = (e, type = 'normal') => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    if (type === 'normal') {
      ModImageLink.value = event.target.result;
    } else {
      ModImageLinkDark.value = event.target.result;
    }
  };
  reader.readAsDataURL(file);
}

const services = ref([]);

function slugifyServiceKey(value = '', fallback = 'service') {
  if (!value) return fallback
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .replaceAll(/-{2,}/g, '-') || fallback
}

function normalizeServiceEntry(service = {}, fallbackPrefix = 'service', index = 0) {
  const fallbackKey = `${fallbackPrefix}-${index + 1}`
  return {
    key: service.key || slugifyServiceKey(service.title, fallbackKey),
    title: service.title || '',
    description: service.description || '',
    visibility: service.visibility === 'private' ? 'private' : 'public',
    enabled: service.enabled !== false,
    url: typeof service.url === 'string' ? service.url.trim() : ''
  }
}

function normalizeServicesList(list = [], fallbackPrefix = 'service') {
  return (list || []).map((service, index) => normalizeServiceEntry(service, fallbackPrefix, index))
}

function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function resolveLocalizedProviderContent(storedContent, lang) {
  if (!storedContent || typeof storedContent !== 'object') {
    return null;
  }

  const localized = storedContent[lang];
  if (localized && typeof localized === 'object') {
    return localized;
  }

  if (storedContent.fr && typeof storedContent.fr === 'object') {
    return storedContent.fr;
  }

  return storedContent;
}

function applyProviderContent(provider, username, storedContent) {
  const lang = currentLanguage.value || 'fr';
  const finalContent = resolveLocalizedProviderContent(storedContent, lang);

  pageTitle.value = stripHtml(finalContent?.pageTitle) || provider.companyName || provider.username;
  titleDescription.value = stripHtml(finalContent?.titleDescription) || t('provider.defaults.title_desc');
  servicesSubtitle.value = stripHtml(finalContent?.servicesSubtitle) || t('provider.defaults.services_subtitle');
  aboutDescription.value = stripHtml(finalContent?.aboutDescription) || t('provider.defaults.about_desc');

  const logos = storedContent?.logos || {};
  imageLink.value = logos.normal || storedContent?.imageLink || `/logos/${username}-logo.png`;
  imageLinkDark.value = logos.alternate || imageLink.value;

  if (Array.isArray(finalContent?.highlights) && finalContent.highlights.length) {
    highlights.value = finalContent.highlights.map(h => ({
      number: stripHtml(h.number),
      text: stripHtml(h.text)
    }));
  } else {
    highlights.value = getDefaultHighlights();
  }

  if (Array.isArray(finalContent?.schedule) && finalContent.schedule.length) {
    schedule.value = finalContent.schedule.map(s => ({
      day: stripHtml(s.day),
      hours: stripHtml(s.hours)
    }));
  } else {
    schedule.value = getDefaultSchedule();
  }

  if (Array.isArray(finalContent?.services) && finalContent.services.length) {
    services.value = normalizeServicesList(finalContent.services, provider.username || provider.companyName || 'service').map(service => ({
      ...service,
      title: stripHtml(service.title),
      description: stripHtml(service.description)
    }));
  } else {
    loadDefaultServices(provider.category, provider.username || provider.companyName || 'service');
  }
}

const cleanPageTitle = computed(() => {
  return pageTitle.value.replaceAll(/<[^>]*>/g, '');
});

// Fonction pour charger les données du prestataire
function loadProviderData() {
  loading.value = true;
  const username = route.params.username;
  
  if (!username) {
    loading.value = false;
    router.push({ name: 'not-found' });
    return;
  }

  setTimeout(() => {
    let provider = providersStore.getProviderByUsername(username);

    if (provider) {
      currentProvider.value = provider;
      
      // Track provider page visit for statistics
      trackProviderVisit({
        providerId: provider.id || username,
        providerName: provider.companyName || provider.username,
        userRole: authStore.user?.role || 'visitor'
      });
      
      const storedContent = providersStore.getProviderContent(username);
      applyProviderContent(provider, username, storedContent);
      loading.value = false;
    } else {
      router.push({ name: 'not-found' });
    }
  }, 100);
}

// Fonction pour charger des services par défaut selon la catégorie
function loadDefaultServices(category, providerKey = 'service') {
  const defaultServices = {
    gaming: [
      { title: t('provider.services.gaming.sim_racing.title'), description: t('provider.services.gaming.sim_racing.desc') },
      { title: t('provider.services.gaming.pro_gear.title'), description: t('provider.services.gaming.pro_gear.desc') },
      { title: t('provider.services.gaming.animation.title'), description: t('provider.services.gaming.animation.desc') }
    ],
    beverages: [
      { title: t('provider.services.beverages.premium.title'), description: t('provider.services.beverages.premium.desc') },
      { title: t('provider.services.beverages.continuous.title'), description: t('provider.services.beverages.continuous.desc') },
      { title: t('provider.services.beverages.fresh.title'), description: t('provider.services.beverages.fresh.desc') }
    ],
    food: [
      { title: t('provider.services.food.fast_food.title'), description: t('provider.services.food.fast_food.desc') },
      { title: t('provider.services.food.fresh_products.title'), description: t('provider.services.food.fresh_products.desc') },
      { title: t('provider.services.food.continuous.title'), description: t('provider.services.food.continuous.desc') }
    ],
    karting: [
      { title: t('provider.services.karting.track.title'), description: t('provider.services.karting.track.desc') },
      { title: t('provider.services.karting.karts.title'), description: t('provider.services.karting.karts.desc') },
      { title: t('provider.services.karting.safety.title'), description: t('provider.services.karting.safety.desc') }
    ],
    camping: [
      { title: t('provider.services.camping.comfort.title'), description: t('provider.services.camping.comfort.desc') },
      { title: t('provider.services.camping.equipment.title'), description: t('provider.services.camping.equipment.desc') },
      { title: t('provider.services.camping.service_247.title'), description: t('provider.services.camping.service_247.desc') }
    ],
    music: [
      { title: t('provider.services.music.animation.title'), description: t('provider.services.music.animation.desc') },
      { title: t('provider.services.music.sound_system.title'), description: t('provider.services.music.sound_system.desc') },
      { title: t('provider.services.music.playlist.title'), description: t('provider.services.music.playlist.desc') }
    ],
    default: [
      { title: t('provider.services.default.premium.title'), description: t('provider.services.default.premium.desc') },
      { title: t('provider.services.default.expert.title'), description: t('provider.services.default.expert.desc') },
      { title: t('provider.services.default.custom.title'), description: t('provider.services.default.custom.desc') }
    ]
  };

  services.value = normalizeServicesList(defaultServices[category] || defaultServices.default, providerKey);
}

const numberOfColumns = ref(100);

function calculateColumns() {
  const screenWidth = globalThis.window?.innerWidth ?? 1200;
  if (screenWidth <= 480) {
    numberOfColumns.value = Math.floor(screenWidth / 12);
  } else if (screenWidth <= 768) {
    numberOfColumns.value = Math.floor(screenWidth / 15);
  } else {
    numberOfColumns.value = Math.floor(screenWidth / 20);
  }
  numberOfColumns.value = Math.max(10, Math.min(150, numberOfColumns.value));
}

onMounted(() => {
  if (!globalThis.window) {
    return;
  }
  calculateColumns();
  globalThis.window.addEventListener('resize', calculateColumns);
});

// recharge les données quand la route change
watch(() => route.params.username, () => {
  loadProviderData();
}, { immediate: true });

watch(currentLanguage, () => {
  if (!currentProvider.value) {
    return;
  }

  const username = route.params.username;
  if (!username) {
    return;
  }

  const storedContent = providersStore.getProviderContent(username);
  applyProviderContent(currentProvider.value, username, storedContent);
});

// vérifie les permissions admin ou prestataire propriétaire
const canEdit = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user || !currentProvider.value) {
    return false;
  }
  
  const user = authStore.user;
  // admin peut tout modifier
  if (user.role === 'organizer') {
    return true;
  }
  // le prestataire peut modifier sa propre page
  if (user.role === 'provider' && user.username === currentProvider.value.username) {
    return true;
  }
  
  return false;
});

const visibleServices = computed(() => {
  const allowPrivateAudience = canEdit.value;
  const filteredServices = services.value
    .filter(service => service.enabled !== false)
    .filter(service => allowPrivateAudience || (service.visibility || 'public') === 'public');
  
  // ajoute automatiquement la carte livre d'or
  const guestbookCard = {
    key: 'guestbook-card',
    title: t('provider.services.guestbook.title'),
    description: t('provider.services.guestbook.desc'),
    url: '#guestbook',
    enabled: true,
    visibility: 'public'
  };
  
  // ajoute automatiquement la carte contact privé
  const privateContactCard = {
    key: 'private-contact-card',
    title: t('provider.services.private_contact.title'),
    description: t('provider.services.private_contact.desc'),
    url: '#contact-prive',
    enabled: true,
    visibility: 'public'
  };
  
  return [...filteredServices, guestbookCard, privateContactCard];
});

function handleServiceNavigation(service) {
  if (!service?.url) {
    return
  }

  const rawUrl = service.url.trim()
  if (!rawUrl) {
    return
  }

  // gère les ancres pour scroller vers une section
  if (rawUrl.startsWith('#')) {
    const targetId = rawUrl.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return
  }

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    if (globalThis.window) {
      globalThis.window.open(rawUrl, '_blank', 'noopener')
    }
    return
  }

  if (rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:')) {
    if (globalThis.window) {
      globalThis.location.href = rawUrl
    }
    return
  }

  if (rawUrl.startsWith('/')) {
    router.push(rawUrl)
    return
  }

  if (globalThis.window) {
    globalThis.window.open(`https://${rawUrl}`, '_blank', 'noopener')
  }
}

// ouvre auto l'éditeur pour le propriétaire
watch(canEdit, (newVal) => {
  if (newVal && !showEditor.value) {
    open();
  }
}, { immediate: true });

// éditeur
const showEditor = ref(false);
const currentLangTab = ref('fr');
const ModContent = ref({
  fr: { pageTitle: '', titleDescription: '', servicesSubtitle: '', aboutDescription: '', services: [], highlights: [], schedule: [] },
  en: { pageTitle: '', titleDescription: '', servicesSubtitle: '', aboutDescription: '', services: [], highlights: [], schedule: [] },
  es: { pageTitle: '', titleDescription: '', servicesSubtitle: '', aboutDescription: '', services: [], highlights: [], schedule: [] }
});
const ModImageLink = ref('');
const ModImageLinkDark = ref('');
const useSingleLogo = ref(false);

function open(){
  if (!canEdit.value) {
    return;
  }
  
  const stored = providersStore.getProviderContent(route.params.username) || {};
  const languages = ['fr', 'en', 'es'];
  
  languages.forEach(lang => {
    const src = stored[lang] || (lang === 'fr' ? stored : {});
    const sourceServices = src.services || (lang === 'fr' ? services.value : []);
    const sourceHighlights = src.highlights || (lang === 'fr' ? highlights.value : [
      { number: '100%', text: '' },
      { number: '24/7', text: '' },
      { number: '1000+', text: '' }
    ]);
    const sourceSchedule = src.schedule || (lang === 'fr' ? schedule.value : [
      { day: '', hours: '' },
      { day: '', hours: '' },
      { day: '', hours: '' }
    ]);
    ModContent.value[lang] = {
      pageTitle: src.pageTitle || (lang === 'fr' ? pageTitle.value : ''),
      titleDescription: src.titleDescription || (lang === 'fr' ? titleDescription.value : ''),
      servicesSubtitle: src.servicesSubtitle || (lang === 'fr' ? servicesSubtitle.value : ''),
      aboutDescription: src.aboutDescription || (lang === 'fr' ? aboutDescription.value : ''),
      services: normalizeServicesList(sourceServices, `${route.params.username || 'service'}-${lang}`).map(s => ({ ...s })),
      highlights: sourceHighlights.map(h => ({ ...h })),
      schedule: sourceSchedule.map(s => ({ ...s }))
    };
  });

  // logos
  const logos = stored.logos || {};
  ModImageLink.value = logos.normal || imageLink.value;
  ModImageLinkDark.value = logos.alternate || imageLinkDark.value;
  
  // initialise l'état logo unique
  useSingleLogo.value = !logos.alternate;
  
  showEditor.value = true;
}

function addService() {
  const lang = currentLangTab.value;
  const list = ModContent.value[lang].services;
  list.push(normalizeServiceEntry({
    title: '',
    description: '',
    visibility: 'public',
    enabled: true,
    url: ''
  }, `${route.params.username || 'service'}-${lang}`, list.length));
}

function removeService(index) {
  ModContent.value[currentLangTab.value].services.splice(index, 1);
}

function addHighlight() {
  ModContent.value[currentLangTab.value].highlights.push({ number: '', text: '' });
}

function removeHighlight(index) {
  ModContent.value[currentLangTab.value].highlights.splice(index, 1);
}

function addScheduleItem() {
  ModContent.value[currentLangTab.value].schedule.push({ day: '', hours: '' });
}

function removeScheduleItem(index) {
  ModContent.value[currentLangTab.value].schedule.splice(index, 1);
}

function saveChanges() {
  // construit la nouvelle structure
  const providerData = {
    logos: {
      normal: ModImageLink.value,
      alternate: useSingleLogo.value ? null : ModImageLinkDark.value
    },
    fr: { ...ModContent.value.fr, services: normalizeServicesList(ModContent.value.fr.services, `${route.params.username}-fr`), highlights: ModContent.value.fr.highlights, schedule: ModContent.value.fr.schedule },
    en: { ...ModContent.value.en, services: normalizeServicesList(ModContent.value.en.services, `${route.params.username}-en`), highlights: ModContent.value.en.highlights, schedule: ModContent.value.en.schedule },
    es: { ...ModContent.value.es, services: normalizeServicesList(ModContent.value.es.services, `${route.params.username}-es`), highlights: ModContent.value.es.highlights, schedule: ModContent.value.es.schedule }
  };
  
  // met à jour l'état local selon la langue
  const lang = currentLanguage.value || 'fr';
  const finalContent = resolveLocalizedProviderContent(providerData, lang);
  
  pageTitle.value = stripHtml(finalContent?.pageTitle) || currentProvider.value?.companyName || currentProvider.value?.username;
  titleDescription.value = stripHtml(finalContent?.titleDescription) || t('provider.defaults.title_desc');
  servicesSubtitle.value = stripHtml(finalContent?.servicesSubtitle) || t('provider.defaults.services_subtitle');
  aboutDescription.value = stripHtml(finalContent?.aboutDescription) || t('provider.defaults.about_desc');

  if (Array.isArray(finalContent?.services) && finalContent.services.length) {
    services.value = normalizeServicesList(finalContent.services, route.params.username || 'service').map(service => ({
      ...service,
      title: stripHtml(service.title),
      description: stripHtml(service.description)
    }));
  } else {
    loadDefaultServices(currentProvider.value?.category, route.params.username || 'service');
  }
  
  if (Array.isArray(finalContent?.highlights) && finalContent.highlights.length) {
    highlights.value = finalContent.highlights.map(h => ({ ...h }));
  } else {
    highlights.value = getDefaultHighlights();
  }
  if (Array.isArray(finalContent?.schedule) && finalContent.schedule.length) {
    schedule.value = finalContent.schedule.map(s => ({ ...s }));
  } else {
    schedule.value = getDefaultSchedule();
  }
  
  imageLink.value = providerData.logos.normal;
  imageLinkDark.value = providerData.logos.alternate || imageLink.value;
  
  providersStore.setProviderContent(route.params.username, providerData)
  
  showEditor.value = false;
}

function cancelEdit() {
  showEditor.value = false;
}


</script>

<style scoped>
@import '@/assets/provider.css';

.dashboard-toolbar {
  position: fixed;
  top: 60px; /* juste sous la navbar */
  left: 0;
  right: 0;
  background: #1a1a1a;
  color: white;
  padding: 0.75rem 2rem;
  z-index: 900;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.toolbar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-label {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.toolbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.mode-switch {
  display: flex;
  background: rgba(255,255,255,0.1);
  padding: 4px;
  border-radius: 8px;
  gap: 2px;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: transparent;
  color: #aaa;
  transition: all 0.2s ease;
}

.switch-btn:hover {
  color: #fff;
}

.switch-btn.active {
  background: #be123c;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.separator {
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.15);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255,255,255,0.1);
  background: #2b2b2b;
  color: white;
  text-decoration: none;
}

.toolbar-btn:hover {
  background: rgba(255,255,255,0.1);
}

.toolbar-btn.active {
  background: #be123c;
  border-color: #be123c;
}

.toolbar-btn.secondary {
  background: transparent;
  border-color: rgba(255,255,255,0.2);
}

/* Ajustement pour ne pas cacher le contenu sous la toolbar fixe */
.hero-section.has-toolbar {
  margin-top: 80px;
}

/* Styles pour l'état de chargement */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Inter', sans-serif;
}

.loading-content {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #E72D55;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  font-size: 1.1rem;
  color: #666666;
  margin: 0;
}



/* Mode sombre pour le chargement */
html.dark-mode .loading-container {
  background: #0a0a0a;
}

html.dark-mode .loading-content p {
  color: #b0b0b0;
}

/* Dark mode styles for DynamicProvider page */
html.dark-mode .hero-section {
  background: #0a0a0a;
}

html.dark-mode .hero-text h2,
html.dark-mode .hero-subtitle,
html.dark-mode .hero-badge .badge-text {
  color: #ffffff;
}

html.dark-mode .hero-badge {
  background: linear-gradient(135deg, #E72D55, #ff4757);
}

html.dark-mode .hero-image img {
  filter: none;
  /* ensure images remain visible on dark bg */
}

html.dark-mode .services-section,
html.dark-mode .info-section {
  background: #0a0a0a;
}

/* Style pour le titre 'Nos Services' en mode sombre */
html.dark-mode .services-section .section-header h3,
html.dark-mode .services-section .section-header .title h3 {
  color: #ffffff;
}

html.dark-mode .service-card {
  background: #151515;
  color: #e6e6e6;
  box-shadow: none;
  border: 1px solid #222;
}

html.dark-mode .service-card p,
html.dark-mode .service-card h4 {
  color: #ddd;
}

html.dark-mode .info-text p,
html.dark-mode .info-text h3 {
  color: #e6e6e6;
}

/* Style pour la carte des horaires d'ouverture en mode sombre */
html.dark-mode .visual-card {
  background: #151515;
  border: 1px solid #333;
}

html.dark-mode .visual-card h4 {
  color: #ffffff;
}

html.dark-mode .schedule-item .day,
html.dark-mode .schedule-item .hours {
  color: #e6e6e6;
}

/* Editor panel dark */
html.dark-mode .editor-panel {
  background: #0f0f0f;
  border-top-color: #222;
}

html.dark-mode .editor-container {
  color: #e6e6e6;
}

html.dark-mode .form-row input,
html.dark-mode .form-row textarea {
  background: #1a1a1a;
  border-color: #333;
  color: #e6e6e6;
}

html.dark-mode .form-row label {
  color: #ddd;
}

html.dark-mode .editor-actions button {
  background: #be123c;
  color: #fff;
  border: 1px solid #be123c;
}

.form-group-label {
  margin: 0;
  font-weight: 600;
  color: #374151;
}

html.dark-mode .form-group-label {
  color: #ddd;
}

/* Garder les cases à damier en noir et blanc pour les deux modes */
/* Suppression des styles dark-mode pour checkered-square */
/* Les cases restent ainsi noir (#000) et blanc (#fff) peu importe le mode */

/* make sure hero image container blends well */
html.dark-mode .hero-image {
  background: transparent;
}

/* Styles pour l'éditeur d'image */
.image-inline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.imageForm {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #ddd;
  background: #f8f9fa;
}

html.dark-mode .imageForm {
  border-color: #333;
  background: #1a1a1a;
}

.image-inline input[type="file"] {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

html.dark-mode .image-inline input[type="file"] {
  border-color: #333;
  background: #1a1a1a;
  color: #e6e6e6;
}

/* Logo Toggling */
.logo-dark { display: none; }
html.dark-mode .logo-light { display: none; }
html.dark-mode .logo-dark { display: block; }
html.dark-mode .logo-dark[src="/gp_logo.png"] {
  filter: brightness(0) invert(1);
}

/* Editor Tabs */
.editor-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.editor-tabs button {
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
}

.editor-tabs button.active {
  background: #be123c;
  color: white;
}

html.dark-mode .editor-tabs {
  border-color: #333;
}

html.dark-mode .editor-tabs button {
  color: #aaa;
}

html.dark-mode .editor-tabs button.active {
  background: #be123c;
  color: white;
}

.service-card {
  position: relative;
}

.service-card.is-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card.is-clickable:hover,
.service-card.is-clickable:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(231, 45, 85, 0.15);
}

.service-card-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #be123c;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  text-transform: uppercase;
}

html.dark-mode .service-card-badge {
  background: #be123c;
  color: #fff;
}

.services-editor .service-edit-item {
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.75rem;
  background: #fff;
  gap: 0.75rem;
}

html.dark-mode .services-editor .service-edit-item {
  border-color: #333;
  background: #0f0f0f;
}

.service-edit-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.service-url-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.service-url-field input {
  font-weight: 400;
}

.service-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.service-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}

.service-visibility {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.service-visibility select {
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

html.dark-mode .service-visibility select {
  background: #111;
  border-color: #333;
  color: #fff;
}

.service-delete {
  align-self: flex-end;
  background: #fee2e2;
  color: #b91c1c;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.service-delete:hover {
  background: #fecaca;
}

html.dark-mode .service-delete {
  background: #7f1d1d;
  color: #fee2e2;
}

/* Logos Grid */
.logos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.logo-input span {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.dark-preview {
  background: #1a1a1a !important;
  border-color: #333 !important;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.checkbox-row input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.checkbox-row label {
  margin: 0;
  font-weight: normal;
  cursor: pointer;
}

.logo-input.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.editor-section {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.editor-section:last-child {
  border-bottom: none;
}

.editor-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color, #374151);
}

/* Simple inputs for text fields */
.simple-input,
.simple-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text-color, #374151);
  background: var(--bg-color, #fff);
  transition: border-color 0.2s ease;
}

.simple-input:focus,
.simple-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #e11d48);
}

.simple-textarea {
  resize: vertical;
  min-height: 60px;
}

html.dark-mode .simple-input,
html.dark-mode .simple-textarea {
  background: #1f2937;
  border-color: #374151;
  color: #f9fafb;
}
</style>