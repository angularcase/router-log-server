import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as dgram from 'dgram';

@Injectable()
export class SyslogService implements OnModuleInit {
  private readonly logger = new Logger(SyslogService.name);

  onModuleInit() {
    // Jeśli chcesz port 514, najpewniej potrzebujesz uprawnień root w systemie.
    // Żeby uniknąć sudo, użyj np. 1514 i w routerze ustaw "Remote Log Server Port" na 1514.
    const SYSLOG_PORT = 1514;

    const server = dgram.createSocket('udp4');

    server.on('message', (msg, rinfo) => {
      const logLine = msg.toString();
      // W tym miejscu możesz od razu parsować, zapisywać do bazy, itp.
      this.logger.log(`[${rinfo.address}] => ${logLine}`);
    });

    server.bind(SYSLOG_PORT, () => {
      this.logger.log(`UDP Syslog server listening on port ${SYSLOG_PORT}`);
    });
  }
}
