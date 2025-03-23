import { Injectable, OnModuleInit } from '@nestjs/common';
import { DevicesManagerService } from './devices-manager/devices-manager.service';
import { AsusRouterService } from './router/asus-router.service';

@Injectable()
export class AppService implements OnModuleInit {

  constructor(
    private devicesManager: DevicesManagerService,
    private routerService: AsusRouterService
  ) {}

  async onModuleInit() {
    await this.devicesManager.initialize();
    const data = await this.routerService.getConnectedMacs();
    this.devicesManager.update(data);
  }

}