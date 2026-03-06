# Better Auth

Better Auth is a framework-agnostic, universal authentication and authorization library for TypeScript. It provides comprehensive authentication features out of the box including email/password authentication, social OAuth providers (Google, GitHub, Apple, Discord, and 30+ more), two-factor authentication, passkeys, magic links, and organization management. The library is built with a powerful plugin ecosystem that allows adding advanced functionality like multi-tenancy, API keys, and custom authentication flows with minimal code.

The library works with any TypeScript backend framework (Next.js, Express, Hono, Astro, Svelte Kit, etc.) and provides reactive client-side hooks for React, Vue, Svelte, and Solid. It supports multiple database adapters including PostgreSQL, MySQL, SQLite, MongoDB, and ORMs like Prisma and Drizzle. Better Auth handles session management, rate limiting, and security best practices automatically while remaining highly customizable through hooks and plugins.

## Installation and Server Setup

Better Auth requires installing the package, setting environment variables, creating an auth instance, and mounting the handler to your framework's route system.

```typescript
// Install: npm install better-auth

// .env
BETTER_AUTH_SECRET=your-secret-key-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000

// auth.ts - Server configuration
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
  database: new Database("./sqlite.db"),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

// Next.js App Router: /app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { POST, GET } = toNextJsHandler(auth);

// Express: server.ts
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const app = express();
app.all("/api/auth/*", toNodeHandler(auth));
app.listen(8000);

// Hono: src/index.ts
import { Hono } from "hono";
import { auth } from "./auth";
const app = new Hono();
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
```

## Client Setup

The auth client provides framework-specific hooks for React, Vue, Svelte, and Solid, enabling reactive session management and authentication methods.

```typescript
// React client: lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // optional if same domain
});

// Export individual methods if preferred
export const { signIn, signUp, signOut, useSession } = authClient;

// Vue client
import { createAuthClient } from "better-auth/vue";
export const authClient = createAuthClient();

// Svelte client
import { createAuthClient } from "better-auth/svelte";
export const authClient = createAuthClient();

// Vanilla JavaScript client
import { createAuthClient } from "better-auth/client";
export const authClient = createAuthClient();
```

## Email & Password Authentication

Email and password authentication provides user registration and sign-in with automatic session management and customizable callbacks.

```typescript
// Server: auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // automatically sign in after signup (default: true)
  },
});

// Client: Sign Up
import { authClient } from "@/lib/auth-client";

const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "securepassword123",
  name: "John Doe",
  image: "https://example.com/avatar.jpg", // optional
  callbackURL: "/dashboard", // optional redirect after email verification
}, {
  onRequest: (ctx) => {
    // show loading state
  },
  onSuccess: (ctx) => {
    console.log("User created:", ctx.data.user);
    // redirect to dashboard
  },
  onError: (ctx) => {
    console.error("Signup failed:", ctx.error.message);
  },
});

// Client: Sign In
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "securepassword123",
  callbackURL: "/dashboard",
  rememberMe: true, // default: true
});

// Client: Sign Out
await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      window.location.href = "/login";
    },
  },
});

// Server-side authentication
const response = await auth.api.signInEmail({
  body: {
    email: "user@example.com",
    password: "securepassword123",
  },
  asResponse: true, // returns Response object with cookies
});
```

## Social OAuth Authentication

Social authentication supports 30+ providers including Google, GitHub, Apple, Discord, and more with automatic account linking and token management.

```typescript
// Server: auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account", // always show account selector
      accessType: "offline", // get refresh token
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
});

// Client: Sign in with OAuth provider
import { authClient } from "@/lib/auth-client";

await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
  errorCallbackURL: "/error",
  newUserCallbackURL: "/welcome",
});

// Sign in with ID Token (useful for mobile apps)
const data = await authClient.signIn.social({
  provider: "google",
  idToken: {
    token: googleIdToken,
    accessToken: googleAccessToken,
  },
});

// Request additional scopes after signup
await authClient.linkSocial({
  provider: "google",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});
```

## Session Management

Better Auth provides comprehensive session management with client-side hooks, server-side validation, cookie caching, and session revocation.

```typescript
// Client: React useSession hook
import { authClient } from "@/lib/auth-client";

function UserProfile() {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!session) return <div>Not logged in</div>;

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
    </div>
  );
}

// Client: Get session without hook
const { data: session, error } = await authClient.getSession();

// Server: Get session with headers
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});

// Server: Configure session options
export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 1 day
    freshAge: 60 * 5, // session is "fresh" for 5 minutes
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
      strategy: "compact", // or "jwt" or "jwe"
    },
  },
});

// Client: List all sessions
const sessions = await authClient.listSessions();

// Client: Revoke specific session
await authClient.revokeSession({ token: "session-token" });

// Client: Revoke all other sessions
await authClient.revokeOtherSessions();

// Client: Change password and revoke sessions
await authClient.changePassword({
  currentPassword: "oldpassword",
  newPassword: "newpassword",
  revokeOtherSessions: true,
});
```

## Server API Endpoints

All endpoints are accessible through the `auth.api` object for server-side usage with full TypeScript support and error handling.

```typescript
import { auth } from "@/lib/auth";
import { APIError, isAPIError } from "better-auth/api";
import { headers } from "next/headers";

// Get session
const session = await auth.api.getSession({
  headers: await headers(),
});

// Sign up
const { user, session: newSession } = await auth.api.signUpEmail({
  body: {
    email: "user@example.com",
    password: "password123",
    name: "John Doe",
  },
});

// Sign in
const result = await auth.api.signInEmail({
  body: {
    email: "user@example.com",
    password: "password123",
  },
});

// Get headers/cookies from response
const { headers: responseHeaders, response } = await auth.api.signUpEmail({
  returnHeaders: true,
  body: {
    email: "user@example.com",
    password: "password123",
    name: "John Doe",
  },
});
const cookies = responseHeaders.get("set-cookie");

// Get full Response object
const response = await auth.api.signInEmail({
  body: { email: "test@test.com", password: "password" },
  asResponse: true,
});

// Error handling
try {
  await auth.api.signInEmail({
    body: { email: "", password: "" },
  });
} catch (error) {
  if (isAPIError(error)) {
    console.log(error.message, error.status);
  }
}
```

## Two-Factor Authentication Plugin

The 2FA plugin provides TOTP (authenticator apps), OTP (email/SMS), backup codes, and trusted device management.

```typescript
// Server: auth.ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  appName: "My App", // shown in authenticator apps
  plugins: [
    twoFactor({
      issuer: "My App",
      otpOptions: {
        async sendOTP({ user, otp }, ctx) {
          // Send OTP via email/SMS
          await sendEmail(user.email, `Your code: ${otp}`);
        },
      },
    }),
  ],
});

// Client: auth-client.ts
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
  ],
});

// Enable 2FA
const { data } = await authClient.twoFactor.enable({
  password: "user-password",
});
// data.totpURI - use to generate QR code
// data.backupCodes - show to user for recovery

// Get TOTP URI for QR code
const { data: qr } = await authClient.twoFactor.getTotpUri({
  password: "user-password",
});

// Sign in with 2FA
const signInResult = await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
}, {
  onSuccess(ctx) {
    if (ctx.data.twoFactorRedirect) {
      // User has 2FA enabled, redirect to verification
      window.location.href = "/two-factor";
    }
  },
});

// Verify TOTP code
await authClient.twoFactor.verifyTotp({
  code: "123456",
  trustDevice: true, // remember device for 30 days
});

// Verify OTP (email/SMS)
await authClient.twoFactor.sendOtp();
await authClient.twoFactor.verifyOtp({
  code: "123456",
  trustDevice: true,
});

// Use backup code
await authClient.twoFactor.verifyBackupCode({
  code: "backup-code-here",
});

// Disable 2FA
await authClient.twoFactor.disable({
  password: "user-password",
});
```

## Passkey Authentication Plugin

Passkeys enable passwordless authentication using WebAuthn with biometrics, security keys, and platform authenticators.

```typescript
// Install: npm install @better-auth/passkey

// Server: auth.ts
import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";

export const auth = betterAuth({
  plugins: [
    passkey({
      rpID: "localhost", // your domain
      rpName: "My Application",
      origin: "http://localhost:3000",
    }),
  ],
});

// Client: auth-client.ts
import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  plugins: [passkeyClient()],
});

// Register a passkey (user must be authenticated)
const { data, error } = await authClient.passkey.addPasskey({
  name: "My MacBook",
  authenticatorAttachment: "platform", // or "cross-platform"
});

// Sign in with passkey
await authClient.signIn.passkey({
  autoFill: true, // enable browser autofill
  fetchOptions: {
    onSuccess(ctx) {
      window.location.href = "/dashboard";
    },
    onError(ctx) {
      console.error("Passkey auth failed:", ctx.error.message);
    },
  },
});

// List user's passkeys
const { data: passkeys } = await authClient.passkey.listUserPasskeys();

// Delete a passkey
await authClient.passkey.deletePasskey({
  id: "passkey-id",
});

// Update passkey name
await authClient.passkey.updatePasskey({
  id: "passkey-id",
  name: "Work Laptop",
});

// Conditional UI setup (browser autofill)
// Add to input: autocomplete="username webauthn"
useEffect(() => {
  if (PublicKeyCredential.isConditionalMediationAvailable?.()) {
    authClient.signIn.passkey({ autoFill: true });
  }
}, []);
```

## Magic Link Authentication Plugin

Magic links allow passwordless email-based authentication where users click a link sent to their email to sign in.

```typescript
// Server: auth.ts
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, ctx) => {
        await sendEmail({
          to: email,
          subject: "Sign in to My App",
          html: `<a href="${url}">Click here to sign in</a>`,
        });
      },
      expiresIn: 300, // 5 minutes
      allowedAttempts: 1,
      disableSignUp: false,
    }),
  ],
});

// Client: auth-client.ts
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

// Send magic link
await authClient.signIn.magicLink({
  email: "user@example.com",
  name: "John Doe", // only used for new signups
  callbackURL: "/dashboard",
  newUserCallbackURL: "/welcome",
  errorCallbackURL: "/error",
});

// Manual verification (if using custom URL)
await authClient.magicLink.verify({
  token: "verification-token",
  callbackURL: "/dashboard",
});
```

## Organization & Multi-Tenancy Plugin

The organization plugin provides complete multi-tenant support with teams, roles, permissions, invitations, and access control.

```typescript
// Server: auth.ts
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      membershipLimit: 100,
      invitationExpiresIn: 48 * 60 * 60, // 48 hours
      teams: { enabled: true },
      async sendInvitationEmail(data) {
        const inviteLink = `https://myapp.com/accept-invitation/${data.id}`;
        await sendEmail({
          to: data.email,
          subject: `Join ${data.organization.name}`,
          html: `<a href="${inviteLink}">Accept invitation</a>`,
        });
      },
    }),
  ],
});

// Client: auth-client.ts
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});

// Create organization
const { data: org } = await authClient.organization.create({
  name: "My Company",
  slug: "my-company",
  logo: "https://example.com/logo.png",
});

// List user's organizations
const { data: orgs } = authClient.useListOrganizations();

// Set active organization
await authClient.organization.setActive({
  organizationId: "org-id",
});

// Get active organization (reactive hook)
const { data: activeOrg } = authClient.useActiveOrganization();

// Invite member
await authClient.organization.inviteMember({
  email: "new-member@example.com",
  role: "member", // or "admin", "owner", or custom roles
  organizationId: "org-id",
});

// Accept invitation
await authClient.organization.acceptInvitation({
  invitationId: "invitation-id",
});

// List members
const { data: members } = await authClient.organization.listMembers({
  organizationId: "org-id",
});

// Update member role
await authClient.organization.updateMemberRole({
  memberId: "member-id",
  role: "admin",
});

// Remove member
await authClient.organization.removeMember({
  memberIdOrEmail: "member@example.com",
});

// Check permissions
const canDelete = await authClient.organization.hasPermission({
  permissions: {
    organization: ["delete"],
  },
});

// Teams (if enabled)
await authClient.organization.createTeam({
  name: "Engineering",
  organizationId: "org-id",
});

await authClient.organization.addTeamMember({
  teamId: "team-id",
  userId: "user-id",
});
```

## Custom Access Control

Define custom roles and permissions for fine-grained access control across your application.

```typescript
// permissions.ts
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  project: ["create", "read", "update", "delete"],
  billing: ["view", "manage"],
} as const;

export const ac = createAccessControl(statement);

export const member = ac.newRole({
  project: ["create", "read"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  project: ["create", "read", "update"],
  billing: ["view"],
});

export const owner = ac.newRole({
  project: ["create", "read", "update", "delete"],
  billing: ["view", "manage"],
  organization: ["update", "delete"],
});

// Server: auth.ts
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { ac, owner, admin, member } from "./permissions";

export const auth = betterAuth({
  plugins: [
    organization({
      ac,
      roles: { owner, admin, member },
    }),
  ],
});

// Client: auth-client.ts
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { ac, owner, admin, member } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles: { owner, admin, member },
    }),
  ],
});

// Check permissions
const hasAccess = await authClient.organization.hasPermission({
  permissions: { project: ["create", "update"] },
});

// Check role permissions locally (no server call)
const canManageBilling = authClient.organization.checkRolePermission({
  permissions: { billing: ["manage"] },
  role: "admin",
});
```

## Database Configuration and Schema

Better Auth supports multiple databases and ORMs with customizable schema and automatic migrations.

```typescript
// PostgreSQL with pg
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
});

// SQLite with better-sqlite3
import Database from "better-sqlite3";
export const auth = betterAuth({
  database: new Database("./sqlite.db"),
});

// Drizzle ORM
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
});

// Prisma ORM
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
});

// MongoDB
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
export const auth = betterAuth({
  database: mongodbAdapter(client),
});

// Custom table/field names
export const auth = betterAuth({
  user: {
    modelName: "users",
    fields: { name: "full_name", email: "email_address" },
  },
  session: {
    modelName: "user_sessions",
    fields: { userId: "user_id" },
  },
});

// Extend user schema with additional fields
export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false, // don't allow user to set
      },
      language: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
    },
  },
});

// CLI commands for database
// npx auth migrate    - Run migrations
// npx auth generate   - Generate schema files
```

## Hooks and Middleware

Hooks allow customizing Better Auth's behavior by intercepting requests before and after they are processed.

```typescript
// Server: auth.ts
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";

export const auth = betterAuth({
  hooks: {
    // Before hook - runs before endpoint execution
    before: createAuthMiddleware(async (ctx) => {
      // Restrict signup to specific email domains
      if (ctx.path === "/sign-up/email") {
        if (!ctx.body?.email.endsWith("@company.com")) {
          throw new APIError("BAD_REQUEST", {
            message: "Only company emails allowed",
          });
        }
      }

      // Modify request context
      if (ctx.path === "/sign-up/email") {
        return {
          context: {
            ...ctx,
            body: { ...ctx.body, name: ctx.body.name.trim() },
          },
        };
      }
    }),

    // After hook - runs after endpoint execution
    after: createAuthMiddleware(async (ctx) => {
      // Send notification when new user registers
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          await sendSlackNotification({
            text: `New user: ${newSession.user.email}`,
          });
        }
      }
    }),
  },

  // Database hooks for model lifecycle
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Add computed fields
          return {
            data: {
              ...user,
              firstName: user.name.split(" ")[0],
              lastName: user.name.split(" ")[1] || "",
            },
          };
        },
        after: async (user) => {
          // Create Stripe customer
          await stripe.customers.create({ email: user.email });
        },
      },
      delete: {
        before: async (user) => {
          if (user.email.includes("admin")) {
            return false; // Block deletion
          }
          return true;
        },
      },
    },
  },
});
```

## Creating Custom Plugins

Better Auth's plugin system allows extending functionality with custom endpoints, schemas, hooks, and middleware.

```typescript
// Server plugin: my-plugin.ts
import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";

export const myPlugin = () => {
  return {
    id: "my-plugin",
    endpoints: {
      getProfile: createAuthEndpoint("/my-plugin/profile", {
        method: "GET",
        use: [sessionMiddleware], // require authentication
      }, async (ctx) => {
        const userId = ctx.context.session.userId;
        const profile = await getProfileFromDB(userId);
        return ctx.json({ profile });
      }),
    },
    schema: {
      profile: {
        fields: {
          bio: { type: "string", required: false },
          website: { type: "string", required: false },
          userId: {
            type: "string",
            references: { model: "user", field: "id" },
          },
        },
      },
    },
    hooks: {
      after: [{
        matcher: (ctx) => ctx.path === "/sign-up/email",
        handler: createAuthMiddleware(async (ctx) => {
          // Create default profile after signup
          if (ctx.context.newSession) {
            await createProfile(ctx.context.newSession.userId);
          }
        }),
      }],
    },
  } satisfies BetterAuthPlugin;
};

// Client plugin: my-plugin-client.ts
import type { BetterAuthClientPlugin } from "better-auth/client";
import type { myPlugin } from "./my-plugin";

export const myPluginClient = () => {
  return {
    id: "my-plugin",
    $InferServerPlugin: {} as ReturnType<typeof myPlugin>,
    getActions: ($fetch) => ({
      async updateProfile(data: { bio?: string; website?: string }) {
        return $fetch("/my-plugin/profile", {
          method: "POST",
          body: data,
        });
      },
    }),
  } satisfies BetterAuthClientPlugin;
};

// Usage
import { betterAuth } from "better-auth";
import { myPlugin } from "./my-plugin";

export const auth = betterAuth({
  plugins: [myPlugin()],
});
```

## Secondary Storage with Redis

Secondary storage enables using Redis or other key-value stores for session caching and rate limiting.

```typescript
// Install: npm install @better-auth/redis-storage ioredis

import { betterAuth } from "better-auth";
import { Redis } from "ioredis";
import { redisStorage } from "@better-auth/redis-storage";

const redis = new Redis({
  host: "localhost",
  port: 6379,
});

export const auth = betterAuth({
  secondaryStorage: redisStorage({
    client: redis,
    keyPrefix: "better-auth:",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

// Manual Redis implementation
export const auth = betterAuth({
  secondaryStorage: {
    get: async (key) => await redis.get(key),
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, "EX", ttl);
      else await redis.set(key, value);
    },
    delete: async (key) => await redis.del(key),
  },
});
```

## Stateless Session Management

Better Auth supports stateless sessions without a database, storing all session data in signed/encrypted cookies.

```typescript
// Stateless mode (no database)
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // No database configuration = automatic stateless mode
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});

// Manual stateless configuration
export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      strategy: "jwe", // encrypted tokens
      refreshCache: true, // auto-refresh before expiry
      version: "1", // change to invalidate all sessions
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true,
  },
});

// Stateless with Redis for revocation support
export const auth = betterAuth({
  secondaryStorage: {
    get: async (key) => await redis.get(key),
    set: async (key, value, ttl) => await redis.set(key, value, "EX", ttl),
    delete: async (key) => await redis.del(key),
  },
  session: {
    cookieCache: {
      maxAge: 5 * 60,
      refreshCache: false, // use Redis for refresh
    },
  },
});
```

## Summary

Better Auth is a production-ready authentication solution for TypeScript applications that handles the complexity of modern auth requirements. The main use cases include building SaaS applications with multi-tenant organization support, implementing secure passwordless authentication with passkeys and magic links, adding two-factor authentication to existing applications, and creating custom authentication flows through the plugin system. The library integrates seamlessly with popular frameworks like Next.js, Remix, Astro, and SvelteKit through framework-specific handlers.

The key integration patterns involve setting up a server instance with database adapter and plugins, creating a client instance with matching client plugins, using reactive hooks like `useSession` for real-time auth state, and calling `auth.api` methods for server-side authentication operations. Better Auth follows security best practices including CSRF protection, secure cookie handling, rate limiting, and proper session management. The CLI tools (`npx auth migrate` and `npx auth generate`) simplify database schema management, while the hook system enables customization without modifying core behavior.
