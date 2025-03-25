import { Controller, Get, Logger, Query } from '@nestjs/common';
import { DevicesManagerService } from './devices-manager/devices-manager.service';
import { isDate } from 'util/types';
import { IsDate } from 'class-validator';

export interface GetArchiveDto {
  // @IsDate()
  from: Date;

  // @IsDate()
  to: Date;
}

export interface GetArchiveSummaryDto {
  // @IsDate()
  from: Date;

  // @IsDate()
  to: Date;
}

@Controller()
export class AppController {

  private readonly logger = new Logger(AppController.name);
  
  constructor(private devicesManager: DevicesManagerService) {}

  @Get('/get-devices-state')
  getDevicesState() {
    return this.devicesManager.getDevicesState();
  }

  @Get('/get-archive')
  getArchive(@Query() query: GetArchiveDto) {
    return this.devicesManager.getArchive(query.from, query.to);
  }

  @Get('/get-archive-summary')
  getArchiveSummary(@Query() query: GetArchiveSummaryDto) {
    const from = new Date(query.from);
    const to = new Date(query.to);

    return this.devicesManager.getArchiveSummary(from, to);
  }
}
