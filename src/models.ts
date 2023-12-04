import { Errors } from './common';

export interface ApplicationError {
  code: Errors;
  message: string;
}
