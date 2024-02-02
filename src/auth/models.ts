import { User } from '@/user';
import { Request } from 'express';

export interface Jwt {
  access_token: string;
}

export interface SignInPayload {
  hash: string;
  username: string;
}

export interface PatchedRequest extends Request {
  user: Pick<User, 'uuid'>;
}
