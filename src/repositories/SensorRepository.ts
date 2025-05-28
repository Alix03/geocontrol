import { AppDataSource } from "@database";
import { In, Repository } from "typeorm";
import { SensorDAO } from "@models/dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { ConflictError } from "@models/errors/ConflictError";
import { GatewayDAO } from "@models/dao/GatewayDAO";

export class SensorRepository {
  private repo: Repository<SensorDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
  }

  async getAllSensors(
    networkCode: string,
    gatewayMac: string
  ): Promise<SensorDAO[]> {
    //non controllo network e gateway perché già ci pensa il controller
    return await this.repo.find({
      where: {
        gateway: {
          macAddress: gatewayMac,
          network: {
            code: networkCode,
          },
        },
      },
    });
  }

  async getSensorByMac(
    networkCode: string,
    gatewayMac: string,
    macAddress: string
  ): Promise<SensorDAO> {
    const result = findOrThrowNotFound(
      await this.repo.find({
        where: {
          macAddress,
          gateway: {
            macAddress: gatewayMac,
            network: {
              code: networkCode,
            },
          },
        },
      }),
      () => true,
      `Sensor with MAC address '${macAddress}' not found`
    );

    return result;
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

    //verifica esistenza gateway e che il gateway faccia parte del network non fatta perchè già eseguita dal sensorController
    const gateway = await AppDataSource.getRepository(GatewayDAO).findOne({
      where: { macAddress: gatewayMac },
    });

    return this.repo.save({
      macAddress: macAddress,
      name: name,
      description: description,
      variable: variable,
      unit: unit,
      gateway: gateway,
    });
  }

  async deleteSensor(
    networkCode: string,
    gatewayMac: string,
    macAddress: string
  ): Promise<void> {
    await this.repo.remove(
      await this.getSensorByMac(networkCode, gatewayMac, macAddress)
    );
  }

  async updateSensor(
    networkCode: string,
    gatewayMac: string,
    oldMacAddress: string, //macAddress del sensore da modificare
    newmacAddress?: string, //nuovo macAddress del sensore
    newname?: string,
    newdescription?: string,
    newvariable?: string,
    newunit?: string
  ): Promise<SensorDAO> {
    findOrThrowNotFound(
      await this.repo.find({ where: { macAddress: oldMacAddress } }),
      () => true,
      `Sensor with MAC address '${oldMacAddress}' not found`
    );

    const sensor = await this.getSensorByMac(
      networkCode,
      gatewayMac,
      oldMacAddress
    );

    if (oldMacAddress != newmacAddress && newmacAddress !== undefined) {
      const exists = await this.repo.findOne({
        where: { macAddress: newmacAddress },
      });
      if (exists) {
        throw new ConflictError(
          `Sensor with MAC Address '${newmacAddress}' already exists`
        );
      }

      sensor.macAddress = newmacAddress;
    }

    //se il nuovo macAddress non è presente nella richiesta di update rimane il macAddress vecchio
    sensor.name = newname ?? sensor.name;
    sensor.description = newdescription ?? sensor.description;
    sensor.variable = newvariable ?? sensor.variable;
    sensor.unit = newunit ?? sensor.unit;

    return await this.repo.save(sensor);
  }

  async getSensorsByNetwork(
    networkCode: string,
    sensorArray?: string[]
  ): Promise<SensorDAO[]> {
    if (!sensorArray) {
      return await this.repo.find({
        where: {
          gateway: {
            network: {
              code: networkCode,
            },
          },
        },
      });
    } else {
      return await this.repo.find({
        where: {
          macAddress: In(sensorArray),
          gateway: {
            network: {
              code: networkCode,
            },
          },
        },
      });
    }
  }
}
