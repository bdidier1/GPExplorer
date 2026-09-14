<template>
  <div class="oauth-callback">
    <div v-if="error" class="oauth-error">
      <div class="error-icon">!</div>
      <h2>{{ t('auth.oauth.error_title') }}</h2>
      <p>{{ errorMessage }}</p>
      <button class="btn-home" @click="goHome">{{ t('auth.oauth.back_home') }}</button>
    </div>
    <div v-else class="oauth-loading">
      <div class="spinner-large"></div>
      <p>{{ t('auth.oauth.loading') }}</p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/login.js'
import { useI18n } from '@/composables/useI18n.js'
import { setAccessToken } from '@/services/apiClient.js'

export default {
  name: 'OAuthCallbackView',
  setup() {
    const authStore = useAuthStore()
    const { t } = useI18n()
    return { authStore, t }
  },
  data() {
    return {
      error: false,
      errorMessage: ''
    }
  },
  mounted() {
    this.handleCallback()
  },
  methods: {
    handleCallback() {
      const params = new URLSearchParams(globalThis.window?.location?.search || '')

      // on verifie si un code erreur est present
      const errorParam = params.get('error')
      if (errorParam) {
        this.error = true
        this.errorMessage = this.t(`auth.oauth.errors.${errorParam}`) || this.t('auth.oauth.errors.default')
        return
      }

      const token = params.get('token')
      if (!token) {
        this.error = true
        this.errorMessage = this.t('auth.oauth.errors.no_token')
        return
      }

      // on stocke le token jwt
      setAccessToken(token)

      // on construit les infos user pour le store
      const userData = {
        _id: params.get('userId'),
        username: params.get('username'),
        email: params.get('email') || '',
        role: params.get('role') || 'user',
        firstName: params.get('firstName') || '',
        lastName: params.get('lastName') || '',
        provider: params.get('provider') || 'oauth',
        qrCodeId: params.get('qrCodeId') || null,
        session: params.get('sessionId') || token
      }

      // on applique la connexion oauth dans le store
      this.authStore.loginWithOAuth(userData, token)

      // redirection selon le role
      const role = userData.role
      if (role === 'organizer') {
        this.$router.replace('/admin/home')
      } else if (role === 'provider') {
        this.$router.replace(`/providers/${userData.username}`)
      } else {
        this.$router.replace('/')
      }
    },
    goHome() {
      this.$router.replace('/')
    }
  }
}
</script>

<style scoped>
.oauth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f9fafb;
}

html.dark-mode .oauth-callback {
  background: #111827;
}

.oauth-loading {
  text-align: center;
  color: #374151;
}

html.dark-mode .oauth-loading {
  color: #d1d5db;
}

.oauth-loading p {
  margin-top: 1.5rem;
  font-size: 1.1rem;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #e72d55;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.oauth-error {
  text-align: center;
  padding: 2rem;
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.oauth-error h2 {
  color: #e72d55;
  margin-bottom: 0.5rem;
}

.oauth-error p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

html.dark-mode .oauth-error p {
  color: #9ca3af;
}

.btn-home {
  padding: 0.75rem 2rem;
  background: #be123c;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-home:hover {
  background: #9f1239;
}
</style>
