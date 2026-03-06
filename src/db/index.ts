import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Limit pool size to avoid "too many clients" in dev (Turbopack hot-reload creates
// new module instances). In production a larger pool is fine.
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === "production" ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
