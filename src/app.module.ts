import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsusRouterService } from './router/asus-router.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterController } from './router/router.controller';
import { DevicesManagerService } from './devices-manager/devices-manager.service';
import { ActionsManagerService } from './actions-manager/actions-manager.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceSchema } from './mongoose/device.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { ArchiveService } from './archive/archive.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: 'Device', schema: DeviceSchema }]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, RouterController],
  providers: [
    AppService,
    AsusRouterService,
    DevicesManagerService,
    ActionsManagerService,
    WebsocketGateway,
    ArchiveService,
  ],
})
export class AppModule {}
