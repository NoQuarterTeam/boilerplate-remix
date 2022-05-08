import * as React from "react"
import { CgSoftwareDownload, CgUserAdd } from "react-icons/cg"
import * as c from "@chakra-ui/react"
import { Prisma } from "@prisma/client"
import { json,LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import dayjs from "dayjs"

import { PartialCheckIcon } from "~/components/PartialCheckIcon"
import { Search } from "~/components/Search"
import { Column, Table } from "~/components/Table"
import { Tile } from "~/components/Tile"
import { db } from "~/lib/db.server"
import { AwaitedFunction } from "~/lib/helpers/types"
import { getTableParams, TableParams } from "~/lib/table"

const getUsers = async ({ search, ...tableParams }: TableParams) => {
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
  return { users, count }
}

const TAKE = 10

export const loader: LoaderFunction = async ({ request }) => {
  const data = await getUsers(getTableParams(request, TAKE, { createdAt: Prisma.SortOrder.desc }))
  return json(data)
}

type LoaderData = AwaitedFunction<typeof getUsers>
type User = LoaderData["users"][0]

export default function AdminIndex() {
  const { users, count } = useLoaderData<LoaderData>()
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
            d={{ base: "none", md: "flex" }}
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
