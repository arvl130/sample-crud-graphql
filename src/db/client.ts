import pg from "pg"
import { serverEnv } from "../env"
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

const pool = new pg.Pool({
  connectionString: serverEnv.DATABASE_URL,
})

const globalForDrizzle = globalThis as unknown as {
  db: NodePgDatabase<typeof schema>
}

export const db =
  globalForDrizzle.db ||
  drizzle(pool, {
    schema,
  })

if (process.env.NODE_ENV !== "production") globalForDrizzle.db = db
