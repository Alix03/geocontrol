import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { mapMeasurementDAOToDTO } from "@services/mapperService";

export async function getMeasurementByNetworkId(networkCode : string): Promise<MeasurementDTO[]> {
    const measurementRepo = new MeasurementRepository();
    return (await measurementRepo.getMeasurementByNetworkId(networkCode)).map(mapMeasurementDAOToDTO);
}

export async function getMeasurementBySensorId(networkCode : string, gatewayMac : string, sensorMac : string): Promise<MeasurementDTO[]> {
    const measurementRepo = new MeasurementRepository();
    return (await measurementRepo.getMeasurementBySensorMac(networkCode, gatewayMac, sensorMac)).map(mapMeasurementDAOToDTO);
}

export async function getOutliersByNetworkId(networkCode : string): Promise<MeasurementDTO[]> {
    const measurementRepo = new MeasurementRepository();
    return (await measurementRepo.getOutliersByNetworkId(networkCode)).map(mapMeasurementDAOToDTO);
}

export async function getOutliersBySensorId(sensorId : string): Promise<MeasurementDTO[]> {
    const measurementRepo = new MeasurementRepository();
    return (await measurementRepo.getOutliersBySensorId(sensorId)).map(mapMeasurementDAOToDTO);
}

export async function createMeasurement(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    measurementDto: MeasurementDTO
  ): Promise<void> {
    const measurementRepo = new MeasurementRepository();
    // Call the repository method with all required parameters
    await measurementRepo.createMeasurement(
      networkCode,
      gatewayMac,
      sensorMac,
      measurementDto
    );
  }


