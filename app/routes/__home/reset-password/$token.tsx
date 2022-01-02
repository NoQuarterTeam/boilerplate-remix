import * as c from "@chakra-ui/react"
import { ActionFunction, Form, Link, redirect, useActionData, useParams, useTransition } from "remix"
import { z } from "zod"
import { ActionData, validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { resetPassword } from "~/services/auth/auth.service"

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, "Must be at least 8 characters"),
  })

  const { data, fieldErrors } = await validateFormData(resetPasswordSchema, formData)
  if (fieldErrors) return badRequest({ fieldErrors, data })
  await resetPassword(data)
  return redirect("/login")
}
type ResetInput = {
  password: string
}

export default function ResetPassword() {
  const { token } = useParams()
  const { state } = useTransition()
  const action = useActionData<ActionData<ResetInput>>()

  return (
    <c.Center flexDir="column" pt={10}>
      <c.Box w={["100%", 400]}>
        <Form method="post">
          <c.Stack spacing={4}>
            <c.Box>
              <c.Heading as="h1">Reset password</c.Heading>
              <c.Text>Enter a new password below.</c.Text>
            </c.Box>
            <c.FormControl isInvalid={!!action?.fieldErrors?.password}>
              <c.FormLabel htmlFor="password">Password</c.FormLabel>
              <input name="token" type="hidden" value={token} />
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
            <c.Button
              isFullWidth
              colorScheme="purple"
              type="submit"
              isDisabled={state === "submitting"}
              isLoading={state === "submitting"}
            >
              Reset
            </c.Button>
            <Link to="/login">Login</Link>
          </c.Stack>
        </Form>
      </c.Box>
    </c.Center>
  )
}
