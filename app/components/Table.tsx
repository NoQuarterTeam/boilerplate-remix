import * as React from "react"
import { CgArrowLongDown, CgArrowLongUp } from "react-icons/cg"
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"
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
  count: number
  take: number
  data?: T[]
  defaultOrder?: Sort
  getRowHref?: (item: T) => string
  noDataText?: string
}

export function Table<T extends DataType>(props: Props<T>) {
  const borderColor = c.useColorModeValue("gray.200", "gray.700")

  const [params, setParams] = useSearchParams()
  const orderBy = (params.get("orderBy") as string | undefined) || props.defaultOrder?.orderBy
  const order = (params.get("order") as Prisma.SortOrder | undefined) || props.defaultOrder?.order

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

            <Pagination count={props.count} pageSize={props.take} />
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
    fontSize: "sm",
    justify: isLast ? "flex-end" : "flex-start",
    display: "flex",
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

const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const DOTS = -1
export const usePagination = ({
  count,
  pageSize,
  currentPage,
}: {
  count: number
  pageSize: number
  currentPage: number
}) => {
  const siblingCount = 1

  const paginationRange = React.useMemo(() => {
    const totalPageCount = Math.ceil(count / pageSize)
    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5
    /*
      Case 1:
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
    if (totalPageNumbers >= totalPageCount) return range(1, totalPageCount)
    /*
    	Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
    */
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount)
    /*
      We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
    */
    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2
    const firstPageIndex = 1
    const lastPageIndex = totalPageCount
    /*
    	Case 2: No left dots to show, but rights dots to be shown
    */
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = range(1, leftItemCount)
      return [...leftRange, DOTS, totalPageCount]
    }
    /*
    	Case 3: No right dots to show, but left dots to be shown
    */
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount)
      return [firstPageIndex, DOTS, ...rightRange]
    }
    /*
    	Case 4: Both left and right dots to be shown
    */
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
    }
    return []
  }, [count, pageSize, siblingCount, currentPage])

  return paginationRange
}

interface PaginationProps {
  count: number
  pageSize: number
}

function Pagination(props: PaginationProps) {
  const [params, setParams] = useSearchParams()
  const currentPage = parseInt((params.get("page") || "1") as string)

  const paginationRange = usePagination({ currentPage, ...props })

  if (!currentPage || currentPage === 0 || paginationRange.length < 2) return null

  const onPageChange = (page: number) => {
    const existingParams = Object.fromEntries(params)
    setParams({ ...existingParams, page: page.toString() })
  }

  const onNext = () => onPageChange(currentPage + 1)
  const onPrevious = () => onPageChange(currentPage - 1)
  const lastPage = paginationRange[paginationRange.length - 1]
  return (
    <c.HStack spacing={1}>
      <c.IconButton
        size="xs"
        isDisabled={currentPage === 1}
        onClick={onPrevious}
        icon={<c.Box as={ChevronLeftIcon} />}
        aria-label="previous page"
      />

      {paginationRange.map((pageNumber) => {
        if (pageNumber === DOTS) return <c.Box key={pageNumber}>&#8230;</c.Box>
        return (
          <c.Button
            fontWeight={pageNumber === currentPage ? "bold" : "normal"}
            size="xs"
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </c.Button>
        )
      })}
      <c.IconButton
        isDisabled={currentPage === lastPage}
        size="xs"
        onClick={onNext}
        icon={<c.Box as={ChevronRightIcon} />}
        aria-label="next page"
      />
    </c.HStack>
  )
}
