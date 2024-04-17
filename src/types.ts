export interface Device {
  key: string;
  ip: string;
}

export interface User {
  username: string;
  password: string;
}

export interface UserWithId extends User {
  id: number;
}

export enum StatusCode {
  Ok = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ResourceConflict = 409,
  InternalServerError = 500,
}