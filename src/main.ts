import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { AppModule } from './app';
import * as bodyParser from 'body-parser';
import { GLOBAL_PREFIX } from './common';
import { UPLOADS_DIR } from './file';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  app.use(bodyParser.json());
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useWebSocketAdapter(new WsAdapter(app));

  if (!existsSync(join(process.cwd(), UPLOADS_DIR))) {
    await mkdir(join(process.cwd(), UPLOADS_DIR));
  }

  await app.listen(process.env.APP_PORT);
}

bootstrap();
