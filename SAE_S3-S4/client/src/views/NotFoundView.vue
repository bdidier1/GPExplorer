<template>
  <div class="not-found-container">
    <!-- contenu principal -->
    <div class="error-content">
      <div class="error-code">404</div>

      <h1 class="error-title">{{ t('not_found.title') }}</h1>
      <p class="error-message">
        {{ t('not_found.message') }}
      </p>

      <div class="error-actions">
        <button class="btn-primary" @click="goHome">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          {{ t('not_found.go_home') }}
        </button>
        <button class="btn-secondary" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          {{ t('not_found.go_back') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n.js'

const router = useRouter()
const { t } = useI18n()

function goHome() {
  router.push('/')
}

function goBack() {
  router.go(-1)
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  background: var(--surface-gradient-start);
  color: var(--text-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

/* contenu principal */
.error-content {
  text-align: center;
  padding: 2rem;
  max-width: 800px;
}

.error-code {
  font-size: 10rem;
  font-weight: 900;
  color: #E72D55;
  margin-bottom: 1rem;
  font-family: 'InterDisplay', 'Inter', sans-serif;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 1rem 0;
  color: var(--text-strong);
}

.error-message {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin: 1.5rem 0 2.5rem;
  line-height: 1.6;
}

/* boutons d action */
.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  border: 2px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}

.btn-primary {
  background: #E72D55;
  border-color: #E72D55;
  color: var(--text-invert);
}

.btn-primary:hover {
  background: #ff1744;
  border-color: #ff1744;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(231, 45, 85, 0.4);
}

.btn-secondary {
  background: transparent;
  border-color: var(--text-strong);
  color: var(--text-strong);
}

.btn-secondary:hover {
  background: var(--text-strong);
  color: var(--text-invert);
  transform: translateY(-2px);
}

.icon {
  width: 20px;
  height: 20px;
}

/* mode sombre */
html.dark-mode .not-found-container {
  background: var(--surface-gradient-start);
  color: var(--text-strong);
}

html.dark-mode .error-title {
  color: var(--text-strong);
}

html.dark-mode .error-message {
  color: var(--text-muted);
}

html.dark-mode .btn-secondary {
  border-color: var(--text-strong);
  color: var(--text-strong);
}

html.dark-mode .btn-secondary:hover {
  background: var(--text-strong);
  color: var(--text-invert);
}

/* responsive */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.5rem;
  }
}
</style>
