<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleSubmit() {
  error.value = ''

  try {
    await auth.login({ email: email.value, password: password.value })

    // Redirect to the page they originally tried to visit, or dashboard
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Login failed. Please try again.'
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <h1 class="text-2xl font-bold text-gray-900 text-center">Sign in</h1>
    <p class="mt-2 text-center text-sm text-gray-600">
      Don't have an account?
      <router-link to="/register" class="text-blue-600 hover:text-blue-500 font-medium">Register</router-link>
    </p>

    <!-- Error alert -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="••••••••"
        />
      </div>

      <div class="flex items-center justify-end">
        <router-link to="/reset-password" class="text-sm text-blue-600 hover:text-blue-500">
          Forgot password?
        </router-link>
      </div>

      <button
        type="submit"
        :disabled="auth.loading"
        class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {{ auth.loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>
