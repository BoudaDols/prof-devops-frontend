# frontend

A Vue 3 single-page application (SPA) for the Proj-devops microservices platform. Communicates with all backend services through the api-gateway using httpOnly cookie authentication.

## Description

The frontend is a static SPA built with Vue 3, Vite, Tailwind CSS, Pinia, and Vue Router. It runs entirely in the browser — no server-side rendering, no container, no Kubernetes pod.

In production, it's deployed as static files to S3 + CloudFront (AWS) or Blob Storage + Azure CDN. In development, Vite's built-in proxy forwards `/api` requests to the api-gateway running locally on port 8080.

### Key design decisions
- **httpOnly cookie for refresh token** — JavaScript never sees the refresh token; the browser manages it automatically
- **Access token in memory (Pinia)** — never stored in localStorage or cookies; lost on page refresh, restored silently via `/api/auth/refresh`
- **Axios interceptors** — auto-attach Bearer token to requests, auto-refresh on 401, queue pending requests during refresh, redirect to login on failure
- **Lazy-loaded routes** — each page is a separate chunk, loaded only when navigated to
- **No container/Docker** — static files only; deployed to CDN
- **Vite proxy in dev** — same-origin requests to `/api` forwarded to `localhost:8080`

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance (withCredentials: true)
│   │   ├── interceptors.ts     # Request (attach token) + Response (auto-refresh on 401)
│   │   └── services.ts         # Typed API functions for all backend services
│   ├── router/
│   │   └── index.ts            # Routes + navigation guards (auth check + silent refresh)
│   ├── stores/
│   │   └── auth.ts             # Pinia store (login, register, logout, refresh)
│   ├── layouts/
│   │   ├── AppLayout.vue       # Sidebar + content area (authenticated pages)
│   │   └── GuestLayout.vue     # Centered card (login, register, reset password)
│   ├── views/
│   │   ├── LoginView.vue       # Email + password login form
│   │   ├── RegisterView.vue    # Registration form with field-level errors
│   │   ├── ResetPasswordView.vue
│   │   ├── DashboardView.vue   # Welcome, stats, quick actions
│   │   ├── ProfileView.vue     # Read/edit profile from user-service
│   │   ├── PlansView.vue       # Pricing cards from abonnement service
│   │   ├── SubscriptionView.vue # Current plan, cancel
│   │   └── LibraryView.vue     # PDF catalog, open/close sessions from pdf-service
│   ├── App.vue                 # Dynamic layout switching
│   ├── main.ts                 # Pinia + Router + interceptors setup
│   └── style.css               # Tailwind import
├── .env.development            # VITE_API_BASE_URL=/api
├── .env.production             # VITE_API_BASE_URL=https://api.example.com/api
├── .github/workflows/
│   └── cd.yml                  # Build → S3 + CloudFront (AWS) / Blob + CDN (Azure)
├── vite.config.ts              # Vue + Tailwind plugins + dev proxy
└── package.json
```

## Pages

| Page | Route | Backend service | Description |
|---|---|---|---|
| Login | `/login` | api-gateway | Email + password, sets httpOnly cookie |
| Register | `/register` | api-gateway | Create account, auto-login |
| Reset Password | `/reset-password` | — | Placeholder (API not yet implemented) |
| Dashboard | `/` | user-service | Welcome, stats, quick actions |
| Profile | `/profile` | user-service | View/edit display name, bio, language, timezone |
| Plans | `/plans` | abonnement | Browse subscription plans, subscribe |
| Subscription | `/subscription` | abonnement | Current plan, cancel |
| PDF Library | `/library` | pdf-service | Browse PDFs, open/close reading sessions |

## Authentication Flow

```
1. User visits any protected page
2. Router guard fires → no token in memory
3. Silent refresh: POST /api/auth/refresh (browser sends httpOnly cookie)
4. If valid → access token stored in Pinia → user sees the page
5. If invalid → redirect to /login

After login:
- Access token in Pinia (memory) → attached to all requests via interceptor
- Refresh token in httpOnly cookie → never accessible to JS
- On 401 → interceptor auto-refreshes → retries failed request
- On page refresh → step 3 above restores the session
```

## API Routes Used

All requests go through the api-gateway proxy:

| Frontend calls | Backend service |
|---|---|
| `POST /api/auth/login` | api-gateway |
| `POST /api/auth/register` | api-gateway |
| `POST /api/auth/refresh` | api-gateway |
| `POST /api/auth/logout` | api-gateway |
| `GET /api/services/user/api/profiles/{id}` | user-service |
| `PUT /api/services/user/api/profiles/{id}` | user-service |
| `GET /api/services/user/api/profiles/{id}/activity` | user-service |
| `GET /api/services/abonnement/api/plans` | abonnement |
| `POST /api/services/abonnement/api/subscriptions` | abonnement |
| `GET /api/services/abonnement/api/subscriptions/{id}` | abonnement |
| `DELETE /api/services/abonnement/api/subscriptions/{id}` | abonnement |
| `GET /api/services/pdf/pdfs` | pdf-service |
| `POST /api/services/pdf/pdfs/{id}/open` | pdf-service |
| `POST /api/services/pdf/pdfs/{id}/close` | pdf-service |

## Getting Started

### Requirements
- Node.js >= 22
- api-gateway running on `localhost:8080` (via `kubectl port-forward`)

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Terminal 1 — backend
kubectl port-forward svc/api-gateway-service 8080:80

# Terminal 2 — frontend
npm run dev
# → http://localhost:5173
```

Vite proxies `/api/*` to `localhost:8080`. Cookies work as same-origin — no CORS issues.

### Build for production

```bash
npm run build
# Output in dist/
```

### Preview production build

```bash
npm run preview
```

## Deployment

| Environment | How | Infrastructure |
|---|---|---|
| Local | `npm run dev` (Vite proxy) | — |
| AWS | S3 + CloudFront | `terraform/modules/frontend/` (cloud=aws) |
| Azure | Blob Storage + Azure CDN | `terraform/modules/frontend/` (cloud=azure) |

CI/CD on push to `main`:
1. `npm ci && npm run build`
2. Upload `dist/` to S3 with cache headers (assets=1yr, index.html=no-cache)
3. Invalidate CloudFront

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for API requests | `/api` (dev), `https://...` (prod) |

## GitHub Actions Secrets Required

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` | AWS credentials for S3 upload |
| `S3_BUCKET_NAME` | Frontend S3 bucket name |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution to invalidate |
| `VITE_API_BASE_URL` | api-gateway URL for production builds |
| `AZURE_CREDENTIALS` | Azure service principal JSON |
| `AZURE_STORAGE_ACCOUNT` | Azure Blob Storage account name |
| `AKS_RESOURCE_GROUP` | Azure resource group (for CDN purge) |
