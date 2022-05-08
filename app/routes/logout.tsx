import type { ActionFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"

import { logout } from "~/services/auth/auth.service"

export const action: ActionFunction = ({ request }) => logout(request)

export const loader = () => redirect("/")
