import { Center, Heading } from "@chakra-ui/react"

import { Limiter } from "~/components/Limiter"

export default function Home() {
  return (
    <Limiter pt={20} minH="100vh">
      <Center flexDir="column">
        <Heading as="h1" mb={4} textAlign="center">
          Welcome to the Boilerplate
        </Heading>
      </Center>
    </Limiter>
  )
}
