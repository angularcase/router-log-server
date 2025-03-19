import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { LineData, MacAddress } from './syslog-service.service';

@Controller()
export class AppController {
  private readonly LOG_FILE = path.join(__dirname, '..', 'logs.json');

  @Get()
  home(): any {
    if (fs.existsSync(this.LOG_FILE)) {
      try {
        const content = fs.readFileSync(this.LOG_FILE, 'utf8');
        const logs = JSON.parse(content) as LineData[];

        const result: { [key: string]: 'in' | 'out' } = {};

        // Dla każdego adresu MAC z naszego enuma:
        for (const mac of Object.values(MacAddress)) {
          // Przyjmujemy domyślnie, że urządzenie jest "out"
          let state: 'in' | 'out' = 'out';
          // Przeglądamy logi od końca (czyli najnowsze wpisy najpierw)
          for (let i = logs.length - 1; i >= 0; i--) {
            const entry = logs[i];
            // Porównujemy adresy MAC (bez uwzględniania wielkości liter)
            if (entry.mac_addr.toLowerCase() === mac.toLowerCase()) {
              // Pierwszy napotkany wpis decyduje – sprawdzamy akcję
              if (entry.action === 'Auth') {
                state = 'in';
              } else if (entry.action === 'Deauth_ind') {
                state = 'out';
              }
              break; // kończymy przeszukiwanie logów dla tego MAC
            }
          }
          result[mac] = state;
        }

        return result;
      } catch (error) {
        return { error: 'Błąd podczas parsowania pliku logs.json' };
      }
    } else {
      return { message: 'Plik logs.json nie istnieje.' };
    }
  }
}
