import * as React from "react"
import { CgSoftwareDownload, CgUserAdd } from "react-icons/cg"
import * as c from "@chakra-ui/react"
import { Prisma } from "@prisma/client"
import { json, LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components"
import dayjs from "dayjs"

import { PartialCheckIcon } from "~/components/PartialCheckIcon"
import { Search } from "~/components/Search"
import { Column, Table } from "~/components/Table"
import { Tile } from "~/components/Tile"
import { db } from "~/lib/db.server"
import { getTableParams } from "~/lib/table"

const TAKE = 10
const DEFAULT_ORDER = { orderBy: "createdAt", order: Prisma.SortOrder.desc }

export const loader = async ({ request }: LoaderArgs) => {
  const { search, ...tableParams } = getTableParams(request, TAKE, DEFAULT_ORDER)
  const users = await db.user.findMany({
    ...tableParams,
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined,
    select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
  })
  const count = await db.user.count()
  return json({ users, count })
}

type User = UseDataFunctionReturn<typeof loader>["users"][0]

export default function AdminIndex() {
  const { users, count } = useLoaderData<typeof loader>()
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([])
  const toggleSelected = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers((selected) => selected.filter((d) => d !== userId))
    } else {
      setSelectedUsers((selected) => [...selected, userId])
    }
  }
  const toggleAll = () => {
    if (selectedUsers.length > 0) {
      setSelectedUsers([])
    } else if (users) {
      setSelectedUsers(users.map((user) => user.id))
    }
  }

  const isPartialSelection = !!users && selectedUsers.length > 0 && selectedUsers.length < users.length

  return (
    <c.Stack spacing={4}>
      <c.Heading>Users</c.Heading>
      <c.HStack>
        <Search placeholder="Search users" />
        <c.Button
          display={{ base: "none", md: "flex" }}
          leftIcon={<c.Box boxSize="20px" as={CgSoftwareDownload} />}
        >
          Download
        </c.Button>
        <c.Button
          display={{ base: "none", md: "flex" }}
          colorScheme="purple"
          leftIcon={<c.Box boxSize="18px" as={CgUserAdd} />}
        >
          Create user
        </c.Button>
        {selectedUsers.length > 0 && (
          <c.Button display={{ base: "none", md: "flex" }} variant="ghost">
            {selectedUsers.length} selected
          </c.Button>
        )}
      </c.HStack>
      <Tile>
        <Table
          take={TAKE}
          defaultOrder={DEFAULT_ORDER}
          noDataText="No users found"
          data={users}
          getRowHref={(user) => user.id}
          count={count}
        >
          <Column<User>
            hasNoLink
            display={{ base: "none", md: "flex" }}
            maxW="30px"
            header={
              <c.Checkbox
                colorScheme="purple"
                zIndex={100}
                isChecked={count > 0 && selectedUsers.length > 0}
                onChange={toggleAll}
                iconColor="white"
                {...(isPartialSelection && { icon: <PartialCheckIcon color="white" /> })}
              />
            }
            row={(user) => (
              <c.Checkbox
                colorScheme="purple"
                isChecked={selectedUsers.includes(user.id)}
                iconColor="white"
                onChange={() => toggleSelected(user.id)}
              />
            )}
          />
          <Column<User>
            sortKey="firstName"
            header="Name"
            row={(user) => user.firstName + " " + user.lastName}
          />
          <Column<User>
            sortKey="email"
            header="Email"
            display={{ base: "none", md: "flex" }}
            row={(user) => user.email}
          />
          <Column<User>
            sortKey="createdAt"
            header="Created"
            row={(user) => dayjs(user.createdAt).format("DD/MM/YYYY")}
          />
        </Table>
      </Tile>
    </c.Stack>
  )
}
