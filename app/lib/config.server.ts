import sendgridClient from "@sendgrid/client"
import sendgrid from "@sendgrid/mail"
import aws, { S3 } from "aws-sdk/clients/all"

import { IS_PRODUCTION } from "./config"
import { Mailer } from "./mailer"
// Only use on the server

// ENV VARIABLES
export const {
  NODE_ENV = "development",
  APP_ENV = "development",
  APP_SECRET = "APP_SECRET",
  SESSION_SECRET = "SESSION_SECRET",
  SENDGRID_API_KEY = "SENDGRID_API_KEY",
  WEB_URL = "localhost:3000",
  REDIS_URL = "",
  AWS_ACCESS_KEY_ID_BOILERPLATE,
  AWS_SECRET_ACCESS_KEY_BOILERPLATE,
} = process.env

// WEB URL
export const FULL_WEB_URL = `${IS_PRODUCTION ? "https://" : "http://"}${WEB_URL}`

// S3
const S3_CONFIG: aws.S3.ClientConfiguration = {
  signatureVersion: "v4",
  region: "eu-central-1",
  credentials:
    AWS_ACCESS_KEY_ID_BOILERPLATE && AWS_SECRET_ACCESS_KEY_BOILERPLATE
      ? {
          accessKeyId: AWS_ACCESS_KEY_ID_BOILERPLATE,
          secretAccessKey: AWS_SECRET_ACCESS_KEY_BOILERPLATE,
        }
      : undefined,
}

// AWS
export const s3 = new S3(S3_CONFIG)

// MAILER
export const mailer = new Mailer()
sendgrid.setApiKey(SENDGRID_API_KEY)
sendgridClient.setApiKey(SENDGRID_API_KEY)
