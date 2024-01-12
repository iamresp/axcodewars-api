import {
  ParseFilePipeBuilder,
  UnprocessableEntityException,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { Errors } from '@/common';
import { createError } from '@/utils';

export const FILE_MAX_SIZE = 2 ** 20 * 2;
export const UPLOADS_DIR = 'uploads';
export const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
export const ENOENT = 'ENOENT';
export const DISK_STORAGE = diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, join(process.cwd(), UPLOADS_DIR));
  },
  filename: function (_req, file, cb) {
    cb(null, `${uuid()}.${file.originalname.split('.').at(-1)}`);
  },
});
/**
 * Валидация загружаемых изображений.
 */
export const IMAGE_VALIDATOR = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /jpe?g|png|webp/,
  })
  .addMaxSizeValidator({
    maxSize: FILE_MAX_SIZE,
  })
  .build({
    exceptionFactory: (message: string) =>
      new UnprocessableEntityException(
        createError(Errors.UNPROCESSABLE_ENTITY, message),
      ),
    fileIsRequired: false,
  });
