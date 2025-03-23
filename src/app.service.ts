import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import axios from 'axios';

export enum MacAddress {
  Z = 'b2:4b:4d:84:24:57',
  D = '70:32:17:91:b2:3e',
  T = '62:49:ef:39:b3:6d',
  P = '14:ac:60:df:13:63',
  G = '8e:3b:ae:57:0c:e4',
}

export enum Person {
  Z = 'Z',
  D = 'D',
  T = 'T',
  P = 'P',
  G = 'G',
}

const PERSON_TO_MAC: Record<Person, MacAddress> = {
  [Person.Z]: MacAddress.Z,
  [Person.D]: MacAddress.D,
  [Person.T]: MacAddress.T,
  [Person.P]: MacAddress.P,
  [Person.G]: MacAddress.G,
};

export type LiveData = {
  [key in Person]: {
    state: 'in' | 'out';
    date: string;
  };
};

interface LogEntry {
  person: Person;
  state: 'in' | 'out';
  date: string;
}

@Injectable()
export class AppService implements OnModuleInit {
  private readonly LOG_FILE = path.join(__dirname, '../assets/', 'logs.json');

  private liveData: LiveData = {
    [Person.Z]: { state: 'out', date: new Date().toISOString() },
    [Person.D]: { state: 'out', date: new Date().toISOString() },
    [Person.T]: { state: 'out', date: new Date().toISOString() },
    [Person.P]: { state: 'out', date: new Date().toISOString() },
    [Person.G]: { state: 'out', date: new Date().toISOString() },
  };

  private currentState: Record<Person, boolean> = {
    [Person.Z]: false,
    [Person.D]: false,
    [Person.T]: false,
    [Person.P]: false,
    [Person.G]: false,
  };

  private logs: LogEntry[] = [];

  onModuleInit() {
  }

  private loadLogsFromFile(): void {
    if (fs.existsSync(this.LOG_FILE)) {
      const content = fs.readFileSync(this.LOG_FILE, 'utf-8');
      try {
        this.logs = JSON.parse(content);
      } catch {
        this.logs = [];
      }
    } else {
      this.logs = [];
    }
  }

  private saveLogsToFile(): void {
    fs.writeFileSync(
      this.LOG_FILE,
      JSON.stringify(this.logs, null, 2),
      'utf-8',
    );
  }

  public async getConnectedDevicesRaw(): Promise<any> {
    const response = await axios.get(
      'http://python-backend:3537/get-connected-devices',
    );
    return response.data;
  }

  private async pollRouter(): Promise<void> {
    try {
      const data = await this.getConnectedDevicesRaw();
      const connectedDevices = Object.keys(data.message);

      for (const person of Object.values(Person)) {
        const mac = PERSON_TO_MAC[person];
        const isConnected = connectedDevices.includes(mac);

        if (isConnected !== this.currentState[person]) {
          this.currentState[person] = isConnected;

          const newState = isConnected ? 'in' : 'out';
          const dateStr = new Date().toISOString();

          this.liveData[person] = {
            state: newState,
            date: dateStr,
          };

          this.logs.push({
            person,
            state: newState,
            date: dateStr,
          });

          this.saveLogsToFile();
        }
      }
    } catch (error) {
      console.error('Błąd podczas pobierania danych z routera', error);
    }
  }

  getLiveData(): LiveData {
    return this.liveData;
  }
}
