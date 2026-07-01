<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { userService, type Profile } from '../api/services'

const auth = useAuthStore()

const profile = ref<Profile | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

// Edit form state
const editMode = ref(false)
const form = ref({
  display_name: '',
  bio: '',
  language: '',
  timezone: '',
})

onMounted(async () => {
  await fetchProfile()
})

async function fetchProfile() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await userService.getProfile(auth.user!.email)
    // The user-service uses user_id (UUID) from the X-User-ID header
    // The gateway passes the UUID from the JWT, but our profile lookup may be by UUID
    // Let's handle both response shapes
    profile.value = (data as any).data ?? data
    populateForm()
  } catch (e: any) {
    if (e.response?.status === 404) {
      // Profile doesn't exist yet — that's okay, show empty state
      profile.value = null
    } else {
      error.value = 'Failed to load profile. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function populateForm() {
  if (profile.value) {
    form.value = {
      display_name: profile.value.display_name || '',
      bio: profile.value.bio || '',
      language: profile.value.language || '',
      timezone: profile.value.timezone || '',
    }
  }
}

function startEdit() {
  populateForm()
  editMode.value = true
  success.value = ''
}

function cancelEdit() {
  editMode.value = false
  error.value = ''
}

async function saveProfile() {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const userId = profile.value?.user_id || auth.user!.email
    const { data } = await userService.updateProfile(userId, form.value)
    profile.value = (data as any).data ?? data
    editMode.value = false
    success.value = 'Profile updated successfully.'
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to save profile.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-8 max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900">Profile</h1>
    <p class="mt-1 text-gray-600">Manage your personal information.</p>

    <!-- Loading -->
    <div v-if="loading" class="mt-8 text-center text-gray-500">Loading profile...</div>

    <!-- Error -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Success -->
    <div v-if="success" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
      {{ success }}
    </div>

    <!-- Profile card (read mode) -->
    <div v-if="!loading && !editMode" class="mt-6 bg-white rounded-xl border border-gray-200 p-6">
      <!-- Account info from auth store (always available) -->
      <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
          {{ auth.user?.name?.charAt(0)?.toUpperCase() || '?' }}
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-900">{{ auth.user?.name }}</p>
          <p class="text-sm text-gray-500">{{ auth.user?.email }}</p>
          <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 capitalize">
            {{ auth.user?.role }}
          </span>
        </div>
      </div>

      <!-- Extended profile from user-service -->
      <div v-if="profile" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Display Name</p>
            <p class="mt-0.5 text-sm text-gray-900">{{ profile.display_name || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Language</p>
            <p class="mt-0.5 text-sm text-gray-900">{{ profile.language || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Timezone</p>
            <p class="mt-0.5 text-sm text-gray-900">{{ profile.timezone || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
            <p class="mt-0.5 text-sm text-gray-900">{{ profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Bio</p>
          <p class="mt-0.5 text-sm text-gray-900">{{ profile.bio || 'No bio yet.' }}</p>
        </div>
      </div>

      <div v-else class="text-sm text-gray-500">
        No extended profile found. Click edit to set up your profile.
      </div>

      <button
        @click="startEdit"
        class="mt-6 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
      >
        Edit Profile
      </button>
    </div>

    <!-- Edit form -->
    <form v-if="!loading && editMode" @submit.prevent="saveProfile" class="mt-6 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <label for="display_name" class="block text-sm font-medium text-gray-700">Display Name</label>
        <input
          id="display_name"
          v-model="form.display_name"
          type="text"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="Your display name"
        />
      </div>

      <div>
        <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          id="bio"
          v-model="form.bio"
          rows="3"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          placeholder="Tell us about yourself"
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="language" class="block text-sm font-medium text-gray-700">Language</label>
          <select
            id="language"
            v-model="form.language"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="">Select language</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
        </div>
        <div>
          <label for="timezone" class="block text-sm font-medium text-gray-700">Timezone</label>
          <select
            id="timezone"
            v-model="form.timezone"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="">Select timezone</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern (US)</option>
            <option value="America/Chicago">Central (US)</option>
            <option value="America/Los_Angeles">Pacific (US)</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button
          type="button"
          @click="cancelEdit"
          class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
