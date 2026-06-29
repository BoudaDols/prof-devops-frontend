import api from './client'
import { useAuthStore } from '../stores/auth'
import router from '../router'

// Track if a token refresh is already in progress (prevents multiple simultaneous refreshes)
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function onRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token))
  pendingRequests = []
}

export function setupInterceptors() {
  // ── Request interceptor ────────────────────────────────────────────────
  // Attaches the access token to every outgoing request
  api.interceptors.request.use((config) => {
    const auth = useAuthStore()

    if (auth.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`
    }

    return config
  })

  // ── Response interceptor ───────────────────────────────────────────────
  // Catches 401 errors and tries to refresh the token before giving up
  api.interceptors.response.use(
    // Success — pass through
    (response) => response,

    // Error — handle 401
    async (error) => {
      const originalRequest = error.config
      const auth = useAuthStore()

      // Don't try to refresh if:
      // - It's not a 401
      // - The failed request was the refresh endpoint itself (avoid infinite loop)
      // - This request was already retried
      if (
        error.response?.status !== 401 ||
        originalRequest.url === '/auth/refresh' ||
        originalRequest._retry
      ) {
        return Promise.reject(error)
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      // Start refresh
      originalRequest._retry = true
      isRefreshing = true

      const success = await auth.refresh()

      if (success && auth.accessToken) {
        // Retry the original request and any queued requests
        onRefreshed(auth.accessToken)
        isRefreshing = false
        originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`
        return api(originalRequest)
      }

      // Refresh failed — redirect to login
      isRefreshing = false
      pendingRequests = []
      auth.clearAuth()
      router.push({ name: 'login' })
      return Promise.reject(error)
    }
  )
}
