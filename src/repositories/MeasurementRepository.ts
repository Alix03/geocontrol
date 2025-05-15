import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { query } from "winston";
import { NetworkDAO } from "@dao/NetworkDAO";

export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
  }


  async createMeasurement(
    createdAt: Date,
    value: number,
    sensorMac: string,
    isOutlier?: boolean,
    ): Promise<MeasurementDAO> {
    // Verifica che il sensore esista e sia associato al networkCode e gatewayMac
    const sensor = await AppDataSource.getRepository(SensorDAO).findOne({
    where: {
      macAddress: sensorMac,
    },
  });
  if (!sensor) {
    throw new Error(
      `Sensor with macAddress '${sensorMac}' not found`
    );
  }
  // Salva la misurazione
  return this.repo.save({
    createdAt: createdAt,
    value: value,
    isOutlier: isOutlier,
    sensor: sensor, // Associa il sensore
  });
}

async getMeasurementByNetworkId(
  networkCode: string,
  query: any,
): Promise<MeasurementDAO[]> {
  const { sensorMacs, startDate, endDate } = query;
  const network = await AppDataSource.getRepository(NetworkDAO).findOne({
    where: { code: networkCode,},
  });
  return null;
}


  async getMeasurementBySensorMac(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    query: any,
  ): Promise<MeasurementDAO[]> {
    const { startDate, endDate } = query;
    const network = await AppDataSource.getRepository(NetworkDAO).findOne({
      where: { code: networkCode },
    });
    const gateway = await AppDataSource.getRepository(SensorDAO).findOne({
      where: { macAddress: gatewayMac },
    });
    const sensor = await AppDataSource.getRepository(SensorDAO).findOne({
      where: { macAddress: sensorMac },
    });
    return null;
  }

  async getOutliersByNetworkId(networkId: string): Promise<MeasurementDAO[]> {
    return null;
  }

  async getOutliersBySensorId(sensorId: string): Promise<MeasurementDAO[]> {
    return null;
  }
}