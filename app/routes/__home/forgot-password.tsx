import * as React from "react"
import * as c from "@chakra-ui/react"
import { ActionFunction, Form, Link, useActionData, useTransition } from "remix"
import { z } from "zod"

import { ActionData, validateFormData } from "~/lib/form"
import { useToast } from "~/lib/hooks/useToast"
import { badRequest } from "~/lib/remix"
import { sendResetPasswordLink } from "~/services/auth/auth.service"

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const resetSchema = z.object({ email: z.string().email("Invalid email") })
  const { data, fieldErrors } = await validateFormData(resetSchema, formData)
  if (fieldErrors) return badRequest({ fieldErrors, data })
  await sendResetPasswordLink(data)
  return true
}

type ResetInput = {
  email: string
}
export default function ForgotPassword() {
  const { state, type } = useTransition()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const action = useActionData<ActionData<ResetInput>>()
  const toast = useToast()
  React.useEffect(() => {
    if (type === "actionSubmission") {
      toast({ description: "Reset link sent to your email", status: "success" })
      if (!inputRef.current) return
      inputRef.current.value = ""
    }
  }, [type])

  return (
    <c.Center flexDir="column" pt={10}>
      <c.Box w={["100%", 400]}>
        <Form method="post">
          <c.Stack spacing={4}>
            <c.Heading as="h1">Forgot your password?</c.Heading>
            <c.Text>Enter your email below to receive your password reset instructions.</c.Text>

            <c.FormControl isInvalid={!!action?.fieldErrors?.email}>
              <c.FormLabel htmlFor="email">Email address</c.FormLabel>
              <c.Input
                ref={inputRef}
                defaultValue={action?.data?.email}
                id="email"
                name="email"
                placeholder="jim@gmail.com"
              />
              <c.FormErrorMessage>{action?.fieldErrors?.email?.[0]}</c.FormErrorMessage>
            </c.FormControl>
            <c.Button
              isFullWidth
              colorScheme="purple"
              type="submit"
              isDisabled={state === "submitting"}
              isLoading={state === "submitting"}
            >
              Send instructions
            </c.Button>
            <Link to="/login">Login</Link>
          </c.Stack>
        </Form>
      </c.Box>
    </c.Center>
  )
}
