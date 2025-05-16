import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NetworkDAO } from "@dao/NetworkDAO";
import { parseISODateParamToUTC, parseStringArrayParam } from "@utils";
import { Between } from "typeorm";

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
    const network = await AppDataSource.getRepository(NetworkDAO).findOne({
      where: { code: networkCode },
    });
    
    //se l'array di sensori è vuoto, mi ritorna tutte le measurement 
    if ((sensorMacs.length == 0)) {
      const measurements = await this.repo.find({
        where: {
          sensor: { gateway: { network: network } },
          createdAt: Between(startDate, endDate),
        },
      }); 
      return measurements;
    } 
    const sensorMacsArray = parseStringArrayParam(sensorMacs);
    const measurementArray: MeasurementDAO[] = [];
    
    for (const sensorMac of sensorMacsArray) {
      const measurements = await this.repo.find({
        relations: {sensor: true},
        where: {
          sensor: { macAddress: sensorMac },
          createdAt: Between(startDate, endDate),
      },
      });
      
      measurementArray.push(...measurements);
    } 
    return measurementArray;

  }

  async getMeasurementBySensorMac(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    query: any
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
