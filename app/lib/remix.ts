import { json } from "@remix-run/node"

export const badRequest = (data: any) => json(data, { status: 400 })
