import type { Prisma } from "@prisma/client"

import { db } from "~/lib/db.server"

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  if (data.email) {
    const existing = await db.user.findFirst({ where: { email: { equals: data.email as string } } })
    if (existing) return { error: "User with these details already exists" }
  }
  const user = await db.user.update({ where: { id }, data })
  return { user }
}
