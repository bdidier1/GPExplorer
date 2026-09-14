<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="showLogin" class="modal-overlay" @click.self="closeLogin">
        <dialog
          class="modal-card"
          open
          aria-labelledby="login-modal-title"
        >
          <button
            class="modal-close"
            @click="closeLogin"
            :aria-label="t('auth.login.close_aria')"
          >
            ×
          </button>
          <div class="modal-header">
            <img
              src="/GP_EXPLORER_-LOGO.png"
              alt="GP Explorer Logo"
              class="login-logo"
            />
            <h2 id="login-modal-title">{{ t('auth.login.title') }}</h2>
            <p>{{ t('auth.login.subtitle') }}</p>
          </div>
          <form class="login-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">{{ t('auth.login.email_label') }}</label>
              <input
                type="text"
                id="email"
                v-model="email"
                :placeholder="t('auth.login.email_placeholder')"
                required
              />
            </div>
            <div class="form-group">
              <label for="password">{{ t('auth.login.password_label') }}</label>
              <div class="password-input">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  :placeholder="t('auth.login.password_placeholder')"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePassword"
                  :title="showPassword ? t('auth.login.hide_password') : t('auth.login.show_password')"
                >
                  <svg
                    v-if="!showPassword"
                    class="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    v-else
                    class="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
              <div v-if="authStore.loginError" class="error-message">
                {{ t(authStore.loginError) }} !
              </div>
            </div>



            <br>
            <div class="form-options">
              <button type="button" class="signup-btn" @click="openSignup">
                {{ t('auth.login.signup_btn') }}
              </button>
              <a href="#" class="forgot-password">{{ t('auth.login.forgot_password') }}</a>
            </div>
            <button type="submit" class="login-btn" :disabled="loading">
              <span v-if="!loading">{{ t('auth.login.submit') }}</span>
              <div v-else class="spinner"></div>
            </button>
            
            <!-- séparateur oauth -->
            <div class="oauth-divider">
              <span>{{ t('auth.oauth.or_divider') }}</span>
            </div>

            <!-- boutons oauth -->
            <div class="oauth-buttons">
              <a href="/api/auth/google" class="oauth-btn oauth-google">
                <svg class="oauth-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {{ t('auth.oauth.google_btn') }}
              </a>
              <a href="/api/auth/discord" class="oauth-btn oauth-discord">
                <svg class="oauth-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#fff"/>
                </svg>
                {{ t('auth.oauth.discord_btn') }}
              </a>
            </div>
          </form>
        </dialog>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { useAuthStore } from '@/stores/login.js'
import { useI18n } from '@/composables/useI18n.js'

export default {
  name: "LoginModal",
  props: {
    showLogin: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'signup'],
  setup() {
    const authStore = useAuthStore()
    const { t } = useI18n()
    
    return { authStore, t }
  },
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      loading: false
    };
  },
  methods: {
    closeLogin() {
      this.$emit('close');
      // réinitialise les champs
      this.email = "";
      this.password = "";
      this.showPassword = false;
    },
    
    validateForm() {
      if (!this.email.trim()) {
        return false;
      }
      // on accepte email ou username
      if (!this.password.trim()) {
        return false;
      }
      return true;
    },
    
    async handleLogin() {
      // validation côté client
      if (!this.validateForm()) {
        return;
      }
      
      this.loading = true;
      
      try {
        // utilise le store d'authentification
        const result = await this.authStore.login({
          email: this.email.trim(),
          password: this.password.trim()
        });
        
        if (result && result.error === 0) {
          // connexion ok
          console.log('Connexion réussie:', result.data.email);
          console.log('Rôle:', result.data.role);
          
          // redirection selon le rôle
          if (result.data.role === 'organizer') {
            this.$router.push('/admin/home');
          } else if (result.data.role === 'provider') {
            // redirection vers la page du prestataire
            this.$router.push(`/providers/${result.data.username}`);
          } else {
            this.$router.push('/');
          }
          
          // ferme la modale puis reset
          this.closeLogin();
          
        } else {
          // le message d'erreur est déjà dans le store
          console.log('Authentification échouée:', this.authStore.loginError);
        }
        
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
      } finally {
        this.loading = false;
      }
    },
    
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    

    
    openSignup() {
      this.$emit('signup');
    },
  },
  watch: {
    showLogin(val) {
      if (typeof document !== "undefined") {
        document.body.style.overflow = val ? "hidden" : "";
        document.documentElement.style.overflow = val ? "hidden" : "";
      }
    },
  },
  beforeUnmount() {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  },
};
</script>

<style scoped>
/* reprend les styles de la navbar */
@import "@/assets/NavBar.css";

/* transition fade de la modale */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* style du lien mot de passe oublié */
.forgot-password {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.9em;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #e72d55;
  text-decoration: underline;
}

html.dark-mode .forgot-password {
  color: #9ca3af !important;
}

html.dark-mode .forgot-password:hover {
  color: #e72d55 !important;
}

.error-message {
  color: #e72d55;
  margin-top: 0.5rem;
  font-size: 0.9em;
}

/* séparateur oauth */
.oauth-divider {
  display: flex;
  align-items: center;
  margin: 1.25rem 0;
  gap: 0.75rem;
}

.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

html.dark-mode .oauth-divider::before,
html.dark-mode .oauth-divider::after {
  background: #374151;
}

.oauth-divider span {
  color: #9ca3af;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* boutons oauth */
.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid #e5e7eb;
}

.oauth-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* bouton google */
.oauth-google {
  background: #fff;
  color: #374151;
}

.oauth-google:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark-mode .oauth-google {
  background: #1f2937;
  color: #e5e7eb;
  border-color: #374151;
}

html.dark-mode .oauth-google:hover {
  background: #374151;
  border-color: #4b5563;
}

/* bouton discord */
.oauth-discord {
  background: #5865F2;
  color: #fff;
  border-color: #5865F2;
}

.oauth-discord:hover {
  background: #4752c4;
  border-color: #4752c4;
  box-shadow: 0 2px 8px rgba(88, 101, 242, 0.3);
}

html.dark-mode .oauth-discord {
  background: #5865F2;
  border-color: #5865F2;
}

html.dark-mode .oauth-discord:hover {
  background: #4752c4;
  border-color: #4752c4;
}

</style>