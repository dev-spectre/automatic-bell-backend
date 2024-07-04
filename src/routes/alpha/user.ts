import { Hono } from "hono";
import schema from "../../zod/user";
import {
  createUser,
  userDoesExists,
  getUserWithDevice,
  storeUserKey,
  deleteUserKey,
  getUserKey,
} from "../../db/user";
import { hashPassword, verifyPassword } from "../../auth";
import { env } from "hono/adapter";
import { sign, verify } from "hono/jwt";
import { User, StatusCode, UserWithDeviceID } from "../../types";

const user = new Hono();

user.post("/signup", async (ctx) => {
  const { req } = ctx;

  const body = await req.json();
  const parsed = schema.user.safeParse(body);
  if (!parsed.success) {
    ctx.status(StatusCode.BadRequest);
    return ctx.json({
      status: StatusCode.BadRequest,
      success: false,
      msg: "Invalid Input",
      err: parsed.error,
    });
  }

  const data: User = parsed.data;
  data.password = hashPassword(data.password, ctx);

  try {
    const userExists = await userDoesExists(data.username, ctx);
    if (userExists) {
      ctx.status(StatusCode.BadRequest);
      return ctx.json({
        status: StatusCode.BadRequest,
        msg: "User already exists",
        err: "Resource conflict",
      });
    }
  } catch (err) {
    ctx.status(StatusCode.InternalServerError);
    return ctx.json({
      status: StatusCode.InternalServerError,
      msg: "Couldn't check if user exists",
      err: "Internal server error",
    });
  }

  try {
    const user = await createUser(data, ctx);
    ctx.status(StatusCode.Ok);
    return ctx.json({
      status: StatusCode.Ok,
      success: true,
      msg: "User created",
      data: user,
    });
  } catch (err) {
    ctx.status(StatusCode.InternalServerError);
    return ctx.json({
      status: StatusCode.InternalServerError,
      success: false,
      msg: "Couldn't create user",
      err: "Internal server error",
    });
  }
});

user.post("/signin", async (ctx) => {
  const { req } = ctx;

  const body = await req.json();
  const parsed = schema.user.safeParse(body);
  if (!parsed.success) {
    ctx.status(StatusCode.BadRequest);
    return ctx.json({
      status: StatusCode.BadRequest,
      success: false,
      msg: "Invalid Input",
      err: parsed.error,
    });
  }
  const data: User = parsed.data;
  const user: UserWithDeviceID | null = await getUserWithDevice(
    data.username,
    ctx,
  );
  if (!user) {
    ctx.status(StatusCode.NotFound);
    return ctx.json({
      status: StatusCode.NotFound,
      success: false,
      msg: "User doesn't exists",
      err: "User doesn't exists,",
    });
  }
  const passwordVerified = verifyPassword(data.password, user.password, ctx);
  if (!passwordVerified) {
    ctx.status(StatusCode.Unauthorized);
    return ctx.json({
      status: StatusCode.Unauthorized,
      success: false,
      msg: "Incorrect password",
      err: "Invalid password",
    });
  }

  const payload = {
    deviceId: user.device,
    userId: user.id,
    username: user.username,
  };
  const { JWT_KEY } = env<{ JWT_KEY: string }>(ctx);
  const jwt = await sign(payload, JWT_KEY);

  try {
    const userKeyId: number[] = [];
    if (user.device?.length !== 0) {
      for (let i = 0; i < user.device.length; i++) {
        const id = await storeUserKey(jwt, user.device[i].id, user.id, ctx);
        userKeyId.push(id);
      }
    }

    ctx.status(StatusCode.Ok);
    return ctx.json({
      status: StatusCode.Ok,
      success: true,
      msg: "User verfied",
      data: {
        jwt,
        userKeyId,
      },
    });
  } catch (err) {
    console.error(err);
    ctx.status(StatusCode.InternalServerError);
    return ctx.json({
      status: StatusCode.InternalServerError,
      success: false,
      err: "Internal server error",
    });
  }
});

user.use(async (ctx, next) => {
  const { req } = ctx;
  const { JWT_KEY } = env<{ JWT_KEY: string }>(ctx);
  const jwt = req.header("Authorization") ?? "";
  try {
    await verify(jwt, JWT_KEY);
    await next();
  } catch (err) {
    console.error(err);
    ctx.status(StatusCode.Unauthorized);
    return ctx.json({
      status: StatusCode.Unauthorized,
      success: false,
      msg: "Couldn't verify user",
      err: "Invalid JWT",
    });
  }
});

user.delete("/key", async (ctx) => {
  const { req } = ctx;
  const body = await req.json();
  const parsed = schema.userKeys.safeParse(body.userKeyId);
  if (!parsed.success) {
    ctx.status(StatusCode.BadRequest);
    return ctx.json({
      status: StatusCode.BadRequest,
      success: false,
      err: parsed.error,
      msg: "Couldn't parse data",
    });
  }

  const userKeyId = parsed.data;
  try {
    const userKey = await getUserKey(userKeyId, ctx);
    await deleteUserKey(userKeyId, ctx);
    ctx.status(StatusCode.Ok);
    return ctx.json({
      status: StatusCode.Ok,
      success: true,
      data: {
        userKey,
      },
    });
  } catch (err) {
    console.error(err);
    ctx.status(StatusCode.InternalServerError);
    return ctx.json({
      status: StatusCode.InternalServerError,
      success: false,
      err: "Internal server error",
    });
  }
});

export default user;
