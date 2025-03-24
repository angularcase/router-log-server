import { Controller, Get, Logger, Query } from '@nestjs/common';
import { DevicesManagerService } from './devices-manager/devices-manager.service';

@Controller()
export class AppController {

  private readonly logger = new Logger(AppController.name);
  
  constructor(private devicesManager: DevicesManagerService) {}

  @Get('/get-connected-devices')
  getConnectedDevices() {
    return this.devicesManager.getDevices();
  }

  @Get('/get-archive')
  getArchive(@Query() query: Partial<GetArchiveDto>) {
    const { from, to } = query;
  
    const parsedFrom = from ? new Date(from) : undefined;
    const parsedTo = to ? new Date(to) : undefined;

    this.logger.log(parsedFrom);
    this.logger.log(parsedTo);
  
    return this.devicesManager.getArchive(parsedFrom, parsedTo);
  }
}

export interface GetArchiveDto {
  from?: Date;
  to?: Date;
}
