import { createPrismaClienWithContext } from ".";
import { Context } from "hono";

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
    where: { id },
    data: { ip },
    select: {
      id: true,
      ip: true,
    },
  });

  return device;
}
