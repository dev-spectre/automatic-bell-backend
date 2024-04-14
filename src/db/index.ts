import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";
import { env } from "hono/adapter";

export function createPrismaClienWithContext(ctx: Context) {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(ctx);
  return new PrismaClient({ datasourceUrl: DATABASE_URL }).$extends(
    withAccelerate(),
  );
}
