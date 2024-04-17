import { Hono } from "hono";
import schema from "../../zod/user";
import { createUser, userDoesExists, getUserWithPassword } from "../../db/user";
import { hashPassword, verifyPassword } from "../../auth";
import { env } from "hono/adapter";
import { sign } from "hono/jwt";
import { User, UserWithId, StatusCode } from "../../types"

const user = new Hono();

user.post("/signup", async (ctx) => {
  const { req } = ctx;

  const body = await req.json();
  const parsed = schema.user.safeParse(body);
  if (!parsed.success) {
    ctx.status(400);
    return ctx.json({
      status: 400,
      success: false,
      msg: "Invalid Input",
      err: parsed.error,
    });
  }

  const data: User = parsed.data;
  data.password = hashPassword(data.password);

  try {
    const userExists = await userDoesExists(data.username, ctx);
    if (userExists) {
      ctx.status(409);
      return ctx.json({
        status: 409,
        msg: "User already exists",
        err: "Resource conflict",
      });
    }
  } catch (err) {
    ctx.status(500);
    return ctx.json({
      status: 500,
      msg: "Couldn't check if user exists",
      err: "Internal server error",
    });
  }

  try {
    const user = await createUser(data, ctx);
    ctx.status(201);
    return ctx.json({
      status: 201,
      success: true,
      msg: "User created",
      data: user,
    });
  } catch (err) {
    ctx.status(500);
    return ctx.json({
      status: 500,
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
    ctx.status(400);
    return ctx.json({
      status: 400,
      success: false,
      msg: "Invalid Input",
      err: parsed.error,
    });
  }

  const data: User = parsed.data;
  const user: UserWithId | null = await getUserWithPassword(data.username, ctx);
  if (!user) {
    ctx.status(StatusCode.NotFound);
    return ctx.json({
      status: StatusCode.NotFound,
      success: false,
      msg: "User doesn't exists",
      err: "User doesn't exists,",
    });
  }

  const passwordVerified = verifyPassword(data.password, user.password);
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
    userId: user.id,
    username: user.username,
  };
  const { JWT_KEY } = env<{ JWT_KEY: string }>(ctx);
  const jwt = await sign(payload, JWT_KEY);

  ctx.status(StatusCode.Ok);
  ctx.json({
    status: StatusCode.Ok,
    success: true,
    msg: "User verfied",
    data: {
      jwt,
    },
  });
});

export default user;
