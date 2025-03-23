import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsusRouterService } from './router/asus-router.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        // Ten wariant ładuje pliki w kolejności:
        // 1. .env.development (jeśli NODE_ENV=development)
        // 2. .env
        envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],  
      }
    )
  ],
  controllers: [AppController],
  providers: [AppService, AsusRouterService],
})
export class AppModule {}
