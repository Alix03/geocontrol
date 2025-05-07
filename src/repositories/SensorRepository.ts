import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@models/dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class SensorRepository {
  private repo: Repository<SensorDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
  }

  getAllSensors(): Promise<SensorDAO[]> {
    return this.repo.find();
  }

  async getSensorByMac(macAddress: string): Promise<SensorDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Sensor with MAC address '${macAddress}' not found`
    );
  }

  async createSensor(
    macAddress: string,
    name: string,
    description: string,
    variable: string,
    unit: string
  ): Promise<SensorDAO> {
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Sensor with MAC address '${macAddress}' already exists`
    );

    return this.repo.save({
      macAddress: macAddress,
      name: name,
      description: description,
      variable: variable,
      unit: unit
    });
  }

  async deleteSensor(macAddress: string): Promise<void> {
    await this.repo.remove(await this.getSensorByMac(macAddress));
  }

  async updateSensor(
    macAddress: string,
    name: string,
    description: string,
    variable: string,
    unit: string): Promise<SensorDAO> {
      
    }
}
