import { json } from "@remix-run/node"

export const badRequest = (data: any) => json(data, { status: 400 })
export const notFound = (data: any) => json(data, { status: 404 })
