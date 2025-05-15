import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { mapMeasurementDAOToDTO } from "@services/mapperService";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { Network as NetworkDTO } from "@models/dto/Network";
import { getNetwork } from "@controllers/networkController";
import { getGateway } from "@controllers/gatewayController";
import { getSensor } from "@controllers/SensorController";

export async function getMeasurementByNetworkId(networkCode : string, query: any): Promise<MeasurementDTO[]> {
    const measurementRepo = new MeasurementRepository();
    //check se esiste il network
    await getNetwork(networkCode);
    return (await measurementRepo.getMeasurementByNetworkId(networkCode, query)).map(mapMeasurementDAOToDTO);
}

export async function getMeasurementBySensorId(networkCode : string, gatewayMac : string, sensorMac : string, query: any): Promise<MeasurementDTO[]> {
    const measurementRepo = new MeasurementRepository();
    //check se esiste il sensore
    await getSensor(networkCode, gatewayMac, sensorMac);
    return (await measurementRepo.getMeasurementBySensorMac(networkCode, gatewayMac, sensorMac, query)).map(mapMeasurementDAOToDTO);
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
    sensorMac: string,
    measurements: MeasurementDTO[] 
  ): Promise<void> {
    const measurementRepo = new MeasurementRepository();
    for (const measurement of measurements) {

    // Call the repository method with all required parameters
    await measurementRepo.createMeasurement(
      measurement.createdAt,
      measurement.value,
      sensorMac,
      measurement.isOutlier ?? false,

    );}
  }


