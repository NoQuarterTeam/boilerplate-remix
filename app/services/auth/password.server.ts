import bcrypt from "bcrypt"

export const comparePasswords = (password: string, hash: string) => bcrypt.compare(password, hash)
export const hashPassword = (password: string) => bcrypt.hash(password, 10)
