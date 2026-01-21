import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

let isRefreshing = false
let refreshTimer: number | null = null

let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Função para salvar tokens e agendar renovação
export const saveTokens = (
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  refreshExpiresIn: number
) => {
  const now = Date.now()
  const expiresAt = now + expiresIn * 1000
  const refreshExpiresAt = now + refreshExpiresIn * 1000

  localStorage.setItem("access_token", accessToken)
  localStorage.setItem("refresh_token", refreshToken)
  localStorage.setItem("token_expires_at", expiresAt.toString())
  localStorage.setItem("refresh_expires_at", refreshExpiresAt.toString())

  scheduleTokenRefresh(expiresIn)
}

// Agenda a renovação do token antes de expirar
const scheduleTokenRefresh = (expiresIn: number) => {
  // Limpa timer anterior se existir
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }

  // Renova 30 segundos antes de expirar (ou quando restar 10% do tempo)
  const refreshTime = Math.max(expiresIn - 30, expiresIn * 0.9)
  const refreshDelay = refreshTime * 1000

  console.log(`Token será renovado em ${refreshTime} segundos`)

  refreshTimer = setTimeout(async () => {
    await refreshAccessToken()
  }, refreshDelay)
}

// Função para renovar o access token
const refreshAccessToken = async () => {
  if (isRefreshing) return

  const refreshToken = localStorage.getItem("refresh_token")
  const refreshExpiresAt = localStorage.getItem("refresh_expires_at")

  // Verifica se o refresh token expirou
  if (refreshExpiresAt && Date.now() >= parseInt(refreshExpiresAt)) {
    console.log("Refresh token expirado, redirecionando para login")
    localStorage.clear()
    window.location.href = "/login"
    return
  }

  if (!refreshToken) {
    localStorage.clear()
    window.location.href = "/login"
    return
  }

  isRefreshing = true

  try {
    console.log("Renovando access token...")
    const response = await publicApi.put("/autenticacao/refresh", null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    const { access_token, refresh_token, expires_in, refresh_expires_in } =
      response.data

    saveTokens(access_token, refresh_token, expires_in, refresh_expires_in)

    api.defaults.headers.common.Authorization = `Bearer ${access_token}`

    console.log("Token renovado com sucesso")
    processQueue(null, access_token)
  } catch (error) {
    console.error("Erro ao renovar token:", error)
    processQueue(error as Error, null)
    localStorage.clear()
    window.location.href = "/login"
  } finally {
    isRefreshing = false
  }
}

// Inicializa renovação automática se já tiver token
export const initializeTokenRefresh = () => {
  const expiresAt = localStorage.getItem("token_expires_at")
  if (!expiresAt) return

  const now = Date.now()
  const expiresAtNum = parseInt(expiresAt)
  const timeUntilExpiry = Math.floor((expiresAtNum - now) / 1000)

  if (timeUntilExpiry > 0) {
    scheduleTokenRefresh(timeUntilExpiry)
  } else {
    // Token já expirado, renova imediatamente
    refreshAccessToken()
  }
}

// Request interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Response interceptor para renovar token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem("refresh_token")

    if (!refreshToken) {
      // Sem refresh token, redireciona para login
      localStorage.clear()
      window.location.href = "/login"
      return Promise.reject(error)
    }

    try {
      const response = await publicApi.put("/autenticacao/refresh", null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      })

      const { access_token, refresh_token, expires_in, refresh_expires_in } =
        response.data

      saveTokens(access_token, refresh_token, expires_in, refresh_expires_in)

      api.defaults.headers.common.Authorization = `Bearer ${access_token}`
      originalRequest.headers.Authorization = `Bearer ${access_token}`

      processQueue(null, access_token)

      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError as Error, null)
      localStorage.clear()
      window.location.href = "/login"
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
