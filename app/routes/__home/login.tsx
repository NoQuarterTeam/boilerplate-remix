import * as c from "@chakra-ui/react"
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useSearchParams,
  useTransition,
} from "remix"
import { z } from "zod"

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
  const action = useActionData<ActionData<LoginInput>>()
  const [searchParams] = useSearchParams()
  return (
    <c.Center flexDir="column" pt={10}>
      <c.Box w={["100%", 400]}>
        <Form method="post">
          <c.Stack spacing={3}>
            <c.Heading as="h1">Login</c.Heading>
            <input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? undefined} />
            <c.FormControl isInvalid={!!action?.fieldErrors?.email}>
              <c.FormLabel htmlFor="email">Email address</c.FormLabel>
              <c.Input
                defaultValue={action?.data?.email}
                id="email"
                name="email"
                placeholder="jim@gmail.com"
              />
              <c.FormErrorMessage>{action?.fieldErrors?.email?.[0]}</c.FormErrorMessage>
            </c.FormControl>
            <c.FormControl isInvalid={!!action?.fieldErrors?.password}>
              <c.FormLabel htmlFor="password">Password</c.FormLabel>
              <c.Input
                defaultValue={action?.data?.password}
                id="password"
                name="password"
                label="Password"
                type="password"
                placeholder="********"
              />
              <c.FormErrorMessage>{action?.fieldErrors?.password?.[0]}</c.FormErrorMessage>
            </c.FormControl>

            <c.Box>
              <c.Button
                colorScheme="purple"
                type="submit"
                isFullWidth
                isDisabled={state === "submitting"}
                isLoading={state === "submitting"}
              >
                Login
              </c.Button>
              <c.FormControl isInvalid={!!action?.formError}>
                <c.FormErrorMessage>{action?.formError}</c.FormErrorMessage>
              </c.FormControl>
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
