import { Hono } from "hono";
import api from "./routes";
import { StatusCode } from "./types";

const app = new Hono();

app.route("/api", api);

app.onError((err, ctx) => {
  ctx.status(StatusCode.InternalServerError);
  return ctx.json({
    status: StatusCode.InternalServerError,
    msg: "Unkown error occured",
    err: "Internal server error",
    success: false,
  });
});

app.all("*", (ctx) => {
  ctx.status(StatusCode.NotFound);
  return ctx.json({
    status: StatusCode.NotFound,
    msg: "Unknown endpoint",
  });
});

export default app;
