import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { User } from './schemas/user.schema';
import { PUBLIC_URL } from '@/common';

@Injectable()
export class AvatarInterceptor implements NestInterceptor {
  /**
   * Изменяет значение поля `avatar` в ответе, заменяя имя файла на ссылку.
   */
  async intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Pick<User, 'avatar'>>> {
    return next.handle().pipe(
      map((data: Pick<User, 'avatar'>) => {
        if (data.avatar) {
          data.avatar = `${PUBLIC_URL}/files/images/${data.avatar}`;
        }

        return data;
      }),
    );
  }
}
