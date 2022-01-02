import { Avatar, Box, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { HeadersFunction, json, LoaderFunction, useLoaderData } from "remix"
import { createImageUrl } from "~/lib/s3"

import { db } from "~/prisma/db"

export const headers: HeadersFunction = () => {
  return { "Cache-Control": "max-age=300, s-maxage=3600" }
}

const getPost = async (id?: string) => {
  if (!id) throw new Response("ID required", { status: 400 })
  const post = await db.post.findUnique({ where: { id }, include: { author: true } })
  if (!post) throw new Response("Not Found", { status: 404 })
  return { post }
}

export const loader: LoaderFunction = async ({ params: { id } }) => {
  const data = await getPost(id)
  return json(data)
}

type LoaderData = Awaited<ReturnType<typeof getPost>>

export default function PostDetail() {
  const { post } = useLoaderData<LoaderData>()
  return (
    <Box>
      <Flex justify="space-between">
        <Stack>
          <Heading fontWeight={800}>{post.title}</Heading>
          <Text>{post.description}</Text>
        </Stack>
        {post.author.avatar && (
          <Avatar size="xl" src={createImageUrl(post.author.avatar)} name={post.author.firstName} />
        )}
      </Flex>
    </Box>
  )
}

export function CatchBoundary() {
  return <Box>Not found!</Box>
}
