import zod from "zod";

export const key = zod.string().min(12);

export const ip = zod.string().ip();

export const deviceId = zod.number();

export const create = zod.object({ ip, key });

export const update = zod.object({
  deviceId,
  key,
  ip,
});

export const assign = zod.object({
  deviceId,
  userId: zod.number(),
});

const schema = {
  key,
  deviceId,
  ip,
  assign,
  create,
  update,
};

export default schema;
