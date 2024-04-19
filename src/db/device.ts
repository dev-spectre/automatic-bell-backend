import { createPrismaClienWithContext } from ".";
import { Context } from "hono";
import { Device } from "../types";

export async function createDevice(deviceInfo: Device, ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  const deviceId = await prisma.device.create({
    select: {
      id: true,
    },
    data: deviceInfo,
  });

  return deviceId;
}

export async function getDeviceById(id: number, ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  const device = await prisma.device.findUnique({
    select: {
      id: true,
      userId: true,
      key: false,
      ip: true,
    },
    where: {
      id,
    },
  });

  return device;
}

export async function getDevice(key: string, ctx: Context) {
  const prisma = createPrismaClienWithContext(ctx);

  const device = await prisma.device.findMany({
    select: {
      id: true,
      ip: true,
    },
    where: {
      key,
    },
  });

  return device;
}

export async function updateDeviceIp(
  id: number,
  key: string,
  ip: string,
  ctx: Context,
) {
  const prisma = createPrismaClienWithContext(ctx);

  const device = await prisma.device.update({
    where: { id, key },
    data: { ip },
    select: {
      id: true,
      ip: true,
    },
  });

  return device;
}

export async function assignDeviceIfNotAssigned(
  deviceId: number,
  userId: number,
  ctx: Context,
) {
  const prisma = createPrismaClienWithContext(ctx);

  const info = await prisma.device.findUnique({
    select: {
      userId: true,
    },
    where: {
      id: deviceId,
    },
  });

  if (info?.userId) return null;

  const device = await prisma.device.update({
    select: {
      id: true,
      key: false,
      ip: true,
      userId: true,
    },
    data: {
      userId,
    },
    where: {
      id: deviceId,
    },
  });

  return device;
}
