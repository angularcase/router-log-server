import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from 'src/devices-manager/devices-manager.service';

@Injectable()
export class DeviceRepositoryService {
  private readonly logger = new Logger(DeviceRepositoryService.name);

  constructor(
    @InjectModel('Device') private readonly deviceModel: Model<Device>,
  ) {}

  async save(device: Device): Promise<void> {
    const newDevice = new this.deviceModel(device);
    await newDevice.save();
  }

  async getLast(mac: string): Promise<Device | null> {
    const device = this.deviceModel.findOne({ mac }).sort({ date: -1 }).exec();

    return device;
  }

  async getArchive(from?: Date, to?: Date): Promise<Device[] | null> {
    const filter: any = {};

    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    } else if (from) {
      filter.date = { $gte: from };
    } else if (to) {
      filter.date = { $lte: to };
    }

    this.logger.log(filter);

    return this.deviceModel.find(filter).sort({ date: 1 }).exec();
  }

  async find(query: any): Promise<Device[]> {
    return this.deviceModel.find(query).exec();
  }

  async findOne(query: any, options?: any): Promise<Device | null> {
    let queryBuilder = this.deviceModel.findOne(query);
    if (options && options.sort) {
      queryBuilder = queryBuilder.sort(options.sort);
    }
    return queryBuilder.exec();
  }
}
