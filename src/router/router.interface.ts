export interface RouterService {
    getConnectedDevices(): Promise<Device[]>;
}

export interface Device {
    mac: string;
}

