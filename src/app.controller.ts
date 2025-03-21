import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('live-data')
  getLiveData() {
    return this.appService.getLiveData();
  }

  @Get('get-connected-devices-raw')
  getConnectedDevices() {
    return this.appService.getConnectedDevicesRaw();
  }
}
