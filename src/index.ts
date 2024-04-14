import { Hono } from "hono";
import api from "./routes";

const app = new Hono();

app.route("/api", api);

app.all("*", (ctx) => {
  ctx.status(404);
  return ctx.json({
    status: 404,
    msg: "Unknown endpoint",
  });
});

export default app;
