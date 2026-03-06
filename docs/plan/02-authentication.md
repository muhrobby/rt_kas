# 02 - Authentication

## Better Auth with Phone + Password

Better Auth provides a framework-agnostic auth system with a plugin ecosystem. We use:
- **Drizzle adapter** for PostgreSQL
- **Phone number plugin** for phone-based login
- **Admin plugin** for role-based access control
- **Email + Password** enabled as fallback / admin login method

---

## File Structure

```
src/
├── lib/
│   ├── auth.ts               # Better Auth server instance
│   └── auth-client.ts        # Better Auth client instance
├── app/
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts  # Better Auth API route handler
├── middleware.ts              # Session-based route protection (or proxy.ts for Next.js 16)
```

---

## Server Configuration

```ts
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, phoneNumber } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  // Email+password as fallback for admin accounts
  emailAndPassword: {
    enabled: true,
  },

  // Phone number plugin for warga login
  plugins: [
    admin({
      defaultRole: "user",  // New users get "user" role by default
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        // Phase 1: Log OTP to console for development
        console.log(`[OTP] ${phoneNumber}: ${code}`);
        // Phase 2: Integrate with SMS provider (Twilio, WA Business API, etc.)
      },
    }),
  ],

  // Custom user fields
  user: {
    additionalFields: {
      wargaId: {
        type: "number",
        required: false,
        input: true,
      },
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,  // 5 minutes cache
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

---

## Client Configuration

```ts
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { adminClient, phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    adminClient(),
    phoneNumberClient(),
  ],
});

// Export typed hooks
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
```

---

## API Route Handler

```ts
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

---

## Middleware (Route Protection)

```ts
// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (sessionCookie && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
```

---

## Authentication Flows

### Flow 1: Admin Login (Phone + Password)

1. Admin enters phone number + password on login page
2. Client calls `authClient.signIn.email({ email: phoneAsEmail, password })`
   - **Note:** Better Auth's phone plugin uses OTP by default. For phone+password, we use a hybrid approach: store phone as a username-like identifier and use email+password flow with phone-formatted email (e.g., `08123456789@kas-rt.local`)
   - **Alternative:** Use Better Auth's `username` plugin where the username IS the phone number
3. Server validates credentials against DB
4. Session created, cookie set
5. Middleware redirects to `/dashboard` (admin dashboard)

### Flow 2: Warga Login (Phone + Password)

1. Same as admin login
2. After session is created, middleware checks role
3. Redirects to warga-specific dashboard

### Flow 3: Admin Creates Warga Account

1. Admin creates warga profile in "Data Warga" module
2. Admin optionally creates a user account for the warga
3. System generates default password (or admin sets one)
4. Warga can login with their phone number + password

---

## Role-Based Access Control

### Server-Side (in Server Actions / Route Handlers)

```ts
// Helper to get and validate session
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
```

### Client-Side (in Components)

```tsx
"use client";
import { useSession } from "@/lib/auth-client";

export function AdminOnlyComponent() {
  const { data: session } = useSession();

  if (session?.user.role !== "admin") return null;

  return <div>Admin content here</div>;
}
```

### Layout-Level (in Route Group Layouts)

```tsx
// src/app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";

export default async function AdminLayout({ children }) {
  const session = await getServerSession();

  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/unauthorized");

  return <>{children}</>;
}
```

---

## Database Schema (Auto-generated by Better Auth CLI)

Run this after configuring `src/lib/auth.ts`:

```bash
npx @better-auth/cli generate --output src/db/schema/auth.ts
```

This generates the Drizzle schema for Better Auth's tables. The output will be placed in `src/db/schema/auth.ts` and exported alongside the other schema files.

---

## Session-Aware UI Updates

### Header (existing `account-switcher.tsx`)

Replace mock user data with real session data:

```tsx
const { data: session } = useSession();
// Display: session.user.name, session.user.role
// Header text: "Halo, {name} ({role})"
```

### Sidebar (`nav-user.tsx`)

Show real user info and wire logout:

```tsx
const { data: session } = useSession();
const handleLogout = () => signOut({ fetchOptions: { onSuccess: () => router.push("/auth/login") } });
```

### Sidebar Items

Conditionally render sidebar items based on role. See [03-route-structure.md](./03-route-structure.md) for details.

---

## Phone Number Strategy

Since the requirement specifies login with `No. Telp`, we have two implementation options:

### Option A: Username Plugin (Recommended)

Use Better Auth's `username` plugin where the username field stores the phone number.

```ts
import { username } from "better-auth/plugins";

plugins: [
  admin(),
  username({
    minLength: 10,
    maxLength: 15,
  }),
]
```

Login: `authClient.signIn.username({ username: "08123456789", password: "..." })`

### Option B: Phone as Email Proxy

Map phone numbers to a local email domain: `08123456789@kas-rt.local`

This works with the standard email+password flow but is less clean.

**Decision: Use Option A (username plugin) for cleaner implementation.**

---

## Security Considerations

- Passwords are hashed by Better Auth using Argon2 (default) or bcrypt
- Sessions are stored in the database with expiry timestamps
- CSRF protection is built into Better Auth
- Rate limiting should be added for login attempts (Better Auth supports this via plugins)
- Phone numbers should be validated (format check) before storage
- Default passwords for warga accounts should be forced to change on first login (future enhancement)
