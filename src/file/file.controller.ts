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
import { ENOENT, MIME_TYPE_MAP, UPLOADS_DIR } from './constants';

@Controller('files')
export class FileController {
  constructor() {}

  @Get(':filename')
  async getFile(
    @Res({ passthrough: true }) res: Response,
    @Param('filename') filename: string,
  ) {
    const ext = filename.split('.').at(-1);

    if (!(ext in MIME_TYPE_MAP)) {
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
        'Content-Type': `${MIME_TYPE_MAP[ext]}/${ext}`,
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
