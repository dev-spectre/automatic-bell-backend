import { Hono } from "hono";
import alpha from "./alpha"

const api = new Hono();

api.route("/v1", alpha);

export default api;