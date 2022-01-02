import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react"
import { ActionFunction, Form, Link, LoaderFunction, redirect, useActionData, useTransition } from "remix"
import { z } from "zod"

import { ActionData, validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { createUserSession, getUser, register } from "~/services/auth/auth.service"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  if (user) return redirect("/")
  return {}
}

export const action: ActionFunction = async ({ request }) => {
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

type RegisterInput = {
  email: string
  password: string
  firstName: string
  lastName: string
}

export default function Register() {
  const { state } = useTransition()
  const action = useActionData<ActionData<RegisterInput>>()
  return (
    <Center flexDir="column" pt={10}>
      <Box w={["100%", 400]}>
        <Form method="post">
          <Stack spacing={3}>
            <Heading as="h1">Register</Heading>
            <FormControl isInvalid={!!action?.fieldErrors?.email}>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input defaultValue={action?.data?.email} id="email" name="email" placeholder="jim@gmail.com" />
              <FormErrorMessage>{action?.fieldErrors?.email?.[0]}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!action?.fieldErrors?.password}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                defaultValue={action?.data?.password}
                id="password"
                name="password"
                label="Password"
                type="password"
                placeholder="********"
              />
              <FormErrorMessage>{action?.fieldErrors?.password?.[0]}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!action?.fieldErrors?.firstName}>
              <FormLabel htmlFor="firstName">First name</FormLabel>
              <Input
                defaultValue={action?.data?.firstName}
                id="firstName"
                name="firstName"
                placeholder="Jim"
              />
              <FormErrorMessage>{action?.fieldErrors?.firstName?.[0]}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!action?.fieldErrors?.lastName}>
              <FormLabel htmlFor="lastName">Last name</FormLabel>
              <Input defaultValue={action?.data?.lastName} id="lastName" name="lastName" placeholder="Sebe" />
              <FormErrorMessage>{action?.fieldErrors?.lastName?.[0]}</FormErrorMessage>
            </FormControl>

            <Box>
              <Button
                colorScheme="purple"
                type="submit"
                isFullWidth
                isDisabled={state === "submitting"}
                isLoading={state === "submitting"}
              >
                Register
              </Button>
              <FormControl isInvalid={!!action?.formError}>
                <FormErrorMessage>{action?.formError}</FormErrorMessage>
              </FormControl>
            </Box>

            <Flex justify="space-between">
              <Link to="/login">Login</Link>
              <Link to="/forgot-password">Forgot password?</Link>
            </Flex>
          </Stack>
        </Form>
      </Box>
    </Center>
  )
}
