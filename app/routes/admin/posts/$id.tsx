import * as c from "@chakra-ui/react"
import { HeadersFunction, json, LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { db } from "~/lib/db.server"
import { badRequest, notFound } from "~/lib/remix"
import { createImageUrl } from "~/lib/s3"

export const headers: HeadersFunction = () => {
  return { "Cache-Control": "max-age=300, s-maxage=3600" }
}

export const loader = async ({ params: { id } }: LoaderArgs) => {
  if (!id) throw badRequest("ID required")
  const post = await db.post.findUnique({
    where: { id },
    select: { id: true, title: true, type: true, description: true, author: true },
  })
  if (!post) throw notFound("Post not Found")
  return json({ post })
}

export default function PostDetail() {
  const { post } = useLoaderData<typeof loader>()
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
