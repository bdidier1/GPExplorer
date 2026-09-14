<template>
  <div class="admin-container">
    <AdminSidebar />
    
    <main class="admin-home-content">
      <h1 class="page-title">{{ t('admin.content.page_title') }}</h1>

      <div class="language-selector">
      <button
        v-for="lang in languages"
        :key="lang.code"
        :class="['lang-btn', { active: currentLanguage === lang.code }]"
        @click="switchLanguage(lang.code)"
      >
        {{ lang.label }}
      </button>
    </div>

    <div class="editor-container">
      <div class="form-group">
        <label for="title">{{ t('admin.content.section_title_label') }}</label>
        <input
          id="title"
          v-model="editableContent.title"
          type="text"
          class="title-input"
          :placeholder="t('admin.content.section_title_placeholder')"
        />
      </div>

      <div class="form-group">
        <label for="editor">{{ t('admin.content.section_content_label') }}</label>
        <Editor
          id="editor"
          v-model="editableContent.htmlContent"
          api-key="cph7vv4ejy1i3p2uwkmcz7ljtfpir3ttttlmithai4dgjrny"
          :init="editorConfig"
        />
      </div>

      <div class="form-group">
        <label for="imageUrl">{{ t('admin.content.section_image_label') }}</label>
        <div class="image-upload-section">
          <div class="image-input-wrapper">
            <input
              id="imageUrl"
              v-model="editableContent.imageUrl"
              type="text"
              class="image-input"
              placeholder="/img/votre-image.jpg ou uploadez une image"
              readonly
            />
            <button class="upload-btn" @click="triggerFileInput">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {{ t('admin.content.import_btn') }}
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              style="display: none"
              @change="handleFileUpload"
            />
          </div>
          <div v-if="editableContent.imageUrl" class="image-preview">
            <img :src="editableContent.imageUrl" :alt="editableContent.title" />
          </div>
          <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn-cancel" @click="resetContent">
          {{ t('admin.content.cancel_btn') }}
        </button>
        <button class="btn-save" @click="saveContent" :disabled="isSaving">
          {{ isSaving ? t('admin.content.saving') : t('admin.content.save_btn') }}
        </button>
      </div>

      <div v-if="saveMessage" :class="['save-message', saveMessage.type]">
        {{ saveMessage.text }}
      </div>
    </div>
  </main>
</div>
</template>

<script>
import { useHomeContentStore } from '@/stores/homeContent'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import Editor from '@tinymce/tinymce-vue'
import { useI18n } from '@/composables/useI18n.js'

export default {
  name: 'AdminHomeContentView',
  components: {
    AdminSidebar,
    Editor
  },
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      currentLanguage: 'fr',
      languages: [
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' }
      ],
      editableContent: {
        title: '',
        htmlContent: '',
        imageUrl: ''
      },
      isSaving: false,
      saveMessage: null,
      uploadError: null,
      editorConfig: {
        height: 500,
        menubar: false,
        statusbar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks fontsize | ' +
          'bold italic underline forecolor backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'link image media | removeformat code fullscreen | help',
        content_style: 'body { font-family:Inter,Arial,sans-serif; font-size:16px; line-height:1.6; color:#333; }',
        font_size_formats: '12px 14px 16px 18px 20px 24px 28px 32px',
        block_formats: 'Paragraphe=p; Titre 2=h2; Titre 3=h3; Titre 4=h4',
        branding: false,
        promotion: false
      }
    }
  },
  computed: {
    homeContentStore() {
      return useHomeContentStore()
    }
  },
  async mounted() {
    await this.homeContentStore.loadContent()
    this.loadLanguageContent()
  },
  methods: {
    switchLanguage(lang) {
      this.currentLanguage = lang
      this.loadLanguageContent()
    },
    
    loadLanguageContent() {
      const content = this.homeContentStore.getContent(this.currentLanguage)
      this.editableContent = {
        title: content.title,
        htmlContent: content.htmlContent,
        imageUrl: content.imageUrl
      }
    },
    
    resetContent() {
      this.loadLanguageContent()
      this.saveMessage = null
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      this.uploadError = null
      
      // Vérifier le type de fichier
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        this.uploadError = this.t('admin.content.upload_invalid_format')
        return
      }
      
      // Vérifier la taille (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        this.uploadError = this.t('admin.content.upload_too_large')
        return
      }
      
      // Convertir en base64 pour affichage immédiat
      const reader = new FileReader()
      reader.onload = (e) => {
        this.editableContent.imageUrl = e.target.result
      }
      reader.onerror = () => {
        this.uploadError = this.t('admin.content.upload_error')
      }
      reader.readAsDataURL(file)
    },
    
    async saveContent() {
      this.isSaving = true
      this.saveMessage = null
      
      try {
        const result = await this.homeContentStore.updateContent(
          this.currentLanguage,
          this.editableContent.title,
          this.editableContent.htmlContent,
          this.editableContent.imageUrl
        )
        
        if (result.success) {
          this.saveMessage = {
            type: 'success',
            text: this.t('admin.content.save_success')
          }
          setTimeout(() => {
            this.saveMessage = null
          }, 3000)
        } else {
          throw new Error(result.error || this.t('admin.content.unknown_error'))
        }
      } catch (error) {
        this.saveMessage = {
          type: 'error',
          text: `${this.t('admin.content.save_error')} : ${error.message}`
        }
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.admin-container {
  display: flex;
  background: var(--surface-gradient-start);
  min-height: 100vh;
}

.admin-home-content {
  /* main content area to the right of the fixed sidebar */
  box-sizing: border-box;
  flex: 1;
  margin: 0;
  margin-left: 260px;
  padding: 2.5rem 2.5rem 4rem;
  padding-top: 100px; /* offset pour laisser la place à la navbar fixe */
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: var(--surface-gradient-end);
  color: var(--text-strong);
  transition: background-color 0.3s ease;
  overflow-x: hidden;
}

.page-title {
  font-size: 2rem;
  color: #E72D55;
  margin-bottom: 2.5rem;
  font-weight: 700;
  text-align: center;
  position: relative;
  z-index: 20; /* s'assurer que le titre reste visible au-dessus de la navbar */
}

/* Make title responsive */
@media (max-width: 1024px) {
  .admin-home-content { 
    margin-left: 220px;
    padding: 2rem 2rem 3rem;
    padding-top: 90px;
  }
  .page-title { font-size: 1.8rem; }
}

@media (max-width: 768px) {
  .admin-home-content { 
    margin-left: 70px;
    padding: 1.5rem 1.5rem 3rem;
    padding-top: 80px;
  }
  .page-title { font-size: 1.5rem; }
}

@media (max-width: 480px) {
  .admin-home-content { 
    margin-left: 70px;
    padding: 1rem 1rem 2rem;
    padding-top: 70px;
  }
  .page-title { 
    font-size: 1.3rem; 
    text-align: center;
    margin-bottom: 1.5rem;
  }
}

html.dark-mode .page-title {
  color: #E72D55;
}

.language-selector {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  padding: 0.5rem;
  background: var(--surface-chip);
  border-radius: 12px;
  width: fit-content;
  max-width: 100%;
  flex-wrap: wrap;
}

.lang-btn {
  padding: 0.75rem 2rem;
  border: 2px solid transparent;
  background: var(--surface-card);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 480px) {
  .lang-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}

.lang-btn:hover {
  border-color: #E72D55;
  color: #E72D55;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 45, 85, 0.2);
}

.lang-btn.active {
  background: #9f1239;
  border-color: #9f1239;
  color: #f8fafc;
  box-shadow: 0 4px 16px rgba(231, 45, 85, 0.3);
}

.editor-container {
  background: var(--surface-panel);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-subtle);
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;

  box-sizing: border-box;
}

/* Responsive editor container */
@media (max-width: 1024px) {
  .editor-container { 
    max-width: 900px; 
    width: 100%; 
    padding: 2rem;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .editor-container { 
    max-width: 100%; 
    width: 100%; 
    padding: 1.5rem;
    border-radius: 12px;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .editor-container { 
    width: 100%; 
    padding: 1rem;
    border-radius: 8px;
    margin: 0;
  }
  
  .form-group label {
    font-size: 0.9rem;
  }
  
  .image-input-wrapper {
    flex-direction: column;
  }
  
  .upload-btn {
    width: 100%;
    justify-content: center;
  }
}

.form-group {
  margin-bottom: 2.5rem;
}

.form-group label {
  display: block;
  font-weight: 700;
  color: var(--text-strong);
  margin-bottom: 0.75rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.title-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid var(--border-subtle);
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 500;
  background: var(--surface-card);
  color: var(--text-strong);
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.title-input:focus {
  outline: none;
  border-color: #E72D55;
  box-shadow: 0 0 0 4px rgba(231, 45, 85, 0.1);
}

/* Empêcher le style d'autocomplétion du navigateur */
.title-input:-webkit-autofill,
.title-input:-webkit-autofill:hover,
.title-input:-webkit-autofill:focus,
.title-input:-webkit-autofill:active,
.image-input:-webkit-autofill,
.image-input:-webkit-autofill:hover,
.image-input:-webkit-autofill:focus,
.image-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px var(--surface-card) inset !important;
  -webkit-text-fill-color: var(--text-strong) !important;
  transition: background-color 5000s ease-in-out 0s;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.image-input-wrapper {
  display: flex;
  gap: 0.75rem;
}

.image-input {
  flex: 1;
  padding: 1rem 1.25rem;
  border: 2px solid var(--border-subtle);
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  background: var(--surface-card);
  color: var(--text-strong);
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.image-input:focus {
  outline: none;
  border-color: #E72D55;
  box-shadow: 0 0 0 4px rgba(231, 45, 85, 0.1);
}

.upload-btn {
  padding: 1rem 2rem;
  background: #9f1239;
  border: 2px solid #9f1239;
  border-radius: 10px;
  color: #f8fafc;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.upload-btn:hover {
  background: #c91d42;
  border-color: #c91d42;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 45, 85, 0.4);
}

.upload-btn svg {
  width: 20px;
  height: 20px;
}

.upload-error {
  color: var(--warning-text);
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
}

.image-preview {
  border: 3px solid #E72D55;
  border-radius: 12px;
  overflow: hidden;
  max-width: 700px;
  box-shadow: 0 8px 24px rgba(231, 45, 85, 0.15);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid var(--border-subtle);
}

.btn-cancel,
.btn-save {
  padding: 1rem 2.5rem;
  border: 2px solid transparent;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.btn-cancel {
  background: var(--surface-muted);
  color: var(--text-muted);
  border-color: var(--border-subtle);
}

.btn-cancel:hover {
  background: var(--text-strong);
  color: var(--surface-panel);
  border-color: var(--text-strong);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-save {
  background: #9f1239;
  color: #f8fafc;
  border-color: #9f1239;
}

.btn-save:hover:not(:disabled) {
  background: #c91d42;
  border-color: #c91d42;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 45, 85, 0.4);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.save-message {
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  text-align: center;
  font-size: 1rem;
  letter-spacing: 0.03em;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.save-message.success {
  background: var(--success-bg);
  color: var(--success-text);
  border: 2px solid #28a745;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.save-message.error {
  background: var(--warning-bg);
  color: var(--warning-text);
  border: 2px solid var(--warning-border);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}
</style>
