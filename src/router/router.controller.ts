import { Controller, Get } from '@nestjs/common';
import { AsusRouterService } from './asus-router.service';

@Controller('router')
export class RouterController {
    
    constructor(
        private readonly routerService: AsusRouterService
    ) {}

    @Get('/get-connected-devices')
    getConnectedDevices() {
        return this.routerService.getConnectedMacsRaw();
    }

}
