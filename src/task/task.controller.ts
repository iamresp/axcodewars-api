import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { AuthGuard } from '@/auth';
import { Task } from './schemas/task.schema';
import { CreateTasksResponseDto } from './models';
import { createError } from '@/utils';
import { Errors } from '@/common';
import { PatchedRequest } from '@/auth/models';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTasks(): Promise<Task[]> {
    return this.taskService.find();
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getTask(@Param('id') uuid: string): Promise<Task> {
    const task = this.taskService.findOne({ uuid });

    if (!task) {
      throw new NotFoundException(
        createError(
          Errors.TASK_ALREADY_EXISTS,
          `Task with uuid ${uuid} not found`,
        ),
      );
    }

    return task;
  }

  @UseGuards(AuthGuard)
  @Post()
  async createTask(
    @Request() req: PatchedRequest,
    @Body() payload: Task | Task[],
  ): Promise<CreateTasksResponseDto> {
    return this.taskService.createTasks([payload].flat(), req.user.uuid);
  }
}
