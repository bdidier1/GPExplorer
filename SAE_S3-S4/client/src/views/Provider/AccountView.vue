<template>
  <div class="provider-container">
    <ProviderSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <h1>{{ t('provider.account.title') }}</h1>
          <p class="section-subtitle">{{ t('provider.account.subtitle') }}</p>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header">
              <h3>{{ t('provider.account.sections.profile') }}</h3>
            </div>
            <div class="card-body">
              <form class="settings-form" @submit.prevent="handleProfileSubmit">
                <div class="form-group">
                  <label for="provider-username">{{ t('auth.register.username_label') }}</label>
                  <input
                    id="provider-username"
                    v-model="formData.username"
                    type="text"
                    class="form-input"
                    :placeholder="t('auth.register.username_placeholder')"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="provider-firstName">{{ t('auth.register.first_name_label') }}</label>
                    <input
                      id="provider-firstName"
                      v-model="formData.firstName"
                      type="text"
                      class="form-input"
                      :placeholder="t('auth.register.first_name_placeholder')"
                    />
                  </div>

                  <div class="form-group">
                    <label for="provider-lastName">{{ t('auth.register.last_name_label') }}</label>
                    <input
                      id="provider-lastName"
                      v-model="formData.lastName"
                      type="text"
                      class="form-input"
                      :placeholder="t('auth.register.last_name_placeholder')"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="provider-email">{{ t('auth.register.email_label') }}</label>
                  <input
                    id="provider-email"
                    v-model="formData.email"
                    type="email"
                    class="form-input"
                    :placeholder="t('auth.register.email_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="provider-phone">{{ t('auth.register.phone_label') }}</label>
                  <input
                    id="provider-phone"
                    v-model="formData.phone"
                    type="tel"
                    class="form-input"
                    :placeholder="t('auth.register.phone_placeholder')"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="provider-company">{{ t('admin_dashboard.company_name') }}</label>
                    <input
                      id="provider-company"
                      v-model="formData.companyName"
                      type="text"
                      class="form-input"
                      :placeholder="t('admin_dashboard.company_name_placeholder')"
                    />
                  </div>

                  <div class="form-group">
                    <label for="provider-category">{{ t('admin_dashboard.category') }}</label>
                    <select id="provider-category" v-model="formData.category" class="form-input">
                      <option value="">{{ t('admin_dashboard.select_category') }}</option>
                      <option v-for="category in categoryOptions" :key="category.value" :value="category.value">
                        {{ category.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="btn-save" :disabled="isSavingProfile">
                  {{ isSavingProfile ? t('provider.account.saving_btn') : t('provider.account.save_btn') }}
                </button>
              </form>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>{{ t('provider.account.sections.security') }}</h3>
            </div>
            <div class="card-body">
              <form class="settings-form" @submit.prevent="handlePasswordSubmit">
                <div class="form-group">
                  <label for="provider-currentPassword">{{ t('user.profile.current_password') }}</label>
                  <input
                    id="provider-currentPassword"
                    v-model="formData.currentPassword"
                    type="password"
                    class="form-input"
                    :placeholder="t('user.profile.current_password_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="provider-newPassword">{{ t('user.profile.new_password') }}</label>
                  <input
                    id="provider-newPassword"
                    v-model="formData.newPassword"
                    type="password"
                    class="form-input"
                    :placeholder="t('user.profile.new_password_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="provider-confirmPassword">{{ t('auth.register.confirm_password_label') }}</label>
                  <input
                    id="provider-confirmPassword"
                    v-model="formData.confirmPassword"
                    type="password"
                    class="form-input"
                    :placeholder="t('user.profile.confirm_password_placeholder')"
                  />
                </div>

                <button type="submit" class="btn-save" :disabled="isSavingPassword">
                  {{ isSavingPassword ? t('provider.account.saving_btn') : t('user.profile.update_password_btn') }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <p v-if="feedback.error" class="error-message">{{ feedback.error }}</p>
        <p v-if="feedback.success" class="success-message">{{ feedback.success }}</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ProviderSidebar from '@/components/Provider/ProviderSidebar.vue'
import { useI18n } from '@/composables/useI18n.js'
import { useAuthStore } from '@/stores/login.js'
import providerAccountService from '@/services/providerAccount.service.js'

const { t } = useI18n()
const authStore = useAuthStore()

const formData = ref({
  username: authStore.user?.username || '',
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  companyName: authStore.user?.companyName || '',
  category: authStore.user?.category || '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const feedback = ref({ error: '', success: '' })

const categoryOptions = computed(() => [
  { value: 'gaming', label: t('partners.categories.gaming') },
  { value: 'beverages', label: t('partners.categories.beverages') },
  { value: 'karting', label: t('partners.categories.karting') },
  { value: 'camping', label: t('partners.categories.camping') },
  { value: 'food', label: t('partners.categories.food') },
  { value: 'music', label: t('partners.categories.music') },
  { value: 'other', label: t('shop_view.group_other') }
])

function clearFeedback() {
  feedback.value = { error: '', success: '' }
}

function normalizeError(message) {
  if (!message) return t('user.errors.update_error')
  return message
}

function isValidEmail(email) {
  // vérifie le format d'email avant l'envoi
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function buildProfilePayload() {
  return {
    username: formData.value.username.trim(),
    firstName: formData.value.firstName.trim(),
    lastName: formData.value.lastName.trim(),
    email: formData.value.email.trim().toLowerCase(),
    phone: formData.value.phone.trim(),
    companyName: formData.value.companyName.trim(),
    category: formData.value.category || 'other'
  }
}

async function submitPayload(payload) {
  const result = await providerAccountService.updateMyProviderProfile(payload)

  if (!result.success) {
    feedback.value.error = normalizeError(result.message)
    return false
  }

  authStore.syncUserProfile(result.data)
  formData.value.username = result.data.username || formData.value.username
  formData.value.email = result.data.email || formData.value.email
  formData.value.firstName = result.data.firstName || ''
  formData.value.lastName = result.data.lastName || ''
  formData.value.phone = result.data.phone || ''
  formData.value.companyName = result.data.companyName || ''
  formData.value.category = result.data.category || formData.value.category

  feedback.value.success = t('user.success.update_ok')
  return true
}

async function handleProfileSubmit() {
  clearFeedback()

  const payload = buildProfilePayload()

  if (!payload.username || payload.username.length < 3) {
    feedback.value.error = 'Le pseudo doit contenir au moins 3 caractères.'
    return
  }

  if (!isValidEmail(payload.email)) {
    feedback.value.error = t('user.errors.email_invalid')
    return
  }

  if (!payload.companyName) {
    feedback.value.error = 'Le nom de l\'entreprise est requis.'
    return
  }

  isSavingProfile.value = true
  try {
    await submitPayload(payload)
  } finally {
    isSavingProfile.value = false
  }
}

async function handlePasswordSubmit() {
  clearFeedback()

  if (!formData.value.currentPassword) {
    feedback.value.error = t('user.errors.password_required')
    return
  }

  if (!formData.value.newPassword) {
    feedback.value.error = t('user.errors.password_length')
    return
  }

  if (formData.value.newPassword.length < 6) {
    feedback.value.error = t('user.errors.password_length')
    return
  }

  if (formData.value.newPassword !== formData.value.confirmPassword) {
    feedback.value.error = t('user.errors.password_mismatch')
    return
  }

  isSavingPassword.value = true
  try {
    const success = await submitPayload({
      currentPassword: formData.value.currentPassword,
      newPassword: formData.value.newPassword
    })

    if (success) {
      formData.value.currentPassword = ''
      formData.value.newPassword = ''
      formData.value.confirmPassword = ''
    }
  } finally {
    isSavingPassword.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.provider-container {
  display: flex;
  min-height: 100vh;
  background: var(--surface-gradient-start, #ffffff);
  font-family: 'Inter', sans-serif;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  margin-top: 72px;
  padding: 2rem 3rem;
  background: var(--surface-gradient-end, #f8f9fa);
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
  gap: 1.25rem;
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
  border-color: #e72d55;
  box-shadow: 0 0 0 3px rgba(231, 45, 85, 0.1);
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
}

.btn-save:hover:not(:disabled) {
  background: #9f1239;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin-top: 1.2rem;
  padding: 1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  font-size: 0.9rem;
  font-weight: 500;
}

.success-message {
  margin-top: 1.2rem;
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 220px;
    padding: 1.5rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

html.dark-mode .main-content {
  background: #111;
}

html.dark-mode .provider-container {
  background: #111;
}

html.dark-mode .section-header h1,
html.dark-mode .card-header h3,
html.dark-mode label {
  color: #f3f4f6;
}

html.dark-mode .section-subtitle {
  color: #9ca3af;
}

html.dark-mode .card {
  background: #1c1c1c;
  border-color: #2a2a2a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}

html.dark-mode .card-header {
  border-bottom-color: #2a2a2a;
}

html.dark-mode .form-input {
  background: #0f0f0f;
  border-color: #2f2f2f;
  color: #f3f4f6;
}

html.dark-mode .form-input::placeholder {
  color: #7b7b7b;
}
</style>
