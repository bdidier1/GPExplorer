<template>
  <div class="admin-container">
    <AdminSidebar />
    
    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <h1>{{ t('admin.page_title') }}</h1>
          <p class="section-subtitle">{{ t('admin.dashboard.subtitle') }}</p>
        </div>

        <div class="dashboard-grid">
          <!-- Carte: Liste des prestataires -->
          <div class="card">
            <div class="card-header">
              <h3>{{ t('admin.provider.list_title') }}</h3>
              <span class="badge" v-if="providers.length > 0">{{ providers.length }} {{ t('admin.dashboard.providers_count') }}</span>
            </div>
            <div class="card-body">
              <div v-if="providers.length === 0" class="no-providers">
                <p>{{ t('admin.dashboard.no_providers') }}</p>
              </div>
              <div v-else class="providers-list">
                <div v-for="provider in providers" :key="provider.id" class="provider-item">
                  <div class="provider-info">
                    <strong>{{ provider.companyName }}</strong>
                    <span class="provider-username">@{{ provider.username }}</span>
                  </div>
                  <div class="provider-actions">
                    <button 
                      @click="goToPage(provider)"
                      target="_blank"
                      class="provider-btn view-btn"
                      :title="t('admin.messages.view_page')"
                    >
                      {{ t('admin.dashboard.view_page') }}
                  </button>
                    <button 
                      @click="editProvider(provider)"
                      class="provider-btn edit-btn"
                      :title="t('admin.provider.edit_title')"
                    >
                      {{ t('admin.provider.modify_btn') }}
                    </button>
                    <button 
                      @click="deleteProvider(provider)"
                      class="provider-btn delete-btn"
                      :title="t('admin.provider.delete_title')"
                    >
                      {{ t('admin.provider.delete_btn') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte: Créer un nouveau prestataire -->
          <div v-if="!isEditing" class="card">
            <div class="card-header">
              <h3>{{ t('admin.provider.create_title') }}</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="createProvider" class="provider-form">
                <div class="form-group">
                  <label for="username">{{ t('admin.form.login') }}</label>
                  <input 
                    type="text" 
                    id="username" 
                    v-model="newProvider.username" 
                    required 
                    class="form-input"
                    :placeholder="t('admin.form.login_placeholder')"
                  />
                </div>
                
                <button type="submit" class="btn-create" :disabled="isCreating">
                  <span v-if="isCreating">{{ t('admin.status.creating') }}</span>
                  <span v-if="!isCreating">{{ t('admin.provider.create_title') }}</span>
                </button>
              </form>
              
              <div v-if="successMessage" class="success-message">
                {{ successMessage }}
              </div>

              <div v-if="invitationLink" class="invitation-box">
                <p>{{ t('admin.messages.invitation_generated') }}</p>
                <input type="text" class="form-input" :value="invitationLink" readonly />
                <button type="button" class="provider-btn view-btn" @click="copyInvitationLink">
                  {{ t('admin.messages.copy_link') }}
                </button>
              </div>
              
              <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>
            </div>
          </div>

          <!-- Carte: Modifier un prestataire -->
          <div v-if="isEditing" class="card">
            <div class="card-header">
              <h3>{{ t('admin.provider.edit_title') }}</h3>
              <button @click="cancelEdit" class="btn-cancel">{{ t('admin.provider.cancel_btn') }}</button>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateProvider" class="provider-form">
                <div class="form-group">
                  <label for="edit-username">{{ t('admin.form.login') }}</label>
                  <input 
                    type="text" 
                    id="edit-username" 
                    v-model="editProviderData.username" 
                    required 
                    class="form-input"
                    :placeholder="t('admin.form.login_placeholder')"
                  />
                </div>
                
                <div class="form-group">
                  <label for="edit-password">{{ t('admin.form.password') }}</label>
                  <input 
                    type="password" 
                    id="edit-password" 
                    v-model="editProviderData.password" 
                    required 
                    class="form-input"
                    :placeholder="t('admin.form.password_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="edit-companyName">{{ t('admin.form.company_name') }}</label>
                  <input 
                    type="text" 
                    id="edit-companyName" 
                    v-model="editProviderData.companyName" 
                    required 
                    class="form-input"
                    :placeholder="t('admin.form.company_name')"
                  />
                </div>

                <div class="form-group">
                  <label for="edit-category">{{ t('admin.categories.label') }}</label>
                  <select 
                    id="edit-category" 
                    v-model="editProviderData.category" 
                    required 
                    class="form-input"
                  >
                    <option value="">{{ t('admin.categories.select') }}</option>
                    <option value="gaming">{{ t('admin.categories.gaming') }}</option>
                    <option value="beverages">{{ t('admin.categories.beverages') }}</option>
                    <option value="karting">{{ t('admin.categories.karting') }}</option>
                    <option value="camping">{{ t('admin.categories.camping') }}</option>
                    <option value="food">{{ t('admin.categories.food') }}</option>
                    <option value="music">{{ t('admin.categories.music') }}</option>
                    <option value="other">{{ t('admin.categories.other') }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="edit-contactPerson">{{ t('admin.form.contact_person') }}</label>
                  <input 
                    type="text" 
                    id="edit-contactPerson" 
                    v-model="editProviderData.contactPerson" 
                    class="form-input"
                    :placeholder="t('admin.form.manager_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="edit-phone">{{ t('admin.form.phone') }}</label>
                  <input 
                    type="tel" 
                    id="edit-phone" 
                    v-model="editProviderData.phone" 
                    class="form-input"
                    :placeholder="t('admin.form.phone_placeholder')"
                  />
                </div>

                <div class="form-group">
                  <label for="edit-email">{{ t('admin.form.email') || 'Email' }}</label>
                  <input 
                    type="email" 
                    id="edit-email" 
                    v-model="editProviderData.email" 
                    required 
                    class="form-input"
                    :placeholder="t('admin.form.email_placeholder')"
                  />
                </div>
                
                <button type="submit" class="btn-update" :disabled="isCreating">
                  <span v-if="isCreating">{{ t('admin.status.updating') }}</span>
                  <span v-if="!isCreating">{{ t('admin.provider.edit_title') }}</span>
                </button>
              </form>
              
              <div v-if="successMessage" class="success-message">
                {{ successMessage }}
              </div>
              
              <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/Admin/AdminSidebar.vue';
import { useProvidersStore } from '@/stores/providers.js';
import { useI18n } from '@/composables/useI18n.js';
import { post } from '@/services/apiClient.js';

export default {
  name: 'AdminHomeView',
  components: {
    AdminSidebar
  },
  setup() {
    const providersStore = useProvidersStore();
    const { t } = useI18n();
    return {
      providersStore,
      t
    };
  },
  data() {
    return {
      providers: [],
      newProvider: {
        username: ''
      },
      editProviderData: {
        _id: '',
        username: '',
        password: '',
        companyName: '',
        category: '',
        contactPerson: '',
        phone: '',
        email: ''
      },
      isEditing: false,
      editingProviderId: null,
      isCreating: false,
      successMessage: '',
      errorMessage: '',
      invitationLink: ''
    }
  },
  mounted() {
    // récupère les prestataires depuis le store pinia
    this.providers = this.providersStore.activeProviders;
  },
  methods: {

    
    goToPage(provider) {
      this.$router.push(`/providers/${provider.username}`)
    },

    async copyInvitationLink() {
      if (!this.invitationLink) {
        return;
      }

      try {
        await navigator.clipboard.writeText(this.invitationLink);
        this.successMessage = this.t('admin.messages.copy_success');
      } catch {
        this.errorMessage = this.t('admin.messages.copy_failed');
      }
    },
    
    async createProvider() {
      // réinitialise les messages
      this.successMessage = '';
      this.errorMessage = '';
      this.invitationLink = '';
      this.isCreating = true;
      
      try {
        // valide les champs
        if (!this.newProvider.username) {
          throw new Error(this.t('admin.messages.login_required'));
        }
        
        // vérifie si le login existe déjà dans le store
        const existingProvider = this.providersStore.activeProviders.find(p => 
          p.username === this.newProvider.username
        );
        
        if (existingProvider) {
          throw new Error(this.t('admin.messages.user_exists'));
        }
        
        const username = this.newProvider.username.trim();
        const payload = {
          username,
          email: `${username}@gpexplorer.com`,
          role: 'provider',
          companyName: username,
          category: 'other',
          firstName: 'Prestataire',
          lastName: username
        };

        // crée user et profil prestataire en base
        const response = await post('/api/users', payload);
        if (response?.error !== 0) {
          throw new Error(response?.message || this.t('admin.errors.create_error'));
        }

        this.invitationLink = response?.data?.invitationLink || '';

        // recharge depuis l'api pour refléter la base
        await this.providersStore.initializeProviders();
        this.providers = [...this.providersStore.activeProviders];
        
        // réinitialise le formulaire
        this.newProvider = {
          username: ''
        };
        
        this.successMessage = this.t('admin.messages.create_success_invitation', { name: username });
        
        // efface le message de succès après 5 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
        
      } catch (error) {
        this.errorMessage = error.message;
        
        // efface le message d'erreur après 5 secondes
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      } finally {
        this.isCreating = false;
      }
    },
    
    editProvider(provider) {
      // charge les données du prestataire dans le formulaire
      this.editProviderData = {
        _id: provider._id || provider.id,
        username: provider.username,
        password: provider.password,
        companyName: provider.companyName || provider.username,
        category: provider.category || 'other',
        contactPerson: provider.contactPerson || '',
        phone: provider.phone || '',
        email: provider.email || ''
      };
      
      this.isEditing = true;
      this.editingProviderId = provider.id || provider._id;
      
      // fait défiler vers le formulaire
      setTimeout(() => {
        const form = document.querySelector('.provider-form');
        if (form) form.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      this.successMessage = '';
      this.errorMessage = '';
    },

    cancelEdit() {
      this.isEditing = false;
      this.editingProviderId = null;
      this.editProviderData = {
        _id: '',
        username: '',
        password: '',
        companyName: '',
        category: '',
        contactPerson: '',
        phone: '',
        email: ''
      };
      this.successMessage = '';
      this.errorMessage = '';
    },

    async updateProvider() {
      // réinitialise les messages
      this.successMessage = '';
      this.errorMessage = '';
      this.isCreating = true;
      
      try {
        // valide les champs
        if (!this.editProviderData.username || !this.editProviderData.password || !this.editProviderData.companyName) {
          throw new Error(this.t('admin.messages.login_pass_name_required'));
        }
        
        // vérifie si le login existe déjà sauf le prestataire courant
        const existingProvider = this.providersStore.activeProviders.find(p => 
          p.username === this.editProviderData.username && p._id !== this.editProviderData._id && p.id !== this.editProviderData._id
        );
        
        if (existingProvider) {
          throw new Error(this.t('admin.messages.user_exists_other'));
        }
        
        // met à jour dans le store pinia
        const updateData = {
          username: this.editProviderData.username,
          password: this.editProviderData.password,
          email: this.editProviderData.email,
          companyName: this.editProviderData.companyName,
          category: this.editProviderData.category,
          contactPerson: this.editProviderData.contactPerson,
          phone: this.editProviderData.phone
        };

        // utilise l'id pour le store
        const providerId = this.providers.find(p => p._id === this.editProviderData._id)?.id || this.editProviderData._id;
        const result = await this.providersStore.updateProvider(providerId, updateData);

        if (!result.success) {
          throw new Error(result.error);
        }

        // met à jour la liste locale
        this.providers = [...this.providersStore.activeProviders];
        
        this.successMessage = this.t('admin.messages.update_success', { name: this.editProviderData.companyName });
        
        // sort du mode édition après 2 secondes
        setTimeout(() => {
          this.cancelEdit();
        }, 2000);
        
        // efface le message de succès après 5 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
        
      } catch (error) {
        this.errorMessage = error.message;
        
        // efface le message d'erreur après 5 secondes
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      } finally {
        this.isCreating = false;
      }
    },
    
    async deleteProvider(provider) {
      if (!confirm(this.t('admin.messages.delete_confirm', { name: provider.companyName }))) {
        return;
      }
      
      try {
        // supprime via le store pinia
        const result = await this.providersStore.removeProvider(provider.id);
        if (!result?.success) {
          throw new Error(result?.error || this.t('admin.errors.delete_error'));
        }
        
        // met à jour la liste des prestataires
        this.providers = this.providersStore.activeProviders;
        
        this.successMessage = this.t('admin.messages.delete_success');
        
        // efface le message de succès après 5 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      } catch (error) {
        this.errorMessage = `${this.t('admin.errors.delete_error')} : ${error.message}`;
        
        // efface le message d'erreur après 5 secondes
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    }
  }
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.admin-container {
  display: flex;
  min-height: 100vh;
  background: var(--surface-gradient-start);
  font-family: 'Inter', sans-serif;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  padding: 2rem 3rem;
  background: var(--surface-gradient-end);
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
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 0.5rem;
}

.section-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #000000;
  margin: 0;
}

.badge {
  background: #9f1239;
  color: #ffffff;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.card-body {
  padding: 1.5rem;
}

.btn-edit {
  background: transparent;
  color: #be123c;
  border: 1px solid #be123c;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: #be123c;
  color: #ffffff;
}

.wysiwyg-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wysiwyg-preview p {
  margin: 0;
  line-height: 1.6;
  color: #333333;
}

.image-preview {
  position: relative;
  margin-top: 1rem;
}

.image-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.btn-change-image {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-change-image:hover {
  background: #E72D55;
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.provider-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.provider-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.provider-info strong {
  word-break: break-word;
}

.provider-username {
  font-size: 0.8rem;
  color: #666666;
  font-weight: normal;
}

.provider-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.provider-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.view-btn {
  background: #be123c;
  color: #ffffff;
}

.view-btn:hover {
  background: #9f1239;
  transform: translateY(-1px);
}

.edit-btn {
  background: #166534;
  color: #ffffff;
}

.edit-btn:hover {
  background: #14532d;
  transform: translateY(-1px);
}

.delete-btn {
  background: #b91c1c;
  color: #ffffff;
}

.delete-btn:hover {
  background: #991b1b;
  transform: translateY(-1px);
}

.provider-category {
  font-size: 0.8rem;
  color: #666666;
}

.provider-services {
  background: #be123c;
  color: #ffffff;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.no-providers {
  text-align: center;
  padding: 2rem;
  color: #999999;
}

.no-providers p {
  margin: 0;
  font-size: 0.95rem;
}

.provider-contact {
  background: #be123c;
  color: #ffffff;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

/* Styles pour le formulaire de création de prestataire */
.provider-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
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

.btn-create {
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

.btn-create:hover:not(:disabled) {
  background: #9f1239;
  transform: translateY(-1px);
}

.btn-create:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.btn-update {
  background: #166534;
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
  margin-right: 10px;
}

.btn-update:hover:not(:disabled) {
  background: #14532d;
  transform: translateY(-1px);
}

.btn-update:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  background: #6c757d;
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

.btn-cancel:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
  font-size: 0.9rem;
  font-weight: 500;
}

.invitation-box {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  display: grid;
  gap: 0.75rem;
}

.invitation-box p {
  margin: 0;
  color: #0f172a;
  font-size: 0.9rem;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Mode sombre */
html.dark-mode .admin-container {
  background: var(--surface-gradient-start);
}

html.dark-mode .main-content {
  background: var(--surface-gradient-end);
}

html.dark-mode .section-header h1 {
  color: #ffffff;
}

html.dark-mode .section-subtitle {
  color: var(--text-muted);
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

html.dark-mode .wysiwyg-preview p {
  color: #b0b0b0;
}

html.dark-mode .provider-item {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark-mode .provider-info strong {
  color: #ffffff;
}

html.dark-mode .provider-username {
  color: #999999;
}

html.dark-mode .form-group label {
  color: #ffffff;
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

html.dark-mode select.form-input {
  background-color: #1f2937;
  color: #f8fafc;
}

html.dark-mode select.form-input option {
  background-color: #111827;
  color: #f8fafc;
}

html.dark-mode select.form-input option[value=''] {
  color: #cbd5e1;
}

html.dark-mode .success-message {
  background: rgba(21, 128, 61, 0.78);
  border-color: #166534;
  color: #dcfce7;
}

html.dark-mode .invitation-box {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.18);
}

html.dark-mode .invitation-box p {
  color: #e2e8f0;
}

html.dark-mode .error-message {
  background: rgba(153, 27, 27, 0.78);
  border-color: #7f1d1d;
  color: #fee2e2;
}

/* Responsive */
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
}

@media (max-width: 768px) {
  .section-header {
    margin-bottom: 1.25rem;
  }

  .section-header h1 {
    font-size: 1.6rem;
  }

  .section-subtitle {
    font-size: 0.9rem;
  }

  .dashboard-grid {
    gap: 1.25rem;
  }

  .card-header,
  .card-body {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .btn-cancel {
    margin-top: 0;
    width: 100%;
    padding: 0.8rem 1rem;
  }

  .provider-item {
    align-items: flex-start;
    gap: 0.75rem;
    flex-direction: column;
  }

  .provider-info {
    width: 100%;
  }

  .provider-actions {
    width: 100%;
    justify-content: stretch;
    gap: 0.45rem;
  }

  .provider-btn {
    flex: 1 1 calc(50% - 0.25rem);
    min-width: 0;
    text-align: center;
  }

  .btn-create,
  .btn-update {
    width: 100%;
    margin-right: 0;
  }

  .invitation-box {
    gap: 0.65rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }

  .section-header h1 {
    font-size: 1.4rem;
  }

  .provider-btn {
    flex: 1 1 100%;
  }
}
</style>
