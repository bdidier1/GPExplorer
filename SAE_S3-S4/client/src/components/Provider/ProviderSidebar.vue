<template>
  <aside class="provider-sidebar">
    <div class="sidebar-header">
      <span class="provider-badge">GP Explorer</span>
    </div>
    
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems" 
        :key="item.id"
        :to="item.path"
        :class="['nav-item']"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label">{{ t(item.labelKey) }}</span>
      </router-link>
    </nav>

  </aside>
</template>

<script>
import { useI18n } from '@/composables/useI18n.js'
import { useAuthStore } from '@/stores/login.js'
import { useProvidersStore } from '@/stores/providers.js'

export default {
  name: 'ProviderSidebar',
  setup() {
    const { t } = useI18n()
    const authStore = useAuthStore()
    const providersStore = useProvidersStore()
    return { t, authStore, providersStore }
  },
  computed: {
    hasStatsAccess() {
      if (this.authStore.user?.role !== 'provider') return false
      const user = this.authStore.user

      const provider = this.providersStore.activeProviders.find((p) =>
        (user.providerId && String(p.id) === String(user.providerId)) ||
        (user._id && String(p.userId) === String(user._id)) ||
        (user.username && p.username === user.username)
      )

      if (provider) {
        return provider.hasStatsAccess === true
      }

      const content = this.providersStore.getProviderContent(user.username)
      return content?.settings?.hasStatsAccess === true
    },
    menuItems() {
      const items = []

      items.push({
        id: 'dashboard',
        labelKey: 'provider.sidebar.dashboard',
        path: '/provider/account',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>`
      })

      if (this.hasStatsAccess) {
        items.push({
          id: 'statistics',
          labelKey: 'provider.sidebar.statistics',
          path: '/provider/statistics',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
        })
      }

      items.push(
        {
          id: 'products',
          labelKey: 'provider.sidebar.products',
          path: '/provider/products',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
        },
        {
          id: 'map',
          labelKey: 'provider.sidebar.map',
          path: '/provider/home',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
        }
      )

      return items
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.provider-sidebar {
  width: 260px;
  background: var(--surface-panel);
  color: var(--text-strong);
  padding: calc(72px + 2rem) 0 2rem; /* push content below top navbar */
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  overflow-y: auto;
  border-right: 1px solid var(--border-subtle);
  z-index: 100;
  font-family: 'Inter', sans-serif;
}

.sidebar-header {
  padding: 0 1.5rem 2rem;
  border-bottom: 1px solid rgba(76, 175, 80, 0.3);
}

.sidebar-header h2 {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0 0 0.5rem;
  color: #166534;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.provider-badge {
  display: inline-block;
  background: var(--surface-muted);
  color: var(--text-strong);
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.sidebar-nav {
  padding: 1.5rem 0;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: transparent;
  color: var(--text-strong);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: var(--surface-muted);
  border-left-color: #4caf50;
}

.nav-item.router-link-active {
  background: var(--surface-muted);
  border-left-color: #4caf50;
  color: var(--text-strong);
}

.nav-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon :deep(svg) {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

/* Responsive */
@media (max-width: 1024px) {
  .provider-sidebar {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .provider-sidebar {
    width: 70px;
  }
  
  .nav-label {
    display: none;
  }
  
  .sidebar-header h2 {
    font-size: 1.2rem;
  }
  
  .provider-badge {
    display: none;
  }
}
</style>
