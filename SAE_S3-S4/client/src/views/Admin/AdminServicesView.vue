<template>
  <div class="admin-container">
    <AdminSidebar />
    
    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <h1>{{ t('admin.services.page_title') }}</h1>
          <p class="section-subtitle">{{ t('admin.services.subtitle') }}</p>
        </div>

        <div v-if="providers.length === 0" class="empty-content">
          <p>{{ t('admin.services.no_providers') }}</p>
        </div>

        <div v-else class="providers-list">
          <div 
            v-for="provider in providers" 
            :key="provider.id"
            class="provider-card"
          >
            <div class="provider-header">
              <div class="provider-info">
                <h2>{{ provider.displayName }}</h2>
                <span class="provider-category">{{ getCategoryLabel(provider.category) }}</span>
              </div>
              <button 
                class="btn-toggle"
                @click="toggleProvider(provider.id)"
              >
                {{ expandedProviders.includes(provider.id) ? t('admin.services.collapse') : t('admin.services.edit') }}
              </button>
            </div>

            <div v-if="expandedProviders.includes(provider.id)" class="provider-content">
              <div class="language-tabs">
                <button 
                  v-for="lang in ['fr', 'en', 'es']" 
                  :key="lang"
                  :class="{ active: editingLang[provider.id] === lang }"
                  @click="editingLang[provider.id] = lang"
                  class="tab-btn"
                >
                  {{ lang.toUpperCase() }}
                </button>
              </div>

              <div class="settings-section">
                <h3>{{ t('admin.services.settings') }}</h3>
                <label class="settings-toggle">
                  <input 
                    type="checkbox" 
                    v-model="getProviderSettings(provider.id).hasStatsAccess"
                  />
                  <span>{{ t('admin.services.stats_access') }}</span>
                </label>
                <p class="settings-description">
                  {{ t('admin.services.stats_access_desc') }}
                </p>
                
                <label class="settings-toggle">
                  <input 
                    type="checkbox" 
                    v-model="getProviderSettings(provider.id).hasGuestbookAccess"
                  />
                  <span>{{ t('admin.services.guestbook_access') }}</span>
                </label>
                <p class="settings-description">
                  {{ t('admin.services.guestbook_access_desc') }}
                </p>
              </div>

              <div class="services-section">
                <h3>Services ({{ (editingLang[provider.id] || 'fr').toUpperCase() }})</h3>
                
                <div 
                  v-for="(service, index) in getProviderServices(provider.id, editingLang[provider.id] || 'fr')"
                  :key="index"
                  class="service-item"
                >
                  <div class="service-fields">
                    <input 
                      v-model="service.title" 
                      type="text" 
                      :placeholder="t('admin.services.service_name_placeholder')"
                      class="input-field"
                    />
                    <input 
                      v-model="service.description" 
                      type="text" 
                      :placeholder="t('admin.services.service_desc_placeholder')"
                      class="input-field"
                    />
                    <input 
                      v-model="service.url" 
                      type="text" 
                      :placeholder="t('admin.services.url_placeholder')"
                      class="input-field"
                    />
                    <div class="service-meta">
                      <label class="service-toggle">
                        <input type="checkbox" v-model="service.enabled" />
                        <span>{{ t('admin.services.active') }}</span>
                      </label>
                      <label class="service-visibility">
                        <span>{{ t('admin.services.visibility') }}</span>
                        <select v-model="service.visibility">
                          <option value="public">{{ t('admin.services.visibility_public') }}</option>
                          <option value="private">{{ t('admin.services.visibility_private') }}</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <button 
                    @click="removeService(provider.id, editingLang[provider.id] || 'fr', index)"
                    class="btn-delete"
                    :title="t('admin.services.delete')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>

                <button 
                  @click="addService(provider.id, editingLang[provider.id] || 'fr')"
                  class="btn-add-service"
                >
                  {{ t('admin.services.add_service') }}
                </button>
              </div>

              <div class="actions">
                <button @click="saveProvider(provider.id)" class="btn-save">
                  {{ t('admin.services.save_changes') }}
                </button>
                <button @click="cancelEdit(provider.id)" class="btn-cancel">
                  {{ t('admin.services.cancel') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import AdminSidebar from '@/components/Admin/AdminSidebar.vue';
import { useProvidersStore } from '@/stores/providers.js';
import { useI18n } from '@/composables/useI18n.js';

const { t } = useI18n();
const providersStore = useProvidersStore();

const providers = computed(() => providersStore.partnersCatalog);
const expandedProviders = ref([]);
const editingLang = reactive({});
const editingContent = reactive({});

function normalizeServices(services = []) {
  return (services || []).map(service => ({
    title: service.title || '',
    description: service.description || '',
    visibility: service.visibility === 'private' ? 'private' : 'public',
    enabled: service.enabled !== false,
    url: typeof service.url === 'string' ? service.url.trim() : ''
  }));
}

// initialise le contenu d'édition quand on ouvre un prestataire
function toggleProvider(providerId) {
  const index = expandedProviders.value.indexOf(providerId);
  if (index > -1) {
    expandedProviders.value.splice(index, 1);
  } else {
    expandedProviders.value.push(providerId);
    if (!editingLang[providerId]) {
      editingLang[providerId] = 'fr';
    }
    loadProviderForEdit(providerId);
  }
}

function loadProviderForEdit(providerId) {
  const provider = providers.value.find(p => p.id === providerId);
  if (!provider) return;

  const content = providersStore.getProviderContent(provider.username) || {};
  
  editingContent[providerId] = {
    fr: {
      pageTitle: content.fr?.pageTitle || provider.companyName || '',
      titleDescription: content.fr?.titleDescription || '',
      servicesSubtitle: content.fr?.servicesSubtitle || '',
      aboutDescription: content.fr?.aboutDescription || '',
      services: normalizeServices(content.fr?.services || provider.services || [])
    },
    en: {
      pageTitle: content.en?.pageTitle || provider.companyName || '',
      titleDescription: content.en?.titleDescription || '',
      servicesSubtitle: content.en?.servicesSubtitle || '',
      aboutDescription: content.en?.aboutDescription || '',
      services: normalizeServices(content.en?.services || provider.services || [])
    },
    es: {
      pageTitle: content.es?.pageTitle || provider.companyName || '',
      titleDescription: content.es?.titleDescription || '',
      servicesSubtitle: content.es?.servicesSubtitle || '',
      aboutDescription: content.es?.aboutDescription || '',
      services: normalizeServices(content.es?.services || provider.services || [])
    },
    logos: content.logos || {
      normal: provider.imageLink,
      alternate: provider.imageLinkDark
    },
    settings: {
      hasStatsAccess: content.settings?.hasStatsAccess ?? provider.hasStatsAccess === true,
      hasGuestbookAccess: content.settings?.hasGuestbookAccess ?? provider.hasGuestbookAccess !== false
    }
  };
}

function getProviderServices(providerId, lang) {
  if (!editingContent[providerId] || !editingContent[providerId][lang]) {
    return [];
  }
  return editingContent[providerId][lang].services;
}

function getProviderSettings(providerId) {
  if (!editingContent[providerId]) {
    editingContent[providerId] = { settings: { hasStatsAccess: false, hasGuestbookAccess: true } };
  }
  if (!editingContent[providerId].settings) {
    editingContent[providerId].settings = { hasStatsAccess: false, hasGuestbookAccess: true };
  }
  return editingContent[providerId].settings;
}

function addService(providerId, lang) {
  if (!editingContent[providerId] || !editingContent[providerId][lang]) return;
  
  editingContent[providerId][lang].services.push({
    title: '',
    description: '',
    url: '',
    visibility: 'public',
    enabled: true
  });
}

function removeService(providerId, lang, index) {
  if (!editingContent[providerId]) return;
  
  // supprime le service dans toutes les langues
  ['fr', 'en', 'es'].forEach(language => {
    if (editingContent[providerId][language] && editingContent[providerId][language].services[index]) {
      editingContent[providerId][language].services.splice(index, 1);
    }
  });
}

function saveProvider(providerId) {
  const provider = providers.value.find(p => p.id === providerId);
  if (!provider || !editingContent[providerId]) return;

  providersStore.setProviderContent(provider.username, editingContent[providerId]);
  
  // ferme l'éditeur
  const index = expandedProviders.value.indexOf(providerId);
  if (index > -1) {
    expandedProviders.value.splice(index, 1);
  }
}

function cancelEdit(providerId) {
  const index = expandedProviders.value.indexOf(providerId);
  if (index > -1) {
    expandedProviders.value.splice(index, 1);
  }
  delete editingContent[providerId];
}

function getCategoryLabel(category) {
  const labels = {
    gaming: 'Gaming',
    beverages: 'Boissons',
    food: 'Restauration',
    karting: 'Karting',
    camping: 'Camping',
    music: 'Musique'
  };
  return labels[category] || category;
}
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

html.dark-mode .empty-content {
  background: #1a1a1a;
  border-color: rgba(231, 45, 85, 0.3);
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.provider-card {
  background: var(--surface-card-strong);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.provider-info h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 0.25rem;
}

.provider-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--surface-muted);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-toggle {
  padding: 0.5rem 1.25rem;
  background: #be123c;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: #9f1239;
  transform: translateY(-1px);
}

.provider-content {
  padding: 1.5rem;
  background: var(--surface-gradient-end);
}

.language-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: #E72D55;
}

.tab-btn.active {
  color: #E72D55;
  border-bottom-color: #E72D55;
}

.services-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #000000;
  margin: 0 0 1rem;
}

.service-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}

.service-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.service-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
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
  font-size: 0.85rem;
  gap: 0.25rem;
  font-weight: 600;
}

.service-visibility select {
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #d0d0d0;
}

html.dark-mode .service-visibility select {
  background: #0a0a0a;
  border-color: rgba(231, 45, 85, 0.3);
  color: #fff;
}

/* section des réglages */
.settings-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.settings-section h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #333333;
  margin: 0 0 1rem;
}

.settings-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}

.settings-toggle input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.settings-description {
  margin: 0.5rem 0 0 1.75rem;
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

html.dark-mode .settings-section {
  background: #0a0a0a;
  border-color: rgba(231, 45, 85, 0.2);
}

html.dark-mode .settings-section h3 {
  color: #ffffff;
}

html.dark-mode .settings-description {
  color: #999;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #E72D55;
}

.btn-delete {
  padding: 0.75rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
}

.btn-delete:hover {
  background: #fee;
  border-color: #dc2626;
}

.btn-add-service {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: #ffffff;
  border: 2px dashed #d0d0d0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-service:hover {
  border-color: #E72D55;
  color: #9f1239;
  background: #fbcfe8;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #15803d;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #166534;
  transform: translateY(-1px);
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #6b7280;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.empty-content {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  color: #666666;
}

/* styles du mode sombre */
html.dark-mode .provider-card {
  background: #1a1a1a;
  border-color: rgba(231, 45, 85, 0.3);
}

html.dark-mode .provider-header {
  border-bottom-color: rgba(231, 45, 85, 0.2);
}

html.dark-mode .provider-info h2 {
  color: #ffffff;
}

html.dark-mode .provider-category {
  background: #9f1239;
  color: #ffffff;
}

html.dark-mode .provider-content {
  background: #0f0f0f;
}

html.dark-mode .language-tabs {
  border-bottom-color: rgba(231, 45, 85, 0.2);
}

html.dark-mode .tab-btn {
  color: #999999;
}

html.dark-mode .tab-btn:hover {
  color: #E72D55;
}

html.dark-mode .services-section h3 {
  color: #ffffff;
}

html.dark-mode .input-field {
  background: #0a0a0a;
  border-color: rgba(231, 45, 85, 0.3);
  color: #ffffff;
}

html.dark-mode .input-field:focus {
  border-color: #E72D55;
}

html.dark-mode .btn-delete {
  background: #0a0a0a;
  border-color: rgba(231, 45, 85, 0.3);
  color: #ef4444;
}

html.dark-mode .btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

html.dark-mode .btn-add-service {
  background: #0a0a0a;
  border-color: rgba(231, 45, 85, 0.3);
  color: #999999;
}

html.dark-mode .btn-add-service:hover {
  border-color: #fb7185;
  color: #fff1f2;
  background: rgba(159, 18, 57, 0.78);
}

html.dark-mode .actions {
  border-top-color: rgba(231, 45, 85, 0.2);
}

/* responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 220px;
    padding: 1.5rem;
  }

  .provider-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .service-item {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
    padding: 1rem;
  }
}
</style>
