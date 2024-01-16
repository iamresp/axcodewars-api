import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PatchedRequest } from '@/auth/models';
import { TaskService } from './task.service';
import { createError } from '@/utils';
import { Errors } from '@/common';

@Injectable()
export class AuthorshipGuard implements CanActivate {
  constructor(private taskService: TaskService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PatchedRequest>();
    const taskUuid = request.params.id as string;
    const userUuid = request.user.uuid;

    if (taskUuid && userUuid) {
      const authorship = await this.taskService.findAuthor(taskUuid);

      if (!authorship || authorship.userUuid === userUuid) {
        return true;
      }
    }

    throw new ForbiddenException(
      createError(
        Errors.INSUFFICIENT_RIGHTS,
        `User ${userUuid} does not have a permission to perform requested operation`,
      ),
    );
  }
}
