<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { abonnementService, type Plan } from '../api/services'

const router = useRouter()

const plans = ref<Plan[]>([])
const loading = ref(true)
const error = ref('')
const subscribing = ref<number | null>(null)

onMounted(async () => {
  try {
    const { data } = await abonnementService.getPlans()
    // Handle response shape: { success, data: [...] } or direct array
    plans.value = Array.isArray(data) ? data : (data.data ?? [])
  } catch (e: any) {
    error.value = 'Failed to load plans. Please try again.'
  } finally {
    loading.value = false
  }
})

async function subscribe(planId: number) {
  subscribing.value = planId
  error.value = ''

  try {
    await abonnementService.createSubscription(planId)
    router.push({ name: 'subscription' })
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Subscription failed. Please try again.'
  } finally {
    subscribing.value = null
  }
}

// Styling helper — gives each plan tier a distinct look
function planStyle(index: number) {
  const styles = [
    { border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', button: 'bg-gray-900 hover:bg-gray-800' },
    { border: 'border-blue-200 ring-2 ring-blue-100', badge: 'bg-blue-100 text-blue-700', button: 'bg-blue-600 hover:bg-blue-700' },
    { border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', button: 'bg-purple-600 hover:bg-purple-700' },
  ]
  return styles[index % styles.length]
}
</script>

<template>
  <div class="p-8 max-w-5xl">
    <h1 class="text-2xl font-bold text-gray-900">Subscription Plans</h1>
    <p class="mt-1 text-gray-600">Choose the plan that works best for you.</p>

    <!-- Error -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-8 text-center text-gray-500">Loading plans...</div>

    <!-- Plans grid -->
    <div v-else class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="(plan, index) in plans"
        :key="plan.id"
        class="bg-white rounded-xl border p-6 flex flex-col"
        :class="planStyle(index).border"
      >
        <!-- Plan name badge -->
        <span
          class="self-start px-3 py-1 text-xs font-semibold rounded-full capitalize"
          :class="planStyle(index).badge"
        >
          {{ plan.name }}
        </span>

        <!-- Price -->
        <div class="mt-4">
          <span class="text-3xl font-bold text-gray-900">
            {{ plan.price === 0 ? 'Free' : `$${plan.price}` }}
          </span>
          <span v-if="plan.price > 0" class="text-sm text-gray-500">/{{ plan.interval || 'month' }}</span>
        </div>

        <!-- Description -->
        <p class="mt-2 text-sm text-gray-600">{{ plan.description }}</p>

        <!-- Features -->
        <ul class="mt-4 space-y-2 flex-1">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-start gap-2 text-sm text-gray-700"
          >
            <span class="text-green-500 mt-0.5 shrink-0">&#10003;</span>
            <span>{{ feature }}</span>
          </li>
        </ul>

        <!-- Subscribe button -->
        <button
          @click="subscribe(plan.id)"
          :disabled="subscribing === plan.id"
          class="mt-6 w-full py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          :class="planStyle(index).button"
        >
          {{ subscribing === plan.id ? 'Subscribing...' : 'Subscribe' }}
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && plans.length === 0 && !error" class="mt-8 text-center text-gray-500">
      No plans available at the moment.
    </div>
  </div>
</template>
