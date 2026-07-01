/**
 * API service layer — centralizes all backend calls.
 * Each function maps to a gateway-proxied endpoint.
 * The gateway forwards /api/services/{service}/{path} to the target microservice.
 */
import api from './client'

// ── User Service ─────────────────────────────────────────────────────────────

export interface Profile {
  user_id: string
  display_name: string
  avatar_url: string
  bio: string
  language: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: number
  user_id: string
  action: string
  details: string
  created_at: string
}

export const userService = {
  getProfile: (userId: string) =>
    api.get<Profile>(`/services/user/api/profiles/${userId}`),

  updateProfile: (userId: string, data: Partial<Profile>) =>
    api.put<Profile>(`/services/user/api/profiles/${userId}`, data),

  getActivity: (userId: string) =>
    api.get<Activity[]>(`/services/user/api/profiles/${userId}/activity`),
}

// ── Abonnement Service ───────────────────────────────────────────────────────

export interface Plan {
  id: number
  name: string
  slug: string
  price: number
  currency: string
  interval: string
  features: string[]
  description: string
}

export interface Subscription {
  id: number
  user_id: string
  plan_id: number
  plan: Plan
  status: string
  started_at: string
  ends_at: string | null
  cancelled_at: string | null
}

export const abonnementService = {
  getPlans: () =>
    api.get<{ success: boolean; data: Plan[] }>('/services/abonnement/api/plans'),

  getPlan: (id: number) =>
    api.get<{ success: boolean; data: Plan }>(`/services/abonnement/api/plans/${id}`),

  getSubscription: (id: string) =>
    api.get<{ success: boolean; data: Subscription }>(`/services/abonnement/api/subscriptions/${id}`),

  createSubscription: (planId: number) =>
    api.post<{ success: boolean; data: Subscription }>('/services/abonnement/api/subscriptions', { plan_id: planId }),

  cancelSubscription: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/services/abonnement/api/subscriptions/${id}`),
}

// ── PDF Service ──────────────────────────────────────────────────────────────

export interface Pdf {
  id: number
  title: string
  filename: string
  description: string | null
  created_at: string
}

export interface SessionOpenResult {
  success: boolean
  message: string
  url: string
  session_id: string
}

export interface SessionCloseResult {
  success: boolean
  message: string
  duration_seconds: number
}

export const pdfService = {
  listPdfs: () =>
    api.get<Pdf[]>('/services/pdf/pdfs'),

  getPdf: (id: number) =>
    api.get<Pdf>(`/services/pdf/pdfs/${id}`),

  openSession: (pdfId: number) =>
    api.post<SessionOpenResult>(`/services/pdf/pdfs/${pdfId}/open`),

  closeSession: (pdfId: number) =>
    api.post<SessionCloseResult>(`/services/pdf/pdfs/${pdfId}/close`),
}
