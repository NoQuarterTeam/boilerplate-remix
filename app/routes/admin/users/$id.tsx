import { Avatar, Box, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { json, LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { db } from "~/lib/db.server"
import { badRequest, notFound } from "~/lib/remix"
import { createImageUrl } from "~/lib/s3"

export const loader = async ({ params: { id } }: LoaderArgs) => {
  if (!id) throw badRequest("ID required")
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, avatar: true, firstName: true, email: true },
  })
  if (!user) throw notFound("User not Found")
  return json({ user })
}

export default function UserDetail() {
  const { user } = useLoaderData<typeof loader>()
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
