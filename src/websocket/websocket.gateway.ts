import {
  OnGatewayConnection,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
import { Device } from 'src/devices-manager/devices-manager.service';
  
  @WebSocketGateway({
    cors: { origin: '*' }
  })
  export class WebsocketGateway implements OnGatewayConnection {

    onClientConnected: () => Promise<any> | undefined;

    @WebSocketServer()
    server: Server;
  
    emit(devices: Device[]) {
      this.server.emit(MessageId.ConnectedDevices, devices);
    }

    handleConnection(client: any, ...args: any[]) {
      if (this.onClientConnected) {
        this.onClientConnected();
      }
    }

    initialize(callback: () => Promise<any>) {
      this.onClientConnected = callback;
    }
  }

export enum MessageId {
  ConnectedDevices = 'connected-devices'
}
  