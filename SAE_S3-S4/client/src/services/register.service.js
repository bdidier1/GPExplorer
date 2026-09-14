class RegisterService {
  async register(userData) {
    try {
      const validation = this.validateUserData(userData)
      if (!validation.isValid) {
        return { error: 1, data: validation.message }
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || null,
          role: userData.role || 'user',
          companyName: userData.companyName,
          category: userData.category
        })
      })

      const json = await res.json()

      if (res.ok && !json.error) {
        return {
          error: 0,
          data: {
            message: 'auth.success.account_created',
            user: json.user || json.data?.user
          }
        }
      }

      // si l'api retourne une erreur de validation ou un doublon
      if (json.message?.includes('existe') || json.message?.includes('exists')) {
        return { error: 1, data: 'auth.errors.user_exists' }
      }

      return { error: 1, data: json.message || 'auth.errors.register_error' }
    } catch (error) {
      console.error('Erreur dans registerService:', error)
      return { error: 1, data: 'auth.errors.register_error' }
    }
  }

  validateUserData(userData) {
    if (!userData.firstName || userData.firstName.trim().length < 2) {
      return { isValid: false, message: 'auth.validation.firstname_length' }
    }
    if (!userData.lastName || userData.lastName.trim().length < 2) {
      return { isValid: false, message: 'auth.validation.lastname_length' }
    }
    if (!userData.username || userData.username.trim().length < 3) {
      return { isValid: false, message: 'auth.validation.username_length' }
    }
    if (!userData.email || !this.isValidEmail(userData.email)) {
      return { isValid: false, message: 'auth.validation.email_invalid' }
    }
    if (!userData.password || userData.password.length < 6) {
      return { isValid: false, message: 'auth.validation.password_length' }
    }
    if (userData.password !== userData.confirmPassword) {
      return { isValid: false, message: 'auth.validation.password_mismatch' }
    }
    return { isValid: true }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

export default new RegisterService()