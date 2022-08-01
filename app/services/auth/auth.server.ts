import type { Prisma, User } from "@prisma/client"
import { createCookieSessionStorage, redirect } from "@remix-run/node"

import { IS_PRODUCTION } from "~/lib/config"
import { SESSION_SECRET } from "~/lib/config.server"
import { db } from "~/lib/db.server"
import { createToken, decryptToken } from "~/lib/jwt"

import { sendPasswordChangedEmail, sendResetPasswordEmail } from "../user/user.mailer.server"
import { comparePasswords, hashPassword } from "./password.server"

export async function login({ email, password }: { email: string; password: string }) {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return { error: "Incorrect email or password" }
  const isCorrectPassword = await comparePasswords(password, user.password)
  if (!isCorrectPassword) return { error: "Incorrect email or password" }
  return { user }
}

export async function sendResetPasswordLink({ email }: { email: string }) {
  const user = await db.user.findUnique({ where: { email } })
  if (user) {
    const token = createToken({ id: user.id })
    await sendResetPasswordEmail(user, token)
  }
  return true
}

export async function resetPassword({ token, password }: { token: string; password: string }) {
  try {
    const payload = decryptToken<{ id: string }>(token)
    const hashedPassword = await hashPassword(password)
    const user = await db.user.update({ where: { id: payload.id }, data: { password: hashedPassword } })
    await sendPasswordChangedEmail(user)
    return true
  } catch (error) {
    return false
  }
}

export async function register(data: Prisma.UserCreateInput) {
  const email = data.email.toLowerCase().trim()
  const existing = await db.user.findFirst({ where: { email } })
  if (existing) return { error: "User with these details already exists" }
  const password = await hashPassword(data.password)
  const user = await db.user.create({ data: { ...data, password } })
  return { user }
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "boilerplate_session",
    secure: IS_PRODUCTION,
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set("userId", userId)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  })
}

export async function getUserIdFromSession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  if (!userId || typeof userId !== "string") return null
  return userId
}

const getSafeUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      createdAt: true,
      email: true,
      updatedAt: true,
      role: true,
    },
  })
  if (!user) return null
  return user
}

export async function getUser(request: Request) {
  const id = await getUserIdFromSession(request)
  if (!id) return null
  try {
    return await getSafeUser(id)
  } catch {
    return null
  }
}

export type CurrentUser = Omit<User, "password">
export type CurrentUserJson = Omit<User, "password" | "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

export async function getCurrentUser(request: Request) {
  const id = await getUserIdFromSession(request)
  if (!id) throw logout(request)
  try {
    const user = await getSafeUser(id)
    if (!user) throw logout(request)
    return user
  } catch {
    throw logout(request)
  }
}

export async function requireUser(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const id = await getUserIdFromSession(request)
  if (!id) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"))
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  })
}
