import { Box, Flex, Heading, Link, LinkProps, Stack, useColorModeValue } from "@chakra-ui/react"
import { NavLink, Outlet } from "@remix-run/react"

export default function ProfileLayout() {
  return (
    <Box pt={10} pb={20} w="100%">
      <Heading pb={10} fontSize={{ base: "2xl", md: "3xl" }}>
        Profile
      </Heading>
      <Flex flexWrap={{ base: "wrap", md: "unset" }}>
        <Box pos="relative">
          <Stack
            position="sticky"
            top="100px"
            minW={{ base: "unset", md: "200px" }}
            mr={8}
            shouldWrapChildren
            flexDir={{ base: "row", md: "column" }}
            mb={{ base: 8, md: 0 }}
            spacing={{ base: 0, md: 4 }}
          >
            <ProfileLink to="." end>
              General
            </ProfileLink>
            <ProfileLink to="settings">Settings</ProfileLink>
          </Stack>
        </Box>
        <Box w="100%">
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}

interface ProfileLinkProps extends LinkProps {
  to: string
  end?: boolean
}
function ProfileLink({ to, end, ...props }: ProfileLinkProps) {
  const activeColor = useColorModeValue("black", "white")
  const inactiveColor = useColorModeValue("gray.500", "gray.400")
  const color = useColorModeValue("black", "white")
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <Link
          as="span"
          pr={4}
          h="25px"
          justifyContent={{ base: "center", md: "flex-start" }}
          textDecoration="none !important"
          color={isActive ? activeColor : inactiveColor}
          _hover={{ color }}
          fontWeight={isActive ? "semibold" : "normal"}
        >
          {props.children}
        </Link>
      )}
    </NavLink>
  )
}
