import { config } from 'dotenv';
import * as appConfig from '@/private/config.json';

config();

export const GLOBAL_PREFIX = 'api';

export const { JWT_SECRET } = appConfig;

export const DATABASE_HOST = process.env.DATABASE_HOST;

export const DATABASE_NAME = process.env.DATABASE_NAME;

export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

export const DATABASE_USER = process.env.DATABASE_USER;

export enum Errors {
  INCORRECT_AUTHORIZATION_HEADER = 1,
  BROKEN_REQUEST,
  WRONG_PASSWORD,
  USER_NOT_FOUND,
  USER_ALREADY_EXISTS,
  TASK_NOT_FOUND,
  TASK_ALREADY_EXISTS,
  CONNECTION_ALREADY_EXISTS,
  INSUFFICIENT_RIGHTS,
  COULD_NOT_DELETE,
  UNSUPPORTED_EXTENSION,
  FILE_NOT_FOUND,
  UNKNOWN_FILE_ERROR,
  UNPROCESSABLE_ENTITY,
}
