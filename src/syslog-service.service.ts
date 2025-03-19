import { Injectable, OnModuleInit } from '@nestjs/common';
import * as dgram from 'dgram';
import * as fs from 'fs';
import * as path from 'path';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export enum MacAddress {
  Z = 'b2:4b:4d:84:24:57',
  D = '70:32:17:91:b2:3e',
  T = '62:49:ef:39:b3:6d',
  P = '14:ac:60:df:13:63',
  G = '8e:3b:ae:57:0c:e4',
}

interface LogEntry {
  date: string;
  action: string;
  mac_addr: string;
}

// echo "Mar 19 15:32:03 wlceventd: wlceventd_proc_event(645): eth3: Deauth_ind 70:32:17:91:b2:3e" | ncat -u 127.0.0.1 1514

@Injectable()
export class SyslogService implements OnModuleInit {
  private readonly LOG_FILE = path.join(__dirname, '../assets/', 'logs.json');

  onModuleInit() {
    const SYSLOG_PORT = 1514;
    const server = dgram.createSocket('udp4');

    server.on('message', (msg, rinfo) => {
      const logLine = msg.toString();

      const parsed = this.parseLogLine(logLine);

      console.log(parsed);

      if (parsed) {
        const macList = Object.values(MacAddress).map((m) => m.toLowerCase());
        const parsedMac = parsed.mac_addr.toLowerCase();

        if (macList.includes(parsedMac)) {
          this.saveLogEntry(parsed.date, parsed.action, parsed.mac_addr);
        }
      }
    });

    server.bind(SYSLOG_PORT, () => {
      console.log(`UDP Syslog server listening on port ${SYSLOG_PORT}`);
    });
  }

  private parseLogLine(line: string) {
    // Wyrażenie regularne:
    //   - date: np. "Mar 19 15:34:55"
    //   - action: "Auth" lub "Deauth_ind"
    //   - mac: np. "70:32:17:91:C1:A7"
    const regex =
      /^(?<date>\w+\s+\d+\s+\d+:\d+:\d+).*?(?<action>Auth|Deauth_ind)\s+(?<mac>[A-Fa-f0-9:]+)/;

    const match = line.match(regex);
    if (!match?.groups) {
      return null;
    }

    return {
      date: this.parsePolishTimestamp(match.groups.date),
      action: match.groups.action,
      mac_addr: match.groups.mac,
    };
  }

  private saveLogEntry(date: string, action: string, mac_addr: string) {
    let logsArray: LogEntry[] = [];

    if (fs.existsSync(this.LOG_FILE)) {
      const raw = fs.readFileSync(this.LOG_FILE, 'utf8');
      try {
        logsArray = JSON.parse(raw) as LogEntry[];
      } catch {
        logsArray = [];
      }
    }

    logsArray.push({ date, action, mac_addr });

    fs.writeFileSync(this.LOG_FILE, JSON.stringify(logsArray, null, 2), 'utf8');
  }

  public parsePolishTimestamp(dateString: string): string {
    dayjs.extend(customParseFormat);
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const currentYear = new Date().getFullYear();
    let parsed = dayjs(`${dateString} ${currentYear}`, 'MMM DD HH:mm:ss YYYY');
    parsed = parsed.tz('Europe/Warsaw');
    return parsed.format('YYYY-MM-DDTHH:mm:ssZ');
  }
}

export interface LineData {
  date: string;
  action: string;
  mac_addr: string;
}
