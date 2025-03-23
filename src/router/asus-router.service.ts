import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Device, RouterService } from './router.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsusRouterService implements RouterService {

    constructor(
        private readonly configService: ConfigService
    ) {}

    async getConnectedDevices(): Promise<Device[]> {
        const response = await axios.get(
            `${this.configService.get<string>('ROUTER_ADAPTER_URL')}/get-connected-devices`);
          return response.data;
    }

}