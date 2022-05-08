import { IS_PRODUCTION } from "./config"

// Only use on the server

// ENV VARIABLES
export const {
  NODE_ENV = "development",
  APP_ENV = "development",
  APP_SECRET = "APP_SECRET",
  SESSION_SECRET = "SESSION_SECRET",
  FLASH_SESSION_SECRET = "FLASH_SESSION_SECRET",
  SENTRY_DSN = "SENTRY_DSN",
  SENDGRID_API_KEY = "SENDGRID_API_KEY",
  WEB_URL = "localhost:3000",
  REDIS_URL = "",
  AWS_ACCESS_KEY_USER,
  AWS_SECRET_KEY_USER,
} = process.env

// WEB URL
export const FULL_WEB_URL = `${IS_PRODUCTION ? "https://" : "http://"}${WEB_URL}`

export type Flash = "flashError" | "flashInfo" | "flashSuccess"

export const FlashType: { [key in "Error" | "Info" | "Success"]: Flash } = {
  Error: "flashError",
  Info: "flashInfo",
  Success: "flashSuccess",
}
