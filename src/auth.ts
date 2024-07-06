import { Context } from "hono";
import crypto from "node:crypto";

export function hashPassword(password: string, ctx: Context, salt?: string): string {
  const NOISE_LENGTH = Number(ctx.env.NOISE_LENGTH);
  const SALT_LENGTH = Number(ctx.env.SALT_LENGTH);
  const PBKDF2_ITERATION = Number(ctx.env.PBKDF2_ITERATION);
  const PBKDF2_LENGTH = Number(ctx.env.PBKDF2_LENGTH);
  const DIGEST = ctx.env.DIGEST;
  if (salt && salt.length !== SALT_LENGTH) return "";
  const randomSalt: string = salt || crypto.randomBytes(NOISE_LENGTH).toString("base64");
  const hashPassword: string = crypto.pbkdf2Sync(password, randomSalt, PBKDF2_ITERATION, PBKDF2_LENGTH, DIGEST).toString("base64");
  const firstHalfOfSalt = randomSalt.slice(0, SALT_LENGTH / 2);
  const secondHalfOfSalt = randomSalt.slice(SALT_LENGTH / 2, SALT_LENGTH);
  return `${secondHalfOfSalt}${hashPassword}${firstHalfOfSalt}`;
}

export function verifyPassword(password: string, hashedPassword: string, ctx: Context): boolean {
  const SALT_LENGTH = ctx.env.SALT_LENGTH;
  const hashedPasswordLength = hashedPassword.length - SALT_LENGTH;
  const salt = `${hashedPassword.slice(hashedPasswordLength + SALT_LENGTH / 2, hashedPassword.length)}${hashedPassword.slice(0, SALT_LENGTH / 2)}`;
  return hashPassword(password, ctx, salt) === hashedPassword;
}
