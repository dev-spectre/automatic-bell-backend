import { Hono } from "hono";
import user from "./user";
import device from "./device";

const alpha = new Hono()

alpha.route("/device", device);
alpha.route("/user", user)

export default alpha;