import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Device } from 'src/devices-manager/devices-manager.service';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket'],
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  onGatewayConnectionAction: () => Promise<any> | undefined;

  @WebSocketServer()
  server: Server;

  emit(messageId: MessageId, data: any) {
    this.server.emit(messageId, data);
  }

  handleDisconnect(client: any) {
    this.emit(MessageId.NumberOfClients, this.getNumberOfClients());
  }

  async handleConnection(client: any, ...args: any[]) {
    this.emit(MessageId.NumberOfClients, this.getNumberOfClients());
    if (this.onGatewayConnectionAction) {
      const devices = await this.onGatewayConnectionAction();
      this.emit(MessageId.ConnectedDevices, devices);
    }
  }

  setOnGatewayConnectionAction(callback: () => Promise<any>) {
    this.onGatewayConnectionAction = callback;
  }

  private getNumberOfClients() {
    return this.server.sockets.sockets.size;
  }
}

export enum MessageId {
  ConnectedDevices = 'connected-devices',
  NumberOfClients = 'number-of-clients',
}
