import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client'

interface User {
  name: string
  email: string
  role: string
}

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────────────
  const accessToken = ref<string | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(false)

  // ── Getters ────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // ── Internal helpers ───────────────────────────────────────────────────
  function setAuth(token: string, userData: User) {
    accessToken.value = token
    user.value = userData
  }

  function clearAuth() {
    accessToken.value = null
    user.value = null
  }

  // ── Actions ────────────────────────────────────────────────────────────

  /**
   * Login with email + password.
   * The API returns access_token in JSON and sets refresh_token as httpOnly cookie.
   */
  async function login(payload: LoginPayload) {
    loading.value = true
    try {
      const { data } = await api.post('/auth/login', payload)
      setAuth(data.data.access_token, data.data.user)
      return data
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a new account.
   * Same response shape as login — access_token in JSON, cookie set by server.
   */
  async function register(payload: RegisterPayload) {
    loading.value = true
    try {
      const { data } = await api.post('/auth/register', payload)
      setAuth(data.data.access_token, data.data.user)
      return data
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh the access token silently.
   * The browser sends the httpOnly cookie automatically — no body needed.
   * Called on app startup to recover the session after page refresh.
   */
  async function refresh(): Promise<boolean> {
    try {
      const { data } = await api.post('/auth/refresh')
      accessToken.value = data.data.access_token
      return true
    } catch {
      clearAuth()
      return false
    }
  }

  /**
   * Logout — blacklists access token on the server and clears the cookie.
   */
  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Even if the API call fails, clear local state
    } finally {
      clearAuth()
    }
  }

  return {
    // State
    accessToken,
    user,
    loading,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    login,
    register,
    refresh,
    logout,
    setAuth,
    clearAuth,
  }
})
