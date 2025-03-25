import { Injectable } from '@nestjs/common';
import { Device } from 'src/devices-manager/devices-manager.service';

@Injectable()
export class ArchiveService {
  constructor(private deviceRepository: DeviceRepository) {}

  /**
   * Metoda getArchive zwraca dla zadanych maców oraz przedziału czasu [from, to]
   * listę przedziałów aktywności (ranges), przy czym:
   *  - Jeśli aktywacja miała miejsce przed "from", zakres zaczyna się od "from".
   *  - Jeśli dezaktywacja nastąpiła po "to", zakres kończy się na "to".
   *  - Jeśli urządzenie było aktywne przez cały okres [from, to],
   *    zwracany jest przedział [from, to].
   */
  async getArchive(
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

export interface ArchiveRange {
  from: Date;
  to: Date;
}

export interface ArchiveResult {
  mac: string;
  ranges: ArchiveRange[];
}

// Rozszerzony interfejs repozytorium – dodajemy metodę findOne
export interface DeviceRepository {
  find(query: any): Promise<Device[]>;
  findOne(query: any, options?: any): Promise<Device | null>;
}
