import * as c from "@chakra-ui/react"

import { Limiter } from "~/components/Limiter"
import { LinkButton } from "~/components/LinkButton"

export default function Home() {
  return (
    <Limiter pt={20} minH="100vh">
      <c.Center flexDir="column">
        <c.Heading as="h1" mb={4} textAlign="center">
          Welcome to the Boilerplate
        </c.Heading>
        <LinkButton to="posts">See posts</LinkButton>
      </c.Center>
    </Limiter>
  )
}
