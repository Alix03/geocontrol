import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NetworkDAO } from "@dao/NetworkDAO";
import { parseISODateParamToUTC, parseStringArrayParam } from "@utils";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Between, MoreThanOrEqual, LessThanOrEqual, In } from "typeorm";
import { NotFoundError } from "@models/errors/NotFoundError";
export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
  }

  async createMeasurement(
    createdAt: Date,
    value: number,
    sensorMac: string
  ): Promise<MeasurementDAO> {
    // Verifica che il sensore esista e sia associato al networkCode e gatewayMac
    //se ci sono li filtriamo e tornanomo solo quelli validi per quel network
    const sensor = await AppDataSource.getRepository(SensorDAO).findOne({
      where: {
        macAddress: sensorMac,
      },
    });
    if (!sensor) {
      throw new NotFoundError(
        `Sensor with macAddress '${sensorMac}' not found`
      );
    }
    // Salva la misurazione
    return this.repo.save({
      createdAt: createdAt,
      value: value,
      sensor: sensor, // Associa il sensore
    });
  }

  async getMeasurementByNetworkId(
  networkCode: string,
  sensorMacs?: string[],
  startDate?: Date,
  endDate?: Date
): Promise<MeasurementDAO[]> {
   const whereClause: any ={sensor:{ macAddress: In(sensorMacs)}};

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
    return measurements;
  }

  async getMeasurementBySensorMac(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MeasurementDAO[]> {
    const whereCondition: any = {
      sensor: {
        macAddress: sensorMac,
        gateway: { network: { code: networkCode } },
      },
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
    return measurements;
  }
}
