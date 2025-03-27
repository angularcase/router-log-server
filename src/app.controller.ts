import { Controller, Get, Logger, Query } from '@nestjs/common';
import { DevicesManagerService } from './devices-manager/devices-manager.service';

export interface GetArchiveDto {
  from: Date;
  to: Date;
}

export interface GetArchiveSummaryDto {
  from: Date;
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
    const from = new Date(query.from);
    const to = new Date(query.to);
    return this.devicesManager.getArchive(from, to);
  }

  @Get('/get-archive-summary')
  getArchiveSummary(@Query() query: GetArchiveSummaryDto) {
    const from = new Date(query.from);
    const to = new Date(query.to);

    return this.devicesManager.getArchiveSummary(from, to);
  }
}
