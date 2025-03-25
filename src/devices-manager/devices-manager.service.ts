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
    '50:14:79:39:43:21',
  ];

  constructor(private deviceRepository: DeviceRepositoryService) {}

  async update(allMacs: string[]) {
    let somethingChanged = false;

    for (const whiteMac of this.whiteMacs) {
      const whiteOnline = allMacs.includes(whiteMac);
      const found = await this.deviceRepository.getLast(whiteMac);

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
      const found = await this.deviceRepository.getLast(whiteMac);
      if (found) {
        reply.push(found);
      }
    }

    return reply;
  }

  async getArchive(from?: Date, to?: Date) {
    const archive = await this.deviceRepository.getArchive(from, to);
    return archive;
  }

  /**
   * Metoda getArchive zwraca dla zadanych maców oraz przedziału czasu [from, to]
   * listę przedziałów aktywności (ranges), przy czym:
   *  - Jeśli aktywacja miała miejsce przed "from", zakres zaczyna się od "from".
   *  - Jeśli dezaktywacja nastąpiła po "to", zakres kończy się na "to".
   *  - Jeśli urządzenie było aktywne przez cały okres [from, to],
   *    zwracany jest przedział [from, to].
   */
  async getArchiveNew(
    from: Date,
    to: Date,
    macs: string[],
  ): Promise<ArchiveResult[]> {
    // Pobieramy eventy z bazy w przedziale [from, to]
    const events: Device[] = await this.deviceRepository.find({
      mac: { $in: macs },
      date: { $gte: from, $lte: to },
    });

    // Dla każdego mac pobieramy ostatni event sprzed "from", by ustalić stan początkowy
    const initialEvents: { [mac: string]: Device | null } = {};
    for (const mac of macs) {
      initialEvents[mac] = await this.deviceRepository.findOne(
        { mac, date: { $lt: from } },
        { sort: { date: -1 } },
      );
    }

    // Grupujemy eventy według adresu mac
    const groupedEvents: { [mac: string]: Device[] } = {};
    for (const event of events) {
      if (!groupedEvents[event.mac]) {
        groupedEvents[event.mac] = [];
      }
      groupedEvents[event.mac].push(event);
    }
    // Sortujemy eventy dla każdego mac chronologicznie
    for (const mac in groupedEvents) {
      groupedEvents[mac].sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    const results: ArchiveResult[] = [];

    // Przetwarzamy każdy mac z listy
    for (const mac of macs) {
      const macEvents = groupedEvents[mac] || [];
      const ranges: ArchiveRange[] = [];
      let currentRange: ArchiveRange | null = null;

      // Jeśli ostatni event przed "from" wskazuje, że urządzenie było aktywne,
      // rozpoczynamy zakres aktywności już od "from".
      const initialEvent = initialEvents[mac];
      if (initialEvent && initialEvent.state === true) {
        currentRange = { from: from, to: to };
      }

      // Iterujemy po eventach z przedziału [from, to]
      for (const event of macEvents) {
        if (event.state === true) {
          // Aktywacja – jeśli nie mamy otwartego zakresu, zaczynamy nowy
          if (!currentRange) {
            // Jeśli event nastąpił przed "from" (teoretycznie może być równo "from"),
            // startujemy zakres od "from"
            const start = event.date < from ? from : event.date;
            currentRange = { from: start, to: to };
          }
          // Jeśli mamy już otwarty zakres, dodatkowy true ignorujemy
        } else {
          // Dezaktywacja – jeśli zakres jest otwarty, kończymy go
          if (currentRange) {
            // Jeśli event nastąpił po "to", kończymy zakres na "to"
            currentRange.to = event.date > to ? to : event.date;
            ranges.push(currentRange);
            currentRange = null;
          }
          // Jeśli nie było aktywacji, false event można pominąć
        }
      }
      // Jeśli zakres pozostał otwarty do końca przedziału, domykamy go na "to"
      if (currentRange) {
        currentRange.to = to;
        ranges.push(currentRange);
      }

      results.push({ mac, ranges });
    }

    return results;
  }
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
