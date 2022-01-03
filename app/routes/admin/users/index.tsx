import * as c from "@chakra-ui/react"
import { Prisma } from "@prisma/client"
import dayjs from "dayjs"
import { json, LoaderFunction, useLoaderData } from "remix"

import { Search } from "~/components/Search"
import { Column, Table } from "~/components/Table"
import { Tile } from "~/components/Tile"
import { getTableParams, TableParams } from "~/lib/table"
import { db } from "~/prisma/db"

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
    select: { id: true, firstName: true, lastName: true, createdAt: true },
  })
  const count = await db.user.count()
  return { users, count }
}

const TAKE = 10

export const loader: LoaderFunction = async ({ request }) => {
  const data = await getUsers(getTableParams(request, TAKE, { createdAt: Prisma.SortOrder.desc }))
  return json(data)
}

type LoaderData = Awaited<ReturnType<typeof getUsers>>
type User = LoaderData["users"][0]

export default function AdminIndex() {
  const { users, count } = useLoaderData<LoaderData>()

  return (
    <c.Stack spacing={4}>
      <c.Heading>Users</c.Heading>
      <Search placeholder="Search users" />
      <Tile>
        <Table
          take={TAKE}
          noDataText="No users found"
          data={users}
          getRowHref={(user) => user.id}
          count={count}
        >
          <Column<User>
            sortKey="firstName"
            header="Name"
            row={(user) => user.firstName + " " + user.lastName}
          />
          {/* <Column<User>
            sortKey="email"
            header="Email"
            d={{ base: "none", md: "flex" }}
            row={(user) => user.email}
          /> */}
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
