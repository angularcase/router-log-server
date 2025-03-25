import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as crypto from 'crypto';
import { ValidationPipe } from '@nestjs/common';

if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalPipes(new ValidationPipe({
  //   transform: true,
  // }));

  app.enableCors();

  await app.listen(3535);
}
bootstrap();
