import { Controller, Get } from '@nestjs/common';
import { AsusRouterService } from './router/asus-router.service';

@Controller()
export class AppController {
  constructor(
    private readonly routerService: AsusRouterService
  ) {}

  @Get('/router/get-connected-devices')
  getConnectedDevices() {
    return this.routerService.getConnectedDevices();
  }
}
