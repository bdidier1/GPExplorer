/* client http centralisé pour parler avec l'api */
/* ajoute le jwt gère le refresh et parse le json */

const TOKEN_KEY = 'accessToken'

// helpers token
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
}

// logique de refresh
let refreshPromise = null

async function refreshAccessToken() {
  // évite les refresh en parallèle
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include' // envoie le cookie refresh token httpOnly
      })
      if (!res.ok) {
        clearTokens()
        return null
      }
      const data = await res.json()
      if (data.token) {
        setAccessToken(data.token)
        return data.token
      }
      clearTokens()
      return null
    } catch {
      clearTokens()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// requête générique
async function request(url, options = {}) {
  const headers = { ...options.headers }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  })

  // si 401 tente un refresh puis rejoue la requête
  if (res.status === 401 && !options._retried) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        _retried: true
      })
    }
  }

  return res
}

// méthodes raccourcies
export async function get(url) {
  const res = await request(url)
  return res.json()
}

export async function post(url, body) {
  const res = await request(url, { method: 'POST', body })
  return res.json()
}

export async function put(url, body) {
  const res = await request(url, { method: 'PUT', body })
  return res.json()
}

export async function del(url) {
  const res = await request(url, { method: 'DELETE' })
  return res.json()
}

export async function patch(url, body) {
  const res = await request(url, { method: 'PATCH', body })
  return res.json()
}
