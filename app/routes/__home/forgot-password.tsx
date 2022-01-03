import * as React from "react"
import * as c from "@chakra-ui/react"
import { ActionFunction, Link, useActionData, useTransition } from "remix"
import { z } from "zod"

import { Form, FormError, FormField } from "~/components/Form"
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
  const form = useActionData<ActionData<ResetInput>>()
  const toast = useToast()
  React.useEffect(() => {
    if (type === "actionSubmission") {
      toast({ description: "Reset link sent to your email", status: "success" })
      if (!inputRef.current) return
      inputRef.current.value = ""
    }
  }, [type])

  const isSubmitting = state === "submitting"
  return (
    <c.Center flexDir="column" pt={10}>
      <c.Box w={["100%", 400]}>
        <Form method="post" form={form}>
          <c.Stack spacing={4}>
            <c.Heading as="h1">Forgot your password?</c.Heading>
            <c.Text>Enter your email below to receive your password reset instructions.</c.Text>
            <FormField isRequired label="Email address" name="email" placeholder="jim@gmail.com" />
            <FormError />
            <c.Button
              isFullWidth
              colorScheme="purple"
              type="submit"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
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
