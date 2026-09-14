import { createRouter, createWebHistory } from 'vue-router'
// stores
import { useAuthStore } from '@/stores/login.js'
import { useProvidersStore } from '@/stores/providers.js'
// utilitaires du guard
import { checkAccess } from './guardUtils.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('../views/TeamView.vue')
    },
    // route dynamique prestataire à garder avant /providers
    {
      path: '/providers/:username',
      name: 'dynamic-provider',
      component: () => import('../views/Provider/DynamicProviderView.vue'),
      props: true
    },
    {
      path: '/providers',
      name: 'providers',
      component: () => import('../views/ProvidersView.vue')
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../views/FAQView.vue')
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: () => import('../views/TicketsView.vue'),
      meta: {
        blockedRoles: ['provider', 'organizer']
      }
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShopView.vue')
    },
    {
      path: '/shop/:id',
      name: 'shop-item',
      component: () => import('../views/ShopItemView.vue'),
      props: true
    },
    {
      path: '/tickets/:segment',
      name: 'tickets-segment',
      component: () => import('../views/TicketsSegmentView.vue'),
      props: true,
      meta: {
        blockedRoles: ['provider', 'organizer']
      }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
      meta: {
        blockedRoles: ['provider', 'organizer']
      }
    },
    // page accès refusé 403
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('../components/ForbiddenView.vue')
    },
    // callback oauth google discord
    {
      path: '/auth/callback',
      name: 'oauth-callback',
      component: () => import('../views/OAuthCallbackView.vue'),
      meta: { public: true }
    },
    {
      path: '/invitation/setup-password',
      name: 'provider-invitation-setup',
      component: () => import('../views/ProviderInvitationSetupView.vue'),
      meta: { public: true }
    },
    // routes admin
    {
      path: '/admin/home',
      name: 'admin-home',
      component: () => import('../views/Admin/AdminHomeView.vue')
    },
    {
      path: '/admin/services',
      name: 'admin-services',
      component: () => import('../views/Admin/AdminServicesView.vue')
    },
    {
      path: '/admin/statistics',
      name: 'admin-statistics',
      component: () => import('../views/Admin/AdminStatisticsView.vue')
    },
    {
      path: '/admin/map',
      name: 'admin-map',
      component: () => import('../views/Admin/AdminMapView.vue')
    },
    {
      path: '/admin/home-content',
      name: 'admin-home-content',
      component: () => import('../views/Admin/AdminHomeContentView.vue')
    },
    {
      path: '/admin/shop',
      name: 'admin-shop',
      component: () => import('../views/Admin/AdminShopView.vue')
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/Admin/AdminUsersView.vue')
    },
    {
      path: '/admin/messages',
      name: 'admin-messages',
      component: () => import('../views/Admin/AdminMessagesView.vue')
    },
    // routes provider
    {
      path: '/provider/home',
      name: 'provider-home',
      component: () => import('../views/Provider/HomeView.vue')
    },
    {
      path: '/provider/account',
      name: 'provider-account',
      component: () => import('../views/Provider/AccountView.vue')
    },
    {
      path: '/provider/products',
      name: 'provider-products',
      component: () => import('../views/Provider/ProductsView.vue')
    },
    {
      path: '/provider/statistics',
      name: 'provider-statistics',
      component: () => import('../views/Provider/ProviderStatisticsView.vue')
    },


    // routes user
    {
      path: '/user/home',
      name: 'user-home',
      component: () => import('../views/User/HomeView.vue')
    },

    // route 404 à laisser en dernier
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

function getBlockedRoles(to) {
  return to.matched.reduce((acc, record) => {
    if (record.meta?.blockedRoles) {
      acc.push(...record.meta.blockedRoles)
    }
    return acc
  }, [])
}

function getExpectedRole(path) {
  const firstSegment = '/' + (path.split('/')[1] || '')
  if (firstSegment === '/user') return 'user'
  if (firstSegment === '/provider') return 'provider'
  if (firstSegment === '/admin') return 'organizer'
  return null
}

function canAccessProviderStats(auth, providersStore, path) {
  if (path !== '/provider/statistics' || auth.user?.role !== 'provider') {
    return true
  }
  const user = auth.user

  const provider = providersStore.activeProviders.find((p) =>
    (user.providerId && String(p.id) === String(user.providerId)) ||
    (user._id && String(p.userId) === String(user._id)) ||
    (user.username && p.username === user.username)
  )

  if (provider) {
    return provider.hasStatsAccess === true
  }

  // si les providers ne sont pas hydratés on ne bloque pas trop tôt
  if (!providersStore.activeProviders.length) {
    return true
  }

  const content = providersStore.getProviderContent(user.username)
  return content?.settings?.hasStatsAccess === true
}

// guard global auth + rôle
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  const providersStore = useProvidersStore()

  if (!auth.isAuthInitialized) {
    await auth.initializeFromStorage()
  }

  const path = to.path
  const isAuthenticated = auth.isAuthenticated
  const role = auth.user?.role

  const blockedRoles = getBlockedRoles(to)

  if (blockedRoles.length && isAuthenticated && role && blockedRoles.includes(role)) {
    return next({ name: 'forbidden', query: { reason: 'role', expected: 'user', actual: role, redirect: to.fullPath } })
  }

  // utilise checkAccess pour vérifier l'accès
  if (checkAccess(path, isAuthenticated, role)) {
    if (!canAccessProviderStats(auth, providersStore, path)) {
      return next({ name: 'forbidden', query: { reason: 'access_denied', redirect: to.fullPath } })
    }
    return next()
  }

  const expected = getExpectedRole(path)

  // pas authentifié donc redirection avec reason auth
  if (!isAuthenticated) {
    return next({ name: 'forbidden', query: { reason: 'auth', expected, redirect: to.fullPath } })
  }

  // authentifié mais mauvais rôle donc reason role
  return next({ name: 'forbidden', query: { reason: 'role', expected, actual: role, redirect: to.fullPath } })
})

export default router
