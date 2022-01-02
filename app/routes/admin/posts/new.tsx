import * as c from "@chakra-ui/react"
import { ActionFunction, Form, redirect, useActionData, useTransition } from "remix"
import { z } from "zod"

import { Tile, TileBody, TileFooter, TileHeader, TileHeading } from "~/components/Tile"
import { ActionData, validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { db } from "~/prisma/db"
import { getCurrentUser } from "~/services/auth/auth.service"

export const action: ActionFunction = async ({ request }) => {
  const postSchema = z.object({ title: z.string().min(1), description: z.string().min(1) })
  const formData = await request.formData()
  const { data, fieldErrors } = await validateFormData(postSchema, formData)
  const user = await getCurrentUser(request)
  if (fieldErrors) return badRequest({ fieldErrors, data })
  const post = await db.post.create({ data: { ...data, author: { connect: { id: user.id } } } })
  return redirect(`/admin/posts/${post.id}`)
}

type PostInput = {
  title: string
  description: string
}

export default function NewPost() {
  const action = useActionData<ActionData<PostInput>>()
  const { state } = useTransition()
  const isSubmitting = state === "submitting"
  return (
    <c.Stack spacing={4}>
      <c.Flex justify="space-between">
        <c.Heading>New post</c.Heading>
      </c.Flex>

      <Tile>
        <Form method="post">
          <TileHeader>
            <TileHeading>Info</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Stack spacing={4}>
              <c.FormControl isInvalid={!!action?.fieldErrors?.title}>
                <c.FormLabel htmlFor="email">Title</c.FormLabel>
                <c.Input defaultValue={action?.data?.title} id="title" name="title" placeholder="My post" />
                <c.FormErrorMessage>{action?.fieldErrors?.title?.[0]}</c.FormErrorMessage>
              </c.FormControl>
              <c.FormControl isInvalid={!!action?.fieldErrors?.description}>
                <c.FormLabel htmlFor="description">Description</c.FormLabel>
                <c.Textarea
                  defaultValue={action?.data?.description}
                  id="description"
                  name="description"
                  placeholder="Cool"
                />
                <c.FormErrorMessage>{action?.fieldErrors?.description?.[0]}</c.FormErrorMessage>
              </c.FormControl>
              <c.FormControl isInvalid={!!action?.formError}>
                <c.FormErrorMessage>{action?.formError}</c.FormErrorMessage>
              </c.FormControl>
            </c.Stack>
          </TileBody>
          <TileFooter>
            <c.ButtonGroup>
              <c.Button
                type="submit"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                colorScheme="purple"
                size="sm"
              >
                Create
              </c.Button>
            </c.ButtonGroup>
          </TileFooter>
        </Form>
      </Tile>
    </c.Stack>
  )
}
