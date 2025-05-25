import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurement } from "@models/dto/Measurement";
import { NotFoundError } from "@models/errors/NotFoundError";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { SensorRepository } from "@repositories/SensorRepository";
import {
  createMeasurement,
  getMeasurementByNetworkId,
} from "@controllers/measurementController";
import { NetworkRepository } from "@repositories/NetworkRepository";
import {
  computeStats,
  createMeasurementsDTO,
  groupMeasurementBySensor,
  setOUtliers,
} from "@services/mapperService";
import { Stats } from "@models/dto/Stats";
import { Measurements } from "@models/dto/Measurements";
import * as mapperService from "@services/mapperService";
import * as utils from "@utils";
import * as MeasurementsDTO from "@models/dto/Measurements";
import * as StatsDTO from "@models/dto/Stats";

jest.mock("@repositories/MeasurementRepository");
jest.mock("@repositories/NetworkRepository");
jest.mock("@repositories/SensorRepository");

describe("measurementController: mocked repositories", () => {
  let mockNetworkRepository: jest.Mocked<NetworkRepository>;
  let mockSensorRepository: jest.Mocked<SensorRepository>;
  let mockMeasurementRepository: jest.Mocked<MeasurementRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNetworkRepository = {
      getNetworkByCode: jest.fn(),
      getAllNetworks: jest.fn(),
      createNetwork: jest.fn(),
      deleteNetwork: jest.fn(),
      updateNetwork: jest.fn(),
    } as any;

    mockSensorRepository = {
      getSensorByMac: jest.fn(),
      getSensorsByNetwork: jest.fn(),
    } as any;

    mockMeasurementRepository = {
      createMeasurement: jest.fn(),
      getMeasurementByNetworkId: jest.fn(),
      getMeasurementBySensorMac: jest.fn(),
    } as any;

    (NetworkRepository as jest.Mock).mockImplementation(
      () => mockNetworkRepository
    );
    (SensorRepository as jest.Mock).mockImplementation(
      () => mockSensorRepository
    );
    (MeasurementRepository as jest.Mock).mockImplementation(
      () => mockMeasurementRepository
    );

    // Aggiungi gli spyOn per le funzioni del mapperService
    jest.spyOn(mapperService, "groupMeasurementBySensor");

    jest.spyOn(mapperService, "computeStats");

    jest.spyOn(mapperService, "createMeasurementsDTO");

    jest.spyOn(mapperService, "setOUtliers");

    jest.spyOn(utils, "parseISODateParamToUTC" );

    jest.spyOn(utils, "parseStringArrayParam");

    jest.spyOn(MeasurementsDTO, "MeasurementsToJSON");

    jest.spyOn(StatsDTO, "StatsToJSON");
  }); 

  const testNetworkDAO = new NetworkDAO();
  testNetworkDAO.id = 1;
  testNetworkDAO.code = "NET01";
  testNetworkDAO.name = "Test Network";
  testNetworkDAO.description = "Test Network Description";

  const testGatewayDAO = new GatewayDAO();
  testGatewayDAO.id = 1;
  testGatewayDAO.macAddress = "gw1";
  testGatewayDAO.name = "Test Gateway";
  testGatewayDAO.description = "Test Gateway Description";
  testGatewayDAO.network = testNetworkDAO;

  const testSensorDAO = new SensorDAO();
  testSensorDAO.id = 1;
  testSensorDAO.macAddress = "mac1";
  testSensorDAO.name = "Test Sensor";
  testSensorDAO.description = "Test Description";
  testSensorDAO.variable = "temperature";
  testSensorDAO.unit = "C";
  testSensorDAO.gateway = testGatewayDAO;

  testNetworkDAO.gateways = [testGatewayDAO];
  testGatewayDAO.sensors = [testSensorDAO];

  const testMeasurement = new MeasurementDAO();
  testMeasurement.createdAt = new Date("2025-05-20T14:48:00.000Z");
  testMeasurement.id = 1;
  testMeasurement.value = 5;
  testMeasurement.sensor = testSensorDAO;

  /*
    CREATE MEASUREMENT
  */
  it("create measurement: success", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.createMeasurement.mockResolvedValue(
      testMeasurement
    );

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5,
    };
    const result = await createMeasurement("NET01", "gw1", "mac1", [measurementDTO]);

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.createMeasurement).toHaveBeenCalledWith(
      measurementDTO.createdAt,
      measurementDTO.value,
      "mac1"
    );

    // Verifica che il sensore sia stato cercato
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1"
    );
  });

  it("create measurement: invalid network code/ gateway mac/ sensor mac", async () => {
    // Mock getSensorByMac per far lanciare NotFoundError

    mockSensorRepository.getSensorByMac.mockRejectedValue(
      new NotFoundError("Entity not found")
    );

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5,
    };

    // Verifica che createMeasurement propaghi l'errore
    await expect(
      createMeasurement("INVALID", "gw1", "mac1", [measurementDTO])
    ).rejects.toThrow(NotFoundError);

    // Verifica che getSensorByMac sia stato chiamato
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "INVALID",
      "gw1",
      "mac1"
    );

    // Verifica che createMeasurement non sia mai stato chiamato
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.createMeasurement).not.toHaveBeenCalled();
  });

  /* 
  GET MEASUREMENT BY NETWORK
  */

  it("getMeasurementByNetwork without query", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetworkId.mockResolvedValue([
      testMeasurement,
    ]);

    const query ={
      startDate: undefined,
      endDate: undefined
    }
    const result = await getMeasurementByNetworkId("NET01", query);
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:48:00.000Z"),
            value: 5,
            isOutlier: false,
          },
        ],
      },
    ]);
  expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(1,query.startDate);
  expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(2,query.endDate);
  

    // Verifica che i sensori siano stati cercati (caso senza sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01");

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetworkId).toHaveBeenCalledWith(
      "NET01",
      [testSensorDAO.macAddress],
      undefined,
      undefined
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([testMeasurement]);

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false,
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith([measurementDTO]);

    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      statsDTO,
      [measurementDTO]
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: [measurementDTO],
    };
    //expect(createMeasurementsDTO).toHaveReturned();
    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);
  });

  it("getMeasurementByNetwork with sensorMacs", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetworkId.mockResolvedValue([
      testMeasurement,
    ]);

    const result = await getMeasurementByNetworkId("NET01", { sensorMacs: "mac1" });
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:48:00.000Z"),
            value: 5,
            isOutlier: false,
          },
        ],
      },
    ]);

    // Verifica che i sensori siano stati cercati (caso con sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01", [
      "mac1",
    ]);

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetworkId).toHaveBeenCalledWith(
      "NET01",
      [testSensorDAO.macAddress],
      undefined,
      undefined
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([testMeasurement]);

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false,
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith([measurementDTO]);

    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      statsDTO,
      [measurementDTO]
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: [measurementDTO],
    };
    //expect(createMeasurementsDTO).toHaveReturned();
    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);
  });

  it("getMeasurementByNetwork with startDate and endDate", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetworkId.mockResolvedValue([
      testMeasurement,
    ]);

    const result =  await getMeasurementByNetworkId("NET01", {
      startDate: "2025-05-20T14:40:00.000Z",
      endDate: "2025-05-20T14:50:00.000Z",
    });
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:48:00.000Z"),
            value: 5,
            isOutlier: false,
          },
        ],
      },
    ]);

    // Verifica che i sensori siano stati cercati (caso senza sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01");

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetworkId).toHaveBeenCalledWith(
      "NET01",
      [testSensorDAO.macAddress],
      new Date("2025-05-20T14:40:00.000Z"),
      new Date("2025-05-20T14:50:00.000Z")
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([testMeasurement]);

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false,
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith([measurementDTO]);

    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      statsDTO,
      [measurementDTO]
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: [measurementDTO],
    };
    //expect(createMeasurementsDTO).toHaveReturned();
    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);
  });
});

