<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <h2>ADMIN</h2>
      <span class="admin-badge">GP Explorer</span>
    </div>
    
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems" 
        :key="item.id"
        :to="item.path"
        :class="['nav-item']"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label">{{ t(item.labelKey) === item.labelKey ? item.label : t(item.labelKey) }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script>
import { useI18n } from '@/composables/useI18n.js'

export default {
  name: 'AdminSidebar',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      menuItems: [
        { 
          id: 'dashboard', 
          labelKey: 'admin.sidebar.dashboard', 
          path: '/admin/home',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
        },
        
        { 
          id: 'services', 
          labelKey: 'admin.sidebar.services', 
          path: '/admin/services',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.2-13.2l-4.3 4.3m-1.4 1.4l-4.3 4.3M23 12h-6m-6 0H1m18.2 5.2l-4.3-4.3m-1.4-1.4l-4.3-4.3"/></svg>`
        },
        { 
          id: 'stats', 
          labelKey: 'admin.sidebar.statistics', 
          path: '/admin/statistics',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`
        },
        { 
          id: 'map', 
          labelKey: 'admin.sidebar.map', 
          path: '/admin/map',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
        },
        { 
          id: 'home-content', 
          labelKey: 'admin.sidebar.home_content', 
          path: '/admin/home-content',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
        },
        {
          id: 'shop',
          labelKey: 'admin.sidebar.shop',
          label: 'Boutique',
          path: '/admin/shop',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5 11h15L21 9"/><path d="M5 9V7a7 7 0 0 1 14 0v2"/><path d="M9 13h6"/></svg>`
        },
        { 
          id: 'users', 
          labelKey: 'admin.sidebar.users', 
          path: '/admin/users',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
        },
        {
          id: 'messages',
          labelKey: 'admin.sidebar.messages',
          path: '/admin/messages',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
        }
      ]
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.admin-sidebar {
  width: 260px;
  background: var(--surface-panel);
  color: var(--text-strong);
  padding: 2rem 0;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  overflow-y: auto;
  border-right: 2px solid #E72D55;
  z-index: 100;
  font-family: 'Inter', sans-serif;
}

.sidebar-header {
  padding: 0 1.5rem 2rem;
  border-bottom: 1px solid rgba(231, 45, 85, 0.3);
}

.sidebar-header h2 {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0 0 0.5rem;
  color: #be123c;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.admin-badge {
  display: inline-block;
  background: #fce7ef;
  color: #881337;
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
  background: rgba(231, 45, 85, 0.1);
  border-left-color: #E72D55;
}

.nav-item.router-link-active {
  background: #fce7ef;
  border-left-color: #E72D55;
  color: #881337;
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

/* responsive */
@media (max-width: 1024px) {
  .admin-sidebar {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 70px;
  }
  
  .nav-label {
    display: none;
  }
  
  .sidebar-header h2 {
    font-size: 1.2rem;
  }
  
  .admin-badge {
    display: none;
  }
}
</style>
