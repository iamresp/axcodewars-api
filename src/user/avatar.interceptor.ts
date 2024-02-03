import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { User } from './schemas/user.schema';
import { Request } from 'express';
import { GLOBAL_PREFIX } from '@/common';

@Injectable()
export class AvatarInterceptor implements NestInterceptor {
  /**
   * Изменяет значение поля `avatar` в ответе, заменяя имя файла на ссылку.
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Pick<User, 'avatar'>>> {
    const request = context.switchToHttp().getRequest<Request>();
    const host = request.get('Host');
    const baseUrl = `${request.protocol}://${host}/${GLOBAL_PREFIX}`;

    return next.handle().pipe(
      map((data: Pick<User, 'avatar'>) => {
        if (data.avatar) {
          data.avatar = `${baseUrl}/files/${data.avatar}`;
        }

        return data;
      }),
    );
  }
}
