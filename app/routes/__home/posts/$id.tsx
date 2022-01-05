import * as c from "@chakra-ui/react"
import { HeadersFunction, json, LoaderFunction, useLoaderData } from "remix"

import { AwaitedFunction } from "~/lib/helpers/types"
import { createImageUrl } from "~/lib/s3"
import { db } from "~/prisma/db"

export const headers: HeadersFunction = () => {
  return { "Cache-Control": "max-age=3600, s-maxage=36000" }
}

const getPost = async (id?: string) => {
  if (!id) throw new Response("ID required", { status: 400 })
  const post = await db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      type: true,
      description: true,
      author: { select: { firstName: true, avatar: true } },
    },
  })
  if (!post) throw new Response("Not Found", { status: 404 })
  return { post }
}

export const loader: LoaderFunction = async ({ params: { id } }) => {
  const data = await getPost(id)
  return json(data)
}

type LoaderData = AwaitedFunction<typeof getPost>

export default function PostDetail() {
  const { post } = useLoaderData<LoaderData>()
  return (
    <c.Stack py={10} spacing={8}>
      <c.Stack justify="space-between">
        <c.Heading fontSize={{ base: "2xl", md: "3xl" }}>{post.title}</c.Heading>
        <c.Box>
          <c.Tag>{post.type}</c.Tag>
        </c.Box>
      </c.Stack>

      <c.Stack>
        <c.Text>{post.description}</c.Text>
      </c.Stack>
      {post.author.avatar && (
        <c.HStack>
          <c.Avatar size="sm" src={createImageUrl(post.author.avatar)} name={post.author.firstName} />
          <c.Text>{post.author.firstName}</c.Text>
        </c.HStack>
      )}
    </c.Stack>
  )
}
