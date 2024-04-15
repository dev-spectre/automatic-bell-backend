import { Hono } from "hono";
import api from "./routes";

const app = new Hono();

app.route("/api", api);

app.all("*", (ctx) => {
  ctx.status(StatusCode.NotFound);
  return ctx.json({
    status: StatusCode.NotFound,
    msg: "Unknown endpoint",
  });
});

export default app;
