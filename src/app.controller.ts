import { Controller, Get } from '@nestjs/common';
import { DevicesManagerService } from './devices-manager/devices-manager.service';

@Controller()
export class AppController {
  constructor(private devicesManager: DevicesManagerService) {}

  @Get('/get-connected-devices')
  getConnectedDevices() {
    return this.devicesManager.getDevices();
  }

  @Get('/get-archive')
  getArchive() {
    return this.devicesManager.getArchive();
  }
}
