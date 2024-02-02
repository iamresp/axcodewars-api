import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Jwt, PatchedRequest, SignInPayload } from './models';
import { AuthGuard } from './auth.guard';
import { User, UserService } from '@/user';
import { createError } from '@/utils';
import { Errors } from '@/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async signIn(@Body() payload: SignInPayload): Promise<Jwt> {
    const { hash, username } = payload;
    return this.authService.signIn(username, hash);
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async getUser(@Request() req: PatchedRequest): Promise<Omit<User, 'hash'>> {
    const user = await this.userService.findOne({
      uuid: req.user.uuid,
    });
    if (!user?.id) {
      throw new NotFoundException(
        createError(Errors.USER_NOT_FOUND, 'User not found'),
      );
    }
    const { avatar, uuid, username } = user;
    return { avatar, uuid, username };
  }

  @UseGuards(AuthGuard)
  @Put('user')
  async updateUser(
    @Request() req: PatchedRequest,
    @Body() payload: Partial<Omit<User, 'uuid'>>,
  ): Promise<Omit<User, 'hash'>> {
    const user = await this.userService.findOne({
      uuid: req.user.uuid,
    });

    if (!user?.id) {
      throw new NotFoundException(
        createError(Errors.USER_NOT_FOUND, 'User not found'),
      );
    }

    if ('uuid' in payload) {
      delete payload.uuid;
    }

    return this.userService.findByIdAndUpdate(user.id, payload);
  }
}
