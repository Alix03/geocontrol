import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import {
  mapMeasurementDAOToDTO,
  createMeasurementsDTO,
  computeStats,
  setOUtliers,
  createStatsDTO,
  groupMeasurementBySensor,
} from "@services/mapperService";
import {
  Measurements as MeasurementsDTO,
  MeasurementsToJSON,
} from "@models/dto/Measurements";
import { getNetwork } from "@controllers/networkController";
import { getSensor } from "@controllers/SensorController";
import { SensorDAO } from "@models/dao/SensorDAO";
import { SensorRepository } from "@repositories/SensorRepository";
import { Stats as StatsDTO, StatsToJSON } from "@models/dto/Stats";
import { parseStringArrayParam, parseISODateParamToUTC } from "@utils";
import { AppDataSource } from "@database";
import { In } from "typeorm";

export async function getMeasurementByNetworkId(
  networkCode: string,
  query?: any
): Promise<MeasurementsDTO[]> {
  const measurementRepo = new MeasurementRepository();
  const sensorRepo = new SensorRepository();

  // Check se esiste il network
  await getNetwork(networkCode);

  const startDate = parseISODateParamToUTC(query.startDate);
  const endDate = parseISODateParamToUTC(query.endDate);

  let sensorMacs: string = query.sensorMacs;
  let sensorArray: string[] = [];
  let filterSensor: any = [];
  if (sensorMacs !== undefined && sensorMacs !== "" && sensorMacs !== null) {
    sensorArray = parseStringArrayParam(sensorMacs);
    //Array di sensori appartenenti al network
    // Usa il metodo del repository per ottenere i sensori
    filterSensor = await sensorRepo.getSensorsByNetwork(
      networkCode,
      sensorArray
    );
  } else {
    // Usa il metodo del repository per ottenere tutti i sensori della rete
    filterSensor = await sensorRepo.getSensorsByNetwork(networkCode);
  }

  sensorArray = filterSensor.map((sensor: SensorDAO) => sensor.macAddress);

  // Ottieni le misurazioni dal repository
  const measurementArray = await measurementRepo.getMeasurementByNetworkId(
    networkCode,
    sensorArray,
    startDate,
    endDate
  );

  // Raggruppa le misurazioni per sensore
  const groupedMeasurements = groupMeasurementBySensor(measurementArray);
  // Calcola le statistiche per ogni gruppo di sensori
  const measurements: MeasurementsDTO[] = [];

  filterSensor.forEach((sensor) => {
    const sensorMac = sensor.macAddress;
    const sensorMeasurement = groupedMeasurements.get(sensorMac);
    const sensorMeasurements = createMeasurementsDTO(
      sensorMac,
      sensorMeasurement && sensorMeasurement.length > 0
        ? computeStats(sensorMeasurement)
        : undefined,
      sensorMeasurement && sensorMeasurement.length > 0 ? sensorMeasurement : [] // Array vuoto se non ci sono misurazioni
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
  query?: any
): Promise<MeasurementsDTO> {
  const measurementRepo = new MeasurementRepository();

  const startDate = parseISODateParamToUTC(query.startDate);
  const endDate = parseISODateParamToUTC(query.endDate);
  //check se esiste il sensore
  await getSensor(networkCode, gatewayMac, sensorMac);

  // Ottieni le misurazioni dal repository
  const measurementArray =
    (await measurementRepo.getMeasurementBySensorMac(
      networkCode,
      gatewayMac,
      sensorMac,
      startDate,
      endDate
    )) || [];
  // Calcola le statistiche per ogni gruppo di sensori

  const stats: StatsDTO = computeStats(measurementArray);
  const sensorMeasurements = createMeasurementsDTO(
    sensorMac,
    measurementArray.length > 0 ? stats : undefined,
    measurementArray.length > 0
      ? measurementArray.map(mapMeasurementDAOToDTO)
      : undefined
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
  const sensorRepo = new SensorRepository();
  // Check se esiste il network
  const startDate = parseISODateParamToUTC(query.startDate);
  const endDate = parseISODateParamToUTC(query.endDate);

  let sensorMacs: string = query.sensorMacs;
  let sensorArray: string[] = [];
  let filterSensor: any = [];

  if (sensorMacs !== undefined && sensorMacs !== "") {
    sensorArray = parseStringArrayParam(sensorMacs);
    //Array di sensori appartenenti al network
    filterSensor = await sensorRepo.getSensorsByNetwork(
      networkCode,
      sensorArray
    );
  } else {
    filterSensor = await sensorRepo.getSensorsByNetwork(networkCode);
  }

  sensorArray = filterSensor.map((sensor: SensorDAO) => sensor.macAddress);

  // Ottieni le misurazioni dal repository
  const measurementArray = await measurementRepo.getMeasurementByNetworkId(
    networkCode,
    sensorArray,
    startDate,
    endDate
  );
  // Raggruppa le misurazioni per sensore
  const groupedMeasurements = groupMeasurementBySensor(measurementArray);
  // Calcola le statistiche per ogni gruppo di sensori
  const measurements: MeasurementsDTO[] = [];
  filterSensor.forEach((sensor) => {
    const sensorMac = sensor.macAddress;
    const sensorMeasurement = groupedMeasurements.get(sensorMac);
    const stats: StatsDTO = computeStats(sensorMeasurement, startDate, endDate);
    const sensorMeasurements = createMeasurementsDTO(sensorMac, stats);
    measurements.push(sensorMeasurements);
  });
  return measurements;
}

export async function getStatsBySensorId(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  query: any
): Promise<StatsDTO> {
  const measurementRepo = new MeasurementRepository();
  const startDate = parseISODateParamToUTC(query.startDate);
  const endDate = parseISODateParamToUTC(query.endDate);
  //check se esiste il sensore
  await getSensor(networkCode, gatewayMac, sensorMac);

  // Ottieni le misurazioni dal repository
  const measurementArray =
    (await measurementRepo.getMeasurementBySensorMac(
      networkCode,
      gatewayMac,
      sensorMac,
      startDate,
      endDate
    )) || [];
  // Calcola le statistiche per ogni gruppo di sensori
  const stats: StatsDTO = computeStats(measurementArray, startDate, endDate);

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
  sensorMac?: string,
  query?: any
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

  const measurementsDTO = createMeasurementsDTO(
    measurements.sensorMacAddress,
    measurements.stats,
    measurements.measurements != undefined
      ? measurements.measurements.filter(
          (measurement) => measurement.isOutlier === true
        )
      : []
  );
  return measurementsDTO;
}

export async function createMeasurement(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  measurements: MeasurementDTO[]
): Promise<void> {
  //verifico i campi obbligatori
  if (
    !networkCode ||
    !gatewayMac ||
    !sensorMac ||
    !measurements ||
    measurements.length === 0
  ) {
    throw new Error("Entity Not Found: Missing required parameters");
  }

  const measurementRepo = new MeasurementRepository();

  //verifico che il sensore sia correttamente associato alla rete
  await getSensor(networkCode, gatewayMac, sensorMac); // Controlla che il sensore appartenga al gateway e al network

  for (const measurement of measurements) {
    // Call the repository method with all required parameters
    await measurementRepo.createMeasurement(
      //quando viene passato createdAt, viene convertito in UTC
      measurement.createdAt,
      measurement.value,
      sensorMac
    );
  }
}
