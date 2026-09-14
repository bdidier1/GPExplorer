import { setAccessToken } from '@/services/apiClient.js'

class LoginService {
  async login(credentials) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      })

      const json = await res.json()

      if (res.ok && json.token) {
        // stocke le token jwt d'accès
        setAccessToken(json.token)

        const userData = {
          _id: json.user._id || json.user.id,
          username: json.user.username,
          email: json.user.email,
          role: json.user.role,
          firstName: json.user.firstName,
          lastName: json.user.lastName,
          phone: json.user.phone,
          qrCodeId: json.user.qrCodeId || null,
          session: json.sessionId
        }

        if (json.user.companyName) userData.companyName = json.user.companyName
        if (json.user.category) userData.category = json.user.category
        if (json.user.organization) userData.organization = json.user.organization
        if (json.user.providerId) userData.providerId = json.user.providerId

        return { error: 0, data: userData }
      }

      return {
        error: 1,
        data: json.message || 'auth.errors.invalid_credentials'
      }
    } catch (error) {
      console.error('Erreur dans loginService:', error)
      return {
        error: 1,
        data: 'auth.errors.login_error'
      }
    }
  }
}

export default new LoginService()