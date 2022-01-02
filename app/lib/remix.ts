import { json } from "remix"

export const badRequest = (data: any) => json(data, { status: 400 })
