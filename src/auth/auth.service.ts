import { User, UserService } from '@/user';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as sha256 from 'sha256';
import { Jwt } from './models';
import { createError } from '@/utils';
import { Errors } from '@/common';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /* API methods */

  async signIn(username: string, hash: string): Promise<Jwt> {
    const user = await this.userService.findOne({ username });
    if (!user) {
      throw new NotFoundException(
        createError(Errors.USER_NOT_FOUND, 'No user with such username found'),
      );
    }
    if (user?.hash !== sha256.x2(hash)) {
      throw new UnauthorizedException(
        createError(Errors.WRONG_PASSWORD, 'Wrong password'),
      );
    }

    const payload: Omit<User, 'hash'> = {
      avatar: user.avatar,
      connId: user.connId,
      username: user.username,
      uuid: user.uuid,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
