import type { ActionFunction } from "remix"
import { redirect } from "remix"

import { logout } from "~/services/auth/auth.service"

export const action: ActionFunction = ({ request }) => logout(request)

export const loader = () => redirect("/")
