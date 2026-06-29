<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import GuestLayout from './layouts/GuestLayout.vue'

const route = useRoute()

const layout = computed(() => {
  return route.meta.layout === 'guest' ? GuestLayout : AppLayout
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
