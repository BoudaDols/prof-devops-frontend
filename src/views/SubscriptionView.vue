<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { abonnementService, type Subscription } from '../api/services'

const subscription = ref<Subscription | null>(null)
const loading = ref(true)
const error = ref('')
const cancelling = ref(false)
const cancelSuccess = ref(false)

onMounted(async () => {
  await fetchSubscription()
})

async function fetchSubscription() {
  loading.value = true
  error.value = ''

  try {
    // The abonnement service returns the current user's subscription
    // via GET /api/subscriptions/{user_id} — the gateway passes X-User-ID
    const { data } = await abonnementService.getSubscription('me')
    subscription.value = (data as any).data ?? data
  } catch (e: any) {
    if (e.response?.status === 404) {
      // No subscription — show empty state
      subscription.value = null
    } else {
      error.value = 'Failed to load subscription.'
    }
  } finally {
    loading.value = false
  }
}

async function cancelSubscription() {
  if (!subscription.value) return
  if (!confirm('Are you sure you want to cancel your subscription?')) return

  cancelling.value = true
  error.value = ''

  try {
    await abonnementService.cancelSubscription(String(subscription.value.id))
    cancelSuccess.value = true
    await fetchSubscription()
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to cancel subscription.'
  } finally {
    cancelling.value = false
  }
}

const statusColor = computed(() => {
  switch (subscription.value?.status) {
    case 'active': return 'bg-green-100 text-green-700'
    case 'cancelled': return 'bg-red-100 text-red-700'
    case 'expired': return 'bg-gray-100 text-gray-700'
    default: return 'bg-yellow-100 text-yellow-700'
  }
})

const isActive = computed(() => subscription.value?.status === 'active')
</script>

<template>
  <div class="p-8 max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900">My Subscription</h1>
    <p class="mt-1 text-gray-600">Manage your current plan.</p>

    <!-- Error -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Cancel success -->
    <div v-if="cancelSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
      Subscription cancelled successfully. You can continue using the service until the end of your billing period.
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-8 text-center text-gray-500">Loading subscription...</div>

    <!-- No subscription -->
    <div v-else-if="!subscription" class="mt-8 bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div class="text-4xl mb-4">📋</div>
      <h2 class="text-lg font-semibold text-gray-900">No active subscription</h2>
      <p class="mt-2 text-sm text-gray-600">Choose a plan to get started with PDF reading.</p>
      <router-link
        to="/plans"
        class="inline-block mt-4 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Browse Plans
      </router-link>
    </div>

    <!-- Active subscription -->
    <div v-else class="mt-6 bg-white rounded-xl border border-gray-200 p-6">
      <!-- Status + plan header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 capitalize">
            {{ subscription.plan?.name || 'Unknown Plan' }}
          </h2>
          <span
            class="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize"
            :class="statusColor"
          >
            {{ subscription.status }}
          </span>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-gray-900">
            {{ subscription.plan?.price === 0 ? 'Free' : `$${subscription.plan?.price}` }}
          </p>
          <p v-if="subscription.plan?.price > 0" class="text-xs text-gray-500">
            /{{ subscription.plan?.interval || 'month' }}
          </p>
        </div>
      </div>

      <!-- Details -->
      <div class="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Started</p>
          <p class="mt-0.5 text-sm text-gray-900">
            {{ subscription.started_at ? new Date(subscription.started_at).toLocaleDateString() : '—' }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Ends</p>
          <p class="mt-0.5 text-sm text-gray-900">
            {{ subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : 'Ongoing' }}
          </p>
        </div>
        <div v-if="subscription.cancelled_at">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Cancelled On</p>
          <p class="mt-0.5 text-sm text-red-600">
            {{ new Date(subscription.cancelled_at).toLocaleDateString() }}
          </p>
        </div>
      </div>

      <!-- Plan features -->
      <div v-if="subscription.plan?.features?.length" class="py-4 border-t border-gray-100">
        <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Plan Includes</p>
        <ul class="space-y-1.5">
          <li
            v-for="feature in subscription.plan.features"
            :key="feature"
            class="flex items-center gap-2 text-sm text-gray-700"
          >
            <span class="text-green-500 shrink-0">&#10003;</span>
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="pt-4 border-t border-gray-100 flex gap-3">
        <router-link
          to="/plans"
          class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Change Plan
        </router-link>
        <button
          v-if="isActive"
          @click="cancelSubscription"
          :disabled="cancelling"
          class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ cancelling ? 'Cancelling...' : 'Cancel Subscription' }}
        </button>
      </div>
    </div>
  </div>
</template>
