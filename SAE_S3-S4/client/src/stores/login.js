import { defineStore } from 'pinia'
import { ref } from 'vue'
import loginService from '@/services/login.service.js'
import registerService from '@/services/register.service.js'
import { clearTokens, getAccessToken, get } from '@/services/apiClient.js'
import { useCartStore } from '@/stores/cart.js'

function normalizeUserFromApi(userData = {}) {
  return {
    _id: userData._id || userData.id,
    username: userData.username,
    role: userData.role,
    email: userData.email || '',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    phone: userData.phone || '',
    companyName: userData.companyName || '',
    category: userData.category || '',
    qrCodeId: userData.qrCodeId || null,
    providerId: userData.providerId || null,
    session: getAccessToken()
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const sessionToken = ref(null)
  const isAuthenticated = ref(false)
  const isAuthInitialized = ref(false)
  const loginError = ref('')
  const registerError = ref('')
  let initPromise = null

  async function fetchCurrentUser() {
    try {
      const json = await get('/api/users/me')
      if (json?.error === 0 && json?.data) {
        user.value = normalizeUserFromApi(json.data)
        sessionToken.value = getAccessToken()
        isAuthenticated.value = true
        isAuthInitialized.value = true
        useCartStore().restoreCartForUser(user.value?._id)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  async function initializeFromStorage() {
    if (isAuthInitialized.value) {
      return isAuthenticated.value
    }

    if (initPromise) {
      return initPromise
    }

    initPromise = (async () => {
      const cartStore = useCartStore()
      const storedToken = getAccessToken()

      if (!storedToken) {
        user.value = null
        sessionToken.value = null
        isAuthenticated.value = false
        isAuthInitialized.value = true
        cartStore.setLoggedOutView()
        return false
      }

      sessionToken.value = storedToken
      const ok = await fetchCurrentUser()
      if (!ok) {
        clearTokens()
        user.value = null
        sessionToken.value = null
        isAuthenticated.value = false
        cartStore.setLoggedOutView()
      }

      isAuthInitialized.value = true
      return isAuthenticated.value
    })()

    try {
      return await initPromise
    } finally {
      initPromise = null
    }
  }

  async function login(credentials) {
    loginError.value = ''
    const result = await loginService.login(credentials)

    if (result?.error === 0) {
      user.value = result.data
      sessionToken.value = getAccessToken()
      isAuthenticated.value = true
      isAuthInitialized.value = true
      useCartStore().restoreCartForUser(user.value?._id)
    } else {
      const serverMessage = typeof result?.data === 'string' ? result.data : result?.message
      loginError.value = serverMessage || 'auth.errors.default_login_error'
    }

    return result
  }

  async function register(userData) {
    registerError.value = ''
    const result = await registerService.register(userData)
    if (result && result.error !== 0) {
      const serverMessage = typeof result?.data === 'string' ? result.data : result?.message
      registerError.value = serverMessage || 'auth.errors.default_register_error'
    }
    return result
  }

  function loginWithOAuth(userData, token) {
    user.value = {
      ...userData,
      session: token
    }
    sessionToken.value = token
    isAuthenticated.value = true
    isAuthInitialized.value = true
    useCartStore().restoreCartForUser(userData?._id)
  }

  async function logout() {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (e) {
      console.warn('Logout request failed:', e)
    }

    user.value = null
    sessionToken.value = null
    isAuthenticated.value = false
    isAuthInitialized.value = true
    loginError.value = ''
    registerError.value = ''
    clearTokens()
    useCartStore().setLoggedOutView()
  }

  async function updateUserInfo(updateData) {
    if (!user.value) return false

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        credentials: 'include',
        body: JSON.stringify({
          username: updateData.username,
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          phone: updateData.phone,
          currentPassword: updateData.currentPassword,
          newPassword: updateData.newPassword
        })
      })

      const json = await res.json()
      if (!res.ok || json?.error !== 0) {
        return false
      }

      const data = json?.data || {}
      if (data.username !== undefined) user.value.username = data.username
      if (data.firstName !== undefined) user.value.firstName = data.firstName
      if (data.lastName !== undefined) user.value.lastName = data.lastName
      if (data.email !== undefined) user.value.email = data.email
      if (data.phone !== undefined) user.value.phone = data.phone

      return true
    } catch (e) {
      console.error('Erreur mise à jour profil:', e)
      return false
    }
  }

  function syncUserProfile(profileData = {}) {
    if (!user.value) return false

    const keys = ['username', 'email', 'firstName', 'lastName', 'phone', 'companyName', 'category', 'providerId']
    for (const key of keys) {
      if (profileData[key] !== undefined) {
        user.value[key] = profileData[key]
      }
    }

    return true
  }

  initializeFromStorage()

  return {
    user,
    sessionToken,
    isAuthenticated,
    isAuthInitialized,
    loginError,
    registerError,
    login,
    loginWithOAuth,
    register,
    logout,
    updateUserInfo,
    syncUserProfile,
    initializeFromStorage,
    fetchCurrentUser
  }
})

export default useAuthStore
