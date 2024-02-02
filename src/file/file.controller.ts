import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import { Response } from 'express';
import { createError } from '@/utils';
import { Errors } from '@/common';
import { ENOENT, SUPPORTED_EXTENSIONS, UPLOADS_DIR } from './constants';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('images/:filename')
  async getFile(
    @Res({ passthrough: true }) res: Response,
    @Param('filename') filename: string,
  ) {
    const ext = filename.split('.').at(-1);

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        createError(
          Errors.UNSUPPORTED_EXTENSION,
          `Unsupported extension .${ext}`,
        ),
      );
    }

    const filepath = join(process.cwd(), UPLOADS_DIR, filename);

    try {
      await stat(filepath);
      const file = createReadStream(filepath);

      res.set({
        'Content-Type': `image/${ext}`,
      });

      return new StreamableFile(file);
    } catch (err: unknown) {
      if (err instanceof Object && 'code' in err) {
        if (err.code === ENOENT) {
          throw new NotFoundException(
            createError(Errors.FILE_NOT_FOUND, `File ${filename} not found`),
          );
        }
      }

      throw new InternalServerErrorException(
        createError(Errors.UNKNOWN_FILE_ERROR, `Could not load ${filename}`),
      );
    }
  }
}
