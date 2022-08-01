import * as c from "@chakra-ui/react"
import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node"
import { Link, useTransition } from "@remix-run/react"
import { z } from "zod"

import { Form, FormError, FormField } from "~/components/Form"
import { validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { createUserSession, getUser, register } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request)
  if (user) return redirect("/")
  return {}
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const registerSchema = z.object({
    email: z.string().min(3).email("Invalid email"),
    password: z.string().min(8, "Must be at least 8 characters"),
    firstName: z.string().min(2, "Must be at least 2 characters"),
    lastName: z.string().min(2, "Must be at least 2 characters"),
  })
  const { data, fieldErrors } = await validateFormData(registerSchema, formData)
  if (fieldErrors) return badRequest({ fieldErrors, data })

  const { user, error } = await register(data)
  if (error || !user) return badRequest({ data, formError: error })
  return createUserSession(user.id, "/")
}

export default function Register() {
  const { state } = useTransition()

  const isSubmitting = state === "submitting"
  return (
    <c.Center flexDir="column" pt={10}>
      <c.Box w={["100%", 400]}>
        <Form method="post">
          <c.Stack spacing={3}>
            <c.Heading as="h1">Register</c.Heading>
            <FormField isRequired label="Email address" name="email" placeholder="jim@gmail.com" />
            <FormField isRequired label="Password" name="password" type="password" placeholder="********" />
            <FormField isRequired label="First name" name="firstName" placeholder="Jim" />
            <FormField isRequired label="Last name" name="lastName" placeholder="Bob" />
            <c.Box>
              <c.Button
                colorScheme="purple"
                type="submit"
                w="100%"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Register
              </c.Button>
              <FormError />
            </c.Box>

            <c.Flex justify="space-between">
              <Link to="/login">Login</Link>
              <Link to="/forgot-password">Forgot password?</Link>
            </c.Flex>
          </c.Stack>
        </Form>
      </c.Box>
    </c.Center>
  )
}
