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

export async function getUserWithDevice(username: string, ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  const user = await prisma.user.findUnique({
    select: {
      username: true,
      password: true,
      id: true,
      device: {
        select: {
          id: true,
        },
      },
    },
    where: {
      username,
    },
  });

  return user;
}

export async function storeUserKey(
  key: string,
  deviceId: number,
  userId: number,
  ctx: Context,
) {
  const prisma = createPrismaClienWithContext(ctx);

  const data = await prisma.userkey.create({
    select: {
      id: true,
    },
    data: {
      userId,
      deviceId,
      key,
    },
  });

  return data.id;
}

export async function deleteUserKey(userKeyId: number[], ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  await prisma.userkey.deleteMany({
    where: {
      id: {
        in: userKeyId,
      },
    },
  });
}

export async function getUserKey(userKeyId: number[], ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  const data = await prisma.userkey.findFirst({
    select: {
      key: true,
    },
    where: {
      id: {
        in: userKeyId,
      },
    },
  });

  return data?.key;
}

export async function resetUserPassword(
  username: string,
  password: string,
  key: string,
  ctx: Context,
) {
  const prisma = createPrismaClienWithContext(ctx);

  const data = await prisma.user.update({
    select: {
      id: true,
      username: true,
      password: true,
    },
    data: {
      password,
    },
    where: {
      username,
      device: {
        some: {
          key,
        },
      },
    },
  });

  return data.password === password;
}