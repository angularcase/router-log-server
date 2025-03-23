import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsusRouterService } from './router/asus-router.service';
import { ConfigModule } from '@nestjs/config';
import { RouterController } from './router/router.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      }
    )
  ],
  controllers: [AppController, RouterController],
  providers: [AppService, AsusRouterService],
})
export class AppModule {}
