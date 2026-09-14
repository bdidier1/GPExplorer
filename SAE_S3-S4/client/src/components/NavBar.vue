<template>
  <nav class="navbar">
    <div class="logo">
      <router-link to="/" class="logo-link">
        <img
          src="/GP_EXPLORER_-LOGO.png"
          alt="Logo"
          style="height: 50px; vertical-align: middle; margin-right: 8px"
        />
      </router-link>
    </div>

    <!-- bouton burger -->
    <button
      class="burger-menu"
      @click="toggleMenu"
      :class="{ active: isMenuOpen }"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <ul class="nav-links" :class="{ active: isMenuOpen }">
      <li v-for="link in currentLinks" :key="link.name">
        <router-link :to="link.url" class="nav-link" @click="closeMenu">{{
          link.name
        }}</router-link>
      </li>
    </ul>

    <!-- boutons d'action -->
    <div class="action-buttons" :class="{ active: isMenuOpen }">
      <button
        class="icon-btn"
        @click="toggleDarkMode"
        :title="darkMode ? t('nav.light_mode') : t('nav.dark_mode')"
      >
        <svg
          v-if="!darkMode"
          class="icon-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"
          />
        </svg>
        <svg
          v-else
          class="icon-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
          />
        </svg>
      </button>
      <!-- sous-menu langues -->
      <div class="lang-menu-wrapper" ref="langMenuWrapper">
        <button
          class="icon-btn lang-btn"
          @click="toggleLangMenu"
          :title="t('navbar_extra.language_label') + getCurrentLanguage().toUpperCase()"
        >
          <svg
            class="icon-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"
            />
          </svg>
          <span class="lang-text">{{ getCurrentLanguage().toUpperCase() }}</span>
        </button>
        <transition name="fade">
          <div v-if="showLangMenu" class="lang-submenu">
            <p
              v-for="code in languageOptions"
              :key="code"
              class="lang-option"
              :class="{ active: isCurrentLanguage(code) }"
              @click="selectLanguage(code)"
            >
              {{ code }}
            </p>
          </div>
        </transition>
      </div>
      <router-link
        v-if="showCartButton"
        to="/cart"
        class="icon-btn"
        @click="closeMenu"
        :title="t('nav.cart')"
      >
        <svg
          class="icon-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
          />
        </svg>
        <span class="cart-count" v-if="cartCount > 0">{{ cartCount }}</span>
      </router-link>

      <!-- bouton de connexion si non connecté -->
      <button v-if="!authStore.isAuthenticated" class="btn btn-login" @click="openLogin">
        <svg
          class="icon-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
        {{ t('nav.login') }}
      </button>

      <!-- menu utilisateur si connecté -->
      <div v-else class="user-menu-wrapper" ref="userMenuWrapper">
        <button class="btn btn-user" @click="toggleUserMenu">
          <svg
            class="icon-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          <span class="user-name">{{ getUserDisplayName() }}</span>
          <svg class="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
          </svg>
        </button>
        
        <transition name="fade">
          <div v-if="showUserMenu" class="user-submenu">
            <div class="user-info">
              <p class="user-email">{{ authStore.user?.email }}</p>
              <span class="user-role" :class="authStore.user?.role">
                {{ getRoleLabel(authStore.user?.role) }}
              </span>
            </div>
            <hr class="menu-divider">
            <router-link 
              :to="getDashboardUrl()" 
              class="menu-item"
              @click="closeUserMenu"
            >
              <svg class="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              {{ t('nav.dashboard') }}
            </router-link>
            <router-link 
              v-if="authStore.user?.role === 'provider' && hasStatsAccess" 
              to="/provider/statistics" 
              class="menu-item"
              @click="closeUserMenu"
            >
              <svg class="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
              </svg>
              {{ t('nav.my_statistics') }}
            </router-link>
            <button class="menu-item logout-btn" @click="handleLogout">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              {{ t('nav.logout') }}
            </button>
          </div>
        </transition>
      </div>
    </div>
    
    <!-- composant modal de login -->
    <LoginModal 
      :showLogin="showLogin" 
      @close="closeLogin" 
      @signup="openSignup" 
    />
    
    <!-- composant modal d'inscription -->
    <RegisterModal 
      :showRegister="showRegister" 
      @close="closeRegister" 
      @login="openLoginFromRegister"
      @success="handleRegisterSuccess"
    />
  </nav>
</template>

<script>
import LoginModal from '@/components/LoginModal.vue';
import RegisterModal from '@/components/RegisterModal.vue';
import { useAuthStore } from '@/stores/login.js'
import { useCartStore } from '@/stores/cart.js'
import { useProvidersStore } from '@/stores/providers.js'
import { useLanguage } from '@/composables/useLanguage.js'
import { useI18n } from '@/composables/useI18n.js'
import { useTheme } from '@/composables/useTheme.js'

export default {
  name: "NavBar",
  components: {
    LoginModal,
    RegisterModal
  },
  setup() {
    const authStore = useAuthStore()
    const cartStore = useCartStore()
    const providersStore = useProvidersStore()
    const { currentLanguage } = useLanguage()
    const { t } = useI18n()
    const { darkMode, toggleDarkMode, initTheme } = useTheme()
    return { authStore, cartStore, providersStore, currentLanguage, t, darkMode, toggleDarkMode, initTheme }
  },
  data() {
    return {
      isMenuOpen: false,
      showLangMenu: false,
      showUserMenu: false,
      languageOptions: ["fr", "en", "es"],
      showLogin: false,
      showRegister: false
    };
  },
  computed: {
    currentLinks() {
      const baseLinks = [
        { name: this.t('nav.links.home'), url: "/" },
        { name: this.t('nav.links.teams'), url: '/teams' },
        { name: this.t('nav.links.providers'), url: '/providers' },
        { name: this.t('nav.links.map'), url: "/map" },
        { name: this.t('nav.links.contact'), url: "/contact" },
        { name: this.t('nav.links.tickets'), url: "/tickets" },
        { name: this.t('nav.links.shop'), url: "/shop" },
      ];

      const role = this.authStore.user?.role;
      const restrictedRoles = ['organizer', 'provider'];

      if (this.authStore.isAuthenticated && restrictedRoles.includes(role)) {
        // enlève les liens restreints
        let links = baseLinks.filter(link => link.url !== '/tickets');
        
        // pour un prestataire on pointe vers son stand
        if (role === 'provider') {
          links = links.map(link => {
            if (link.url === '/providers') {
              return { 
                ...link, 
                name: this.t('nav.my_stand'),
                url: `/providers/${this.authStore.user.username}` 
              };
            }
            return link;
          });
        }
        
        return links;
      }

      return baseLinks;
    },
    cartCount() {
      // calcule le total d'articles dans le panier
      return this.cartStore.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    showCartButton() {
      const role = this.authStore.user?.role;
      const restrictedRoles = ['organizer', 'provider'];
      return !(this.authStore.isAuthenticated && restrictedRoles.includes(role));
    },
    hasStatsAccess() {
      if (this.authStore.user?.role !== 'provider') return false;
      const user = this.authStore.user;

      const provider = this.providersStore.activeProviders.find((p) =>
        (user.providerId && String(p.id) === String(user.providerId)) ||
        (user._id && String(p.userId) === String(user._id)) ||
        (user.username && p.username === user.username)
      );

      if (provider) {
        return provider.hasStatsAccess === true;
      }

      const content = this.providersStore.getProviderContent(user.username);
      return content?.settings?.hasStatsAccess === true;
    }
  },
  mounted() {
    this.initTheme();
    // écoute le clic extérieur pour fermer les menus
    document.addEventListener("click", this.handleOutsideClick);
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    openLogin() {
      this.closeMenu();
      this.showLogin = true;
    },
    closeLogin() {
      this.showLogin = false;
    },
    openSignup() {
      this.closeLogin();
      this.showRegister = true;
    },
    closeRegister() {
      this.showRegister = false;
    },
    openLoginFromRegister() {
      this.closeRegister();
      this.showLogin = true;
    },
    handleRegisterSuccess() {
      // petit log de succès
      console.log('Inscription réussie');
      // ouvre ensuite la modale de login
      this.openLoginFromRegister();
    },
    toggleLangMenu() {
      this.showLangMenu = !this.showLangMenu;
    },
    closeLangMenu() {
      this.showLangMenu = false;
    },
    selectLanguage(code) {
      if (this.currentLanguage !== code) {
        const event = new CustomEvent("languageChanged", {
          detail: { language: code },
        });
        globalThis.dispatchEvent(event);
        localStorage.setItem('preferredLanguage', code);
      }
      this.closeLangMenu();
    },
    handleOutsideClick(e) {
      // ferme le menu langues si clic extérieur
      if (this.showLangMenu) {
        const langWrap = this.$refs.langMenuWrapper;
        if (langWrap && !langWrap.contains(e.target)) {
          this.showLangMenu = false;
        }
      }
      
      // ferme le menu utilisateur si clic extérieur
      if (this.showUserMenu) {
        const userWrap = this.$refs.userMenuWrapper;
        if (userWrap && !userWrap.contains(e.target)) {
          this.showUserMenu = false;
        }
      }
    },

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },

    closeUserMenu() {
      this.showUserMenu = false;
    },

    getUserDisplayName() {
      const user = this.authStore.user;
      if (!user) return this.t('nav.user');
      
      // priorité prénom nom puis username puis email
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      } else if (user.username) {
        return user.username;
      } else {
        return user.email;
      }
    },

    getRoleLabel(role) {
      if (!role) return this.t('nav.roles.user');
      return this.t(`nav.roles.${role}`) || this.t('nav.roles.user');
    },

    getDashboardUrl() {
      const role = this.authStore.user?.role;
      switch (role) {
        case 'organizer':
          return '/admin/home';
        case 'provider':
          return '/provider/home';
        case 'user':
          return '/user/home';
        default:
          return '/';
      }
    },
    getCurrentLanguage() {
      return this.currentLanguage || 'fr';
    },
    isCurrentLanguage(code) {
      return this.getCurrentLanguage() === code;
    },

    async handleLogout() {
      try {
        this.authStore.logout();
        this.closeUserMenu();
        // redirige vers l'accueil après déconnexion
        if (this.$route.path !== '/') {
          this.$router.push('/');
        }
        console.log('Déconnexion réussie');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    },
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  },
};
</script>

<style scoped>
/* importe le css externe pour garder ce fichier lisible */
@import "@/assets/NavBar.css";

/* sous-menu langues */
.lang-menu-wrapper {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  height: 100%;
}
.lang-btn {
  display: flex;
  align-items: center;
}
.lang-submenu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  padding: 6px 6px;
  display: flex;
  gap: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}
.lang-option {
  text-transform: uppercase;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  background: rgba(255, 255, 255, 0.5);
  transition: background 0.18s, color 0.18s;
}
.lang-option:hover {
  background: #444;
  color: #fff;
}
.lang-option.active {
  background: #000;
  color: #fff;
  cursor: default;
}

/* menu utilisateur */
.user-menu-wrapper {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  height: 100%;
}

.btn-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 0.9em;
}

.btn-user:hover {
  background: rgba(0, 0, 0, 0.2);
}

.user-name {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.btn-user:hover .chevron-icon {
  transform: rotate(180deg);
}

.user-submenu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px 0;
  min-width: 250px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.user-info {
  padding: 8px 16px;
  margin-bottom: 8px;
}

.user-email {
  font-size: 0.9em;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #374151;
}

.user-role {
  font-size: 0.75em;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.user-role.organizer {
  background: #991b1b;
  color: #ffffff;
}

.user-role.provider {
  background: #065f46;
  color: #ffffff;
}

.user-role.user {
  background: #1d4ed8;
  color: #ffffff;
}

.menu-divider {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 8px 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  font-size: 0.9em;
  transition: background-color 0.2s ease;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  font-family: inherit;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.menu-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.logout-btn {
  color: #dc2626 !important;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.1) !important;
}

/* mode sombre */
html.dark-mode .btn-user {
  background: #000000;
  border-color: #333333;
  color: #ffffff;
}

html.dark-mode .btn-user:hover {
  background: #111111;
}

html.dark-mode .user-submenu {
  background: rgba(31, 31, 31, 0.98);
  border-color: #404040;
  color: #f5f5f5;
}

html.dark-mode .user-email {
  color: #ffffff;
}

html.dark-mode .menu-divider {
  border-color: #404040;
}

html.dark-mode .menu-item {
  color: #ffffff;
}

html.dark-mode .menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

html.dark-mode .logout-btn {
  color: #f87171 !important;
}

/* responsive */
@media (max-width: 768px) {
  .user-submenu {
    right: -20px;
    min-width: 200px;
  }
  
  .user-name {
    max-width: 100px;
  }
}
</style>
