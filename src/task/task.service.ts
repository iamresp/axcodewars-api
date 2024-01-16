import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Task, TTaskDocument } from './schemas/task.schema';
import { CreateTasksResponseDto } from './models';
import { TaskUser, TTaskUserDocument } from './schemas/task-user.schema';
import { DeleteResult } from 'mongodb';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name)
    private tasksRepository: Model<TTaskDocument>,
    @InjectModel(TaskUser.name)
    private taskUsersRepository: Model<TTaskUserDocument>,
  ) {}

  /* Database methods */

  async findOne(knownData: Partial<Task>): Promise<TTaskDocument> {
    return await this.tasksRepository.findOne(knownData).exec();
  }

  async findById(id: string): Promise<TTaskDocument> {
    return await this.tasksRepository.findById(id).exec();
  }

  async find(): Promise<TTaskDocument[]> {
    return await this.tasksRepository.find().exec();
  }

  async findByTitle(title: string): Promise<TTaskDocument[]> {
    return await this.tasksRepository.find({ title }).exec();
  }

  async updateOne(id: string, $set: Partial<Task>): Promise<TTaskDocument> {
    return await this.tasksRepository.findByIdAndUpdate(id, { $set }).exec();
  }

  async deleteOne(uuid: string): Promise<DeleteResult> {
    return this.tasksRepository.deleteOne({ uuid }).exec();
  }

  async findAuthor(taskUuid: string): Promise<TTaskUserDocument> {
    return await this.taskUsersRepository.findOne({ taskUuid }).exec();
  }

  /* API methods */

  async createTasks(
    payload: Task[],
    userUuid: string,
  ): Promise<CreateTasksResponseDto> {
    const omitted: Task[] = [];

    for (const task of payload) {
      const foundTask = await this.findOne({ title: task.title });

      if (foundTask) {
        omitted.push(foundTask);
      }
    }

    const inserted = payload
      .filter((task) => !omitted.includes(task))
      .map((task) => {
        const uuid = uuidv4();
        return { ...task, uuid };
      });

    const userAuthorshipPayload: TaskUser[] = inserted.map(({ uuid }) => ({
      taskUuid: uuid,
      userUuid,
    }));

    await this.tasksRepository.insertMany(inserted);
    await this.taskUsersRepository.insertMany(userAuthorshipPayload);

    return {
      inserted,
      omitted,
    };
  }
}
