import { pgTable, varchar, serial } from "drizzle-orm/pg-core"

export const flowers = pgTable("flowers", {
  id: serial("id").primaryKey(),
  name: varchar("name", {
    length: 255,
  }),
  color: varchar("color", {
    enum: [
      "light",
      "rose",
      "pink",
      "fuchsia",
      "purple",
      "violet",
      "indigo",
      "blue",
      "lightBlue",
      "darkBlue",
      "cyan",
      "teal",
      "emerald",
      "green",
      "lime",
      "yellow",
      "amber",
      "orange",
      "red",
      "warmGray",
      "trueGray",
      "gray",
      "coolGray",
      "blueGray",
      "dark",
    ],
  }),
})
