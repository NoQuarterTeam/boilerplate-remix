import { User } from "@prisma/client"

import { FULL_WEB_URL } from "~/lib/config.server"
import { mailer } from "~/lib/mailer.server"

export async function sendResetPasswordEmail(user: User, token: string) {
  try {
    if (!user.email) return
    await mailer.send({
      templateId: "d-efeeebd841dd48768ab7f4ac9907d2f1",
      to: user.email,
      variables: {
        link: `${FULL_WEB_URL}/reset-password/${token}`,
      },
    })
  } catch (error) {
    console.log(error)
  }
}

export async function sendPasswordChangedEmail(user: User) {
  try {
    if (!user.email) return
    await mailer.send({
      templateId: "d-c33ce68972604e0d9ca5e7732c771926",
      to: user.email,
    })
  } catch (error) {
    console.log(error)
  }
}
