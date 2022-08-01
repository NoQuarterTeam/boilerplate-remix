import * as c from "@chakra-ui/react"
import { json, LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { Tile, TileBody, TileHeader, TileHeading } from "~/components/Tile"
import { db } from "~/lib/db.server"
import { requireUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request)
  const userCount = await db.user.count()
  const postCount = await db.post.count()

  return json({ userCount, postCount })
}

type LoaderData = {
  userCount: number
  postCount: number
}
export default function AdminIndex() {
  const { userCount, postCount } = useLoaderData<LoaderData>()
  return (
    <c.Stack spacing={4}>
      <c.Heading>Welcome, here are some stats.</c.Heading>
      <c.SimpleGrid columns={{ base: 1, md: 2 }} spacing={20}>
        <Tile>
          <TileHeader>
            <TileHeading>User count</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Text>{userCount}</c.Text>
          </TileBody>
        </Tile>
        <Tile>
          <TileHeader>
            <TileHeading>Post count</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Text>{postCount}</c.Text>
          </TileBody>
        </Tile>
      </c.SimpleGrid>
    </c.Stack>
  )
}
