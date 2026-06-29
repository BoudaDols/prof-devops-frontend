<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const navLinks = [
  { name: 'Dashboard', to: '/', icon: '📊' },
  { name: 'PDF Library', to: '/library', icon: '📚' },
  { name: 'Plans', to: '/plans', icon: '💳' },
  { name: 'Subscription', to: '/subscription', icon: '📋' },
  { name: 'Profile', to: '/profile', icon: '👤' },
]

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- Logo / Brand -->
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <span class="text-lg font-bold text-gray-900">Proj-devops</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-4 space-y-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          active-class="bg-gray-100 text-gray-900"
        >
          <span>{{ link.icon }}</span>
          <span>{{ link.name }}</span>
        </router-link>
      </nav>

      <!-- User section -->
      <div class="px-4 py-4 border-t border-gray-200">
        <div class="flex items-center gap-3 px-3 py-2">
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
            {{ auth.user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ auth.user?.email }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>
