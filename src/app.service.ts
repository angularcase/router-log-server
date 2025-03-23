import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DevicesManagerService } from './devices-manager/devices-manager.service';
import { AsusRouterService } from './router/asus-router.service';
import { Interval } from '@nestjs/schedule';
import { MessageId, WebsocketGateway } from './websocket/websocket.gateway';

@Injectable()
export class AppService implements OnModuleInit {

  private readonly logger = new Logger(AppService.name);

  @Interval(10000)
  async handleInterval() {
    const somethingChanged = await this.refresh();
    if (somethingChanged) {
      this.broadcastChanges();
    }
  }

  constructor(
    private devicesManager: DevicesManagerService,
    private routerService: AsusRouterService,
    private websocketGateway: WebsocketGateway
  ) {}

  async onModuleInit() {
    this.websocketGateway.setOnGatewayConnectionAction(async () => {
      const devices = await this.devicesManager.getDevices();
      this.websocketGateway.emit(MessageId.ConnectedDevices, devices);
    });
  }

  async broadcastChanges() {
    this.logger.log('broadcastChanges');
    const devices = await this.devicesManager.getDevices();
    this.websocketGateway.emit(MessageId.ConnectedDevices, devices);
  }

  async refresh(): Promise<boolean> {
    const data = await this.routerService.getConnectedMacs();
    const somethingChanged = await this.devicesManager.update(data);

    this.logger.log(`refresh somethingChanged ${somethingChanged}`);

    return somethingChanged;
  }

}