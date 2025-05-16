import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { mapMeasurementDAOToDTO, createMeasurementsDTO, computeStats } from "@services/mapperService";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { Network as NetworkDTO } from "@models/dto/Network";
import { Measurements as MeasurementsDTO, MeasurementsToJSON} from "@models/dto/Measurements";
import { getNetwork } from "@controllers/networkController";
import { getGateway } from "@controllers/gatewayController";
import { getSensor } from "@controllers/SensorController";
import { parseISODateParamToUTC } from "@utils";
import { Stats as StatsDTO } from "@models/dto/Stats";


export async function getMeasurementByNetworkId(networkCode: string, query: any): Promise<MeasurementsDTO[]> {
    const measurementRepo = new MeasurementRepository();
    // Check se esiste il network
    await getNetwork(networkCode);

    // Ottieni le misurazioni dal repository
    const measurementArray = (await measurementRepo.getMeasurementByNetworkId(networkCode, query)) || [];
    // Raggruppa le misurazioni per sensore
    const groupedMeasurements: Map<string, MeasurementDTO[]> = new Map();
    measurementArray.forEach((measurement) => {
        const sensorMac = measurement.sensor.macAddress; // Assumendo che il sensore abbia un campo macAddress
        if (!groupedMeasurements.has(sensorMac)) {
            groupedMeasurements.set(sensorMac, []);
        }
        groupedMeasurements.get(sensorMac)!.push(mapMeasurementDAOToDTO(measurement));
    });
    // Calcola le statistiche per ogni gruppo di sensori
    const measurements: MeasurementsDTO[] = [];
    groupedMeasurements.forEach((measurementsForSensor, sensorMac) => {
        const stats: StatsDTO = computeStats(measurementsForSensor, query.startDate, query.endDate);
        const sensorMeasurements = createMeasurementsDTO(sensorMac, stats, measurementsForSensor);
       measurements.push(sensorMeasurements);
       
    }); 
    // Converti in JSON e restituisci
    MeasurementsToJSON(measurements); 
    return measurements;
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
      //quando viene passato createdAt, viene convertito in UTC
      measurement.createdAt,
      measurement.value,
      sensorMac,
      measurement.isOutlier ?? false,

    );}
  }


