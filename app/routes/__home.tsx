import { Box } from "@chakra-ui/react"
import { json, LoaderFunction, Outlet, useLoaderData } from "remix"

import { Limiter } from "~/components/Limiter"
import { Nav } from "~/components/Nav"
import { getUser } from "~/services/auth/auth.service"
import type { CurrentUser } from "~/services/auth/auth.service"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  return json(user)
}

export default function HomeLayout() {
  const user = useLoaderData<CurrentUser | null>()
  return (
    <Box>
      <Nav user={user} />
      <Limiter pt="65px">
        <Outlet />
      </Limiter>
    </Box>
  )
}
