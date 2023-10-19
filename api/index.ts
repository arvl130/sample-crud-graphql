import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { db } from "../src/db/client.js"
import * as schema from "../src/db/schema.js"
import { eq } from "drizzle-orm"
import cors from "cors"
import http from "http"
import express from "express"

const app = express()
const httpServer = http.createServer(app)

const typeDefs = `#graphql
type Flower {
  id: ID!
  name: String!
  color: String!
}

type Query {
  flower(id: ID!): Flower
  flowers: [Flower!]!
}

type Mutation {
  addFlower(newFlower: NewFlower!): Flower!
  deleteFlower(id: ID!): Flower!
  updateFlower(id: ID!, newFlower: NewFlower!): Flower!
}

input NewFlower {
  name: String!
  color: String!
}`

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
