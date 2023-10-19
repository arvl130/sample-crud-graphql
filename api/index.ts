import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import fs from "fs"
import path from "path"
import { db } from "../src/db/client.js"
import * as schema from "../src/db/schema.js"
import { eq } from "drizzle-orm"
import cors from "cors"
import http from "http"
import express from "express"

const app = express()
const httpServer = http.createServer(app)

const __dirname = path.resolve(path.dirname(""))
const typeDefs = fs
  .readFileSync(path.resolve(__dirname, "src/schema.graphql").toString())
  .toString("utf-8")

const resolvers = {
  Query: {
    async flower(_, args) {
      const results = await db
        .select()
        .from(schema.flowers)
        .where(eq(schema.flowers.id, args.id))

      if (results.length === 1) return results[0]
      return null
    },
    async flowers() {
      const results = await db.select().from(schema.flowers)

      return results
    },
  },
  Mutation: {
    async addFlower(_, args) {
      const results = await db
        .insert(schema.flowers)
        .values({
          name: args.newFlower.name,
          color: args.newFlower.color,
        })
        .returning()

      if (results.length === 1) return results[0]
    },
    async updateFlower(_, args) {
      const results = await db
        .update(schema.flowers)
        .set({
          name: args.newFlower.name,
          color: args.newFlower.color,
        })
        .where(eq(schema.flowers.id, args.id))
        .returning({
          id: schema.flowers.id,
          name: schema.flowers.name,
          color: schema.flowers.color,
        })

      if (results.length === 1) return results[0]
      return null
    },
    async deleteFlower(_, args) {
      const results = await db
        .delete(schema.flowers)
        .where(eq(schema.flowers.id, args.id))
        .returning()

      if (results.length === 1) return results[0]
      return null
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})

await server.start()

app.use(
  "/",
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
)

export default httpServer
