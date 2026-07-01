<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { userService, type Activity } from '../api/services'

const auth = useAuthStore()
const recentActivity = ref<Activity[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  if (!auth.user) return

  try {
    // Fetch user's recent activity from user-service
    const userId = getUuid()
    if (userId) {
      const { data } = await userService.getActivity(userId)
      // API may return { data: [...] } or [...] depending on gateway response shape
      recentActivity.value = Array.isArray(data) ? data.slice(0, 5) : []
    }
  } catch (e: any) {
    // Non-critical — dashboard still works without activity
    error.value = ''
  } finally {
    loading.value = false
  }
})

// The user UUID comes from the JWT payload — stored when we decoded the access token.
// Since we don't decode the JWT on the frontend, we rely on the /api/profile endpoint.
function getUuid(): string | null {
  // We'll get the UUID from the profile endpoint or store it after login
  // For now, return null — activity section will be empty until profile is loaded
  return null
}
</script>

<template>
  <div class="p-8 max-w-4xl">
    <!-- Welcome -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        Welcome back, {{ auth.user?.name }}
      </h1>
      <p class="mt-1 text-gray-600">Here's an overview of your account.</p>
    </div>

    <!-- Quick stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">Role</p>
        <p class="mt-1 text-lg font-semibold text-gray-900 capitalize">{{ auth.user?.role }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">Email</p>
        <p class="mt-1 text-lg font-semibold text-gray-900 truncate">{{ auth.user?.email }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">Account Status</p>
        <p class="mt-1 text-lg font-semibold text-green-600">Active</p>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <router-link
          to="/library"
          class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span class="text-xl">📚</span>
          <div>
            <p class="text-sm font-medium text-gray-900">PDF Library</p>
            <p class="text-xs text-gray-500">Browse and read PDFs</p>
          </div>
        </router-link>
        <router-link
          to="/plans"
          class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span class="text-xl">💳</span>
          <div>
            <p class="text-sm font-medium text-gray-900">Plans</p>
            <p class="text-xs text-gray-500">View subscription plans</p>
          </div>
        </router-link>
        <router-link
          to="/profile"
          class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span class="text-xl">👤</span>
          <div>
            <p class="text-sm font-medium text-gray-900">Profile</p>
            <p class="text-xs text-gray-500">Edit your information</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent activity -->
    <div v-if="recentActivity.length > 0" class="mt-6 bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <ul class="space-y-3">
        <li v-for="item in recentActivity" :key="item.id" class="flex items-start gap-3 text-sm">
          <span class="text-gray-400 mt-0.5">•</span>
          <div>
            <p class="text-gray-900">{{ item.action }}</p>
            <p class="text-xs text-gray-500">{{ new Date(item.created_at).toLocaleString() }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
