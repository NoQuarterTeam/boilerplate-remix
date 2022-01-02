import sendgridClient from "@sendgrid/client"
import sendgrid from "@sendgrid/mail"

import { S3 } from "aws-sdk/clients/all"
import { Mailer } from "./mailer"
// Only use on the server

// ENV VARIABLES
export const {
  NODE_ENV = "development",
  APP_ENV = "development",
  APP_SECRET = "APP_SECRET",
  SESSION_SECRET = "SESSION_SECRET",
  SENTRY_DSN = "SENTRY_DSN",
  SENDGRID_API_KEY = "SENDGRID_API_KEY",
  WEB_URL = "localhost:3000",
  REDIS_URL = "",
} = process.env

// IS PRODUCTION
export const IS_PRODUCTION = APP_ENV === "production"

// WEB URL
export const FULL_WEB_URL = `${IS_PRODUCTION ? "https://" : "http://"}${WEB_URL}`

// S3
const S3_CONFIG = {
  signatureVersion: "v4",
  region: "eu-central-1",
}

// AWS
export const s3 = new S3(S3_CONFIG)

// MAILER
export const mailer = new Mailer()
sendgrid.setApiKey(SENDGRID_API_KEY)
sendgridClient.setApiKey(SENDGRID_API_KEY)
