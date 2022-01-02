import * as React from "react"
import { BiTrash } from "react-icons/bi"
import * as c from "@chakra-ui/react"
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useTransition,
} from "remix"
import { z } from "zod"

import { ImageUploader } from "~/components/ImageUploader"
import { Tile, TileBody, TileFooter, TileHeader, TileHeading } from "~/components/Tile"
import { ActionData, validateFormData } from "~/lib/form"
import { useToast } from "~/lib/hooks/useToast"
import { badRequest } from "~/lib/remix"
import { UPLOAD_PATHS } from "~/lib/uploadPaths"
import type { CurrentUser } from "~/services/auth/auth.service"
import { getCurrentUser, requireUser } from "~/services/auth/auth.service"
import { updateUser } from "~/services/user/user.service"
import { createImageUrl } from "~/lib/s3"

export const meta: MetaFunction = () => {
  return { title: "Profile" }
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request)
  const user = await getCurrentUser(request)
  return json(user)
}

export const action: ActionFunction = async ({ request }) => {
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

type ProfileInput = {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
}

export default function Profile() {
  const uploader = useFetcher()
  const user = useLoaderData<CurrentUser>()
  const toast = useToast()
  const action = useActionData<ActionData<ProfileInput>>()
  const { state, type } = useTransition()

  React.useEffect(() => {
    if (type === "actionRedirect" || type === "fetchActionRedirect") {
      toast({ description: "Profile updated", status: "success" })
    }
  }, [type])

  const handleUpdateAvatar = (avatar: string) => {
    uploader.submit({ avatar }, { method: "post", action: "/profile?index" })
  }
  const isSubmitting = state === "submitting"
  return (
    <c.Stack spacing={6}>
      <Tile>
        <Form method="post">
          <TileHeader>
            <TileHeading>Info</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Stack spacing={4} maxW="300px">
              <c.FormControl isInvalid={!!action?.fieldErrors?.email}>
                <c.FormLabel htmlFor="email">Email address</c.FormLabel>
                <c.Input
                  defaultValue={action?.data?.email || user.email}
                  id="email"
                  name="email"
                  placeholder="jim@gmail.com"
                />
                <c.FormErrorMessage>{action?.fieldErrors?.email?.[0]}</c.FormErrorMessage>
              </c.FormControl>
              <c.FormControl isInvalid={!!action?.fieldErrors?.firstName}>
                <c.FormLabel htmlFor="firstName">First name</c.FormLabel>
                <c.Input
                  defaultValue={action?.data?.firstName || user.firstName}
                  id="firstName"
                  name="firstName"
                  placeholder="Jim"
                />
                <c.FormErrorMessage>{action?.fieldErrors?.firstName?.[0]}</c.FormErrorMessage>
              </c.FormControl>
              <c.FormControl isInvalid={!!action?.fieldErrors?.lastName}>
                <c.FormLabel htmlFor="lastName">Last name</c.FormLabel>
                <c.Input
                  defaultValue={action?.data?.lastName || user.lastName}
                  id="lastName"
                  name="lastName"
                  placeholder="Sebe"
                />
                <c.FormErrorMessage>{action?.fieldErrors?.lastName?.[0]}</c.FormErrorMessage>
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
                Update
              </c.Button>
            </c.ButtonGroup>
          </TileFooter>
        </Form>
      </Tile>
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
