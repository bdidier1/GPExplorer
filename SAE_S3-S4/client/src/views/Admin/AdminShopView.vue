<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <div>
            <h1>{{ t('admin_shop.title') }}</h1>
            <p class="section-subtitle">{{ t('admin_shop.subtitle') }}</p>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" @click="fetchProducts">{{ t('admin_shop.refresh') }}</button>
            <span class="badge">{{ t('admin_shop.products_count', { count: products.length }) }}</span>
          </div>
        </div>

        <div v-if="loading" class="empty-state">
          <p>{{ t('admin_shop.loading') }}</p>
        </div>

        <div v-else-if="products.length === 0" class="empty-state">
          <p>{{ t('admin_shop.no_products') }}</p>
        </div>

        <div v-else class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ t('admin_shop.table.product') }}</th>
                <th>{{ t('admin_shop.table.shop') }}</th>
                <th>{{ t('admin_shop.table.price') }}</th>
                <th>{{ t('admin_shop.table.stock') }}</th>
                <th class="text-right">{{ t('admin_shop.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td :data-label="t('admin_shop.table.product')">
                  <div class="product-cell">
                    <img :src="product.image || '/img/products/placeholder.jpg'" :alt="product.title" class="product-thumb" />
                    <div>
                      <strong>{{ product.title }}</strong>
                      <p class="muted">{{ product.category || t('admin_shop.table.no_category') }}</p>
                    </div>
                  </div>
                </td>
                <td :data-label="t('admin_shop.table.shop')">
                  <div>
                    <strong>{{ product.provider?.name || t('admin_shop.table.unknown_shop') }}</strong>
                    <p class="muted">{{ product.provider?.category || '' }}</p>
                  </div>
                </td>
                <td :data-label="t('admin_shop.table.price')">{{ Number(product.price).toFixed(2) }} €</td>
                <td :data-label="t('admin_shop.table.stock')">{{ product.stock - (product.sold || 0) }}</td>
                <td class="text-right" :data-label="t('admin_shop.table.actions')">
                  <div class="action-group">
                    <button class="btn-action" @click="openEdit(product)">{{ t('admin_shop.actions.edit') }}</button>
                    <button class="btn-action danger" @click="removeProduct(product)">{{ t('admin_shop.actions.delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ t('admin_shop.modal.edit_title') }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <label>{{ t('admin_shop.modal.name_fr') }}</label>
            <input v-model="formData.titleI18n.fr" type="text" class="form-input" />
          </div>
          <div class="form-grid">
            <div class="form-row">
              <label>{{ t('admin_shop.modal.name_en') }}</label>
              <input v-model="formData.titleI18n.en" type="text" class="form-input" />
            </div>
            <div class="form-row">
              <label>{{ t('admin_shop.modal.name_es') }}</label>
              <input v-model="formData.titleI18n.es" type="text" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <label>{{ t('admin_shop.modal.desc_fr') }}</label>
            <textarea v-model="formData.descriptionI18n.fr" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-grid">
            <div class="form-row">
              <label>{{ t('admin_shop.modal.desc_en') }}</label>
              <textarea v-model="formData.descriptionI18n.en" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-row">
              <label>{{ t('admin_shop.modal.desc_es') }}</label>
              <textarea v-model="formData.descriptionI18n.es" class="form-input" rows="3"></textarea>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-row">
              <label>{{ t('admin_shop.modal.price') }}</label>
              <input v-model.number="formData.price" type="number" min="0" step="0.01" class="form-input" />
            </div>
            <div class="form-row">
              <label>{{ t('admin_shop.modal.stock') }}</label>
              <input v-model.number="formData.stock" type="number" min="0" class="form-input" />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-row">
              <label>{{ t('admin_shop.modal.category') }}</label>
              <input v-model="formData.category" type="text" class="form-input" />
            </div>
            <div class="form-row">
              <label>{{ t('admin_shop.modal.image') }}</label>
              <input v-model="formData.image" type="text" class="form-input" />
            </div>
          </div>
          <p v-if="formError" class="error-message">{{ formError }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">{{ t('admin_shop.modal.cancel') }}</button>
          <button class="btn-primary" :disabled="saving" @click="saveProduct">
            {{ saving ? t('admin_shop.modal.saving') : t('admin_shop.modal.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import providerProductService from '@/services/providerProduct.service.js'
import { useI18n } from '@/composables/useI18n.js'

const { t } = useI18n()

const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const products = ref([])
const selectedProduct = ref(null)
const formError = ref('')

const formData = reactive({
  titleI18n: { fr: '', en: '', es: '' },
  descriptionI18n: { fr: '', en: '', es: '' },
  price: 0,
  stock: 0,
  category: '',
  image: ''
})

function getDisplayTitle(product) {
  const titleI18n = product?.titleI18n || {}
  return titleI18n.fr || titleI18n.en || titleI18n.es || product?.title || ''
}

function getDisplayDescription(product) {
  const descriptionI18n = product?.descriptionI18n || {}
  return descriptionI18n.fr || descriptionI18n.en || descriptionI18n.es || product?.description || ''
}

async function fetchProducts() {
  loading.value = true
  try {
    const result = await providerProductService.getAdminProducts()
    products.value = result.error === 0 ? (result.data || []) : []
  } finally {
    loading.value = false
  }
}

function openEdit(product) {
  selectedProduct.value = product
  formData.titleI18n = {
    fr: product?.titleI18n?.fr || product?.title || '',
    en: product?.titleI18n?.en || '',
    es: product?.titleI18n?.es || ''
  }
  formData.descriptionI18n = {
    fr: product?.descriptionI18n?.fr || product?.description || '',
    en: product?.descriptionI18n?.en || '',
    es: product?.descriptionI18n?.es || ''
  }
  formData.price = Number(product.price) || 0
  formData.stock = Number(product.stock) || 0
  formData.category = product.category || ''
  formData.image = product.image || ''
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedProduct.value = null
}

async function saveProduct() {
  if (!selectedProduct.value) return
  saving.value = true
  formError.value = ''
  try {
    const result = await providerProductService.updateAdminProduct(selectedProduct.value.id, {
      titleI18n: formData.titleI18n,
      descriptionI18n: formData.descriptionI18n,
      title: formData.titleI18n.fr || formData.titleI18n.en || formData.titleI18n.es || '',
      description: formData.descriptionI18n.fr || formData.descriptionI18n.en || formData.descriptionI18n.es || '',
      price: formData.price,
      stock: formData.stock,
      category: formData.category,
      image: formData.image
    })
    if (result.error === 0) {
      await fetchProducts()
      closeModal()
    }
  } catch (error) {
    formError.value = error.message || 'Erreur lors de la mise à jour'
  } finally {
    saving.value = false
  }
}

async function removeProduct(product) {
  if (!window.confirm(t('admin_shop.modal.confirm_delete', { name: product.title }))) return
  try {
    await providerProductService.deleteAdminProduct(product.id)
    await fetchProducts()
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchProducts)
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: var(--surface-gradient-start);
}

.main-content {
  margin-left: 260px;
  width: calc(100% - 260px);
  padding: 6rem 2rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-header h1 {
  color: var(--text-strong);
}

.section-subtitle {
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filters-card,
.table-card {
  background: var(--surface-panel);
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
}

.filters-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.filter-input,
.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  color: #111;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 0.95rem 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  text-align: left;
  vertical-align: middle;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 0.95rem 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  text-align: left;
  vertical-align: middle;
  color: var(--text-soft);
}

.text-right {
  text-align: right;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.product-cell strong {
  color: var(--text-strong);
}

.product-thumb {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 12px;
  background: #f3f4f6;
}

.muted {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
  font-size: 0.88rem;
}

.status-badge,
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: #7f1d3a;
  color: #fff;
}

.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #fef3c7; color: #92400e; }
.status-badge.deleted { background: #fee2e2; color: #991b1b; }

.action-group {
  display: inline-flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-action,
.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action { background: #e5e7eb; color: #111827; }
.btn-action:hover { background: #d1d5db; }
.btn-action.warning { background: #fef3c7; }
.btn-action.danger { background: #fee2e2; color: #991b1b; }
.btn-action.danger:hover { background: #fecaca; }

.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-primary {
  background: #7f1d3a;
  color: #fff;
}

.btn-primary:hover {
  background: #9f1239;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 200;
}

.modal-content {
  width: min(760px, 100%);
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
}

.modal-header,
.modal-footer {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.modal-header h2 {
  color: #111;
  margin: 0;
}

.modal-body {
  padding: 0 1.25rem 1.25rem;
}

.modal-body label {
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 1rem;
}

.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.error-message {
  color: #b91c1c;
  margin: 0;
}

.btn-close {
  border: none;
  background: transparent;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
}

.btn-close:hover {
  color: #111;
}

/* mode sombre */
html.dark-mode .admin-container {
  background: var(--surface-gradient-start);
}

html.dark-mode .main-content {
  background: var(--surface-gradient-end);
}

html.dark-mode .section-header h1 {
  color: #fff;
}

html.dark-mode .table-card,
html.dark-mode .filters-card {
  background: #1a1a1a;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

html.dark-mode .data-table th {
  color: #999;
  border-bottom-color: #333;
}

html.dark-mode .data-table td {
  color: #ccc;
  border-bottom-color: #333;
}

html.dark-mode .product-cell strong {
  color: #fff;
}

html.dark-mode .product-thumb {
  background: #2a2a2a;
}

html.dark-mode .muted {
  color: #888;
}

html.dark-mode .filter-input,
html.dark-mode .form-input {
  background: #2a2a2a;
  border-color: #444;
  color: #fff;
}

html.dark-mode .filter-input::placeholder,
html.dark-mode .form-input::placeholder {
  color: #888;
}

html.dark-mode .btn-action {
  background: #2a2a2a;
  color: #d1d5db;
}

html.dark-mode .btn-action:hover {
  background: #3a3a3a;
}

html.dark-mode .btn-action.danger {
  background: #7f1d1d;
  color: #fecaca;
}

html.dark-mode .btn-action.danger:hover {
  background: #991b1b;
}

html.dark-mode .btn-secondary {
  background: #2a2a2a;
  color: #d1d5db;
}

html.dark-mode .btn-secondary:hover {
  background: #3a3a3a;
}

html.dark-mode .modal-content {
  background: #1a1a1a;
}

html.dark-mode .modal-header h2 {
  color: #fff;
}

html.dark-mode .modal-body label {
  color: #ccc;
}

html.dark-mode .btn-close {
  color: #999;
}

html.dark-mode .btn-close:hover {
  color: #fff;
}

html.dark-mode .empty-state {
  color: #888;
}

/* responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 220px;
    width: calc(100% - 220px);
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
    width: calc(100% - 70px);
    padding: 5.5rem 1rem 1rem;
  }

  .section-header,
  .filters-row,
  .form-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .section-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .data-table thead {
    display: none;
  }

  .data-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 0.5rem;
  }

  html.dark-mode .data-table tr {
    border-color: #333;
  }

  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
    padding: 0.5rem 0.75rem;
  }

  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .data-table td.text-right {
    justify-content: flex-end;
  }

  .data-table td.text-right::before {
    display: none;
  }

  .product-cell {
    flex-direction: row;
  }

  .action-group {
    width: 100%;
    justify-content: stretch;
  }

  .action-group .btn-action {
    flex: 1;
    text-align: center;
  }
}
</style>
