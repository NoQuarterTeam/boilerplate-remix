import { BiCog, BiExit, BiMoon, BiSun, BiUser } from "react-icons/bi"
import { GiHamburgerMenu } from "react-icons/gi"
import {
  Avatar,
  Box,
  Button,
  Fade,
  HStack,
  IconButton,
  Link as CLink,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react"
import { Role } from "@prisma/client"
import { Form, Link } from "remix"

import { createImageUrl } from "~/lib/s3"
import type { CurrentUser } from "~/services/auth/auth.service"

import { Limiter } from "./Limiter"
import { LinkButton } from "./LinkButton"

interface Props {
  user: CurrentUser | null
}
export function Nav(props: Props) {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === "dark"

  return (
    <Box
      w="100%"
      pos="fixed"
      top={0}
      left={0}
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.100", "gray.700")}
      zIndex={500}
    >
      <Limiter
        display="flex"
        transition="200ms all"
        py={{ base: 4, md: 3 }}
        bg={useColorModeValue("white", "gray.800")}
        justifyContent="space-between"
        alignItems="center"
        w="100%"
      >
        {/* Left link list */}
        <HStack spacing={8}>
          <CLink fontWeight="bold" as={Link} to="/">
            Boilerplate
          </CLink>
          <Link to="/posts">Posts</Link>
        </HStack>

        {/* Right link list */}

        {!props.user && (
          <Fade in>
            <HStack spacing={4} display={{ base: "none", md: "flex" }}>
              <LinkButton to="/login" variant="ghost">
                Login
              </LinkButton>
              <LinkButton to="/register" variant="solid" colorScheme="purple">
                Register
              </LinkButton>
            </HStack>
          </Fade>
        )}

        {/* Right menu list */}
        <Menu placement="bottom-end" closeOnSelect closeOnBlur>
          <MenuButton
            as={IconButton}
            display={{ base: "flex", md: props.user ? "flex" : "none" }}
            p={0}
            colorScheme={props.user ? "gray" : undefined}
            borderRadius="full"
            icon={
              props.user ? (
                <Avatar
                  size="sm"
                  boxSize="35px"
                  bg="purple.50"
                  src={createImageUrl(props.user.avatar)}
                  name={props.user.firstName}
                />
              ) : (
                <Box as={GiHamburgerMenu} />
              )
            }
          />

          <MenuList fontSize="md">
            {props.user ? (
              <>
                <Link to="/profile">
                  <MenuItem icon={<Box as={BiUser} boxSize="16px" />}>Profile</MenuItem>
                </Link>
                {props.user.role === Role.ADMIN && (
                  <Link to="/admin">
                    <MenuItem icon={<Box as={BiCog} boxSize="16px" />}>Admin</MenuItem>
                  </Link>
                )}
                <MenuDivider />
                <MenuItem
                  closeOnSelect={false}
                  icon={<Box as={isDark ? BiSun : BiMoon} boxSize="16px" />}
                  onClick={toggleColorMode}
                >
                  Toggle theme
                </MenuItem>
                <MenuDivider />

                <Form action="/logout" method="post">
                  <Button type="submit" isFullWidth variant="ghost" icon={<Box as={BiExit} boxSize="16px" />}>
                    Logout
                  </Button>
                </Form>
              </>
            ) : (
              <>
                <MenuItem
                  closeOnSelect={false}
                  icon={<Box as={isDark ? BiSun : BiMoon} boxSize="16px" />}
                  onClick={toggleColorMode}
                >
                  Toggle theme
                </MenuItem>
                <MenuDivider />
                <Link to="/login">
                  <MenuItem>Login</MenuItem>
                </Link>
                <Link to="/register">
                  <MenuItem fontWeight="semibold">Register</MenuItem>
                </Link>
              </>
            )}
          </MenuList>
        </Menu>
      </Limiter>
    </Box>
  )
}
