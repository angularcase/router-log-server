import { Injectable } from '@nestjs/common';
import { DeviceRepositoryService } from 'src/device-repository/device-repository.service';

@Injectable()
export class DevicesManagerService {
  private whiteMacs = [
    'b2:4b:4d:84:24:57',
    '70:32:17:91:b2:3e',
    '62:49:ef:39:b3:6d',
    '14:ac:60:df:13:63',
    '8e:3b:ae:57:0c:e4',
    // '50:14:79:39:43:21',
  ];

  constructor(private deviceRepository: DeviceRepositoryService) {}

  async update(allMacs: string[]) {
    let somethingChanged = false;

    for (const whiteMac of this.whiteMacs) {
      const whiteOnline = allMacs.includes(whiteMac);
      const found = await this.deviceRepository.findLast(whiteMac);

      if (!found || found.state !== whiteOnline) {
        somethingChanged = true;
        await this.deviceRepository.save({
          mac: whiteMac,
          state: whiteOnline,
          date: new Date(),
        });
      }
    }

    return somethingChanged;
  }

  async getDevicesState() {
    const reply: Device[] = [];
    for (const whiteMac of this.whiteMacs) {
      const found = await this.deviceRepository.findLast(whiteMac);
      if (found) {
        reply.push(found);
      }
    }

    return reply;
  }

  async getArchiveSummary(from: Date, to: Date): Promise<ArchiveSummaryResult[]> {
    const archive = await this.getArchive(from, to);
  
    const summary: ArchiveSummaryResult[] = archive.map(({ mac, ranges }) => {
      const seconds = ranges.reduce((acc, range) => {
        const duration = (range.to.getTime() - range.from.getTime()) / 1000;
        return acc + duration;
      }, 0);
  
      return { mac, seconds };
    });
  
    return summary;
  }

  async getArchive(from: Date, to: Date): Promise<ArchiveResult[]> {
    const whiteMacs = this.whiteMacs;
    const archiveResults: ArchiveResult[] = [];

    for (let whiteMac of whiteMacs) {
      let archiveResult = await this.getArchiveByMac(whiteMac, from, to);
      archiveResults.push(archiveResult);
    }

    return archiveResults;
  }



  async getArchiveByMac(mac: string, from: Date, to: Date): Promise<ArchiveResult> {
    const result: ArchiveResult = { mac, ranges: [] };
    const now = new Date();

    const lastEventBefore = await this.deviceRepository.findLastEventBefore(mac, from);
    const events = await this.deviceRepository.findEventsBetween(mac, from, to);

    let currentlyActive = false;
    let currentRangeStart: Date | null = null;

    if (lastEventBefore?.state === true) {
      currentlyActive = true;
      currentRangeStart = from;
    }

    for (const event of events) {
      if (event.state === true) {
        if (!currentlyActive) {
          currentlyActive = true;
          currentRangeStart = event.date < from ? from : event.date;
        }
      } else if (event.state === false) {
        if (currentlyActive && currentRangeStart) {
          const end = event.date > to ? to : event.date;
          result.ranges.push({ from: currentRangeStart, to: end });
          currentlyActive = false;
          currentRangeStart = null;
        }
      }
    }

    // Otwarte zdarzenie bez końca — zamykamy sztucznie na min(now, to)
    if (currentlyActive && currentRangeStart) {
      const end = now < to ? now : to;
      result.ranges.push({ from: currentRangeStart, to: end });
    }

    return result;
  }

}

export interface ArchiveSummaryResult {
  mac: string;
  seconds: number;
}

export interface Device {
  mac: string;
  state: boolean;
  date: Date;
}

export interface ArchiveRange {
  from: Date;
  to: Date;
}

export interface ArchiveResult {
  mac: string;
  ranges: ArchiveRange[];
}
