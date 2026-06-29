<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const submitted = ref(false)

function handleSubmit() {
  // TODO: Call reset password API when implemented
  submitted.value = true
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <h1 class="text-2xl font-bold text-gray-900 text-center">Reset password</h1>
    <p class="mt-2 text-center text-sm text-gray-600">
      Enter your email and we'll send you a reset link.
    </p>

    <!-- Success state -->
    <div v-if="submitted" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
      If that email exists in our system, you'll receive a reset link shortly.
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="mt-6 space-y-4">
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

      <button
        type="submit"
        class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
      >
        Send reset link
      </button>
    </form>

    <p class="mt-4 text-center text-sm">
      <router-link to="/login" class="text-blue-600 hover:text-blue-500 font-medium">Back to login</router-link>
    </p>
  </div>
</template>
