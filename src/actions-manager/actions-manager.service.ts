import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Device } from 'src/devices-manager/devices-manager.service';

@Injectable()
export class ActionsManagerService {
  private readonly logger = new Logger(ActionsManagerService.name);

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

  getArchive() {
    const all = this.deviceModel.find().sort({ date: 1 }).exec();
    return all;
  }
}
