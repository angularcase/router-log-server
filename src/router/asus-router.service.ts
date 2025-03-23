import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Device, RouterService } from './router.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsusRouterService implements RouterService {

    private url: string | undefined;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.url = this.configService.get<string>('ROUTER_ADAPTER_URL');
    }

    async getConnectedDevices(): Promise<Device[]> {
        console.log(this.url);

        const response = await axios.get(
            `${this.url}/get-connected-devices`);
          return response.data;
    }

}