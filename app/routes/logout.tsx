import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"

import { logout } from "~/services/auth/auth.server"

export const action = ({ request }: ActionArgs) => logout(request)

export const loader = () => redirect("/")
