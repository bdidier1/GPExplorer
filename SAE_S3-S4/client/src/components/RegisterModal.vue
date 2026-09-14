<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="showRegister" class="modal-overlay" @click.self="closeRegister">
        <dialog
          class="modal-card register-modal"
          open
          aria-labelledby="register-modal-title"
        >
          <button
            class="modal-close"
            @click="closeRegister"
            :aria-label="t('auth.register.close_aria')"
          >
            ×
          </button>
          <div class="modal-header">
            <img
              src="/GP_EXPLORER_-LOGO.png"
              alt="GP Explorer Logo"
              class="login-logo"
            />
            <h2 id="register-modal-title">{{ t('auth.register.title') }}</h2>
            <p>{{ t('auth.register.subtitle') }}</p>
          </div>
          
          <form class="register-form" @submit.prevent="handleRegister">
            <!-- infos personnelles -->
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">{{ t('auth.register.first_name_label') }}</label>
                <input
                  type="text"
                  id="firstName"
                  v-model="formData.firstName"
                  :placeholder="t('auth.register.first_name_placeholder')"
                  required
                />
              </div>
              <div class="form-group">
                <label for="lastName">{{ t('auth.register.last_name_label') }}</label>
                <input
                  type="text"
                  id="lastName"
                  v-model="formData.lastName"
                  :placeholder="t('auth.register.last_name_placeholder')"
                  required
                />
              </div>
            </div>

            <!-- infos de connexion -->
            <div class="form-group">
              <label for="username">{{ t('auth.register.username_label') }}</label>
              <input
                type="text"
                id="username"
                v-model="formData.username"
                :placeholder="t('auth.register.username_placeholder')"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">{{ t('auth.register.email_label') }}</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                :placeholder="t('auth.register.email_placeholder')"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone">{{ t('auth.register.phone_label') }}</label>
              <input
                type="tel"
                id="phone"
                v-model="formData.phone"
                :placeholder="t('auth.register.phone_placeholder')"
              />
            </div>

            <!-- mots de passe -->
            <div class="form-row">
              <div class="form-group">
                <label for="password">{{ t('auth.register.password_label') }}</label>
                <div class="password-input">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="formData.password"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="togglePassword"
                    :title="showPassword ? t('auth.register.hide_password') : t('auth.register.show_password')"
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
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label for="confirmPassword">{{ t('auth.register.confirm_password_label') }}</label>
                <div class="password-input">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="toggleConfirmPassword"
                    :title="showConfirmPassword ? t('auth.register.hide_password') : t('auth.register.show_password')"
                  >
                    <svg
                      v-if="!showConfirmPassword"
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
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- message d'erreur -->
            <div v-if="errorMessage" class="error-message">
              {{ t(errorMessage) }}
            </div>

            <!-- message de succès -->
            <div v-if="successMessage" class="success-message">
              {{ t(successMessage) }}
            </div>

            <!-- actions -->
            <div class="form-actions">
              <button type="button" class="login-link" @click="openLogin">
                {{ t('auth.register.login_link') }}
              </button>
              <button type="submit" class="register-btn" :disabled="loading">
                <span v-if="!loading">{{ t('auth.register.submit') }}</span>
                <div v-else class="spinner"></div>
              </button>

            </div>
          </form>
        </dialog>
      </div>
    </transition>
  </teleport>
</template>

<script>
import registerService from '@/services/register.service.js'
import { useI18n } from '@/composables/useI18n.js'

export default {
  name: "RegisterModal",
  props: {
    showRegister: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'login', 'success'],
  setup() {
    const { t } = useI18n()
    
    return { t }
  },
  data() {
    return {
      formData: {
        role: 'user', // fixé sur visiteur
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      },
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    closeRegister() {
      this.$emit('close');
      this.resetForm();
    },
    
    resetForm() {
      this.formData = {
        role: 'user', // fixé sur visiteur
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      };
      this.showPassword = false;
      this.showConfirmPassword = false;
      this.errorMessage = '';
      this.successMessage = '';
    },
    
    async handleRegister() {
      this.errorMessage = '';
      this.successMessage = '';
      this.loading = true;
      
      try {
        const result = await registerService.register(this.formData);
        
        if (result && result.error === 0) {
          this.successMessage = 'auth.register.success';
          
          // attend 2 secondes puis ouvre le login
          setTimeout(() => {
            this.$emit('success');
            this.closeRegister();
          }, 2000);
          
        } else {
          this.errorMessage = result && result.data ? result.data : 'auth.register.error_generic';
        }
        
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        this.errorMessage = 'auth.register.error_generic';
      } finally {
        this.loading = false;
      }
    },
    
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    

    
    openLogin() {
      this.$emit('login');
    }
  },
  watch: {
    showRegister(val) {
      if (typeof document !== "undefined") {
        document.body.style.overflow = val ? "hidden" : "";
        document.documentElement.style.overflow = val ? "hidden" : "";
      }
    }
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

/* modale inscription un peu plus large */
.register-modal {
  max-width: 600px !important;
  max-height: 90vh;
  overflow-y: auto;
}

/* formulaire d'inscription */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* lignes du formulaire */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* style des selects */
select {
  background: var(--surface-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  color: var(--text-strong);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

select:focus {
  outline: none;
  border-color: #E72D55;
  box-shadow: 0 0 0 3px rgba(231, 45, 85, 0.1);
}

/* actions du formulaire */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.login-link {
  background: transparent;
  border: none;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9em;
  cursor: pointer;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #E72D55;
  text-decoration: underline;
}

.register-btn {
  background: #E72D55;
  color: var(--text-invert);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-btn:hover:not(:disabled) {
  background: #c91f45;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 45, 85, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* messages */
.error-message {
  color: #881337;
  background: #fce7ef;
  border: 1px solid #f9a8c0;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.9em;
  margin-top: 0.5rem;
}

.success-message {
  color: #065f46;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.9em;
  margin-top: 0.5rem;
}

/* responsive */
@media (max-width: 768px) {
  .register-modal {
    max-width: 95vw !important;
    margin: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .register-btn {
    width: 100%;
  }
}
</style>