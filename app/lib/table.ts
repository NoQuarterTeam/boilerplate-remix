import { Prisma } from "@prisma/client"

export function getOrderByParams(request: Request) {
  const url = new URL(request.url)
  const orderBy = url.searchParams.get("orderBy") || undefined
  const order = url.searchParams.get("order") || undefined
  return orderBy && order ? { [orderBy]: order } : undefined
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
  orderBy?: Prisma.Enumerable<any>
}

export function getTableParams(request: Request, take?: number) {
  const pagination = getPaginationParams(request, take)
  const orderBy = getOrderByParams(request)
  const search = getSearchParams(request)
  return { ...pagination, search, orderBy }
}
