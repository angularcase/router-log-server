import { Controller, Get } from '@nestjs/common';
import { AsusRouterService } from './asus-router.service';

@Controller('router')
export class RouterController {
  constructor(private readonly routerService: AsusRouterService) {}

  @Get('/get-devices-state')
  getDevicesState() {
    return this.routerService.getConnectedMacsRaw();
  }
}
