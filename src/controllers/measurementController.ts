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
import { NetworkRepository } from "@repositories/NetworkRepository";
import { NotFoundError } from "@models/errors/NotFoundError";
import { start } from "repl";

export async function getMeasurementsByNetwork(
  networkCode: string,
  query: any
): Promise<MeasurementsDTO[]> {
  const measurementRepo = new MeasurementRepository();
  const sensorRepo = new SensorRepository();

  // Check se esiste il network
  const networkRepo = new NetworkRepository();
  await networkRepo.getNetworkByCode(networkCode);

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
  const measurementArray = await measurementRepo.getMeasurementByNetwork(
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
        ? computeStats(sensorMeasurement, startDate, endDate)
        : undefined,
      sensorMeasurement && sensorMeasurement.length > 0 ? sensorMeasurement : [] // Array vuoto se non ci sono misurazioni
    );
    setOUtliers(sensorMeasurements);
    measurements.push(sensorMeasurements);
  });
  return measurements;
}

export async function getMeasurementsBySensor(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  query?: any
): Promise<MeasurementsDTO> {
  const measurementRepo = new MeasurementRepository();

  const startDate = parseISODateParamToUTC(query.startDate);
  const endDate = parseISODateParamToUTC(query.endDate);
  //check se esiste il sensore
  const sensorRepo = new SensorRepository();
  await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac);

  // Ottieni le misurazioni dal repository
  const measurementArray = await measurementRepo.getMeasurementBySensor(
    networkCode,
    gatewayMac,
    sensorMac,
    startDate,
    endDate
  );
  // Calcola le statistiche per ogni gruppo di sensori
  const mappedMeasurement = measurementArray.map(mapMeasurementDAOToDTO);
  const sensorMeasurements = createMeasurementsDTO(
    sensorMac,
    measurementArray.length > 0
      ? computeStats(mappedMeasurement, startDate, endDate)
      : undefined,
    measurementArray.length > 0 ? mappedMeasurement : undefined
  );

  setOUtliers(sensorMeasurements);

  return sensorMeasurements;
}

export async function getStatsByNetwork(
  networkCode: string,
  query: any
): Promise<MeasurementsDTO[]> {
  const measurementRepo = new MeasurementRepository();
  const networkRepo = new NetworkRepository();
  const sensorRepo = new SensorRepository();
  // Check se esiste il network
  await networkRepo.getNetworkByCode(networkCode);
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
  const measurementArray = await measurementRepo.getMeasurementByNetwork(
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
    //const stats: StatsDTO = computeStats(sensorMeasurement, startDate, endDate);
    const sensorMeasurements = createMeasurementsDTO(
      sensorMac,
      sensorMeasurement && sensorMeasurement.length > 0
        ? computeStats(sensorMeasurement, startDate, endDate)
        : undefined
    );
    measurements.push(sensorMeasurements);
  });
  return measurements;
}

export async function getStatsBySensor(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  query: any
): Promise<StatsDTO> {
  const sensorRepo = new SensorRepository();
  const measurementRepo = new MeasurementRepository();
  const startDate = parseISODateParamToUTC(query.startDate);
  const endDate = parseISODateParamToUTC(query.endDate);
  //check se esiste il sensore
  await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac);

  // Ottieni le misurazioni dal repository
  const measurementArray = await measurementRepo.getMeasurementBySensor(
    networkCode,
    gatewayMac,
    sensorMac,
    startDate,
    endDate
  );
  // Calcola le statistiche per ogni gruppo di sensori
  const mappedMeasurement = measurementArray.map(mapMeasurementDAOToDTO);
  const stats: StatsDTO =
    measurementArray && measurementArray.length > 0
      ? computeStats(mappedMeasurement, startDate, endDate)
      : {
          mean: 0,
          variance: 0,
          upperThreshold: 0,
          lowerThreshold: 0,
        };

  return stats;
}

export async function getOutliersByNetwork(
  networkCode: string,
  query: any
): Promise<MeasurementsDTO[]> {
  const measurements = await getMeasurementsByNetwork(networkCode, query);
  const measurementsDTO: MeasurementsDTO[] = [];

  let outliers: MeasurementDTO[];
  measurements.forEach((x) => {
    const measurement = x.measurements;

    if (measurement && measurement.length > 0) {
      outliers = measurement.filter(
        (measurement) => measurement.isOutlier === true
      );
    }
    measurementsDTO.push(
      createMeasurementsDTO(
        x.sensorMacAddress,
        measurement && measurement.length > 0 ? x.stats : undefined,
        measurement && measurement.length > 0 ? outliers : undefined
      )
    );
  });
  return measurementsDTO;
}

export async function getOutliersBySensor(
  networkCode: string,
  gatewayMac: string,
  sensorMac?: string,
  query?: any
): Promise<MeasurementsDTO> {
  //prendo le elenco delle misurazioni del sensore
  const measurements = await getMeasurementsBySensor(
    networkCode,
    gatewayMac,
    sensorMac,
    query
  );

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
  const measurementRepo = new MeasurementRepository();

  //verifico che il sensore sia correttamente associato alla rete
  const sensorRepo = new SensorRepository();
  await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac); // Controlla che il sensore appartenga al gateway e al network

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
