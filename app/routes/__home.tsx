import { Box } from "@chakra-ui/react"
import { json, LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import { Limiter } from "~/components/Limiter"
import { Nav } from "~/components/Nav"
import { getUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request)
  return json(user)
}

export default function HomeLayout() {
  const user = useLoaderData<typeof loader>()
  return (
    <Box>
      <Nav user={user} />
      <Limiter pt="65px">
        <Outlet />
      </Limiter>
    </Box>
  )
}
