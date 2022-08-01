import * as React from "react"
import { BiTrash } from "react-icons/bi"
import * as c from "@chakra-ui/react"
import { ActionArgs, json, LoaderArgs, MetaFunction, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData, useTransition } from "@remix-run/react"
import { z } from "zod"

import { Form, FormError, FormField } from "~/components/Form"
import { ImageUploader } from "~/components/ImageUploader"
import { Tile, TileBody, TileFooter, TileHeader, TileHeading } from "~/components/Tile"
import { shallowEqual, validateFormData } from "~/lib/form"
import { useToast } from "~/lib/hooks/useToast"
import { badRequest } from "~/lib/remix"
import { createImageUrl } from "~/lib/s3"
import { UPLOAD_PATHS } from "~/lib/uploadPaths"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"
import { updateUser } from "~/services/user/user.server"

export const meta: MetaFunction = () => {
  return { title: "Profile" }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request)
  const user = await getCurrentUser(request)
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  const user = await getCurrentUser(request)
  const formData = await request.formData()
  const updateSchema = z.object({
    email: z.string().min(3).email("Invalid email").optional(),
    firstName: z.string().min(2, "Must be at least 2 characters").optional(),
    lastName: z.string().min(2, "Must be at least 2 characters").optional(),
    avatar: z.string().nullable().optional(),
  })
  const { data, fieldErrors } = await validateFormData(updateSchema, formData)
  if (fieldErrors) return badRequest({ fieldErrors, data })
  // Dont need to update email address if the same as the current one
  let updateData: Partial<typeof data> = { ...data }
  if (data.email === user.email) delete updateData.email
  if (data.avatar && data.avatar === "") updateData.avatar = null
  const { error } = await updateUser(user.id, updateData)
  if (error) return badRequest({ data, formError: error })
  return redirect("/profile")
}

export default function Profile() {
  const uploader = useFetcher()
  const formRef = React.useRef<HTMLFormElement>(null)
  const user = useLoaderData<typeof loader>()
  const toast = useToast()

  const [isDirty, setIsDirty] = React.useState(false)
  const { state, type } = useTransition()

  React.useEffect(() => {
    if (type === "actionRedirect") {
      toast({ description: "Profile updated", status: "success" })
      setIsDirty(false)
    }
    if (type === "fetchActionRedirect") {
      toast({ description: "Avatar updated", status: "success" })
    }
  }, [type])

  const handleUpdateAvatar = (avatar: string) => {
    uploader.submit({ avatar }, { method: "post", action: "/profile?index" })
  }
  const isSubmitting = state === "submitting"

  return (
    <c.Stack spacing={6}>
      <Form
        ref={formRef}
        method="post"
        onChange={(e) => {
          const formData = new FormData(e.currentTarget)
          const data = Object.fromEntries(formData) as Record<string, string>
          const { firstName, lastName, email } = user
          const isDirty = !shallowEqual({ firstName, lastName, email }, data)
          setIsDirty(isDirty)
        }}
      >
        <Tile>
          <TileHeader>
            <TileHeading>Info</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Stack spacing={4} maxW="300px">
              <FormField
                label="Email address"
                defaultValue={user.email}
                name="email"
                placeholder="jim@gmail.com"
              />
              <FormField
                label="First name"
                defaultValue={user.firstName}
                name="firstName"
                placeholder="Jim"
              />
              <FormField label="Last name" defaultValue={user.lastName} name="lastName" placeholder="Sebe" />
              <FormError />
            </c.Stack>
          </TileBody>
          <TileFooter>
            <c.ButtonGroup>
              <c.Button
                type="submit"
                isDisabled={!isDirty || isSubmitting}
                isLoading={isSubmitting}
                colorScheme="purple"
                size="sm"
              >
                Update
              </c.Button>
              {isDirty && (
                <c.Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    formRef.current?.reset()
                    setIsDirty(false)
                  }}
                >
                  Cancel
                </c.Button>
              )}
            </c.ButtonGroup>
          </TileFooter>
        </Tile>
      </Form>
      <Tile>
        <TileHeader>
          <TileHeading>Avatar</TileHeading>
        </TileHeader>
        <TileBody>
          <c.VStack w="min-content">
            <ImageUploader
              dropzoneOptions={{ maxSize: 1_000_000 }}
              path={UPLOAD_PATHS.userAvatar(user.id)}
              onSubmit={handleUpdateAvatar}
            >
              <c.Avatar src={createImageUrl(user.avatar)} size="xl" />
            </ImageUploader>
            {user.avatar && (
              <c.Button
                colorScheme="red"
                aria-label="remove image"
                onClick={() => handleUpdateAvatar("")}
                size="sm"
                variant="ghost"
                leftIcon={<c.Box as={BiTrash} />}
                borderRadius="lg"
              >
                Remove
              </c.Button>
            )}
          </c.VStack>
        </TileBody>
        <TileFooter>Click on your avatar to upload a new photo</TileFooter>
      </Tile>
    </c.Stack>
  )
}
