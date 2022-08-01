import * as c from "@chakra-ui/react"
import { Avatar } from "@chakra-ui/react"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import { Tile, TileBody, TileFooter, TileHeader, TileHeading } from "~/components/Tile"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers"
import { createImageUrl } from "~/lib/s3"

dayjs.extend(relativeTime)

export const meta = () => {
  return { title: "Posts" }
}
export const headers = useLoaderHeaders

const getPosts = async () => {
  const posts = await db.post.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      author: { select: { firstName: true, avatar: true } },
    },
  })
  const count = await db.user.count()
  return { posts, count }
}

export const loader = async () => {
  const posts = await getPosts()
  return json(posts, { headers: { "Cache-Control": "max-age=300, s-maxage=3600" } })
}

export default function Posts() {
  const { posts } = useLoaderData<typeof loader>()
  return (
    <c.Stack py={10} spacing={8}>
      <c.Heading fontSize={{ base: "2xl", md: "3xl" }}>Posts</c.Heading>
      <c.SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {posts.map((post) => (
          <Link to={post.id} key={post.id}>
            <Tile>
              <TileHeader>
                <TileHeading>{post.title}</TileHeading>
              </TileHeader>
              <TileBody>{post.description}</TileBody>
              <TileFooter>
                <c.Flex justify="flex-end">
                  <c.HStack>
                    <Avatar size="sm" src={createImageUrl(post.author.avatar)} name={post.author.firstName} />
                    <c.Text>{dayjs(post.createdAt).fromNow()}</c.Text>
                  </c.HStack>
                </c.Flex>
              </TileFooter>
            </Tile>
          </Link>
        ))}
      </c.SimpleGrid>
    </c.Stack>
  )
}
