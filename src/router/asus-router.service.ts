import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { RouterService } from './router.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsusRouterService implements RouterService {
  private url: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.get<string>('ROUTER_ADAPTER_URL');
  }

  async getConnectedMacs(): Promise<string[]> {
    const raw = await this.getConnectedMacsRaw();
    const devices: string[] = Object.keys(raw);
    return devices;
  }

  async getConnectedMacsRaw(): Promise<any> {
    const response = await axios.get(`${this.url}/get-connected-devices`);
    return response.data;
  }
}
