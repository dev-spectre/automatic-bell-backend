import { Hono } from "hono";
import schema from "../../zod/device";
import { createDevice, getDevice, updateDeviceIp } from "../../db/device";

const device = new Hono();

device.get("/:key", async (ctx) => {
  const { req } = ctx;
  const key = req.param("key");

  const parsed = schema.key.safeParse(key);
  if (!parsed.success) {
    ctx.status(400);
    ctx.json({
      status: 400,
      msg: "Invalid key",
      err: parsed.error,
    });
  }

  try {
    const deviceInfo = await getDevice(key, ctx);
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
    ctx.status(400);
    return ctx.json({
      status: 400,
      success: false,
      msg: "Failed while parsing request body",
      err: "Invalid JSON",
    });
  }

  const parsed = schema.register.safeParse(body);
  if (!parsed.success) {
    ctx.status(400);
    return ctx.json({
      status: 400,
      success: false,
      msg: "Error in parsing request body",
      err: parsed.error,
    });
  }

  const deviceInfo: Device = parsed.data;
  try {
    const deviceId = await createDevice(deviceInfo, ctx);
    ctx.status(201);
    return ctx.json({
      status: 201,
      success: true,
      msg: "Device created",
      data: { deviceId },
    });
  } catch (err) {
    console.error(err);
    ctx.status(500);
    return ctx.json({
      status: 500,
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

  const {id, key, ip}: {id: number, key: string, ip: string} = parsed.data;

  try {
    const deviceInfo = await updateDeviceIp(id, key, ip, ctx);
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

export default device;
