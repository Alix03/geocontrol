import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
  }


  async createMeasurement(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    measurementData: MeasurementDTO
    ): Promise<MeasurementDAO> {
    // Verifica che il sensore esista e sia associato al networkCode e gatewayMac
    const sensor = await AppDataSource.getRepository(SensorDAO).findOne({
    relations: ["gateway", "gateway.network"],
    where: {
      macAddress: sensorMac,
      gateway: {
        macAddress: gatewayMac,
        network: {
          code: networkCode,
        },
      },
    },
  });
  if (!sensor) {
    throw new Error(
      `Sensor with macAddress '${sensorMac}' not found in gateway '${gatewayMac}' and network '${networkCode}'`
    );
  }
  // Salva la misurazione
  return this.repo.save({
    createdAt: measurementData.createdAt,
    value: measurementData.value,
    isOutlier: measurementData.isOutlier,
    sensor: sensor, // Associa il sensore
  });
}

async getMeasurementByNetworkId(
  networkCode: string
): Promise<MeasurementDAO[]> {
  return await this.repo.find({
    relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
    where: {
      sensor: {
        gateway: {
          network: {
            code: networkCode, // Filtra per networkCode
          },
        },
      },
    },
  });
}


  async getMeasurementBySensorMac(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
  ): Promise<MeasurementDAO[]> {
    return await this.repo.find({
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
      where: {
        sensor: {
          macAddress: sensorMac, // Filtra per sensorMac
          gateway: {
            macAddress: gatewayMac, // Filtra per gatewayMac
            network: {
              code: networkCode, // Filtra per networkCode
            },
          },
        },
      },
    });
  }

  async getOutliersByNetworkId(networkId: string): Promise<MeasurementDAO[]> {
    return await this.repo.find({
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
      where: {
        isOutlier: true,
        sensor: {
          gateway: {
            network: {
              id: networkId,
            },
          },
        },
      },
    });
  }

  async getOutliersBySensorId(sensorId: string): Promise<MeasurementDAO[]> {
    return await this.repo.find({
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
      where: {
        isOutlier: true,
        sensor: {
          id: sensorId,
        },
      },
    });
  }

  //??
  async getStatsByNetworkId(networkId: string): Promise<any[]> {
    return await this.repo
      .createQueryBuilder("measurement")
      .select("AVG(measurement.value)", "mean")
      .addSelect("VARIANCE(measurement.value)", "variance")
      .innerJoin("measurement.sensor", "sensor")
      .innerJoin("sensor.gateway", "gateway")
      .innerJoin("gateway.network", "network")
      .where("network.id = :networkId", { networkId })
      .groupBy("network.id")
      .getRawMany();
  }

  async getStatsBySensorId(sensorId: string): Promise<any[]> {
    return await this.repo
      .createQueryBuilder("measurement")
      .select("AVG(measurement.value)", "mean")
      .addSelect("VARIANCE(measurement.value)", "variance")
      .where("measurement.sensorId = :sensorId", { sensorId })
      .groupBy("measurement.sensorId")
      .getRawMany();
  }
      
}