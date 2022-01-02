import jwt from "jsonwebtoken"
import { APP_SECRET } from "./config.server"

type Payload = Record<string, any>

export const createToken = (payload: Payload, options?: jwt.SignOptions): string => {
  try {
    const token = jwt.sign(payload, APP_SECRET, {
      issuer: "@boilerplate/api",
      audience: ["@boilerplate/app", "@boilerplate/web"],
      expiresIn: "4w",
      ...options,
    })
    return token
  } catch (error) {
    // Oops
    throw error
  }
}

export function decryptToken<T>(token: string): T {
  try {
    jwt.verify(token, APP_SECRET)
    const payload = jwt.decode(token)
    return payload as T
  } catch (error) {
    // Oops
    throw error
  }
}
