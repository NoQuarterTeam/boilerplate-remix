import * as React from "react"
import { BiMoon, BiSun } from "react-icons/bi"
import { CgAlbum, CgExternal, CgFileDocument, CgHome, CgUser } from "react-icons/cg"
import * as c from "@chakra-ui/react"
import { Role } from "@prisma/client"
import { json, LoaderArgs } from "@remix-run/node"
import { Form, NavLink, Outlet, useLoaderData } from "@remix-run/react"

import type { CurrentUser } from "~/services/auth/auth.server"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request)
  const user = await getCurrentUser(request)
  return json(user)
}

export default function AdminLayout() {
  const user = useLoaderData<CurrentUser>()
  const { colorMode, toggleColorMode } = c.useColorMode()
  const isDark = colorMode === "dark"

  const bg = c.useColorModeValue("white", "gray.900")
  const borderColor = c.useColorModeValue("gray.100", "gray.900")

  return (
    <c.Flex w="100vw" h="100vh" overflow="hidden">
      <c.Flex
        flexDir="column"
        justify="space-between"
        w={{ base: "70px", md: "200px" }}
        p={{ base: 4, md: 8 }}
        py={8}
        h="100vh"
        bg={bg}
        borderRight="1px solid"
        borderColor={borderColor}
      >
        <c.Stack spacing={4}>
          <SidebarLink to="/" icon={<c.Box boxSize="18px" as={CgHome} />}>
            Home
          </SidebarLink>
          <SidebarLink to="." end icon={<c.Box boxSize="18px" as={CgAlbum} />}>
            Dashboard
          </SidebarLink>
          {user.role === Role.ADMIN && (
            <SidebarLink to="users" icon={<c.Box boxSize="18px" as={CgUser} />}>
              Users
            </SidebarLink>
          )}
          <SidebarLink to="posts" icon={<c.Box boxSize="18px" as={CgFileDocument} />}>
            Posts
          </SidebarLink>
        </c.Stack>
        <c.Stack>
          <c.Center>
            <c.IconButton
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              variant="ghost"
              onClick={toggleColorMode}
              icon={<c.Box as={isDark ? BiSun : BiMoon} boxSize="20px" />}
            />
          </c.Center>
          <c.Center>
            <c.Text>{user.firstName}</c.Text>
          </c.Center>
          <Form action="/logout" method="post">
            <c.Button type="submit" w="100%" variant="outline" size="sm">
              <c.Icon boxSize="20px" as={CgExternal} mr={{ base: 0, md: 2 }} />
              <c.Text display={{ base: "none", md: "block" }}>Logout</c.Text>
            </c.Button>
          </Form>
        </c.Stack>
      </c.Flex>
      <c.Box
        w={{ base: "calc(100vw - 70px)", md: "calc(100vw - 200px)" }}
        px={{ base: 4, md: 10 }}
        py={8}
        overflow="scroll"
      >
        <Outlet />
      </c.Box>
    </c.Flex>
  )
}

interface SidebarLinkProps extends c.LinkProps {
  to: string
  end?: boolean
  icon: React.ReactNode
  children: string
}

function SidebarLink({ to, icon, end, ...props }: SidebarLinkProps) {
  const activeColor = c.useColorModeValue("purple.500", "purple.300")
  const inactiveColor = c.useColorModeValue("black", "white")
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <c.Link
          as="span"
          display="flex"
          color={isActive ? activeColor : inactiveColor}
          alignItems="center"
          justifyContent={{ base: "center", md: "flex-start" }}
          fontWeight="semibold"
          {...props}
        >
          <c.Center w="26px">{icon}</c.Center>
          <c.Text ml={2} display={{ base: "none", md: "block" }}>
            {props.children}
          </c.Text>
        </c.Link>
      )}
    </NavLink>
  )
}
