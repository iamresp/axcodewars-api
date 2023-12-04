import { Task } from './schemas/task.schema';

export interface CreateTasksResponseDto {
  inserted: Task[];
  omitted: Task[];
}
