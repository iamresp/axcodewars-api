import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { unlink } from 'fs/promises';

@Catch(UnprocessableEntityException)
export class UnprocessableEntityExceptionFilter implements ExceptionFilter {
  async catch(exception: UnprocessableEntityException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    /**
     * Так как интерсептор на загрузку файла срабатывает раньше валидации, этот фильтр, отлавливая соотв. ошибку,
     * принудительно удаляет некорректный файл перед тем, как окончательно вернуть ответ клиенту.
     */
    if (request.file) {
      await unlink(request.file.path);
    }

    response.status(status).json(exception.getResponse());
  }
}
