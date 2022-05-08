import { Role } from "@prisma/client"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request)
  const user = await getCurrentUser(request)
  if (user.role !== Role.ADMIN) return redirect("/admin")
  return json(user)
}

export default function UsersLayout() {
  return <Outlet />
}
