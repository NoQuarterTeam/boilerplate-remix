import * as c from "@chakra-ui/react"
import { json, LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers"
import { badRequest, notFound } from "~/lib/remix"
import { createImageUrl } from "~/lib/s3"

export const headers = useLoaderHeaders

export const loader = async ({ params: { id } }: LoaderArgs) => {
  if (!id) throw badRequest("ID required")
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
  if (!post) throw notFound("Post not Found")
  return json({ post }, { headers: { "Cache-Control": "max-age=300, s-maxage=36000" } })
}

export default function PostDetail() {
  const { post } = useLoaderData<typeof loader>()
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
