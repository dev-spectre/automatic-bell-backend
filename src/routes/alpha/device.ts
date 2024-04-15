import { Hono } from "hono";
import schema from "../../zod/device";
import {
  createDevice,
  getDevice,
  updateDeviceIp,
  getDeviceById,
  assignDevice,
} from "../../db/device";
import { sign, verify } from "jsonwebtoken";
import { env } from "hono/adapter";

const device = new Hono();

device.use(async (ctx, next) => {
  const { req } = ctx;
  const { JWT_KEY } = env<{ JWT_KEY: string }>(ctx);
  const jwt = req.header("Authorization")?.split(" ")?.at(1) ?? "";
  try {
    verify(jwt, JWT_KEY);
    await next();
  } catch {
    ctx.status(StatusCode.Unauthorized);
    return ctx.json({
      status: StatusCode.Unauthorized,
      success: false,
      msg: "Couldn't verify user",
      err: "Invalid JWT",
    });
  }
});

device.get("/", async (ctx) => {
  const { req } = ctx;
  const data = req.query("id");

  const parsed = schema.deviceId.safeParse(data);
  if (!parsed.success) {
    ctx.status(StatusCode.BadRequest);
    return ctx.json({
      status: StatusCode.BadRequest,
      msg: "Invalid id",
      err: parsed.error,
    });
  }

  const id = parsed.data;
  try {
    const deviceInfo = await getDeviceById(id, ctx);
    return ctx.json({
      status: StatusCode.Ok,
      msg: "Fetched device info",
      success: true,
      data: {
        deviceInfo,
      },
    });
  } catch (err) {
    ctx.status(StatusCode.InternalServerError);
    ctx.json({
      status: StatusCode.InternalServerError,
      success: false,
      msg: "Couldn't fetch device info",
      err: "Internal server error",
    });
  }
});

device.get("/:key", async (ctx) => {
  const { req } = ctx;
  const data = req.param("key");

  const parsed = schema.key.safeParse(data);
  if (!parsed.success) {
    ctx.status(StatusCode.BadRequest);
    return ctx.json({
      status: StatusCode.BadRequest,
      msg: "Invalid key",
      err: parsed.error,
    });
  }

  const key = parsed.data;
  try {
    const deviceInfo = await getDevice(key, ctx);
    return ctx.json({
      status: StatusCode.Ok,
      msg: "Fetched device info",
      success: true,
      data: {
        deviceInfo,
      },
    });
  } catch (err) {
    ctx.status(StatusCode.InternalServerError);
    ctx.json({
      status: StatusCode.InternalServerError,
      success: false,
      msg: "Couldn't fetch device info",
      err: "Internal server error",
    });
  }
});

device.post("/", async (ctx) => {
  const { req } = ctx;
  try {
    var body = await req.json();
  } catch (err) {
    ctx.status(StatusCode.BadRequest);
    return ctx.json({
      status: StatusCode.BadRequest,
      success: false,
      msg: "Failed while parsing request body",
      err: "Invalid JSON",
    });
  }

  const parsed = schema.create.safeParse(body);
  if (!parsed.success) {
    ctx.status(StatusCode.BadRequest);
    return ctx.json({
      status: StatusCode.BadRequest,
      success: false,
      msg: "Error in parsing request body",
      err: parsed.error,
    });
  }

  const deviceInfo: Device = parsed.data;
  try {
    const { id } = await createDevice(deviceInfo, ctx);
    const { JWT_KEY } = env<{ JWT_KEY: string }>(ctx);
    const jwt = sign({ id }, JWT_KEY);
    ctx.status(StatusCode.Ok);
    return ctx.json({
      status: StatusCode.Ok,
      success: true,
      msg: "Device created",
      data: {
        jwt,
        deviceId: id,
      },
    });
  } catch (err) {
    console.error(err);
    ctx.status(StatusCode.InternalServerError);
    return ctx.json({
      status: StatusCode.InternalServerError,
      success: false,
      msg: "Couldn't create device",
      err: "Internal server error",
    });
  }
});

device.put("/", async (ctx) => {
  const { req } = ctx;
  const body = await req.json();

  const parsed = schema.update.safeParse(body);
  if (!parsed.success) {
    ctx.status(400);
    return ctx.json({
      status: 400,
      msg: "Parse error",
      err: parsed.error,
    });
  }

  const { deviceId, key, ip }: { deviceId: number; key: string; ip: string } =
    parsed.data;

  try {
    const deviceInfo = await updateDeviceIp(deviceId, key, ip, ctx);
    return ctx.json({
      status: 200,
      msg: "Fetched device info",
      success: true,
      data: {
        deviceInfo,
      },
    });
  } catch (err) {
    ctx.status(500);
    ctx.json({
      status: 500,
      success: false,
      msg: "Couldn't update device info",
      err: "Internal server error",
    });
  }
});

device.put("/assign", async (ctx) => {
  const { req } = ctx;
  const body = await req.json();

  const parsed = schema.assign.safeParse(body);
  if (!parsed.success) {
    ctx.status(StatusCode.BadRequest);
    return ctx.json({
      status: StatusCode.BadRequest,
      success: false,
      msg: "Couldn't parse input",
      err: "Invalid input format",
    });
  }

  const { deviceId, userId } = parsed.data;
  try {
    const deviceInfo = await assignDevice(deviceId, userId, ctx);
    ctx.status(StatusCode.Ok);
    return ctx.json({
      status: StatusCode.Ok,
      msg: "Assigned device to user",
      success: true,
      data: { ...deviceInfo },
    });
  } catch (err) {
    ctx.status(StatusCode.InternalServerError);
    return ctx.json({
      status: StatusCode.InternalServerError,
      msg: "Couldn't assign device",
      err: "Internal sever error",
      success: false,
    });
  }
});

export default device;
