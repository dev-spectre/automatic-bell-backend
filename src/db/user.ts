import { Context } from "hono";
import { User } from "../types";
import { createPrismaClienWithContext } from ".";

export async function createUser(data: User, ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  const user = await prisma.user.create({
    select: {
      id: true,
      username: true,
      password: false,
    },
    data: {
      username: data.username,
      password: data.password,
    },
  });

  return user;
}

export async function userDoesExists(username: string, ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  const user = await prisma.user.findFirst({
    select: {
      username: true,
      password: false,
      id: false,
    },
    where: {
      username,
    },
  });

  return user;
}

export async function getUserWithPassword(username: string, ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return user;
}
