import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import fs from "fs"
import path from "path"
import { db } from "./db/client.js"
import * as schema from "./db/schema.js"
import { eq } from "drizzle-orm"

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
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

const { url } = await startStandaloneServer(server, {
  listen: { port },
})

console.log(`Server ready at: ${url}`)
