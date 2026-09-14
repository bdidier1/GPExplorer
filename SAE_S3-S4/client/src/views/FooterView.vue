<template>
  <footer :class="['footer', { 'with-admin-sidebar': isAdminRoute, 'with-provider-sidebar': isProviderRoute }]">
    <!-- petite transition visuelle -->
    <div class="footer-transition">
      <div class="gradient-bar"></div>
      <div class="decorative-line">
        <span class="line-dot"></span>
        <span class="line-dot"></span>
        <span class="line-dot"></span>
      </div>
    </div>

    <div class="footer-content">
      <!-- section principale -->
      <div class="footer-grid">
        <!-- colonne logo et description -->
        <div class="footer-column footer-brand">
          <div class="brand-logo">
            <img src="/GP_EXPLORER_-LOGO.png" alt="GP Explorer Logo" class="footer-logo">
          </div>
                    <p class="brand-description">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- colonne navigation -->
        <div class="footer-column">
          <h3 class="footer-title">{{ t('footer.nav_title') }}</h3>
          <ul class="footer-links">
            <li><router-link to="/">{{ t('footer.links.home') }}</router-link></li>
            <li><router-link to="/teams">{{ t('footer.links.teams') }}</router-link></li>
            <li><router-link to="/tickets">{{ t('footer.links.tickets') }}</router-link></li>
            <li><router-link to="/map">{{ t('footer.links.map') }}</router-link></li>
          </ul>
        </div>

        <!-- colonne services -->
        <div class="footer-column">
          <h3 class="footer-title">{{ t('footer.services_title') }}</h3>
          <ul class="footer-links">
            <li><router-link to="/providers">{{ t('footer.links.vendors') }}</router-link></li>
            <li><router-link to="/contact">{{ t('footer.links.contact') }}</router-link></li>
            <li><router-link to="/faq">{{ t('footer.links.faq') }}</router-link></li>
          </ul>
        </div>

        <!-- colonne legale -->
        <div class="footer-column">
          <h3 class="footer-title">{{ t('footer.info_title') }}</h3>
          <ul class="footer-links">
            <li><a href="#" @click.prevent>{{ t('footer.links.legal') }}</a></li>
            <li><a href="#" @click.prevent>{{ t('footer.links.terms') }}</a></li>
            <li><a href="#" @click.prevent>{{ t('footer.links.sitemap') }}</a></li>
          </ul>
        </div>
        
      </div>

      <!-- barre copyright -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">
            {{ currentYear }} <span class="brand-name"> - {{ t('footer.made_by') }}</span>
          </p>
          <div class="payment-methods">
            <span class="payment-text">{{ t('footer.secure_payment') }}</span>
            <div class="payment-icons">
              <svg class="payment-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              <svg class="payment-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- elements decoratifs -->
    <div class="decorative-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </footer>
</template>

<script>
import { useI18n } from '@/composables/useI18n.js'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'FooterView',
  setup() {
    const { t } = useI18n()
    const currentYear = new Date().getFullYear()
    const route = useRoute()
    const isAdminRoute = computed(() => route.path.startsWith('/admin'))
    const isProviderRoute = computed(() => route.path.startsWith('/provider'))
    return { t, currentYear, isAdminRoute, isProviderRoute }
  }
}
</script>

<style scoped>
/* styles importes depuis le fichier css dedie */
@import '@/assets/FooterView.css';
</style>
