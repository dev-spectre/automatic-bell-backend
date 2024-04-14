import zod from "zod";

export const key = zod.string().min(12);

export const ip = zod.string().ip();

export const register = zod.object({ ip, key });

export const update = zod.object({
  id: zod.number(),
  key: key,
  ip: ip,
});

const schema = {
  key,
  ip,
  register,
  update,
};

export default schema;
