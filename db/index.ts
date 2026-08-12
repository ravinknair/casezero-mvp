import { env } from "cloudflare:workers";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

let dbInstance: DrizzleD1Database<typeof schema> | null = null;

export function getDb(): DrizzleD1Database<typeof schema> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in wrangler.toml or provide database binding."
    );
  }

  dbInstance = drizzle(env.DB, { schema });
  return dbInstance;
}

// Export the database instance
export const db = new Proxy({} as DrizzleD1Database<typeof schema>, {
  get: (target, prop) => {
    const dbInstance = getDb();
    return (dbInstance as any)[prop];
  },
});
