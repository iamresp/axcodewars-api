import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UserService } from './user.service';
import { CreateUserRequestDto, CreateUserResponseDto } from './models';
import { IMAGE_VALIDATOR, UnprocessableEntityExceptionFilter } from '@/file';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  @UseFilters(new UnprocessableEntityExceptionFilter())
  async createUser(
    @UploadedFile(IMAGE_VALIDATOR)
    file: Express.Multer.File,
    @Body() payload: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const { hash, username } = payload;
    const avatar = file.filename;
    return this.userService.createUser(username, hash, avatar);
  }
}
