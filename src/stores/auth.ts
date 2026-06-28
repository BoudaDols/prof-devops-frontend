import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  name: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setAuth(token: string, userData: User) {
    accessToken.value = token
    user.value = userData
  }

  function clearAuth() {
    accessToken.value = null
    user.value = null
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    isAdmin,
    setAuth,
    clearAuth,
  }
})
