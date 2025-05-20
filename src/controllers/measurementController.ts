import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import {
  mapMeasurementDAOToDTO,
  createMeasurementsDTO,
  computeStats,
  setOUtliers,
  createStatsDTO,
} from "@services/mapperService";
import {
  Measurements as MeasurementsDTO,
  MeasurementsToJSON,
} from "@models/dto/Measurements";
import { getNetwork } from "@controllers/networkController";
import { getSensor } from "@controllers/SensorController";
import { Stats as StatsDTO, StatsToJSON } from "@models/dto/Stats";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { set } from "date-fns";

export async function getMeasurementByNetworkId(
  networkCode: string,
  query: any
): Promise<MeasurementsDTO[]> {
  const measurementRepo = new MeasurementRepository();
  // Check se esiste il network
  await getNetwork(networkCode);

  // Ottieni le misurazioni dal repository
  const measurementArray =
    (await measurementRepo.getMeasurementByNetworkId(networkCode, query)) || [];
    
  // Raggruppa le misurazioni per sensore
  const groupedMeasurements = groupMeasurementBySensor(measurementArray);
  // Calcola le statistiche per ogni gruppo di sensori
  const measurements: MeasurementsDTO[] = [];
  groupedMeasurements.forEach((measurementsForSensor, sensorMac) => {
    const stats: StatsDTO = computeStats(measurementsForSensor);
    const sensorMeasurements = createMeasurementsDTO(
      sensorMac,
      measurementArray.length>0 ? stats : undefined,
      measurementArray.length>0 ? measurementsForSensor : undefined
    );
    setOUtliers(sensorMeasurements);
    measurements.push(sensorMeasurements);
  });
  return measurements;
}

export async function getMeasurementBySensorId(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  query: any
): Promise<MeasurementsDTO> {
  const measurementRepo = new MeasurementRepository();
  //check se esiste il sensore
  await getSensor(networkCode, gatewayMac, sensorMac);

  // Ottieni le misurazioni dal repository
  const measurementArray =
    (await measurementRepo.getMeasurementBySensorMac(
      networkCode,
      gatewayMac,
      sensorMac,
      query
    )) || [];
  // Calcola le statistiche per ogni gruppo di sensori
  const stats: StatsDTO = computeStats(measurementArray);
  const sensorMeasurements = createMeasurementsDTO(
    sensorMac,
    measurementArray.length>0 ? stats : undefined,
    measurementArray.length>0 ? measurementArray.map(mapMeasurementDAOToDTO) :  undefined
  );
  setOUtliers(sensorMeasurements);
  // Converti in JSON e restituisci
  return MeasurementsToJSON(sensorMeasurements);
}

export async function getStatsByNetworkId(
  networkCode: string,
  query: any
): Promise<MeasurementsDTO[]> {
  const measurementRepo = new MeasurementRepository();
  // Check se esiste il network
  await getNetwork(networkCode);

  // Ottieni le misurazioni dal repository
  const measurementArray =
    (await measurementRepo.getMeasurementByNetworkId(networkCode, query)) || [];
  // Raggruppa le misurazioni per sensore
  const groupedMeasurements = groupMeasurementBySensor(measurementArray);
  // Calcola le statistiche per ogni gruppo di sensori
  const measurements: MeasurementsDTO[] = [];
  groupedMeasurements.forEach((measurementsForSensor, sensorMac) => {
    const stats: StatsDTO = computeStats(measurementsForSensor);
    const sensorMeasurements = createMeasurementsDTO(sensorMac, stats);
    measurements.push(sensorMeasurements);
  });
  // Converti in JSON e restituisci
  MeasurementsToJSON(measurements);
  return measurements;
}

export async function getStatsBySensorId(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  query: any
): Promise<StatsDTO> {
  const measurementRepo = new MeasurementRepository();
  //check se esiste il sensore
  await getSensor(networkCode, gatewayMac, sensorMac);

  // Ottieni le misurazioni dal repository
  const measurementArray =
    (await measurementRepo.getMeasurementBySensorMac(
      networkCode,
      gatewayMac,
      sensorMac,
      query
    )) || [];
  // Calcola le statistiche per ogni gruppo di sensori
  const stats: StatsDTO = computeStats(measurementArray);

  // Converti in JSON e restituisci
  return StatsToJSON(stats);
}

export async function getOutliersByNetworkId(
  networkCode: string,
  query: any
): Promise<MeasurementsDTO[]> {
  const measurementRepo = new MeasurementRepository();
  const measurements = await getMeasurementByNetworkId(networkCode, query);
  const measurementsDTO: MeasurementsDTO[] = [];
  measurements.forEach((x) => {
    const measurement = x.measurements;
    setOUtliers(x);
    const outliers = measurement.filter(
      (measurement) => measurement.isOutlier === true
    );
    measurementsDTO.push(
      createMeasurementsDTO(x.sensorMacAddress, x.stats, outliers)
    );
  });
  return measurementsDTO;
}

export async function getOutliersBySensorId(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  query: any
): Promise<MeasurementsDTO> {
  const measurementRepo = new MeasurementRepository();
  //prendo le elenco delle misurazioni del sensore
  const measurements = await getMeasurementBySensorId(
    networkCode,
    gatewayMac,
    sensorMac,
    query
  );
  setOUtliers(measurements);

  
  const measurementsDTO=createMeasurementsDTO(
      measurements.sensorMacAddress,
      measurements.stats,
      measurements.measurements != undefined ? measurements.measurements.
        filter((measurement) => measurement.isOutlier === true) : []
    )
  return measurementsDTO;
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
      measurement.isOutlier ?? false
    );
  }
}

export function groupMeasurementBySensor(
  measurementArray: MeasurementDAO[]
): Map<string, MeasurementDTO[]> {
  const groupedMeasurements: Map<string, MeasurementDTO[]> = new Map();
  measurementArray.forEach((measurement) => {
    const sensorMac = measurement.sensor.macAddress; // Assumendo che il sensore abbia un campo macAddress
    if (!groupedMeasurements.has(sensorMac)) {
      groupedMeasurements.set(sensorMac, []);
    }
    groupedMeasurements
      .get(sensorMac)!
      .push(mapMeasurementDAOToDTO(measurement));
  });
  return groupedMeasurements;
}

