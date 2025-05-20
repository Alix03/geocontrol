import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@models/dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { ConflictError } from "@models/errors/ConflictError";
import { GatewayDAO } from "@models/dao/GatewayDAO";

export class SensorRepository {
  private repo: Repository<SensorDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
  }

  getAllSensors(networkCode:string, gatewayMac: string): Promise<SensorDAO[]> {
    return this.repo.find({ where: {
      gateway: {
        macAddress: gatewayMac,
        network: {
          code: networkCode
        }
      },
    }});
  }

  async getSensorByMac(networkCode:string, gatewayMac: string, macAddress: string): Promise<SensorDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: {
         macAddress,
         gateway: {
          macAddress: gatewayMac,
          network: {
            code: networkCode
          }
         }
         } }),
      () => true,
      `Sensor with MAC address '${macAddress}' not found`
    );
  }

  async createSensor(
    gatewayMac: string,
    macAddress: string,
    name?: string,
    description?: string,
    variable?: string,
    unit?: string
  ): Promise<SensorDAO> {
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Sensor with MAC address '${macAddress}' already exists`
    );

    //verifica che il gateway faccia parte del network non fatta perchè già eseguita dal sensorController
    const gateway = findOrThrowNotFound(
      await AppDataSource.getRepository(GatewayDAO).find({ where: { macAddress: gatewayMac } }),
      () => true,
      `Gateway with MAC address '${gatewayMac}' not found`
    );

    return this.repo.save({
      macAddress: macAddress,
      name: name,
      description: description,
      variable: variable,
      unit: unit,
      gateway: gateway
    });
  }

  async deleteSensor(networkCode:string, gatewayMac:string, macAddress: string): Promise<void> {
    await this.repo.remove(await this.getSensorByMac(networkCode, gatewayMac, macAddress));
  }

  async updateSensor(
    networkCode: string,
    gatewayMac: string,
    oldMacAddress: string,
    macAddress?: string,
    name?: string,
    description?: string,
    variable?: string,
    unit?: string): Promise<SensorDAO> {
      findOrThrowNotFound(
        await this.repo.find({ where: { macAddress: oldMacAddress } }),
        () => true,
        `Sensor with MAC address '${oldMacAddress}' not found`
      );

      const sensor = await this.getSensorByMac(networkCode, gatewayMac, oldMacAddress);
      if (oldMacAddress != macAddress && macAddress !== undefined){
        const exists = await this.repo.findOne({ where: { macAddress: macAddress } });
        if (exists) {
          throw new ConflictError(`Sensor with MAC Address '${macAddress}' already exists`);
        }

        sensor.macAddress = macAddress;
      }
      //se il nuovo macAddress non è presente nella richiesta di update rimane il macAddress vecchio

      Object.assign(sensor, {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(variable !== undefined && { variable }),
        ...(unit !== undefined && { unit }),
      });
      

      return this.repo.save(sensor);
    }
}
