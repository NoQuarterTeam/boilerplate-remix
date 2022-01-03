import * as c from "@chakra-ui/react"
import {
  ActionFunction,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useSearchParams,
  useTransition,
} from "remix"
import { z } from "zod"

import { Form, FormError, FormField } from "~/components/Form"
import { ActionData, validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { createUserSession, getUser, login } from "~/services/auth/auth.service"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  if (user) return redirect("/")
  return {}
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const loginSchema = z.object({
    email: z.string().min(3).email("Invalid email"),
    password: z.string().min(8, "Must be at least 8 characters"),
  })
  const { data, fieldErrors } = await validateFormData(loginSchema, formData)
  if (fieldErrors) return badRequest({ fieldErrors, data })

  const { error, user } = await login(data)
  if (error || !user) return badRequest({ data, formError: error })

  const redirectTo = formData.get("redirectTo") || "/"
  return createUserSession(user.id, redirectTo as string)
}

type LoginInput = {
  email: string
  password: string
}

export default function Login() {
  const { state } = useTransition()
  const form = useActionData<ActionData<LoginInput>>()
  const [searchParams] = useSearchParams()
  const isSubmitting = state === "submitting"
  return (
    <c.Center flexDir="column" pt={10}>
      <c.Box w={["100%", 400]}>
        <Form method="post" form={form}>
          <c.Stack spacing={3}>
            <c.Heading as="h1">Login</c.Heading>
            <input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? undefined} />
            <FormField isRequired label="Email address" name="email" placeholder="jim@gmail.com" />
            <FormField isRequired label="Password" name="password" type="password" placeholder="********" />
            <c.Box>
              <c.Button
                colorScheme="purple"
                type="submit"
                isFullWidth
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Login
              </c.Button>
              <FormError />
            </c.Box>

            <c.Flex justify="space-between">
              <Link to="/register">Register</Link>
              <Link to="/forgot-password">Forgot password?</Link>
            </c.Flex>
          </c.Stack>
        </Form>
      </c.Box>
    </c.Center>
  )
}
