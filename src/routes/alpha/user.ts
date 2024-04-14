import { Hono } from "hono";
import schema from "../../zod/user";
import { createUser, userDoesExists } from "../../db/user";
import { hashPassword, verifyPassword } from "../../auth";

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

export default user;
