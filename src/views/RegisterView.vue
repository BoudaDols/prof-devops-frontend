<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const errors = ref<Record<string, string[]>>({})

async function handleSubmit() {
  error.value = ''
  errors.value = {}

  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    router.push('/')
  } catch (e: any) {
    if (e.response?.data?.errors) {
      errors.value = e.response.data.errors
    }
    error.value = e.response?.data?.message || 'Registration failed. Please try again.'
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <h1 class="text-2xl font-bold text-gray-900 text-center">Create account</h1>
    <p class="mt-2 text-center text-sm text-gray-600">
      Already have an account?
      <router-link to="/login" class="text-blue-600 hover:text-blue-500 font-medium">Sign in</router-link>
    </p>

    <!-- Error alert -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          autocomplete="name"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="John Doe"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name[0] }}</p>
      </div>

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
        <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email[0] }}</p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="new-password"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="••••••••"
        />
        <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password[0] }}</p>
      </div>

      <div>
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm password</label>
        <input
          id="password_confirmation"
          v-model="passwordConfirmation"
          type="password"
          required
          autocomplete="new-password"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        :disabled="auth.loading"
        class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {{ auth.loading ? 'Creating account...' : 'Create account' }}
      </button>
    </form>
  </div>
</template>
