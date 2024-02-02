import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, PatchedRequest } from '@/auth';
import { Errors } from '@/common';
import { createError } from '@/utils';
import { TaskService } from './task.service';
import { Task } from './schemas/task.schema';
import { CreateTasksResponseDto } from './models';
import { AuthorshipGuard } from './authorship.guard';

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
        createError(Errors.TASK_NOT_FOUND, `Task with uuid ${uuid} not found`),
      );
    }

    return task;
  }

  @UseGuards(AuthGuard, AuthorshipGuard)
  @Put('/:id')
  async updateTask(
    @Param('id') uuid: string,
    @Body() payload: Partial<Omit<Task, 'uuid'>>,
  ): Promise<Task> {
    const task = await this.taskService.findOne({ uuid });
    const tasks = await this.taskService.findByTitle(payload.title);

    if (!task) {
      throw new NotFoundException(
        createError(Errors.TASK_NOT_FOUND, `Task with uuid ${uuid} not found`),
      );
    }

    if (tasks?.filter((task) => task.uuid !== uuid).length) {
      throw new BadRequestException(
        createError(Errors.TASK_ALREADY_EXISTS, 'Task title must be unique'),
      );
    }

    return this.taskService.updateOne(uuid, payload);
  }

  @UseGuards(AuthGuard, AuthorshipGuard)
  @Delete('/:id')
  async deleteTask(@Param('id') uuid: string): Promise<boolean> {
    const result = await this.taskService.deleteOne(uuid);

    if (result.acknowledged && Boolean(result.deletedCount)) {
      return true;
    }

    throw new NotFoundException(
      createError(Errors.COULD_NOT_DELETE, `Task with uuid ${uuid} not found`),
    );
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
