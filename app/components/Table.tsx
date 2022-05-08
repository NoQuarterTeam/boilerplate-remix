import * as React from "react"
import { CgArrowLongDown, CgArrowLongUp } from "react-icons/cg"
import * as c from "@chakra-ui/react"
import { Prisma } from "@prisma/client"
import { Link as RLink, useSearchParams } from "@remix-run/react"

import { NoData } from "./NoData"

interface DataType {
  id: string
}

export type Sort = { orderBy: string; order: Prisma.SortOrder }

interface Props<T extends DataType> {
  children:
    | ArrayLike<React.ReactElement<ColumnProps<T>> | undefined>
    | React.ReactElement<ColumnProps<T>>
    | undefined
  count?: number
  take?: number
  data?: T[]
  getRowHref?: (item: T) => string
  noDataText?: string
}

export function Table<T extends DataType>(props: Props<T>) {
  const borderColor = c.useColorModeValue("gray.200", "gray.700")

  const [params, setParams] = useSearchParams()
  const orderBy = params.get("orderBy") as string | undefined
  const order = params.get("order") as Prisma.SortOrder | undefined

  const handleSort = (order: Sort) => {
    const existingParams = Object.fromEntries(params)
    setParams({ ...existingParams, ...order })
  }

  const maybeColumns: (ColumnProps<T> | undefined)[] = React.Children.map<
    ColumnProps<T>,
    React.ReactElement<ColumnProps<T>>
  >(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.children,
    (child) => child?.props,
  )

  const columns = maybeColumns.filter(Boolean) as ColumnProps<T>[]
  const data = props.data || []

  return (
    <c.Flex flexGrow={1} direction="column" overflow="hidden">
      <c.Flex px={4} py={3}>
        {columns.map(({ sortKey, header, row, hasNoLink, ...column }: ColumnProps<T>, i: number) => (
          <c.Flex
            key={i.toString()}
            flex={1}
            overflow="hidden"
            justifyContent={i === columns.length - 1 ? "flex-end" : "flex-start"}
            align="center"
            {...column}
          >
            {header && row && (
              <c.Button
                as={sortKey ? "button" : "div"}
                display="flex"
                variant="unstyled"
                alignItems="center"
                minW="auto"
                fontSize="sm"
                h="auto"
                fontWeight={700}
                cursor={sortKey ? "pointer" : "default"}
                onClick={() =>
                  sortKey
                    ? handleSort({
                        orderBy: sortKey,
                        order: order === Prisma.SortOrder.desc ? Prisma.SortOrder.asc : Prisma.SortOrder.desc,
                      })
                    : {}
                }
              >
                {header}
                {orderBy && !!sortKey && orderBy === sortKey && (
                  <c.Center ml={2}>
                    {order === Prisma.SortOrder.asc ? (
                      <c.Box as={CgArrowLongUp} size="16px" m="-4px" />
                    ) : order === Prisma.SortOrder.desc ? (
                      <c.Box as={CgArrowLongDown} size="16px" m="-4px" />
                    ) : null}
                  </c.Center>
                )}
              </c.Button>
            )}
          </c.Flex>
        ))}
      </c.Flex>

      {data.length > 0 ? (
        <c.Flex direction="column" justify="space-between" flexGrow={1}>
          {data.map((item) => (
            <Row key={item.id} hasHref={!!props.getRowHref}>
              {columns.map(({ row, sortKey, header, ...column }: ColumnProps<T>, i: number) => (
                <ColumnField
                  key={i.toString()}
                  href={props.getRowHref?.(item)}
                  isLast={i === columns.length - 1}
                  {...column}
                >
                  {row?.(item)}
                </ColumnField>
              ))}
            </Row>
          ))}
          <c.Flex
            py={3}
            px={4}
            align="center"
            justify="space-between"
            borderTop="1px solid"
            borderColor={borderColor}
          >
            <c.Text w="100%" fontSize="sm">
              {props.count} {props.count === 1 ? "item" : "items"}
            </c.Text>

            <Pagination count={props.count} take={props.take} />
          </c.Flex>
        </c.Flex>
      ) : (
        <c.Center p={10}>
          <NoData>{props.noDataText || "No data yet"}</NoData>
        </c.Center>
      )}
    </c.Flex>
  )
}

interface ColumnProps<T> extends c.FlexProps {
  row?: (item: T) => React.ReactNode
  sortKey?: string
  hasNoLink?: boolean
  header?: React.ReactNode
}

export function Column<T extends DataType>(_: ColumnProps<T>) {
  return <></>
}

function _ColumnField<T>({
  isLast,
  hasNoLink,
  href,
  ...props
}: ColumnProps<T> & { href?: string; isLast?: boolean }) {
  const sharedProps: c.FlexProps = {
    flex: 1,
    align: "center",
    h: "50px",
    isTruncated: true,
    fontSize: "sm",
    justify: isLast ? "flex-end" : "flex-start",
    overflowX: "auto",
    ...props,
  }
  return !hasNoLink && !!href ? (
    <c.Flex as={RLink} to={href} _hover={{ textDecor: "none" }} {...sharedProps}>
      {props.children}
    </c.Flex>
  ) : (
    <c.Flex {...sharedProps}>{props.children}</c.Flex>
  )
}

const ColumnField = React.memo(_ColumnField)

interface RowProps {
  children: React.ReactNode
  hasHref?: boolean
}

function Row(props: RowProps) {
  const borderColor = c.useColorModeValue("gray.200", "gray.700")
  const bg = c.useColorModeValue("gray.50", "gray.900")
  return (
    <c.Flex
      w="100%"
      {...(props.hasHref && { cursor: "pointer", _hover: { bg } })}
      px={4}
      align="center"
      borderTop="1px solid"
      borderColor={borderColor}
    >
      {props.children}
    </c.Flex>
  )
}

export interface PaginationProps {
  count?: number
  take?: number
}

export const Pagination: React.FC<PaginationProps> = (props) => {
  const numberOfPages = props.count ? Math.ceil(props.count / (props.take || 5)) : 0
  const [params, setParams] = useSearchParams()
  const currentPage = parseInt(params.get("page") || "1") as number
  const handleSetPage = (page: number) => {
    const existingParams = Object.fromEntries(params)
    setParams({ ...existingParams, page: page.toString() })
  }

  const pageArray = [...Array(numberOfPages)].map((_, i) => i)
  return (
    <c.HStack spacing={1}>
      <c.Button
        borderRadius="md"
        size="sm"
        variant="ghost"
        isDisabled={currentPage <= 1 || props.count === 0}
        onClick={() => handleSetPage(currentPage - 1)}
      >
        Prev
      </c.Button>
      {pageArray
        // .slice(currentPage > 3 ? currentPage - 3 : 0, currentPage > 3 ? currentPage + 2 : props.take || 5)
        .map((page) => (
          <c.Button
            borderRadius="md"
            size="xs"
            key={page}
            variant={currentPage === page + 1 ? "solid" : "ghost"}
            onClick={() => handleSetPage(page + 1)}
          >
            {page + 1}
          </c.Button>
        ))}
      <c.Button
        borderRadius="md"
        size="sm"
        variant="ghost"
        isDisabled={props.count === 0 || (!!props.count && props.count <= currentPage * (props.take || 5))}
        onClick={() => handleSetPage(currentPage + 1)}
      >
        Next
      </c.Button>
    </c.HStack>
  )
}
