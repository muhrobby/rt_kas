import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  plugins: [
    admin({
      defaultRole: "user",
    }),
    username({
      minUsernameLength: 10,
      maxUsernameLength: 15,
    }),
  ],
  rateLimit: {
    window: 60,
    max: 10,
  },
  user: {
    additionalFields: {
      wargaId: {
        type: "number",
        required: false,
        input: true,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 2,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
