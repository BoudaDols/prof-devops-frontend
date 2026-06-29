import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ── Guest routes (centered layout, no navbar) ────────────────────────
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true, layout: 'guest' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guest: true, layout: 'guest' },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: { guest: true, layout: 'guest' },
    },

    // ── Authenticated routes (navbar + content area) ─────────────────────
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { auth: true, layout: 'app' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { auth: true, layout: 'app' },
    },
    {
      path: '/plans',
      name: 'plans',
      component: () => import('../views/PlansView.vue'),
      meta: { auth: true, layout: 'app' },
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: () => import('../views/SubscriptionView.vue'),
      meta: { auth: true, layout: 'app' },
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryView.vue'),
      meta: { auth: true, layout: 'app' },
    },
  ],
})

// ── Navigation guard ───────────────────────────────────────────────────────
// Tracks whether we've already tried to refresh the token on app startup
let initialRefreshDone = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // On first navigation (app startup), try to refresh the token silently.
  // If the user still has a valid httpOnly cookie, this restores their session.
  if (!initialRefreshDone) {
    initialRefreshDone = true
    if (!auth.isAuthenticated) {
      await auth.refresh()
    }
  }

  // Route requires authentication but user is not logged in
  if (to.meta.auth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Route is guest-only (login/register) but user is already logged in
  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
