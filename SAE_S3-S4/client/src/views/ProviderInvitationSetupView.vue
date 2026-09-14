<template>
  <main class="invite-page">
    <section class="invite-card">
      <h1>{{ t('provider_invitation.title') }}</h1>
      <p class="subtitle">{{ t('provider_invitation.subtitle') }}</p>

      <form @submit.prevent="submit" class="invite-form" v-if="!successMessage">
        <label for="password">{{ t('provider_invitation.password_label') }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          minlength="6"
          required
          :placeholder="t('provider_invitation.password_placeholder')"
        />

        <label for="confirmPassword">{{ t('provider_invitation.confirm_password_label') }}</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          minlength="6"
          required
          :placeholder="t('provider_invitation.confirm_password_placeholder')"
        />

        <button type="submit" :disabled="isSubmitting || !token">
          {{ isSubmitting ? t('provider_invitation.saving') : t('provider_invitation.submit') }}
        </button>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button v-if="successMessage" class="back-btn" @click="goHome">
        {{ t('provider_invitation.back_home') }}
      </button>
    </section>
  </main>
</template>

<script>
import { post } from '@/services/apiClient.js';
import { setAccessToken } from '@/services/apiClient.js';
import { useAuthStore } from '@/stores/login.js';
import { useI18n } from '@/composables/useI18n.js';

export default {
  name: 'ProviderInvitationSetupView',
  setup() {
    const authStore = useAuthStore();
    const { t } = useI18n();
    return { authStore, t };
  },
  data() {
    return {
      token: '',
      password: '',
      confirmPassword: '',
      isSubmitting: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  mounted() {
    const rawToken = this.$route.query.token;
    this.token = Array.isArray(rawToken) ? rawToken[0] : (rawToken || '');

    if (!this.token) {
      this.errorMessage = this.t('provider_invitation.errors.token_missing');
    }
  },
  methods: {
    async submit() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.token) {
        this.errorMessage = this.t('provider_invitation.errors.token_missing');
        return;
      }
      if (this.password.length < 6) {
        this.errorMessage = this.t('provider_invitation.errors.password_too_short');
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = this.t('provider_invitation.errors.password_mismatch');
        return;
      }

      this.isSubmitting = true;
      try {
        const response = await post('/api/provider-invitations/setup-password', {
          token: this.token,
          password: this.password,
          confirmPassword: this.confirmPassword
        });

        if (response?.error !== 0) {
          throw new Error(response?.message || this.t('provider_invitation.errors.generic'));
        }

        if (!response?.token || !response?.user) {
          throw new Error(this.t('provider_invitation.errors.generic'));
        }

        setAccessToken(response.token);

        const userData = {
          _id: response.user._id || response.user.id,
          username: response.user.username,
          email: response.user.email || '',
          role: response.user.role || 'provider',
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          phone: response.user.phone || '',
          qrCodeId: response.user.qrCodeId || null,
          session: response.sessionId || response.token,
          companyName: response.user.companyName || '',
          category: response.user.category || '',
          providerId: response.user.providerId || null
        };

        this.authStore.loginWithOAuth(userData, response.token);

        this.successMessage = response?.message || this.t('provider_invitation.success');
        this.password = '';
        this.confirmPassword = '';

        const role = userData.role;
        if (role === 'organizer') {
          this.$router.replace('/admin/home');
        } else if (role === 'provider') {
          this.$router.replace(`/providers/${userData.username}`);
        } else {
          this.$router.replace('/user/home');
        }
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.isSubmitting = false;
      }
    },
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: #000000;
}

.invite-card {
  width: min(100%, 460px);
  background: var(--surface-card);
  border-radius: 18px;
  box-shadow: 0 18px 42px var(--card-shadow);
  padding: 2rem;
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(6px);
}

h1 {
  margin: 0;
  font-size: clamp(1.45rem, 2.6vw, 1.8rem);
  color: var(--text-strong);
  letter-spacing: -0.01em;
}

.subtitle {
  margin: 0.85rem 0 1.35rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.invite-form {
  display: grid;
  gap: 0.85rem;
}

label {
  font-size: 0.95rem;
  color: var(--text-soft);
  font-weight: 700;
}

input {
  width: 100%;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  padding: 0.76rem 0.9rem;
  font-size: 0.95rem;
  color: var(--control-text);
  background: var(--control-bg);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

input::placeholder {
  color: var(--text-muted);
}

input:focus {
  outline: none;
  border-color: var(--border-accent);
  box-shadow: 0 0 0 4px rgba(231, 45, 85, 0.15);
  transform: translateY(-1px);
}

.invite-form button,
.back-btn {
  border: 0;
  border-radius: 12px;
  padding: 0.82rem 1rem;
  background: var(--accent-gradient);
  color: var(--text-invert);
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.invite-form button:hover:not(:disabled),
.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px var(--accent-shadow);
  background: var(--accent-gradient-hover);
}

.invite-form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error {
  margin-top: 1.1rem;
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  color: var(--warning-text);
}

.success {
  margin-top: 1.1rem;
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  background: var(--success-bg);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: var(--success-text);
}

.back-btn {
  margin-top: 1.1rem;
  width: 100%;
}

@media (max-width: 640px) {
  .invite-page {
    padding: 0.8rem;
  }

  .invite-card {
    padding: 1.25rem;
    border-radius: 14px;
  }
}
</style>
