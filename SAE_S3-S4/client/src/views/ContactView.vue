<template>
  <div class="contact-page">
    <!-- section hero -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="section-header">
          <div class="title-with-lines">
            <div class="header-stripe left"></div>
            <h1 class="main-title">{{ t('contact.page_title') }}</h1>
            <div class="header-stripe right"></div>
          </div>
          <h2 class="subtitle-red">{{ t('contact.subtitle') }}</h2>
          <p class="description">{{ t('contact.intro') }}</p>
        </div>
      </div>
    </section>

    <!-- section contact -->
    <section class="contact-content">
      <div class="container">
        <div class="contact-grid">
          <!-- formulaire de contact -->
          <div class="contact-form-section">
            <div class="form-card">
              <h3 class="form-title">{{ t('contact.title') }}</h3>
              <form @submit.prevent="handleSubmit" class="contact-form">
                <div class="form-group">
                  <label for="name" class="form-label">{{ t('contact.form.name') }} *</label>
                  <input
                    type="text"
                    id="name"
                    v-model="formData.name"
                    class="form-input"
                    :placeholder="t('contact.placeholders.name')"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">{{ t('contact.form.email') }} *</label>
                  <input
                    type="email"
                    id="email"
                    v-model="formData.email"
                    class="form-input"
                    :placeholder="t('contact.placeholders.email')"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="phone" class="form-label">{{ t('contact.form.phone') }}</label>
                  <input
                    type="tel"
                    id="phone"
                    v-model="formData.phone"
                    class="form-input"
                    :placeholder="t('contact.placeholders.phone')"
                  />
                </div>

                <div class="form-group">
                  <label for="subject" class="form-label">{{ t('contact.form.subject') }} *</label>
                  <select
                    id="subject"
                    v-model="formData.subject"
                    class="form-input"
                    required
                  >
                    <option value="">{{ t('contact.placeholders.subject') }}</option>
                    <option value="general">{{ t('contact.subjects.general') }}</option>
                    <option value="tickets">{{ t('contact.subjects.tickets') }}</option>
                    <option value="partners">{{ t('contact.subjects.partners') }}</option>
                    <option value="provider_request">{{ t('contact.subjects.provider_request') }}</option>
                    <option value="press">{{ t('contact.subjects.press') }}</option>
                    <option value="other">{{ t('contact.subjects.other') }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="message" class="form-label">{{ t('contact.form.message') }} *</label>
                  <textarea
                    id="message"
                    v-model="formData.message"
                    class="form-textarea"
                    :placeholder="t('contact.placeholders.message')"
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                  <span v-if="!isSubmitting">{{ t('contact.submit') }}</span>
                  <span v-else>{{ t('contact.submitting') }}</span>
                </button>

                <div v-if="submitMessage" class="submit-message" :class="submitMessageType">
                  {{ submitMessage }}
                </div>
              </form>
            </div>
          </div>

          <!-- infos contact format compact -->
          <div class="contact-info-section">
            <div class="info-card small-info">
              <h3 class="info-title">{{ t('contact.info.title') }}</h3>

              <div class="info-item">
                <div class="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div class="info-content">
                  <h4 class="info-label">{{ t('contact.info.address') }}</h4>
                  <p class="info-text">{{ t('contact.info.address_line1') }}<br>{{ t('contact.info.address_line2') }}</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div class="info-content">
                  <h4 class="info-label">{{ t('contact.info.phone') }}</h4>
                  <p class="info-text">+33 2 43 00 00 00</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div class="info-content">
                  <h4 class="info-label">{{ t('contact.info.email') }}</h4>
                  <p class="info-text">contact@gpexplorer.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n.js'
import { sendMessageToAdmin } from '@/services/adminMessage.service.js'

const { t } = useI18n()

const formData = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const submitMessage = ref('')
const submitMessageType = ref('')

const handleSubmit = async () => {
  isSubmitting.value = true
  submitMessage.value = ''

  try {
    // on envoie le message a l admin via l api
    await sendMessageToAdmin({
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      subject: formData.value.subject,
      message: formData.value.message
    })

    isSubmitting.value = false
    submitMessage.value = t('contact.messages.success')
    submitMessageType.value = 'success'

    // on remet le formulaire a zero
    formData.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }

    // on vide le message apres 5 secondes
    setTimeout(() => {
      submitMessage.value = ''
    }, 5000)
  } catch (error) {
    console.error('[Contact] Failed to send message', error)
    isSubmitting.value = false
    submitMessage.value = t('contact_errors.send_error')
    submitMessageType.value = 'error'
  }
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--surface-gradient-start);
  color: var(--text-strong);
  font-family: 'Inter', sans-serif;
}

/* section hero */
.hero-section {
  margin-top: 70px;
  background: #0a0a0a;
  padding: 4rem 2rem;
  text-align: center;
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
  color: var(--text-strong);
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

/* section contact */
.contact-content {
  background: var(--surface-gradient-start);
  padding: 4rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 3rem;
  align-items: start;
}

/* section formulaire */
.contact-form-section {
  width: 100%;
}

.form-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 1.2rem;
  padding: 3rem;
  box-shadow: 0 6px 28px var(--card-shadow);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--text-strong);
  margin: 0 0 2rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-strong);
  letter-spacing: 0.01em;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  color: var(--text-strong);
  background: var(--surface-panel);
  border: 2px solid var(--border-subtle);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #E72D55;
  box-shadow: 0 0 0 3px rgba(231, 45, 85, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--text-invert);
  background: var(--accent-gradient);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-gradient-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-shadow);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-message {
  padding: 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  text-align: center;
}

.submit-message.success {
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-text);
}

/* section infos */
.contact-info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: end;
}

.info-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
  padding: 1.1rem;
  box-shadow: 0 4px 16px var(--card-shadow);
}

.small-info {
  width: 320px;
}

.info-title,
.social-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-strong);
  margin: 0 0 2rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.info-item {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-chip);
  border-radius: 10px;
  color: #E72D55;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 1rem;
  font-weight: 900;
  color: var(--text-strong);
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.info-text {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

/* bloc social retire pour simplifier la page */

/* mode sombre */
html:not(.dark-mode) .hero-section {
  background: var(--surface-gradient-start);
}

html.dark-mode .contact-page {
  background: var(--surface-gradient-start);
}

html.dark-mode .hero-section {
  background: var(--surface-gradient-start);
}

html.dark-mode .contact-content {
  background: var(--surface-gradient-start);
}

html.dark-mode .form-card,
html.dark-mode .info-card {
  background: var(--surface-card);
  border-color: var(--border-subtle);
}

html.dark-mode .form-input,
html.dark-mode .form-textarea {
  background: var(--surface-panel);
  border-color: var(--border-subtle);
  color: var(--text-strong);
}

html.dark-mode .form-input::placeholder,
html.dark-mode .form-textarea::placeholder {
  color: var(--text-muted);
}

html.dark-mode .info-item {
  background: transparent;
}

/* styles social en mode sombre retires */

/* responsive */
@media (max-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .title-with-lines {
    gap: 1rem;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .contact-content {
    padding: 2rem 0;
  }

  .form-card,
  .info-card {
    padding: 1.5rem;
  }
}
</style>
