<template>
  <div class="shop-item-view">
    <!-- bouton retour -->
    <div class="back-bar">
      <button class="btn-back" @click="$router.push({ name: 'shop' })">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        {{ t('shop_item.back') }}
      </button>
    </div>

    <!-- contenu introuvable -->
    <div v-if="!item" class="not-found">
      <h2>{{ t('shop_item.not_found_title') }}</h2>
      <p>{{ t('shop_item.not_found_desc') }}</p>
      <button class="btn-back-home" @click="$router.push({ name: 'shop' })">
        {{ t('shop_item.back') }}
      </button>
    </div>

    <!-- detail produit -->
    <div v-else class="item-detail">
      <div class="item-gallery">
        <div class="main-image">
          <img :src="item.image" :alt="localizedItem?.title || item.title" />
        </div>
        <div class="stock-indicator" :class="stockClass">
          <span class="stock-dot"></span>
          {{ stockLabel }}
        </div>
      </div>

      <div class="item-info">
        <p class="item-category">{{ formatCategory(item.category) }}</p>
        <h1 class="item-title">{{ localizedItem?.title || item.title }}</h1>

        <div class="item-price-block">
          <span class="price-value">{{ item.price.toFixed(2) }}€</span>
        </div>

        <p class="item-description">{{ localizedItem?.description || item.description }}</p>

        <div v-if="item.tags?.length" class="item-tags">
          <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="quantity-selector">
          <label for="quantity-display">{{ t('shop_item.quantity') }}</label>
          <div class="qty-controls">
            <button class="qty-btn" @click="decrementQty" :disabled="quantity <= 1">−</button>
            <input id="quantity-display" class="qty-value qty-input-display" type="number" :value="quantity" readonly />
            <button class="qty-btn" @click="incrementQty" :disabled="quantity >= remainingStock">+</button>
          </div>
        </div>

        <button
          class="btn-add-cart-detail"
          :disabled="item.stock <= 0 || remainingStock <= 0"
          @click="addToCart"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/>
          </svg>
          {{ item.stock > 0 ? t('shop_item.add_to_cart') : t('shop_item.out_of_stock') }}
        </button>

        <div v-if="addedMessage" class="added-confirmation">
          ✓ {{ addedMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import providerProductService from '@/services/providerProduct.service.js'
import { useCartStore } from '@/stores/cart.js'
import { useI18n } from '@/composables/useI18n.js'
import { useLanguage } from '@/composables/useLanguage.js'

const route = useRoute()
const cartStore = useCartStore()
const { t } = useI18n()
const { currentLanguage } = useLanguage()

const item = ref(null)
const quantity = ref(1)
const addedMessage = ref('')

onMounted(async () => {
  const result = await providerProductService.getPublicProductById(route.params.id)
  item.value = result.error === 0 ? result.data : null
})

function resolveLocalizedField(product, fieldName) {
  const i18nMap = product?.[`${fieldName}I18n`] || {}
  const lang = currentLanguage.value || 'fr'

  if (typeof i18nMap[lang] === 'string' && i18nMap[lang].trim()) {
    return i18nMap[lang].trim()
  }

  for (const fallbackLang of ['fr', 'en', 'es']) {
    if (typeof i18nMap[fallbackLang] === 'string' && i18nMap[fallbackLang].trim()) {
      return i18nMap[fallbackLang].trim()
    }
  }

  const raw = product?.[fieldName]
  return typeof raw === 'string' ? raw : ''
}

const localizedItem = computed(() => {
  if (!item.value) return null
  return {
    ...item.value,
    title: resolveLocalizedField(item.value, 'title'),
    description: resolveLocalizedField(item.value, 'description')
  }
})

const stockClass = computed(() => {
  if (!item.value) return ''
  if (item.value.stock <= 0) return 'out-of-stock'
  if (item.value.stock <= 10) return 'low-stock'
  return 'in-stock'
})

const stockLabel = computed(() => {
  if (!item.value) return ''
  if (item.value.stock <= 0) return t('shop_item.out_of_stock')
  if (item.value.stock <= 10) return t('shop_item.low_stock', { stock: item.value.stock })
  return t('shop_item.in_stock', { stock: item.value.stock })
})

const remainingStock = computed(() => {
  if (!item.value) return 0
  const cartEntry = cartStore.items.find(i => i.ticketId === item.value.id)
  const inCart = cartEntry ? cartEntry.quantity : 0
  return Math.max(0, item.value.stock - inCart)
})

function formatCategory(cat) {
  if (!cat) return ''
  return cat.replaceAll('merch-', '').replaceAll('-', ' ').replaceAll(/\b\w/g, c => c.toUpperCase())
}

function incrementQty() {
  if (item.value && quantity.value < remainingStock.value) {
    quantity.value++
  }
}

function decrementQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function addToCart() {
  if (!item.value || item.value.stock <= 0) return
  const toAdd = Math.min(quantity.value, remainingStock.value)
  if (toAdd <= 0) {
    addedMessage.value = t('shop_item.stock_max')
    setTimeout(() => { addedMessage.value = '' }, 3000)
    return
  }
  for (let i = 0; i < toAdd; i++) {
    cartStore.addItem({
      id: item.value.id,
      name: localizedItem.value?.title || item.value.title,
      price: item.value.price,
      type: item.value.providerId ? 'shop' : 'merch',
      stock: item.value.stock,
      image: item.value.image
    })
  }
  addedMessage.value = t('shop_item.added_to_cart', { count: toAdd, title: localizedItem.value?.title || item.value.title })
  quantity.value = 1
  setTimeout(() => { addedMessage.value = '' }, 3000)
}
</script>

<style scoped>
.shop-item-view {
  min-height: 100vh;
  background: var(--surface-gradient-start);
  color: var(--text-strong);
  font-family: 'Inter', sans-serif;
  padding: 2rem;
}

/* bouton retour */
.back-bar {
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #E72D55;
}

.btn-back svg {
  width: 20px;
  height: 20px;
}

/* etat introuvable */
.not-found {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.not-found h2 {
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 1rem;
  color: var(--text-strong);
}

.not-found p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.btn-back-home {
  background: #E72D55;
  color: var(--text-invert);
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back-home:hover {
  background: #d01d47;
}

/* detail produit */
.item-detail {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* galerie image */
.item-gallery {
  position: relative;
}

.main-image {
  background: var(--surface-card-strong);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 8px 24px var(--card-shadow);
}

.main-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  aspect-ratio: 1 / 1;
}

.stock-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stock-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.in-stock { background: #d4edda; color: #155724; }
.in-stock .stock-dot { background: #28a745; }
.low-stock { background: #fff3cd; color: #856404; }
.low-stock .stock-dot { background: #ffc107; }
.out-of-stock { background: #f8d7da; color: #721c24; }
.out-of-stock .stock-dot { background: #dc3545; }

/* infos produit */
.item-info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.item-category {
  font-size: 0.85rem;
  font-weight: 700;
  color: #E72D55;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.item-title {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-strong);
  margin: 0;
  line-height: 1.2;
}

.item-price-block {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.price-value {
  font-size: 2rem;
  font-weight: 900;
  color: #E72D55;
}

.item-description {
  font-size: 1rem;
  color: var(--text-soft);
  line-height: 1.7;
  margin: 0;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--surface-chip);
  color: var(--text-strong);
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* selecteur de quantite */
.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quantity-selector label {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-soft);
}

.qty-controls {
  display: inline-flex;
  align-items: center;
  border: 2px solid var(--border-subtle);
  border-radius: 10px;
  overflow: hidden;
  width: fit-content;
}

.qty-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: var(--surface-muted);
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--text-strong);
  transition: background 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: var(--surface-chip);
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-value {
  width: 50px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-strong);
}

/* bouton ajouter */
.btn-add-cart-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 1rem;
  background: #E72D55;
  color: var(--text-invert);
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-add-cart-detail svg {
  width: 22px;
  height: 22px;
}

.btn-add-cart-detail:hover:not(:disabled) {
  background: #d01d47;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 45, 85, 0.3);
}

.btn-add-cart-detail:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.added-confirmation {
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-text);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* mode sombre */
html.dark-mode .shop-item-view {
  background: var(--surface-gradient-start);
}

html.dark-mode .btn-back {
  color: var(--text-muted);
}

html.dark-mode .btn-back:hover {
  color: #E72D55;
}

html.dark-mode .not-found h2 {
  color: var(--text-strong);
}

html.dark-mode .not-found p {
  color: var(--text-muted);
}

html.dark-mode .main-image {
  background: var(--surface-card-strong);
  border-color: var(--border-subtle);
}

html.dark-mode .item-title {
  color: var(--text-strong);
}

html.dark-mode .item-description {
  color: var(--text-soft);
}

html.dark-mode .quantity-selector label {
  color: var(--text-soft);
}

html.dark-mode .qty-controls {
  border-color: var(--border-subtle);
}

html.dark-mode .qty-btn {
  background: var(--surface-muted);
  color: var(--text-strong);
}

html.dark-mode .qty-btn:hover:not(:disabled) {
  background: var(--surface-chip);
}

html.dark-mode .qty-value {
  color: var(--text-strong);
}

html.dark-mode .tag {
  background: var(--surface-chip);
}

html.dark-mode .in-stock {
  background: rgba(22, 101, 52, 0.72);
  color: #dcfce7;
}

html.dark-mode .low-stock {
  background: rgba(146, 64, 14, 0.72);
  color: #fef3c7;
}

html.dark-mode .out-of-stock {
  background: rgba(127, 29, 29, 0.72);
  color: #fee2e2;
}

html.dark-mode .added-confirmation {
  background: rgba(22, 101, 52, 0.72);
  border-color: rgba(110, 231, 183, 0.45);
  color: #dcfce7;
}

/* responsive */
@media (max-width: 900px) {
  .item-detail {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .item-title {
    font-size: 1.5rem;
  }

  .price-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .shop-item-view {
    padding: 1rem;
  }

  .item-title {
    font-size: 1.3rem;
  }
}
</style>
