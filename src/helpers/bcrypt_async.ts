import { promisify } from "util"
import bcrypt from "bcrypt"

export const HASH_ASYNC = promisify(bcrypt.hash).bind(bcrypt)
export const HASH_COMPARE_ASYNC = promisify(bcrypt.compare).bind(bcrypt)
