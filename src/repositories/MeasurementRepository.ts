import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";

export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
  }

  async getMeasurementByNetworkId(networkId: number): Promise<MeasurementDAO[]> {
    return await this.repo.find({
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
      where: {
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

  async getMeasurementBySensorId(sensorId: number): Promise<MeasurementDAO[]> {
    return await this.repo.find({
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
      where: {
        sensor: {
          id: sensorId,
        },
      },
    });
  }

  async getOutliersByNetworkId(networkId: number): Promise<MeasurementDAO[]> {
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

  async getOutliersBySensorId(sensorId: number): Promise<MeasurementDAO[]> {
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

  async createMeasurement(
    sensorId: number, 
    measurementData: Partial<MeasurementDAO>
    ): Promise<MeasurementDAO> {
    const measurement = this.repo.create({
      ...measurementData,
      sensor: { id: sensorId },
    });
    return await this.repo.save(measurement);
  }

  async getStatsByNetworkId(networkId: number): Promise<any[]> {
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

  async getStatsBySensorId(sensorId: number): Promise<any[]> {
    return await this.repo
      .createQueryBuilder("measurement")
      .select("AVG(measurement.value)", "mean")
      .addSelect("VARIANCE(measurement.value)", "variance")
      .where("measurement.sensorId = :sensorId", { sensorId })
      .groupBy("measurement.sensorId")
      .getRawMany();
  }
}