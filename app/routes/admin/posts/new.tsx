import * as React from "react"
import * as c from "@chakra-ui/react"
import { PostType } from "@prisma/client"
import { ActionArgs, redirect } from "@remix-run/node"
import { useTransition } from "@remix-run/react"
import { z } from "zod"

import { Form, FormError, FormField } from "~/components/Form"
import { Tile, TileBody, TileFooter, TileHeader, TileHeading } from "~/components/Tile"
import { db } from "~/lib/db.server"
import { validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { getCurrentUser } from "~/services/auth/auth.server"

export const action = async ({ request }: ActionArgs) => {
  const postSchema = z.object({
    title: z.string().min(1, { message: "Required" }),
    description: z.string().min(1, { message: "Required" }),
    type: z.nativeEnum(PostType, { errorMap: () => ({ message: "Invalid option" }) }),
  })
  const formData = await request.formData()
  const { data, fieldErrors } = await validateFormData(postSchema, formData)
  const user = await getCurrentUser(request)
  if (fieldErrors) return badRequest({ fieldErrors, data })
  const post = await db.post.create({ data: { ...data, author: { connect: { id: user.id } } } })
  return redirect(`/admin/posts/${post.id}`)
}

const POST_TYPE_OPTIONS: { label: string; value: PostType }[] = [
  { value: PostType.FUNNY, label: "Funny" },
  { value: PostType.SERIOUS, label: "Serious" },
  { value: PostType.NEWS, label: "News" },
  { value: PostType.RANDOM, label: "Random" },
  { value: PostType.TECH, label: "Tech" },
]

export default function NewPost() {
  const [isDirty, setIsDirty] = React.useState(false)
  const { state } = useTransition()
  const isSubmitting = state === "submitting"

  return (
    <c.Stack spacing={4}>
      <c.Flex justify="space-between">
        <c.Heading>New post</c.Heading>
      </c.Flex>

      <Form
        method="post"
        onChange={(e) => {
          const formData = new FormData(e.currentTarget)
          const data = Object.fromEntries(formData)
          const isDirty = Object.values(data).some((val) => !!val)
          setIsDirty(isDirty)
        }}
      >
        <Tile>
          <TileHeader>
            <TileHeading>Info</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Stack spacing={4}>
              <FormField name="title" label="Title" placeholder="My post" min={1} />
              <FormField name="description" label="Description" input={<c.Textarea rows={6} />} />
              <FormField
                name="type"
                label="Type"
                placeholder="Select type"
                input={
                  <c.Select>
                    {POST_TYPE_OPTIONS.map(({ value, label }) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </c.Select>
                }
              />
              <FormError />
            </c.Stack>
          </TileBody>
          <TileFooter>
            <c.ButtonGroup>
              <c.Button
                type="submit"
                isDisabled={isSubmitting || !isDirty}
                isLoading={isSubmitting}
                colorScheme="purple"
                size="sm"
              >
                Create
              </c.Button>
            </c.ButtonGroup>
          </TileFooter>
        </Tile>
      </Form>
    </c.Stack>
  )
}
