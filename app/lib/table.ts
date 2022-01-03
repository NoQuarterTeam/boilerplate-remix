import { Prisma } from "@prisma/client"

export function getOrderByParams(request: Request, defaultOrder?: { [key: string]: Prisma.SortOrder }) {
  const url = new URL(request.url)
  const orderBy = url.searchParams.get("orderBy") || undefined
  const order = url.searchParams.get("order") || undefined
  if (!orderBy || !order) return defaultOrder
  return getOrderBy(orderBy, order)
}

// Sometimes we have table thats using nested data, and so the sortKey needs to be nested
// e.g { user: { createdAt: "desc" } }, instead of just { createdAt: "desc" }
// so this function allows us to pass "user.createdAt" as the sortKey
// and it converts it to the nested structure, pretty sweet right?

export function getOrderBy(orderBy: string, order: string) {
  let object = {} as any
  const result = object
  const arr = orderBy.split(".")
  for (let i = 0; i < arr.length - 1; i++) {
    object = object[arr[i]] = {}
  }
  object[arr[arr.length - 1]] = order
  return result
}

export function getPaginationParams(request: Request, take?: number) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get("page") || "") || 1
  const customTake = take || 5
  const skip = (page - 1) * customTake
  return { skip, take }
}
export function getSearchParams(request: Request) {
  const url = new URL(request.url)
  const search = url.searchParams.get("search") || undefined
  return search
}

export type TableParams = {
  skip?: number
  take?: number
  search?: string
  orderBy?: { [key: string]: Prisma.SortOrder }
}

export function getTableParams(
  request: Request,
  take?: number,
  defaultOrder?: { [key: string]: Prisma.SortOrder },
) {
  const pagination = getPaginationParams(request, take)
  const orderBy = getOrderByParams(request, defaultOrder)
  const search = getSearchParams(request)
  return { ...pagination, search, orderBy }
}
