interface Device {
  key: string;
  ip: string;
}

interface User {
  username: string;
  password: string;
}

interface UserWithId extends User {
  id: number;
}

enum StatusCode {
  Ok = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ResourceConflict = 409,
  InternalServerError = 500,
}