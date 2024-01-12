import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Request,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Errors } from '@/common';
import {
  IMAGE_VALIDATOR,
  UPLOADS_DIR,
  UnprocessableEntityExceptionFilter,
} from '@/file';
import { AvatarInterceptor, User, UserService } from '@/user';
import { createError } from '@/utils';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Jwt, PatchedRequest, SignInPayload } from './models';

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
  @UseInterceptors(AvatarInterceptor)
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
  @UseInterceptors(FileInterceptor('avatar'), AvatarInterceptor)
  @UseFilters(new UnprocessableEntityExceptionFilter())
  async updateUser(
    @Request() req: PatchedRequest,
    @Body() payload: Partial<Omit<User, 'uuid'>>,
    @UploadedFile(IMAGE_VALIDATOR) file?: Express.Multer.File,
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

    if (file) {
      if (user.avatar) {
        await unlink(join(UPLOADS_DIR, user.avatar));
      }

      payload.avatar = file.filename;
    } else {
      delete payload.avatar;
    }

    return this.userService.findByIdAndUpdate(user.id, payload);
  }
}
