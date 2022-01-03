import * as c from "@chakra-ui/react"
import { HeadersFunction, json, LoaderFunction, useLoaderData } from "remix"

import { AwaitedFunction } from "~/lib/helpers/types"
import { createImageUrl } from "~/lib/s3"
import { db } from "~/prisma/db"

export const headers: HeadersFunction = () => {
  return { "Cache-Control": "max-age=300, s-maxage=3600" }
}

const getPost = async (id?: string) => {
  if (!id) throw new Response("ID required", { status: 400 })
  const post = await db.post.findUnique({
    where: { id },
    select: { id: true, title: true, type: true, description: true, author: true },
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
    <c.Box>
      <c.Flex justify="space-between">
        <c.Stack>
          <c.HStack>
            <c.Heading fontWeight={800}>{post.title}</c.Heading>
            <c.Tag>{post.type}</c.Tag>
          </c.HStack>
          <c.Text>{post.description}</c.Text>
        </c.Stack>
        {post.author.avatar && (
          <c.Avatar size="xl" src={createImageUrl(post.author.avatar)} name={post.author.firstName} />
        )}
      </c.Flex>
    </c.Box>
  )
}
