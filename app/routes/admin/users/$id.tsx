import { Avatar, Box, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { json, LoaderFunction, useLoaderData } from "remix"

import { createImageUrl } from "~/lib/s3"

import { db } from "~/prisma/db"

const getUser = async (id?: string) => {
  if (!id) throw new Response("ID required", { status: 400 })
  const user = await db.user.findUnique({ where: { id } })
  if (!user) throw new Response("Not Found", { status: 404 })
  return { user }
}

export const loader: LoaderFunction = async ({ params: { id } }) => {
  const data = await getUser(id)
  return json(data)
}

type LoaderData = Awaited<ReturnType<typeof getUser>>

export default function UserDetail() {
  const { user } = useLoaderData<LoaderData>()
  return (
    <Box>
      <Flex justify="space-between">
        <Stack>
          <Heading fontWeight={800}>{user.firstName}</Heading>
          <Text>{user.email}</Text>
        </Stack>
        {user.avatar && <Avatar size="xl" src={createImageUrl(user.avatar)} name={user.firstName} />}
      </Flex>
    </Box>
  )
}

export function CatchBoundary() {
  return <Box>Not found!</Box>
}
