interface Device {
  key: string;
  ip: string;
}

interface User {
  username: string;
  password: string;
}

enum StatusCode {
  Ok = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  ResourceConflict = 409,
  InternalServerError = 500,
}