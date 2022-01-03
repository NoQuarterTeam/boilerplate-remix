import { PrismaClient } from "@prisma/client"

export let db: PrismaClient

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient({ log: ["query", "warn", "error"] })
  db.$connect()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({ log: ["query", "warn", "error"] })
    global.__db.$connect()
  }
  db = global.__db
  db?.$on("beforeExit", () => {
    process.exit(0)
  })
}
