import "dotenv/config"
import type { Config } from "drizzle-kit"
import { serverEnv } from "./src/env"

export default {
  schema: "./src/db/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: serverEnv.DATABASE_URL,
  },
} satisfies Config
