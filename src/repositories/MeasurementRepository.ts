import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NetworkDAO } from "@dao/NetworkDAO";
import { parseISODateParamToUTC, parseStringArrayParam } from "@utils";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
  }

  async createMeasurement(
    createdAt: Date,
    value: number,
    sensorMac: string,
    isOutlier?: boolean
  ): Promise<MeasurementDAO> {
    // Verifica che il sensore esista e sia associato al networkCode e gatewayMac
    const sensor = await AppDataSource.getRepository(SensorDAO).findOne({
      where: {
        macAddress: sensorMac,
      },
    });
    if (!sensor) {
      throw new Error(`Sensor with macAddress '${sensorMac}' not found`);
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
  query: any
): Promise<MeasurementDAO[]> {
  const sensorMacs = query.sensorMacs || [];
  const startDate = parseISODateParamToUTC(query.startDate);
  const endDate = parseISODateParamToUTC(query.endDate);

  const sensorMacsArray = parseStringArrayParam(sensorMacs);
  const isFilteringByMac = sensorMacsArray.length > 0;

  // Caso: senza filtro MAC → filtriamo per network
  if (!isFilteringByMac) {
    const whereBase = {
      sensor: {
        gateway: {
          network: { code: networkCode },
        },
      },
    };

    let whereClause: any = { ...whereBase };

    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      whereClause.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      whereClause.createdAt = LessThanOrEqual(endDate);
    }
    
    return await this.repo.find({
      where: whereClause,
      relations: {
        sensor: {
          gateway: {
            network: true,
          },
        },
      },
    });
  }

  
  const allMeasurements: MeasurementDAO[] = [];

  for (const sensorMac of sensorMacsArray) {
    const whereClause: any = {
      sensor: { macAddress: sensorMac },
    };

    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      whereClause.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      whereClause.createdAt = LessThanOrEqual(endDate);
    }

    const measurements = await this.repo.find({
      where: whereClause,
      relations: { sensor: true },
    });

    allMeasurements.push(...measurements);
  }

  return allMeasurements;
}

  async getMeasurementBySensorMac(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    query: any
  ): Promise<MeasurementDAO[]> {
    const startDate = parseISODateParamToUTC(query.startDate);
    const endDate = parseISODateParamToUTC(query.endDate);

    const whereCondition: any = {
      sensor: { macAddress: sensorMac, gateway: { network: { code: networkCode } } },
    };
    
    // Aggiungi il filtro per le date solo se sono definite
    if (startDate && endDate) {
      whereCondition.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      whereCondition.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      whereCondition.createdAt = LessThanOrEqual(endDate);
    }
    
    // Esegui la query con la condizione dinamica
    const measurements = await this.repo.find({
      where: whereCondition,
      relations: { sensor: { gateway: { network: true } } },
    });
    //raggruppo le misurazioni per sensore
    const groupedMeasurements: MeasurementDAO[] = [];
    for (const measurement of measurements) {
      if (measurement.sensor.macAddress === sensorMac) {
        groupedMeasurements.push(measurement);
      }
    }
    return groupedMeasurements;
 }

  async getOutliersByNetworkId(networkId: string): Promise<MeasurementDAO[]> {
    return null;
  }

  async getOutliersBySensorId(sensorId: string): Promise<MeasurementDAO[]> {
    return null;
  }
}
