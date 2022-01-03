import * as c from "@chakra-ui/react"
import { Prisma } from "@prisma/client"
import dayjs from "dayjs"
import { json, LoaderFunction, useLoaderData } from "remix"

import { LinkButton } from "~/components/LinkButton"
import { Search } from "~/components/Search"
import { Column, Table } from "~/components/Table"
import { Tile } from "~/components/Tile"
import { getTableParams, TableParams } from "~/lib/table"
import { db } from "~/prisma/db"

const getPosts = async ({ search, ...tableParams }: TableParams) => {
  const posts = await db.post.findMany({
    ...tableParams,
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { author: { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { author: { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
          ],
        }
      : undefined,
    select: {
      id: true,
      title: true,
      author: { select: { id: true, avatar: true, firstName: true, lastName: true } },
      createdAt: true,
    },
  })
  const count = await db.post.count()
  return { posts, count }
}

const TAKE = 10

export const loader: LoaderFunction = async ({ request }) => {
  const posts = await getPosts(getTableParams(request, TAKE))
  return json(posts)
}

type LoaderData = Awaited<ReturnType<typeof getPosts>>
type Post = LoaderData["posts"][0]

export default function Posts() {
  const { posts, count } = useLoaderData<LoaderData>()
  return (
    <c.Stack spacing={4}>
      <c.Flex justify="space-between">
        <c.Heading>Posts</c.Heading>
        <LinkButton to="new" colorScheme="purple">
          Create
        </LinkButton>
      </c.Flex>
      <Search placeholder="Search posts" />
      <Tile>
        <Table
          noDataText="No posts found"
          data={posts}
          take={TAKE}
          getRowHref={(post) => post.id}
          count={count}
        >
          <Column<Post> sortKey="title" header="Title" row={(post) => post.title} />
          <Column<Post>
            sortKey="author.firstName"
            display={{ base: "none", md: "flex" }}
            header="Author"
            row={(post) => post.author.firstName + " " + post.author.lastName}
          />
          <Column<Post>
            sortKey="createdAt"
            header="Created"
            row={(post) => dayjs(post.createdAt).format("DD/MM/YYYY")}
          />
        </Table>
      </Tile>
    </c.Stack>
  )
}
