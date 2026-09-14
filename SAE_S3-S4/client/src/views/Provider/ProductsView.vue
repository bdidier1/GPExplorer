<template>
  <div class="provider-container">
    <ProviderSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <div>
            <h1>{{ t('provider_products.title') }}</h1>
            <p class="section-subtitle">{{ t('provider_products.subtitle') }}</p>
          </div>
          <button class="btn-add" @click="openAddModal">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            {{ t('provider_products.add_product') }}
          </button>
        </div>

        <!-- liste des produits -->
        <div class="products-list" v-if="products.length > 0">
          <div class="product-card" v-for="product in products" :key="product.id">
            <div class="product-image">
              <img :src="product.image || '/img/products/placeholder.jpg'" :alt="getProductTitle(product)" />
            </div>
            <div class="product-info">
              <h3>{{ getProductTitle(product) }}</h3>
              <p class="product-description">{{ getProductDescription(product) }}</p>
              <div class="product-meta">
                <span class="product-price">{{ Number(product.price).toFixed(2) }}€</span>
                <span class="product-stock">{{ t('provider_products.stock_label', { available: product.stock - (product.sold || 0), total: product.stock }) }}</span>
              </div>
              <div class="product-tags" v-if="product.tags && product.tags.length">
                <span class="tag" v-for="tag in product.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="product-actions">
              <button class="btn-edit" @click="openEditModal(product)">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                {{ t('provider_products.edit') }}
              </button>
              <button class="btn-delete" @click="removeProduct(product.id)">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                {{ t('provider_products.delete') }}
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else>
          <p>{{ t('provider_products.empty') }}</p>
          <button class="btn-add-large" @click="openAddModal">{{ t('provider_products.add_first') }}</button>
        </div>

        <!-- modale ajouter ou modifier -->
        <div class="modal-overlay" v-if="showModal" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>{{ isEditMode ? t('provider_products.modal_edit_title') : t('provider_products.modal_add_title') }}</h2>
              <button class="btn-close" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-field">
                <p class="group-label">{{ t('provider_products.label_title') }}</p>
                <div class="i18n-grid">
                  <div class="i18n-field">
                    <label for="provider-product-title-fr">{{ t('provider_products.label_title_fr') }}</label>
                    <input id="provider-product-title-fr" type="text" v-model="formData.titleI18n.fr" :placeholder="t('provider_products.placeholder_title_fr')" />
                  </div>
                  <div class="i18n-field">
                    <label for="provider-product-title-en">{{ t('provider_products.label_title_en') }}</label>
                    <input id="provider-product-title-en" type="text" v-model="formData.titleI18n.en" :placeholder="t('provider_products.placeholder_title_en')" />
                  </div>
                  <div class="i18n-field">
                    <label for="provider-product-title-es">{{ t('provider_products.label_title_es') }}</label>
                    <input id="provider-product-title-es" type="text" v-model="formData.titleI18n.es" :placeholder="t('provider_products.placeholder_title_es')" />
                  </div>
                </div>
              </div>
              <div class="form-field">
                <p class="group-label">{{ t('provider_products.label_description') }}</p>
                <div class="i18n-grid">
                  <div class="i18n-field">
                    <label for="provider-product-description-fr">{{ t('provider_products.label_description_fr') }}</label>
                    <textarea id="provider-product-description-fr" v-model="formData.descriptionI18n.fr" :placeholder="t('provider_products.placeholder_description_fr')" rows="2"></textarea>
                  </div>
                  <div class="i18n-field">
                    <label for="provider-product-description-en">{{ t('provider_products.label_description_en') }}</label>
                    <textarea id="provider-product-description-en" v-model="formData.descriptionI18n.en" :placeholder="t('provider_products.placeholder_description_en')" rows="2"></textarea>
                  </div>
                  <div class="i18n-field">
                    <label for="provider-product-description-es">{{ t('provider_products.label_description_es') }}</label>
                    <textarea id="provider-product-description-es" v-model="formData.descriptionI18n.es" :placeholder="t('provider_products.placeholder_description_es')" rows="2"></textarea>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label for="provider-product-price">{{ t('provider_products.label_price') }}</label>
                  <input id="provider-product-price" type="number" v-model.number="formData.price" placeholder="0" min="0" step="0.01" />
                </div>
                <div class="form-field">
                  <label for="provider-product-stock">{{ t('provider_products.label_stock') }}</label>
                  <input id="provider-product-stock" type="number" v-model.number="formData.stock" placeholder="0" min="0" />
                </div>
              </div>
              <div class="form-field">
                <label for="provider-product-category">{{ t('provider_products.label_category') }}</label>
                <input id="provider-product-category" type="text" v-model="formData.category" :placeholder="t('provider_products.placeholder_category')" />
              </div>
              <div class="form-field">
                <label for="provider-product-image">{{ t('provider_products.label_image') }}</label>
                <input id="provider-product-image" type="text" v-model="formData.image" :placeholder="t('provider_products.placeholder_image')" />
              </div>
              <div class="form-field">
                <label for="provider-product-tags">{{ t('provider_products.label_tags') }}</label>
                <input id="provider-product-tags" type="text" v-model="tagsInput" :placeholder="t('provider_products.placeholder_tags')" />
              </div>
              <p v-if="formError" class="form-error">{{ formError }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal">{{ t('provider_products.cancel') }}</button>
              <button class="btn-save" @click="saveProduct" :disabled="saving">
                {{ saving ? t('provider_products.saving') : (isEditMode ? t('provider_products.save') : t('provider_products.add')) }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ProviderSidebar from '@/components/Provider/ProviderSidebar.vue'
import providerProductService from '@/services/providerProduct.service.js'
import { useAuthStore } from '@/stores/login.js'
import { get } from '@/services/apiClient.js'
import { useI18n } from '@/composables/useI18n.js'
import { useLanguage } from '@/composables/useLanguage.js'

const SUPPORTED_LANGUAGES = ['fr', 'en', 'es']

const authStore = useAuthStore()
const { t } = useI18n()
const { currentLanguage } = useLanguage()

function createEmptyI18nMap() {
  return { fr: '', en: '', es: '' }
}

function createEmptyFormData() {
  return {
    title: '',
    description: '',
    titleI18n: createEmptyI18nMap(),
    descriptionI18n: createEmptyI18nMap(),
    price: 0,
    stock: 0,
    category: '',
    image: '',
    tags: []
  }
}

function normalizeI18nMap(value, fallback = '') {
  const normalized = createEmptyI18nMap()

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const lang of SUPPORTED_LANGUAGES) {
      const entry = value[lang]
      if (typeof entry === 'string') {
        normalized[lang] = entry.trim()
      }
    }
  }

  if (!SUPPORTED_LANGUAGES.some(lang => normalized[lang]) && typeof fallback === 'string' && fallback.trim()) {
    normalized.fr = fallback.trim()
  }

  return normalized
}

function resolveLocalizedText(i18nMap, fallback = '') {
  const preferred = currentLanguage.value || 'fr'
  if (i18nMap?.[preferred]) {
    return i18nMap[preferred]
  }

  for (const lang of SUPPORTED_LANGUAGES) {
    if (i18nMap?.[lang]) {
      return i18nMap[lang]
    }
  }

  if (typeof fallback === 'string' && fallback.trim()) {
    return fallback.trim()
  }

  return ''
}

function hasTitle(i18nMap) {
  return SUPPORTED_LANGUAGES.some(lang => i18nMap?.[lang]?.trim())
}

function getProductTitle(product) {
  const titleI18n = normalizeI18nMap(product.titleI18n || product.title_i18n, product.title)
  return resolveLocalizedText(titleI18n, product.title)
}

function getProductDescription(product) {
  const descriptionI18n = normalizeI18nMap(product.descriptionI18n || product.description_i18n, product.description)
  return resolveLocalizedText(descriptionI18n, product.description)
}

const products = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const editingProductId = ref(null)
const saving = ref(false)
const formError = ref('')
const tagsInput = ref('')
const formData = ref(createEmptyFormData())

// id du prestataire connecté
const providerId = ref(null)

onMounted(async () => {
  // 1 essaye depuis le store auth
  providerId.value = authStore.user?.providerId

  // 2 si absent le récupère depuis l'api providers
  if (!providerId.value && authStore.user?._id) {
    try {
      const res = await get('/api/providers')
      if (res.error === 0 && res.data) {
        const match = res.data.find(p => p.userId === authStore.user._id)
        if (match) {
          providerId.value = match.id
          if (authStore.user) authStore.user.providerId = match.id
        }
      }
    } catch (e) {
      console.error('Erreur récupération providerId:', e)
    }
  }

  if (!providerId.value) {
    console.warn('Aucun providerId trouvé pour cet utilisateur.')
  }

  await loadProducts()
  globalThis.window?.addEventListener('open-add-product-modal', openAddModal)
})

onBeforeUnmount(() => {
  globalThis.window?.removeEventListener('open-add-product-modal', openAddModal)
})

async function loadProducts() {
  if (!providerId.value) return
  try {
    const result = await providerProductService.getProducts(providerId.value)
    if (result.error === 0) {
      products.value = result.data || []
    } else {
      console.warn('loadProducts: réponse API error', result.message)
    }
  } catch (e) {
    console.error('Erreur chargement produits:', e)
  }
}

function openAddModal() {
  isEditMode.value = false
  editingProductId.value = null
  formError.value = ''
  formData.value = createEmptyFormData()
  tagsInput.value = ''
  showModal.value = true
}

function openEditModal(product) {
  const titleI18n = normalizeI18nMap(product.titleI18n || product.title_i18n, product.title)
  const descriptionI18n = normalizeI18nMap(product.descriptionI18n || product.description_i18n, product.description)

  isEditMode.value = true
  editingProductId.value = product.id
  formError.value = ''
  formData.value = {
    title: resolveLocalizedText(titleI18n, product.title),
    description: resolveLocalizedText(descriptionI18n, product.description),
    titleI18n,
    descriptionI18n,
    price: product.price,
    stock: product.stock,
    category: product.category || '',
    image: product.image || '',
    tags: [...(product.tags || [])]
  }
  tagsInput.value = (product.tags || []).join(', ')
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function saveProduct() {
  const titleI18n = normalizeI18nMap(formData.value.titleI18n, formData.value.title)
  const descriptionI18n = normalizeI18nMap(formData.value.descriptionI18n, formData.value.description)

  if (!hasTitle(titleI18n)) { formError.value = t('provider_products.error_title_i18n_required'); return }
  if (!formData.value.price || formData.value.price <= 0) { formError.value = t('provider_products.error_price_positive'); return }
  if (formData.value.stock == null || formData.value.stock < 0) { formError.value = t('provider_products.error_stock_positive'); return }

  formError.value = ''
  saving.value = true

  const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
  const payload = {
    ...formData.value,
    title: resolveLocalizedText(titleI18n, formData.value.title),
    description: resolveLocalizedText(descriptionI18n, formData.value.description),
    titleI18n,
    descriptionI18n,
    tags
  }

  try {
    if (isEditMode.value) {
      await providerProductService.updateProduct(providerId.value, editingProductId.value, payload)
    } else {
      await providerProductService.addProduct(providerId.value, payload)
    }
    await loadProducts()
    closeModal()
  } catch (e) {
    console.error('Erreur saveProduct:', e)
    formError.value = e.message || t('provider_products.error_save')
  } finally {
    saving.value = false
  }
}

async function removeProduct(productId) {
  if (!confirm(t('provider_products.confirm_delete'))) return
  await providerProductService.deleteProduct(providerId.value, productId)
  await loadProducts()
}
</script>

<style scoped>
.provider-container {
  display: flex;
  min-height: 100vh;
  background: var(--surface-gradient-start, #ffffff);
  font-family: 'Inter', sans-serif;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  padding: 2rem 3rem;
  background: var(--surface-gradient-end, #f8f9fa);
  margin-top: 72px;
}

.content-section {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h1 {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-strong, #000);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0;
}

.section-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted, #666);
  margin: .25rem 0 0;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #be123c, #9f1239);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(231, 45, 85, 0.3);
}
.btn-add svg { width: 20px; height: 20px; }
.btn-add:hover {
  background: linear-gradient(135deg, #c91f45, #a81a38);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(231, 45, 85, 0.4);
}

/* Product cards */
.products-list {
  display: grid;
  gap: 1.25rem;
}

.product-card {
  background: var(--surface-card, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 4px 16px var(--card-shadow, rgba(0,0,0,.06));
  display: grid;
  grid-template-columns: 110px 1fr auto;
  gap: 1.25rem;
  align-items: start;
  transition: border-color .2s;
}
.product-card:hover {
  border-color: rgba(231, 45, 85, 0.3);
}

.product-image {
  width: 110px;
  height: 110px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface-muted, #f0f0f0);
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info h3 {
  margin: 0 0 0.4rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-strong, #000);
  word-break: break-word;
}

.product-description {
  margin: 0 0 .75rem;
  color: var(--text-muted, #666);
  line-height: 1.5;
  font-size: .92rem;
  word-break: break-word;
}

.product-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
}
.product-price {
  font-weight: 800;
  font-size: 1.05rem;
  color: #9f1239;
}
.product-stock {
  color: var(--text-muted, #666);
  font-size: 0.88rem;
  word-break: break-word;
}

.product-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.tag {
  padding: 0.2rem 0.5rem;
  background: #9f1239;
  color: #ffffff;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 160px;
}

.btn-edit,
.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-edit svg, .btn-delete svg { width: 16px; height: 16px; }

.btn-edit {
  background: #1e3a8a;
  color: #ffffff;
  border: 1px solid #1e3a8a;
}
.btn-edit:hover { background: #1e40af; }

.btn-delete {
  background: #991b1b;
  color: #ffffff;
  border: 1px solid #991b1b;
}
.btn-delete:hover { background: #b91c1c; }

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--surface-card, #fff);
  border: 2px dashed var(--border-subtle, #ddd);
  border-radius: 16px;
  color: var(--text-muted, #666);
}
.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.25rem;
}

.btn-add-large {
  padding: 0.9rem 2rem;
  background: linear-gradient(135deg, #be123c, #9f1239);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(231, 45, 85, 0.3);
}
.btn-add-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(231, 45, 85, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--surface-card, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  border-radius: 16px;
  width: 90%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,.3);
  box-sizing: border-box;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle, #e0e0e0);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-strong, #000);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-muted, #666);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}
.btn-close:hover {
  background: var(--surface-muted, #f0f0f0);
  color: var(--text-strong, #000);
}

.modal-body {
  padding: 1.5rem;
}

.form-field {
  margin-bottom: 1.25rem;
}
.group-label {
  margin: 0 0 0.4rem;
  font-weight: 700;
  font-size: .9rem;
  color: var(--text-soft, #333);
}
.form-field label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 700;
  font-size: .9rem;
  color: var(--text-soft, #333);
}
.form-field input,
.form-field textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border-subtle, #ddd);
  border-radius: 8px;
  font-size: .95rem;
  font-family: 'Inter', sans-serif;
  background: var(--surface-muted, #fafafa);
  color: var(--text-strong, #000);
  box-sizing: border-box;
}
.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #E72D55;
}

.i18n-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.i18n-field {
  margin: 0;
}

.i18n-field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted, #666);
}

.i18n-field textarea {
  min-height: 72px;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-error {
  color: #d32f2f;
  font-size: .88rem;
  font-weight: 600;
  margin: 0;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-subtle, #e0e0e0);
  display: flex;
  justify-content: flex-end;
  gap: .75rem;
}

.btn-cancel,
.btn-save {
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: .95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-cancel {
  background: var(--surface-muted, #e0e0e0);
  color: var(--text-soft, #333);
  border: 1px solid var(--border-subtle, #ccc);
}
.btn-cancel:hover { opacity: 0.85; }

.btn-save {
  background: linear-gradient(135deg, #be123c, #9f1239);
  color: white;
  box-shadow: 0 4px 12px rgba(231,45,85,.3);
}
.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(231,45,85,.4);
}
.btn-save:disabled { opacity: .5; cursor: not-allowed; }

/* Dark mode */
html.dark-mode .main-content { background: #0a0a0a; }
html.dark-mode .product-card { background: #1a1a1a; border-color: rgba(231,45,85,.15); }
html.dark-mode .product-card:hover { border-color: rgba(231,45,85,.35); }
html.dark-mode .product-image { background: #252525; }
html.dark-mode .empty-state { background: #1a1a1a; border-color: rgba(231,45,85,.2); }
html.dark-mode .modal-content { background: #1a1a1a; border-color: rgba(231,45,85,.2); }
html.dark-mode .modal-header { border-color: rgba(255,255,255,.08); }
html.dark-mode .modal-footer { border-color: rgba(255,255,255,.08); }
html.dark-mode .form-field input,
html.dark-mode .form-field textarea { background: #252525; border-color: rgba(255,255,255,.1); color: #fff; }
html.dark-mode .form-field input:focus,
html.dark-mode .form-field textarea:focus { border-color: #E72D55; }
html.dark-mode .btn-close:hover { background: #252525; }
html.dark-mode .btn-cancel { background: #252525; border-color: rgba(255,255,255,.1); color: #ccc; }
html.dark-mode .tag { background: rgba(231,45,85,.15); }
html.dark-mode .btn-edit { background: rgba(33,150,243,.12); border-color: rgba(33,150,243,.25); }
html.dark-mode .btn-delete { background: rgba(244,67,54,.1); border-color: rgba(244,67,54,.2); }

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 220px;
    padding: 1.5rem;
  }

  .product-card {
    grid-template-columns: 96px 1fr;
  }

  .product-image {
    width: 96px;
    height: 96px;
  }

  .product-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    min-width: 0;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
    padding: 1rem;
  }

  .section-header {
    align-items: stretch;
    margin-bottom: 1.25rem;
  }

  .section-header h1 {
    font-size: 1.55rem;
  }

  .section-subtitle {
    font-size: 0.9rem;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .products-list {
    gap: 1rem;
  }

  .product-card {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 0.9rem;
  }

  .product-image {
    width: 100%;
    height: 180px;
  }

  .product-actions {
    flex-direction: row;
    justify-content: stretch;
    gap: 0.5rem;
  }

  .btn-edit,
  .btn-delete {
    flex: 1 1 0;
    justify-content: center;
    min-width: 0;
  }

  .modal-content {
    width: calc(100% - 1rem);
    max-height: 92vh;
    border-radius: 12px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-header h2 {
    font-size: 1.1rem;
    padding-right: 0.6rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .i18n-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }

  .section-header h1 {
    font-size: 1.4rem;
  }

  .product-image {
    height: 155px;
  }

  .product-meta {
    gap: 0.45rem;
  }

  .product-price {
    font-size: 1rem;
  }

  .product-stock {
    font-size: 0.82rem;
  }

  .product-actions {
    flex-direction: column;
  }
}
</style>
