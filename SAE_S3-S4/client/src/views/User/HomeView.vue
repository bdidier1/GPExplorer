  <template>
  <div class="user-container">
    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <h1>{{ t('user.dashboard.title') }}</h1>
          <p class="section-subtitle">{{ t('user.dashboard.subtitle') }}</p>
        </div>

        <div class="dashboard-grid">
          <!-- carte informations personnelles -->
          <div class="card">
            <div class="card-header">
              <h3>{{ t('user.profile.personal_info') }}</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit" class="settings-form">
                <div class="form-group">
                  <label for="username">{{ t('auth.register.username_label') }}</label>
                  <input
                    id="username"
                    v-model="formData.username"
                    type="text"
                    class="form-input"
                    :placeholder="t('auth.register.username_placeholder')"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">{{ t('auth.register.first_name_label') }}</label>
                    <input
                      id="firstName"
                      v-model="formData.firstName"
                      type="text"
                      class="form-input"
                      :placeholder="t('auth.register.first_name_placeholder')"
                    />
                  </div>

                  <div class="form-group">
                    <label for="lastName">{{ t('auth.register.last_name_label') }}</label>
                    <input
                      id="lastName"
                      v-model="formData.lastName"
                      type="text"
                      class="form-input"
                      :placeholder="t('auth.register.last_name_placeholder')"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="email">{{ t('auth.register.email_label') }}</label>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    class="form-input"
                    :placeholder="t('auth.register.email_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="phone">{{ t('auth.register.phone_label') }}</label>
                  <input
                    id="phone"
                    v-model="formData.phone"
                    type="tel"
                    class="form-input"
                    :placeholder="t('auth.register.phone_placeholder')"
                  />
                </div>

                <button type="submit" class="btn-save">
                  {{ t('user.profile.save_btn') }}
                </button>
              </form>
            </div>
          </div>

          <!-- carte securite -->
          <div class="card">
            <div class="card-header">
              <h3>{{ t('user.profile.security') }}</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit" class="settings-form">
                <div class="form-group">
                  <label for="currentPassword">{{ t('user.profile.current_password') }}</label>
                  <input
                    id="currentPassword"
                    v-model="formData.currentPassword"
                    type="password"
                    class="form-input"
                    :placeholder="t('user.profile.current_password_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="newPassword">{{ t('user.profile.new_password') }}</label>
                  <input
                    id="newPassword"
                    v-model="formData.newPassword"
                    type="password"
                    class="form-input"
                    :placeholder="t('user.profile.new_password_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="confirmPassword">{{ t('auth.register.confirm_password_label') }}</label>
                  <input
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    type="password"
                    class="form-input"
                    :placeholder="t('user.profile.confirm_password_placeholder')"
                  />
                </div>

                <div v-if="errorMessage" class="error-message">
                  {{ t(errorMessage) }}
                </div>

                <div v-if="successMessage" class="success-message">
                  {{ t(successMessage) }}
                </div>

                <button type="submit" class="btn-save">
                  {{ t('user.profile.update_password_btn') }}
                </button>
              </form>
            </div>
          </div>

          <!-- carte mon qr code -->
          <div class="card card-full">
            <div class="card-header">
              <h3>{{ t('user.qrcode.title') }}</h3>
            </div>
            <div class="card-body">
              <div class="qr-code-section">
                <p class="qr-description">{{ t('user.qrcode.description') }}</p>

                <div v-if="qrLoading" class="loading-message">
                  {{ t('user.qrcode.loading') }}
                </div>

                <div v-else-if="qrError" class="error-message">
                  {{ t('user.qrcode.error') }}
                </div>

                <template v-else-if="qrCodeDataURL">
                  <div class="qr-display">
                    <img :src="qrCodeDataURL" :alt="t('user.qrcode.title')" />
                  </div>

                  <div class="qr-info">
                    <span class="qr-id-label">{{ t('user.qrcode.id_label') }}</span>
                    <code class="qr-id-value">{{ authStore.user?.qrCodeId }}</code>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- carte mes commandes -->
          <div class="card card-full">
            <div class="card-header">
              <h3>{{ t('user.orders.title') }}</h3>
            </div>
            <div class="card-body">
              <div v-if="loadingOrders" class="loading-message">
                {{ t('user.orders.loading') }}
              </div>

              <div v-else-if="ordersError" class="error-message">
                {{ t(ordersError) }}
              </div>

              <div v-else-if="userOrders.length > 0" class="orders-list">
                <div v-for="order in userOrders" :key="order.orderId" class="order-item">
                  <div class="order-header">
                    <strong>{{ t('user.orders.order_number', { id: order.orderId }) }}</strong>
                    <span class="order-date">{{ formatDate(order.orderDate) }}</span>
                  </div>
                  <div class="order-body">
                    <div class="order-tickets">
                      <div v-for="ticket in order.tickets" :key="ticket.code || ticket.ticketId" class="ticket-row">
                        <div class="ticket-info">
                          <strong>{{ ticket.name }}</strong>
                          <span v-if="ticket.type === 'shop'" class="badge-shop">{{ t('cart_badges.shop') }}</span>
                          <span v-if="ticket.quantity > 1" class="item-qty">x{{ ticket.quantity }}</span>
                        </div>
                        <div class="ticket-details">
                          <span v-if="ticket.type !== 'shop'" class="ticket-date">{{ formatDate(ticket.date) }}</span>
                          <span 
                            v-if="ticket.type !== 'shop'"
                            class="ticket-status" 
                            :class="getStatusClass(ticket.verified)"
                          >
                            {{ t(getStatusText(ticket.verified)) }}
                          </span>
                          <span v-if="ticket.type === 'shop' && ticket.price" class="ticket-price">
                            {{ (ticket.price * (ticket.quantity || 1)).toFixed(2) }}€
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p v-else class="empty-history">{{ t('user.orders.empty') }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/login';
import { getUserOrders } from '@/services/ticketVerification.service.js';
import { useI18n } from '@/composables/useI18n';
import { useLanguage } from '@/composables/useLanguage';
import { useQRCode } from '@/composables/useQRCode';

const authStore = useAuthStore();
const { t } = useI18n();
const { currentLanguage } = useLanguage();

// section qr code
const { qrCodeDataURL, error: qrError, loading: qrLoading, generateQRCode } = useQRCode();

async function loadQRCode() {
  const qrId = authStore.user?.qrCodeId;
  if (qrId) {
    await generateQRCode(qrId);
  }
}


// section formulaire utilisateur
const formData = ref({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const errorMessage = ref('');
const successMessage = ref('');
// ancienne partie verification retiree

const userOrders = ref([]);
const loadingOrders = ref(false);
const ordersError = ref('');


async function loadUserOrders() {
  // on remet l etat propre avant le chargement
  userOrders.value = [];
  ordersError.value = '';
  loadingOrders.value = true;

  // on verifie que l utilisateur est connecté
  const userId = authStore.user?._id;
  if (!userId) {
    loadingOrders.value = false;
    return;
  }

  // on recupere les commandes depuis l api
  const result = await getUserOrders(userId);

  if (result.success) {
    // on trie pour afficher les plus recentes en premier
    try {
      const sorted = result.orders.slice().sort((a, b) => {
        const aDate = new Date(a.orderDate || a.createdAt || 0);
        const bDate = new Date(b.orderDate || b.createdAt || 0);
        return bDate - aDate;
      });

      // on normalise pour toujours avoir orderId et tickets
      const normalized = sorted.map(o => {
        let tickets = []
        if (o.tickets && Array.isArray(o.tickets)) {
          tickets = o.tickets
        } else if (o.items && Array.isArray(o.items)) {
          tickets = o.items.map(it => ({
            code: it.code || it.ticketId || null,
            ticketId: it.ticketId || it.productId || null,
            name: it.name || it.ticketName || it.product?.title || it.ticket?.name || t('user_home.ticket_fallback'),
            date: it.date || o.orderDate || new Date().toISOString(),
            quantity: it.quantity || 1,
            price: it.unitPrice || it.price || 0,
            type: it.itemType || it.type || 'ticket',
            verified: !!it.verified
          }))
        }

        return {
          orderId: o.orderId || o.id || `order-local-${Math.random().toString(36).slice(2,8)}`,
          userId: o.userId,
          email: o.email || null,
          tickets,
          orderDate: o.orderDate || o.createdAt || new Date().toISOString(),
          status: o.status || 'confirmed',
          holdId: o.holdId || null,
          totalAmount: o.totalAmount || (tickets.reduce((s, t) => s + ((t.price||0)*(t.quantity||1)),0))
        }
      })

      userOrders.value = normalized;
    } catch (e) {
      // en cas de souci on garde l ordre recu
      console.warn('[User Home] Normalization fallback for user orders', e)
      userOrders.value = result.orders;
    }
  } else {
    ordersError.value = result.message;
  }

  loadingOrders.value = false;
}

onMounted(() => {
  if (authStore.user) {
    formData.value.username = authStore.user.username || '';
    formData.value.firstName = authStore.user.firstName || '';
    formData.value.lastName = authStore.user.lastName || '';
    formData.value.email = authStore.user.email || '';
    formData.value.phone = authStore.user.phone || '';
  }

  loadUserOrders();
  loadQRCode();
});

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (formData.value.newPassword) {
    if (!formData.value.currentPassword) {
      errorMessage.value = 'user.errors.password_required';
      return;
    }

    if (formData.value.newPassword !== formData.value.confirmPassword) {
      errorMessage.value = 'user.errors.password_mismatch';
      return;
    }

    if (formData.value.newPassword.length < 6) {
      errorMessage.value = 'user.errors.password_length';
      return;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    errorMessage.value = 'user.errors.email_invalid';
    return;
  }

  const updateData = {
    username: formData.value.username,
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    email: formData.value.email,
    phone: formData.value.phone
  };

  if (formData.value.newPassword) {
    updateData.currentPassword = formData.value.currentPassword;
    updateData.newPassword = formData.value.newPassword;
  }

  const success = await authStore.updateUserInfo(updateData);

  if (success) {
    successMessage.value = 'user.success.update_ok';
    
    formData.value.currentPassword = '';
    formData.value.newPassword = '';
    formData.value.confirmPassword = '';

    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } else {
    errorMessage.value = 'user.errors.update_error';
  }
};

// ancienne partie verification retiree

const formatDate = (dateString) => {
  if (!dateString) {
    return t('user_home.unknown_date');
  }
  
  try {
    const date = new Date(dateString);
    const locales = {
      'fr': 'fr-FR',
      'en': 'en-US',
      'es': 'es-ES'
    };
    return date.toLocaleString(locales[currentLanguage.value] || 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (error) {
    console.warn('[User Home] Invalid date format', error)
    return dateString;
  }
};

const getStatusClass = (verified) => {
  if (verified) {
    return 'verified';
  } else {
    return 'not-verified';
  }
};

const getStatusText = (verified) => {
  if (verified) {
    return 'user.orders.verified';
  } else {
    return 'user.orders.not_verified';
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.user-container {
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
}

.main-content {
  flex: 1;
  padding: 2rem 3rem;
  background: #f8f9fa;
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
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 0.5rem;
}

.section-subtitle {
  font-size: 0.95rem;
  color: #666666;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.card-full {
  grid-column: span 2;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(231, 45, 85, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #000000;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-weight: 600;
  color: #333333;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.8rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  background: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #E72D55;
  box-shadow: 0 0 0 3px rgba(231, 45, 85, 0.1);
}

.form-input::placeholder {
  color: #999999;
}

.error-message {
  padding: 1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  font-size: 0.9rem;
  font-weight: 500;
}

.success-message {
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-save {
  background: #be123c;
  color: #ffffff;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1rem;
}

.btn-save:hover {
  background: #9f1239;
  transform: translateY(-1px);
}

.verification-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.verification-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-verify,
.btn-refresh {
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh {
  background: #475569;
}

.btn-verify:hover,
.btn-refresh:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.codes-history {
  margin-top: 2rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 600;
}

.codes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.code-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(231, 45, 85, 0.15);
  border-radius: 8px;
  background: rgba(231, 45, 85, 0.03);
}

.code-item strong {
  letter-spacing: 0.1em;
}

.empty-history {
  margin-top: 1rem;
  color: #666666;
  font-style: italic;
}

/* section commandes */
.loading-message {
  padding: 2rem;
  text-align: center;
  color: #666666;
  font-style: italic;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-item {
  border: 1px solid rgba(231, 45, 85, 0.15);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(231, 45, 85, 0.02);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(231, 45, 85, 0.08);
  border-bottom: 1px solid rgba(231, 45, 85, 0.15);
}

.order-header strong {
  font-size: 1.05rem;
  color: #000000;
}

.order-date {
  font-size: 0.85rem;
  color: #666666;
}

.order-body {
  padding: 1.5rem;
}

.order-tickets {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-left: 3px solid #E72D55;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.ticket-row:hover {
  background: rgba(231, 45, 85, 0.05);
  transform: translateX(5px);
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ticket-info strong {
  font-size: 1rem;
  color: #000000;
}

.ticket-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.ticket-date {
  font-size: 0.8rem;
  color: #999999;
}

.ticket-status {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.ticket-status.verified {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.ticket-status.not-verified {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.badge-shop {
  font-size: 0.75rem;
  color: #be123c;
  font-weight: 600;
}

.item-qty {
  font-size: 0.8rem;
  color: #666;
}

.ticket-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #be123c;
}

/* mode sombre */
html.dark-mode .user-container {
  background: #0a0a0a;
}

html.dark-mode .main-content {
  background: #0a0a0a;
}

html.dark-mode .section-header h1 {
  color: #ffffff;
}

html.dark-mode .section-subtitle {
  color: #999999;
}

html.dark-mode .card {
  background: #1a1a1a;
  border-color: rgba(231, 45, 85, 0.3);
}

html.dark-mode .card-header {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark-mode .card-header h3 {
  color: #ffffff;
}

html.dark-mode label {
  color: var(--text-primary);
}

html.dark-mode .form-input {
  background: #1f2937;
  border-color: #475569;
  color: #f8fafc;
}

html.dark-mode .form-input::placeholder {
  color: #666666;
}

html.dark-mode .form-input:focus {
  border-color: #E72D55;
  background: rgba(255, 255, 255, 0.08);
}

html.dark-mode .success-message {
  background: rgba(21, 128, 61, 0.78);
  border-color: #166534;
  color: #dcfce7;
}

html.dark-mode .error-message {
  background: rgba(153, 27, 27, 0.78);
  border-color: #7f1d1d;
  color: #fee2e2;
}

.qr-code-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qr-description {
  text-align: center;
  color: #666;
  margin: 0;
}

.qr-display {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
  border: 2px solid #ddd;
}

.qr-display img {
  max-width: 300px;
  width: 100%;
  height: auto;
}

html.dark-mode .qr-description {
  color: #aaa;
}

html.dark-mode .qr-display {
  background: #2a2a2a;
  border-color: #3a3a3a;
}

.qr-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.qr-id-label {
  font-weight: 600;
  color: #333;
}

.qr-id-value {
  font-family: monospace;
  font-size: 0.85rem;
  background: #fce7ef;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  color: #881337;
  letter-spacing: 0.05em;
}

html.dark-mode .qr-id-label {
  color: #ccc;
}

html.dark-mode .qr-id-value {
  background: rgba(159, 18, 57, 0.75);
  color: #fff1f2;
}

html.dark-mode .loading-message {
  color: #999999;
}

html.dark-mode .order-item {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark-mode .order-header {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark-mode .order-header strong {
  color: #ffffff;
}

html.dark-mode .order-date {
  color: #999999;
}

html.dark-mode .ticket-row {
  background: rgba(255, 255, 255, 0.05);
}

html.dark-mode .ticket-row:hover {
  background: rgba(231, 45, 85, 0.1);
}

html.dark-mode .ticket-info strong {
  color: #ffffff;
}

html.dark-mode .ticket-status.verified {
  background: rgba(21, 128, 61, 0.78);
  border-color: #166534;
  color: #dcfce7;
}

html.dark-mode .ticket-status.not-verified {
  background: rgba(153, 27, 27, 0.78);
  border-color: #7f1d1d;
  color: #fee2e2;
}

/* responsive */
@media (max-width: 1024px) {
  .main-content {
    padding: 1.5rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .card-full {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
