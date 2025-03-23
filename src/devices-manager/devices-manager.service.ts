import { Injectable } from '@nestjs/common';
import { ActionsManagerService } from 'src/actions-manager/actions-manager.service';


@Injectable()
export class DevicesManagerService {

    private whiteMacs = [
        'b2:4b:4d:84:24:57',
        '70:32:17:91:b2:3e',
        '62:49:ef:39:b3:6d',
        '14:ac:60:df:13:63',
        '8e:3b:ae:57:0c:e4',
        '50:14:79:39:43:21',
    ];

    private whiteDevices: Device[];

    constructor(
        private actionsManager: ActionsManagerService
    ) {
        this.whiteDevices = this.whiteMacs.map<Device>((mac) => {
            return {
                mac: mac,
                state: false,
                date: ''
            }
        });
    }

    async initialize() {
        for (let whiteDevice of this.whiteDevices) {
            const found = await this.actionsManager.getLast(whiteDevice.mac);
            if (found) {
                whiteDevice = found;
            }
        }
    }

    getDevices() {
        return this.whiteDevices;
    }

    update(connectedMacs: string[]) {
        connectedMacs = connectedMacs.map(mac => mac.toLocaleLowerCase());
    
        this.whiteDevices.forEach(whiteDevice => {
            if (connectedMacs.includes(whiteDevice.mac.toLowerCase())) {
                whiteDevice.state = true;
                this.deviceChangedState(whiteDevice, true);
            } else {
                whiteDevice.state = false;
                this.deviceChangedState(whiteDevice, false);
            }
        });
    }

    private deviceChangedState(device: Device, newState: boolean) {
        device.date = new Date().toISOString();
        this.actionsManager.save(device);
    }

}

export interface Device {
    mac: string;
    state: boolean;
    date: string;
}