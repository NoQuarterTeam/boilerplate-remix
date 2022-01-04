import * as c from "@chakra-ui/react"
import { Avatar } from "@chakra-ui/react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { HeadersFunction, json, Link, LoaderFunction, MetaFunction, useLoaderData } from "remix"

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

export const loader: LoaderFunction = async () => {
  const posts = await getPosts()
  return json(posts)
}
type LoaderData = AwaitedFunction<typeof getPosts>

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>()
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
