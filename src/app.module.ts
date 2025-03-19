import { Module } from '@nestjs/common';
import { SyslogService } from './syslog-service.service';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [SyslogService],
})
export class AppModule {}
