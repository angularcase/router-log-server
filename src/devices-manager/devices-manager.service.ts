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

  constructor(private actionsManager: ActionsManagerService) {}

  async update(allMacs: string[]) {
    let somethingChanged = false;

    for (const whiteMac of this.whiteMacs) {
      const whiteOnline = allMacs.includes(whiteMac);
      const found = await this.actionsManager.getLast(whiteMac);

      if (!found || found.state !== whiteOnline) {
        somethingChanged = true;
        await this.actionsManager.save({
          mac: whiteMac,
          state: whiteOnline,
          date: new Date(),
        });
      }
    }

    return somethingChanged;
  }

  async getDevices() {
    const reply: Device[] = [];
    for (const whiteMac of this.whiteMacs) {
      const found = await this.actionsManager.getLast(whiteMac);
      if (found) {
        reply.push(found);
      }
    }

    return reply;
  }

  async getArchive(from?: Date, to?: Date) {
    const archive = await this.actionsManager.getArchive(from, to);
    return archive;
  }
}

export interface Device {
  mac: string;
  state: boolean;
  date: Date;
}
