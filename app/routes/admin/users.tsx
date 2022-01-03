import { Role } from "@prisma/client"
import { json, LoaderFunction, Outlet, redirect } from "remix"

import { getCurrentUser, requireUser } from "~/services/auth/auth.service"

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request)
  const user = await getCurrentUser(request)
  if (user.role !== Role.ADMIN) return redirect("/admin")
  return json(user)
}

export default function UsersLayout() {
  return <Outlet />
}
