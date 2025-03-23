import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DevicesManagerService } from './devices-manager/devices-manager.service';
import { AsusRouterService } from './router/asus-router.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class AppService implements OnModuleInit {

  private readonly logger = new Logger(AppService.name);

  @Interval(10000)
  async handleInterval() {
    this.refresh();
  }

  constructor(
    private devicesManager: DevicesManagerService,
    private routerService: AsusRouterService
  ) {}

  async onModuleInit() {
    await this.refresh();
  }

  async refresh() {
    this.logger.log('refresh');
    const data = await this.routerService.getConnectedMacs();
    this.devicesManager.update(data);
  }

}