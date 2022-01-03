import * as c from "@chakra-ui/react"
import { Avatar } from "@chakra-ui/react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { HeadersFunction, json, LoaderFunction, MetaFunction, useLoaderData } from "remix"

import { Tile, TileBody, TileFooter, TileHeader, TileHeading } from "~/components/Tile"
import { AwaitedFunction } from "~/lib/helpers/types"
import { createImageUrl } from "~/lib/s3"
import { db } from "~/prisma/db"

dayjs.extend(relativeTime)

export const meta: MetaFunction = () => {
  return { title: "Posts" }
}
export const headers: HeadersFunction = () => {
  return { "Cache-Control": "max-age=300, s-maxage=3600" }
}
const getPosts = async () => {
  const posts = await db.post.findMany({
    take: 10,
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

export const loader: LoaderFunction = async () => {
  const posts = await getPosts()
  return json(posts)
}
type LoaderData = AwaitedFunction<typeof getPosts>

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>()
  return (
    <c.Box pt={10} pb={20} w="100%">
      <c.Heading pb={10} fontSize={{ base: "2xl", md: "3xl" }}>
        Posts
      </c.Heading>
      <c.SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {posts.map((post) => (
          <Tile key={post.id}>
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
        ))}
      </c.SimpleGrid>
    </c.Box>
  )
}
