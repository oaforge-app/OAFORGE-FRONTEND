# OAForge Frontend

> React + Vite SPA — AI-powered Online Assessment practice platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Routing | React Router v6 |
| State / Data | TanStack Query v5 |
| HTTP | Axios (with interceptor) |
| Styling | Tailwind CSS |
| UI Primitives | shadcn/ui + Radix |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Notifications | Sonner (toast) |
| Theme | next-themes (dark/light) |
| Deployment | Vercel |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                            │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │   Router    │   │ QueryClient  │   │  ThemeProvider  │  │
│  │(createBrowser│  │(TanStack)    │   │  (next-themes)  │  │
│  │   Router)   │   └──────┬───────┘   └─────────────────┘  │
│  └──────┬──────┘          │                                 │
│         │           ┌─────▼──────┐                         │
│         │           │   Axios    │                         │
│         │           │Interceptor │                         │
│         │           │(401→refresh│                         │
│         │           │ →queue)    │                         │
│         │           └─────┬──────┘                         │
│         │                 │                                 │
│  ┌──────▼─────────────────▼──────────────────────────────┐  │
│  │                    Pages                               │  │
│  │  Landing │ Login │ Register │ Dashboard │ Settings ... │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │               API Query Hooks (TanStack)                │  │
│  │  useUser │ useProfile │ useGetSessions │ useAssessment  │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Auth Flow (Frontend)

```
App loads
    │
    ▼
AuthGate ( / )
    │
    ├── has valid access_token? ──▶ /dashboard
    │
    └── no token / 401
            │
            ▼
        /login page
            │
        POST /auth/login
            │
            ├── success ──▶ navigate("/dashboard")
            │
            └── 401 ──▶ show error

Token Expiry Handling (axios interceptor):
    Any request → 401
        │
        ├── isRefreshing? ──▶ queue request, wait
        │
        └── not refreshing
                │
            GET /auth/refresh-token
                │
                ├── success ──▶ retry all queued requests
                │
                └── fail ──▶ window.location.href = "/login"
                             (only if not already on public page)

Session Revoke Detection (useSessionRevoked hook):
    Polls GET /auth/me every 30s
        │
        └── 401 ──▶ interceptor tries refresh ──▶ fails ──▶ /login
```

---

## Project Structure

```
src/
├── api/                        # TanStack Query hooks
│   ├── auth.query.ts           # useUser, useLogin, useLogout
│   ├── user.query.ts           # useProfile, useSaveGroqKey, useUpdateProfile
│   ├── sessions.query.ts       # useGetSessions, useRevokeSession
│   ├── assessment.query.ts     # useCreateAssessment, useGetAssessment
│   └── results.query.ts        # useSubmitResult, useGetResults
│
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── settings/
│   │   └── SessionsCard.tsx    # Active sessions management
│   └── Navbar.tsx
│
├── hooks/
│   └── useSessionRevoked.ts    # Polls /auth/me, detects revoked sessions
│
├── lib/
│   └── axios.ts                # Axios instance + 401 interceptor + queue
│
├── pages/
│   ├── LandingPage.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx        # 2-step: form → OTP → account
│   │   ├── ForgotPass.tsx
│   │   └── Settings.tsx        # Profile, API key, active sessions
│   ├── assessments/
│   │   ├── CreateAssessment.tsx
│   │   └── AssessmentPlan.tsx
│   ├── test/
│   │   └── TestScreen.tsx
│   ├── results/
│   │   ├── Results.tsx
│   │   └── ResultDetail.tsx
│   ├── Dashboard.tsx
│   ├── AuthCallback.tsx        # Google OAuth redirect handler
│   └── NotFound.tsx
│
├── utility/
│   ├── ProtectedRoute.tsx      # Auth-aware route wrapper
│   └── AuthGate.tsx            # / root redirect logic
│
├── types/
└── App.tsx                     # Router + QueryClient + ThemeProvider
```

---

## Route Structure

```
/                           AuthGate (redirects based on auth state)
├── login                   Public (redirects to /dashboard if authed)
├── register                Public
├── forgot-password         Public
├── auth/callback           Google OAuth callback
│
└── [Protected]
    ├── dashboard
    ├── settings
    ├── assessment/new
    ├── assessment/:id/plan
    ├── assessment/:id/test
    ├── results
    └── results/:resultId
```

---

## Key Components

### `axios.ts` — Interceptor
```
Every response →
  401? → already retried? → reject
       → isRefreshing? → push to failedQueue
       → try GET /auth/refresh-token
           success → processQueue → retry original
           fail    → processQueue(error) → redirect /login
                     (skips redirect if already on public page)
```

### `useSessionRevoked` hook
```
Mounts on RootLayout (every authenticated page)
  → skip if on /login, /register, /forgot-password
  → setInterval 30s
      → GET /auth/me
          → 401 → interceptor → refresh fails → /login
```

### `SessionsCard.tsx`
```
GET /auth/sessions
  → renders each RefreshToken row
  → isCurrent matched by tokenHash of current refresh cookie (backend)
  → current session: green badge, no sign-out button
  → other sessions: "Sign out" → DELETE /auth/sessions/:id
      → backend deletes RT + blocklists specific jti
      → invalidates sessions query → card refreshes
```

### `ProtectedRoute.tsx`
```
allowAuthenticated=false  →  redirects authed users away (login/register)
allowAuthenticated=true   →  redirects unauthed users to /login
```

---

## Settings Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Settings                                               │
│                                                         │
│  ┌───────────────────┐  ┌──────────────────────────────┐│
│  │  Groq API Key     │  │                              ││
│  │  (5/12)           │  │  Profile                     ││
│  ├───────────────────┤  │  (7/12)                      ││
│  │  Account          │  │  firstName, lastName,        ││
│  │  email, provider  │  │  college, branch             ││
│  └───────────────────┘  └──────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Active Sessions  (full width)                      ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          ││
│  │  │ Chrome   │  │ Safari   │  │ Firefox  │          ││
│  │  │ Desktop  │  │ Mobile   │  │ Desktop  │          ││
│  │  │ Current  │  │ Sign out │  │ Sign out │          ││
│  │  └──────────┘  └──────────┘  └──────────┘          ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## Environment Variables

```env
VITE_BACKEND_URL=https://your-app.railway.app
```

---

## Setup & Development

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

---

## Design System

All pages share a consistent dark forge theme:

| Token | Value | Usage |
|---|---|---|
| Background | `#050506` | Page background (dark) |
| Card | `#0d0d10` | Card surfaces |
| Accent | `#5E6AD2` | Primary actions, focus rings |
| Accent Light | `#818CF8` | Labels, highlights |
| Text Primary | `#EDEDEF` | Headings, values |
| Text Secondary | `#8A8F98` | Labels, descriptions |
| Green | `#34D399` | Success, correct answers |
| Red | `#F87171` | Errors, wrong answers |
| Amber | `#FBBF24` | Warnings, alerts |

Cards follow a consistent pattern:
- `rounded-2xl` border radius
- `border border-white/[0.07]` subtle border
- Top edge glow via `h-px bg-gradient-to-r`
- Radial accent tint at corner

---

## Registration Flow

```
Step 1: Fill form (email, name, password)
    │
    ▼
POST /auth/send-register-otp
    │
    ▼
Step 2: Enter OTP from email
    │
    ▼
POST /auth/verify-register-otp
    │
    ▼
POST /auth/register  (creates account, sets cookies)
    │
    ▼
navigate("/dashboard")
```