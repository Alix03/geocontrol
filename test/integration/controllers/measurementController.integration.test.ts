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
  getMeasurementsByNetwork,
  getMeasurementsBySensor,
  getOutliersByNetwork,
  getStatsByNetwork,
  getStatsBySensor,
  getOutliersBySensor,
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

    jest.spyOn(utils, "parseISODateParamToUTC");

    jest.spyOn(utils, "parseStringArrayParam");

    jest.spyOn(MeasurementsDTO, "MeasurementsToJSON");

    jest.spyOn(StatsDTO, "StatsToJSON");

    jest.spyOn(
      require("@controllers/measurementController"),
      "getMeasurementsByNetworkId"
    );
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
    const result = await createMeasurement("NET01", "gw1", "mac1", [
      measurementDTO,
    ]);

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

  it("getMeasurementsByNetwork without query", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getMeasurementsByNetwork("NET01", query);
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
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che i sensori siano stati cercati (caso senza sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01");

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
      "NET01",
      [testSensorDAO.macAddress],
      undefined,
      undefined
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([testMeasurement]);

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false, //DA RIGUARDARE
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      undefined,
      undefined
    );

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

  it("getMeasurementsByNetwork with sensorMacs", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const result = await getMeasurementsByNetwork("NET01", {
      sensorMacs: "mac1",
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

    // Verifica che i sensori siano stati cercati (caso con sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01", [
      "mac1",
    ]);

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
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

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      undefined,
      undefined
    );

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

  it("getMeasurementsByNetwork with startDate and endDate", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const result = await getMeasurementsByNetwork("NET01", {
      startDate: "2025-05-20T14:40:00.000Z",
      endDate: "2025-05-20T14:50:00.000Z",
    });
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          startDate: new Date("2025-05-20T14:40:00.000Z"),
          endDate: new Date("2025-05-20T14:50:00.000Z"),
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
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
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

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      new Date("2025-05-20T14:40:00.000Z"),
      new Date("2025-05-20T14:50:00.000Z")
    );

    const statsDTO: Stats = {
      startDate: new Date("2025-05-20T14:40:00.000Z"),
      endDate: new Date("2025-05-20T14:50:00.000Z"),
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

  it("getMeasurementsByNetwork with invalid date format", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const result = await getMeasurementsByNetwork("NET01", {
      startDate: "invalid-date",
      endDate: "2025-05-20T14:50:00.000Z",
    });

    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          endDate: new Date("2025-05-20T14:50:00.000Z"),
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

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      "invalid-date"
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      "2025-05-20T14:50:00.000Z"
    );

    // Should continue with undefined dates
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
      "NET01",
      expect.any(Array),
      undefined,
      new Date("2025-05-20T14:50:00.000Z")
    );
  });

  it("getMeasurementsByNetwork with multiple sensors response", async () => {
    const testSensor2 = { ...testSensorDAO, macAddress: "mac2" };
    const testMeasurement2 = { ...testMeasurement };
    testMeasurement2.sensor = testSensor2;

    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([
      testSensorDAO,
      testSensor2,
    ]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
      testMeasurement2,
    ]);

    const result = await getMeasurementsByNetwork("NET01", {});

    expect(result).toHaveLength(2);
    expect(result[0].sensorMacAddress).toBe("mac1");
    expect(result[1].sensorMacAddress).toBe("mac2");
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
      {
        sensorMacAddress: "mac2",
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

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([
      testMeasurement,
      testMeasurement2,
    ]);
  });

  it("getMeasurementByNetwork with no measurements found", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([]);

    const result = await getMeasurementsByNetwork("NET01", {});

    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
      },
    ]);

    expect(computeStats).toHaveBeenCalledTimes(0);
  });

  it("getMeasurementByNetwork with non-existent sensor macs", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([]);

    const result = await getMeasurementsByNetwork("NET01", {
      sensorMacs: "non-existent-mac",
    });

    expect(result).toEqual([]);
    expect(
      mockMeasurementRepository.getMeasurementByNetwork
    ).toHaveBeenCalledWith("NET01", [], undefined, undefined);
  });

  it("getMeasurementsByNetwork with some invalid sensorMacs", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const result = await getMeasurementsByNetwork("NET01", {
      sensorMacs: ["mac1", "INVALID"],
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

    // Verifica che i sensori siano stati cercati (caso con sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01", [
      "mac1",
      "INVALID",
    ]);

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
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

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      undefined,
      undefined
    );

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

  it("getMeasurementByNetwork with multiple measurements and outlier", async () => {
    const measurementArray = [];
    const measurements = [10, 12, 11, 13, 14, 15, 16, 12, 11, 50].map(
      (value, index) => {
        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date(`2025-05-20T14:${48 + index}:00.000Z`);
        measurement.id = index + 1;
        measurement.value = value;
        measurement.sensor = testSensorDAO;
        measurementArray.push(measurement);
      }
    );

    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue(
      measurementArray
    );

    const result = await getMeasurementsByNetwork("NET01", {});

    // Verifica il risultato
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 16.4,
          variance: 128.64,
          upperThreshold: 39.08391500601252,
          lowerThreshold: -6.283915006012521,
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:48:00.000Z"),
            value: 10,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:49:00.000Z"),
            value: 12,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:50:00.000Z"),
            value: 11,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:51:00.000Z"),
            value: 13,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:52:00.000Z"),
            value: 14,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:53:00.000Z"),
            value: 15,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:54:00.000Z"),
            value: 16,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:55:00.000Z"),
            value: 12,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:56:00.000Z"),
            value: 11,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:57:00.000Z"),
            value: 50,
            isOutlier: true, //outlier
          },
        ],
      },
    ]);

    // Verifica le chiamate alle funzioni
    expect(groupMeasurementBySensor).toHaveBeenCalledWith(measurementArray);

    const measurementDTOs = [
      {
        createdAt: new Date("2025-05-20T14:48:00.000Z"),
        value: 10,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:49:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:50:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:51:00.000Z"),
        value: 13,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:52:00.000Z"),
        value: 14,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:53:00.000Z"),
        value: 15,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:54:00.000Z"),
        value: 16,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:55:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:56:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:57:00.000Z"),
        value: 50,
        isOutlier: true, //DA RIVEDERE
      },
    ];

    expect(computeStats).toHaveBeenCalledWith(
      measurementDTOs,
      undefined,
      undefined
    );

    const statsDTO: Stats = {
      mean: 16.4,
      variance: 128.64,
      upperThreshold: 39.08391500601252,
      lowerThreshold: -6.283915006012521,
    };

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      statsDTO,
      measurementDTOs
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: measurementDTOs,
    };

    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);
  });

  /*

  getMeasurementBySensorId

  */

  it("getMeasurementBySensor without query", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getMeasurementsBySensor(
      "NET01",
      "gw1",
      "mac1",
      query
    );
    expect(result).toEqual({
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
    });

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che viene controllata l'esistenza del sensore/gateway/network
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1"
    );

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      undefined,
      undefined
    );

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false,
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      undefined,
      undefined
    );

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

    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);
  });

  it("getMeasurementBySensor with only endDate ", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: undefined,
      endDate: "2025-05-20T14:50:00.000Z",
    };
    const result = await getMeasurementsBySensor(
      "NET01",
      "gw1",
      "mac1",
      query
    );
    expect(result).toEqual({
      sensorMacAddress: "mac1",
      stats: {
        endDate: new Date("2025-05-20T14:50:00.000Z"),
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
    });

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che viene controllata l'esistenza del sensore/gateway/network
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1"
    );

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      undefined,
      new Date("2025-05-20T14:50:00.000Z")
    );

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false,
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      undefined,
      new Date("2025-05-20T14:50:00.000Z")
    );

    const statsDTO: Stats = {
      endDate: new Date("2025-05-20T14:50:00.000Z"),
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

    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);
  });

  it("getMeasurementBySensor with startDate and endDate ", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: "2025-05-20T14:40:00.000Z",
      endDate: "2025-05-20T14:50:00.000Z",
    };
    const result = await getMeasurementsBySensor(
      "NET01",
      "gw1",
      "mac1",
      query
    );
    expect(result).toEqual({
      sensorMacAddress: "mac1",
      stats: {
        startDate: new Date("2025-05-20T14:40:00.000Z"),
        endDate: new Date("2025-05-20T14:50:00.000Z"),
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
    });

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che viene controllata l'esistenza del sensore/gateway/network
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1"
    );

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      new Date("2025-05-20T14:40:00.000Z"),
      new Date("2025-05-20T14:50:00.000Z")
    );

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false,
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      new Date("2025-05-20T14:40:00.000Z"),
      new Date("2025-05-20T14:50:00.000Z")
    );

    const statsDTO: Stats = {
      startDate: new Date("2025-05-20T14:40:00.000Z"),
      endDate: new Date("2025-05-20T14:50:00.000Z"),
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

    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);
  });

  it("getMeasurementBySensor with endDate before startDate: empty array ", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([]);

    const query = {
      startDate: "2025-05-20T14:50:00.000Z",
      endDate: "2025-05-20T14:40:00.000Z",
    };
    const result = await getMeasurementsBySensor(
      "NET01",
      "gw1",
      "mac1",
      query
    );
    expect(result).toEqual({
      sensorMacAddress: "mac1",
    });

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che viene controllata l'esistenza del sensore/gateway/network
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1"
    );

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      new Date("2025-05-20T14:50:00.000Z"),
      new Date("2025-05-20T14:40:00.000Z")
    );

    expect(computeStats).not.toHaveBeenCalled();

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      undefined,
      undefined
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
    };

    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);
  });

  it("getMeasurementBySensor with invalid sensor/gateway/network ", async () => {
    mockSensorRepository.getSensorByMac.mockRejectedValue(
      new NotFoundError("")
    );

    const query = {
      startDate: undefined,
      endDate: undefined,
    };

    await expect(
      getMeasurementsBySensor("NET01", "gw1", "INVALID", query)
    ).rejects.toThrow(NotFoundError);

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che viene controllata l'esistenza del sensore/gateway/network
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "INVALID"
    );

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).not.toHaveBeenCalled();
  });

  /*

  GETSTATSBYNETWORK

  */

  it("getStatsByNetworkId without query", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getStatsByNetwork("NET01", query);
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
      },
    ]);
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che i sensori siano stati cercati (caso senza sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01");

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
      "NET01",
      [testSensorDAO.macAddress],
      undefined,
      undefined
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([testMeasurement]);

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      undefined,
      undefined
    );

    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      statsDTO
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
    };
    expect(createMeasurementsDTO).toHaveReturnedWith(measurementsDTO);
  });

  it("getStatsByNetworkId with sensorArray", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      sensorMacs: "mac1",
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getStatsByNetwork("NET01", query);
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
      },
    ]);
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che i sensori siano stati cercati (caso con sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01", [
      "mac1",
    ]);

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
      "NET01",
      [testSensorDAO.macAddress],
      undefined,
      undefined
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([testMeasurement]);

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      undefined,
      undefined
    );

    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      statsDTO
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
    };
    expect(createMeasurementsDTO).toHaveReturnedWith(measurementsDTO);
  });

  it("getStatsByNetworkId with startDate and endDate", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: "2025-05-20T14:40:00.000Z",
      endDate: "2025-05-20T14:50:00.000Z",
    };
    const result = await getStatsByNetwork("NET01", query);
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          startDate: new Date("2025-05-20T14:40:00.000Z"),
          endDate: new Date("2025-05-20T14:50:00.000Z"),
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
      },
    ]);
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che i sensori siano stati cercati (caso senza sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01");

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
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

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      new Date("2025-05-20T14:40:00.000Z"),
      new Date("2025-05-20T14:50:00.000Z")
    );

    const statsDTO: Stats = {
      startDate: new Date("2025-05-20T14:40:00.000Z"),
      endDate: new Date("2025-05-20T14:50:00.000Z"),
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      statsDTO
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
    };
    expect(createMeasurementsDTO).toHaveReturnedWith(measurementsDTO);
  });

  it("getStatsByNetworkId with multiple sensors", async () => {
    const testSensor2 = { ...testSensorDAO, macAddress: "mac2" };
    const testMeasurement2 = { ...testMeasurement };
    testMeasurement2.sensor = testSensor2;

    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([
      testSensorDAO,
      testSensor2,
    ]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
      testMeasurement2,
    ]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getStatsByNetwork("NET01", query);
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
      },
      {
        sensorMacAddress: "mac2",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
      },
    ]);
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che i sensori siano stati cercati (caso senza sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01");

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
      "NET01",
      ["mac1", "mac2"],
      undefined,
      undefined
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([
      testMeasurement,
      testMeasurement2,
    ]);

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5,
    };
    const measurementDTO2: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5,
    };

    expect(computeStats).toHaveBeenNthCalledWith(
      1,
      [measurementDTO],
      undefined,
      undefined
    );
    expect(computeStats).toHaveBeenNthCalledWith(
      2,
      [measurementDTO2],
      undefined,
      undefined
    );

    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      1,
      testSensorDAO.macAddress,
      statsDTO
    );
    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensor2.macAddress,
      statsDTO
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
    };
    const measurementsDTO2: Measurements = {
      sensorMacAddress: testSensor2.macAddress,
      stats: statsDTO,
    };

    expect(createMeasurementsDTO).toHaveNthReturnedWith(1, measurementsDTO);
    expect(createMeasurementsDTO).toHaveNthReturnedWith(2, measurementsDTO2);
  });

  it("getStatsByNetworkId without measurement", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getStatsByNetwork("NET01", query);
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
      },
    ]);
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che i sensori siano stati cercati (caso senza sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01");

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
      "NET01",
      [testSensorDAO.macAddress],
      undefined,
      undefined
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([]);

    expect(computeStats).not.toHaveBeenCalled();

    expect(createMeasurementsDTO).toHaveBeenCalledWith(
      testSensorDAO.macAddress,
      undefined
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
    };
    expect(createMeasurementsDTO).toHaveReturnedWith(measurementsDTO);
  });

  it("getStatsByNetworkId with invalid sensorArray", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([]);

    const query = {
      sensorMacs: "INVALID",
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getStatsByNetwork("NET01", query);
    expect(result).toEqual([]);
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che i sensori siano stati cercati (caso con sensorArray)
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorsByNetwork).toHaveBeenCalledWith("NET01", [
      "INVALID",
    ]);

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementByNetwork).toHaveBeenCalledWith(
      "NET01",
      [],
      undefined,
      undefined
    );

    expect(groupMeasurementBySensor).toHaveBeenCalledWith([]);

    expect(computeStats).not.toHaveBeenCalled();

    expect(createMeasurementsDTO).not.toHaveBeenCalled();
  });

  /*

  GETSTATSBYSENSOR

  */

  it("getStatsBySensorId without query", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getStatsBySensor("NET01", "gw1", "mac1", query);
    expect(result).toEqual({
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    });

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che viene controllata l'esistenza del sensore/gateway/network
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1"
    );

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      undefined,
      undefined
    );

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      undefined,
      undefined
    );

    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(computeStats).toHaveReturnedWith(statsDTO);
  });

  it("getStatsBySensorId with startDate", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: "2025-05-20T14:40:00.000Z",
      endDate: undefined,
    };
    const result = await getStatsBySensor("NET01", "gw1", "mac1", query);
    expect(result).toEqual({
      startDate: new Date("2025-05-20T14:40:00.000Z"),
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    });

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1"
    );

    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      new Date("2025-05-20T14:40:00.000Z"),
      undefined
    );

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5,
    };

    expect(computeStats).toHaveBeenCalledWith(
      [measurementDTO],
      new Date("2025-05-20T14:40:00.000Z"),
      undefined
    );
  });

  it("getStatsBySensorId with startDate and endDate", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: "2025-05-20T14:40:00.000Z",
      endDate: "2025-05-20T14:50:00.000Z",
    };
    const result = await getStatsBySensor("NET01", "gw1", "mac1", query);
    expect(result).toEqual({
      startDate: new Date("2025-05-20T14:40:00.000Z"),
      endDate: new Date("2025-05-20T14:50:00.000Z"),
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    });

    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      new Date("2025-05-20T14:40:00.000Z"),
      new Date("2025-05-20T14:50:00.000Z")
    );
  });

  it("getStatsBySensorId with invalid sensor mac", async () => {
    mockSensorRepository.getSensorByMac.mockRejectedValue(
      new NotFoundError("Sensor not found")
    );

    const query = {
      startDate: undefined,
      endDate: undefined,
    };

    await expect(
      getStatsBySensor("NET01", "gw1", "invalidMac", query)
    ).rejects.toThrow(NotFoundError);

    expect(
      mockMeasurementRepository.getMeasurementBySensor
    ).not.toHaveBeenCalled();
    expect(computeStats).not.toHaveBeenCalled();
  });

  it("getStatsBySensorId with no measurements", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getStatsBySensor("NET01", "gw1", "mac1", query);
    expect(result).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
    });

    expect(computeStats).not.toHaveBeenCalled();
  });

  it("getStatsBySensorId with multiple measurements", async () => {
    const measurements = [
      { ...testMeasurement, value: 10 },
      { ...testMeasurement, value: 20 },
      { ...testMeasurement, value: 30 },
    ];

    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue(
      measurements
    );

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getStatsBySensor("NET01", "gw1", "mac1", query);
    expect(result).toEqual({
      mean: 20,
      variance: 66.66666666666667,
      upperThreshold: 36.329931618554525,
      lowerThreshold: 3.6700683814454784,
    });

    const measurementDTOs = measurements.map((m) => ({
      createdAt: m.createdAt,
      value: m.value,
    }));

    expect(computeStats).toHaveBeenCalledWith(
      measurementDTOs,
      undefined,
      undefined
    );
  });

  it("getStatsBySensorId with invalid date format", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: "invalid-date",
      endDate: "2025-05-20T14:50:00.000Z",
    };
    const result = await getStatsBySensor("NET01", "gw1", "mac1", query);
    expect(result).toEqual({
      endDate: new Date("2025-05-20T14:50:00.000Z"),
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    });

    expect(
      mockMeasurementRepository.getMeasurementBySensor
    ).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      undefined,
      new Date("2025-05-20T14:50:00.000Z")
    );
  });

  /*

GETOUTLIERSBYNETWORK

*/

  it("getOutliersByNetworkId without query: no outliers", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getOutliersByNetwork("NET01", query);
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5,
        },
      },
    ]);

    const getMeasurementsByNetworkIdSpy = jest.spyOn(
      require("@controllers/measurementController"),
      "getMeasurementsByNetworkId"
    );
    //expect(getMeasurementsByNetworkIdSpy).toHaveBeenCalledWith("NET01", query);

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false, //DA RIGUARDARE
      value: 5,
    };
    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };
    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: [measurementDTO],
    };

    expect(setOUtliers).toHaveBeenCalledTimes(1);
    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      statsDTO,
      []
    );
  });

  it("getOutliersByNetworkId without query: outliers", async () => {
    const measurementArray = [];
    const measurements = [10, 12, 11, 13, 14, 15, 16, 12, 11, 50].map(
      (value, index) => {
        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date(`2025-05-20T14:${48 + index}:00.000Z`);
        measurement.id = index + 1;
        measurement.value = value;
        measurement.sensor = testSensorDAO;
        measurementArray.push(measurement);
      }
    );

    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue(
      measurementArray
    );

    const result = await getOutliersByNetwork("NET01", {});

    // Verifica il risultato
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 16.4,
          variance: 128.64,
          upperThreshold: 39.08391500601252,
          lowerThreshold: -6.283915006012521,
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:57:00.000Z"),
            value: 50,
            isOutlier: true, //outlier
          },
        ],
      },
    ]);

    const measurementDTOs = [
      {
        createdAt: new Date("2025-05-20T14:48:00.000Z"),
        value: 10,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:49:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:50:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:51:00.000Z"),
        value: 13,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:52:00.000Z"),
        value: 14,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:53:00.000Z"),
        value: 15,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:54:00.000Z"),
        value: 16,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:55:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:56:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:57:00.000Z"),
        value: 50,
        isOutlier: true, //DA RIVEDERE
      },
    ];

    expect(computeStats).toHaveBeenCalledWith(
      measurementDTOs,
      undefined,
      undefined
    );

    const statsDTO: Stats = {
      mean: 16.4,
      variance: 128.64,
      upperThreshold: 39.08391500601252,
      lowerThreshold: -6.283915006012521,
    };

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: measurementDTOs,
    };

    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      statsDTO,
      [
        {
          createdAt: new Date("2025-05-20T14:57:00.000Z"),
          value: 50,
          isOutlier: true, //outlier
        },
      ]
    );
  });

  it("getOutliersByNetworkId with sensorArray: outliers", async () => {
    const measurementArray = [];
    const measurements = [10, 12, 11, 13, 14, 15, 16, 12, 11, 50].map(
      (value, index) => {
        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date(`2025-05-20T14:${48 + index}:00.000Z`);
        measurement.id = index + 1;
        measurement.value = value;
        measurement.sensor = testSensorDAO;
        measurementArray.push(measurement);
      }
    );

    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue(
      measurementArray
    );

    const query = {
      sensorMacs: ["mac1"],
    };

    const result = await getOutliersByNetwork("NET01", query);

    // Verifica il risultato
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          mean: 16.4,
          variance: 128.64,
          upperThreshold: 39.08391500601252,
          lowerThreshold: -6.283915006012521,
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:57:00.000Z"),
            value: 50,
            isOutlier: true, //outlier
          },
        ],
      },
    ]);

    const measurementDTOs = [
      {
        createdAt: new Date("2025-05-20T14:48:00.000Z"),
        value: 10,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:49:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:50:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:51:00.000Z"),
        value: 13,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:52:00.000Z"),
        value: 14,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:53:00.000Z"),
        value: 15,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:54:00.000Z"),
        value: 16,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:55:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:56:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:57:00.000Z"),
        value: 50,
        isOutlier: true, //DA RIVEDERE
      },
    ];

    const statsDTO: Stats = {
      mean: 16.4,
      variance: 128.64,
      upperThreshold: 39.08391500601252,
      lowerThreshold: -6.283915006012521,
    };

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: measurementDTOs,
    };

    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      statsDTO,
      [
        {
          createdAt: new Date("2025-05-20T14:57:00.000Z"),
          value: 50,
          isOutlier: true, //outlier
        },
      ]
    );
  });

  it("getOutliersByNetworkId with startDate and endDate: outliers", async () => {
    const measurementArray = [];
    const measurements = [10, 12, 11, 13, 14, 15, 16, 12, 11, 50].map(
      (value, index) => {
        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date(`2025-05-20T14:${48 + index}:00.000Z`);
        measurement.id = index + 1;
        measurement.value = value;
        measurement.sensor = testSensorDAO;
        measurementArray.push(measurement);
      }
    );

    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue(
      measurementArray
    );

    const query = {
      startDate: "2025-05-20T14:30:00.000Z",
      endDate: "2025-05-20T14:58:00.000Z",
    };

    const result = await getOutliersByNetwork("NET01", query);

    // Verifica il risultato
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
        stats: {
          startDate: new Date("2025-05-20T14:30:00.000Z"),
          endDate: new Date("2025-05-20T14:58:00.000Z"),
          mean: 16.4,
          variance: 128.64,
          upperThreshold: 39.08391500601252,
          lowerThreshold: -6.283915006012521,
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:57:00.000Z"),
            value: 50,
            isOutlier: true, //outlier
          },
        ],
      },
    ]);

    const measurementDTOs = [
      {
        createdAt: new Date("2025-05-20T14:48:00.000Z"),
        value: 10,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:49:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:50:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:51:00.000Z"),
        value: 13,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:52:00.000Z"),
        value: 14,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:53:00.000Z"),
        value: 15,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:54:00.000Z"),
        value: 16,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:55:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:56:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:57:00.000Z"),
        value: 50,
        isOutlier: true, //DA RIVEDERE
      },
    ];

    const statsDTO: Stats = {
      startDate: new Date("2025-05-20T14:30:00.000Z"),
      endDate: new Date("2025-05-20T14:58:00.000Z"),
      mean: 16.4,
      variance: 128.64,
      upperThreshold: 39.08391500601252,
      lowerThreshold: -6.283915006012521,
    };

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: measurementDTOs,
    };

    expect(groupMeasurementBySensor).toHaveBeenCalledWith(measurementArray);
    expect(computeStats).toHaveBeenCalledWith(measurementDTOs,new Date("2025-05-20T14:30:00.000Z"),
       new Date("2025-05-20T14:58:00.000Z") );
    expect(setOUtliers).toHaveBeenCalledWith(measurementsDTO);

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      statsDTO,
      [
        {
          createdAt: new Date("2025-05-20T14:57:00.000Z"),
          value: 50,
          isOutlier: true, //outlier
        },
      ]
    );
  });

  it("getOutliersByNetworkId without query: no measurements", async () => {
    mockNetworkRepository.getNetworkByCode.mockResolvedValue(testNetworkDAO);
    mockSensorRepository.getSensorsByNetwork.mockResolvedValue([testSensorDAO]);
    mockMeasurementRepository.getMeasurementByNetwork.mockResolvedValue([]);

    const result = await getOutliersByNetwork("NET01", {});

    // Verifica il risultato
    expect(result).toEqual([
      {
        sensorMacAddress: "mac1",
      },
    ]);

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      undefined,
      undefined
    );
  });

  /*

getOutliersBySensorId

*/

  it("getOutliersBySensorId without query: no outliers", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([
      testMeasurement,
    ]);

    const query = {
      startDate: undefined,
      endDate: undefined,
    };
    const result = await getOutliersBySensor("NET01", "gw1", "mac1", query);
    expect(result).toEqual({
      sensorMacAddress: "mac1",
      stats: {
        mean: 5,
        variance: 0,
        upperThreshold: 5,
        lowerThreshold: 5,
      },
    });

    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      1,
      query.startDate
    );
    expect(utils.parseISODateParamToUTC).toHaveBeenNthCalledWith(
      2,
      query.endDate
    );

    // Verifica che viene controllata l'esistenza del sensore/gateway/network
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1"
    );

    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.getMeasurementBySensor).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "mac1",
      undefined,
      undefined
    );

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      isOutlier: false,
      value: 5,
    };

    const statsDTO: Stats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5,
    };

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      statsDTO,
      []
    );

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: [],
    };

    expect(setOUtliers).toHaveBeenCalledTimes(1);
  });

  it("getOutliersBySensorId without query: outliers", async () => {
    const measurementArray = [];
    const measurements = [10, 12, 11, 13, 14, 15, 16, 12, 11, 50].map(
      (value, index) => {
        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date(`2025-05-20T14:${48 + index}:00.000Z`);
        measurement.id = index + 1;
        measurement.value = value;
        measurement.sensor = testSensorDAO;
        measurementArray.push(measurement);
      }
    );

    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue(
      measurementArray
    );

    const result = await getOutliersBySensor("NET01", "gw1", "mac1", {});

    // Verifica il risultato
    expect(result).toEqual({
      sensorMacAddress: "mac1",
      stats: {
        mean: 16.4,
        variance: 128.64,
        upperThreshold: 39.08391500601252,
        lowerThreshold: -6.283915006012521,
      },
      measurements: [
        {
          createdAt: new Date("2025-05-20T14:57:00.000Z"),
          value: 50,
          isOutlier: true, //outlier
        },
      ],
    });

    const measurementDTOs = [
      {
        createdAt: new Date("2025-05-20T14:48:00.000Z"),
        value: 10,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:49:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:50:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:51:00.000Z"),
        value: 13,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:52:00.000Z"),
        value: 14,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:53:00.000Z"),
        value: 15,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:54:00.000Z"),
        value: 16,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:55:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:56:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:57:00.000Z"),
        value: 50,
        isOutlier: true, //DA RIVEDERE
      },
    ];

    const statsDTO: Stats = {
      mean: 16.4,
      variance: 128.64,
      upperThreshold: 39.08391500601252,
      lowerThreshold: -6.283915006012521,
    };

    expect(setOUtliers).toHaveBeenCalledTimes(1);

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      statsDTO,
      [
        {
          createdAt: new Date("2025-05-20T14:57:00.000Z"),
          value: 50,
          isOutlier: true, //outlier
        },
      ]
    );
  });

  it("getOutliersBySensorId with startDate and endDate: outliers", async () => {
    const measurementArray = [];
    const measurements = [10, 12, 11, 13, 14, 15, 16, 12, 11, 50].map(
      (value, index) => {
        const measurement = new MeasurementDAO();
        measurement.createdAt = new Date(`2025-05-20T14:${48 + index}:00.000Z`);
        measurement.id = index + 1;
        measurement.value = value;
        measurement.sensor = testSensorDAO;
        measurementArray.push(measurement);
      }
    );

    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue(
      measurementArray
    );

    const query = {
      startDate: "2025-05-20T14:30:00.000Z",
      endDate: "2025-05-20T14:58:00.000Z",
    };

    const result = await getOutliersBySensor("NET01", "gw1", "mac1", query);

    // Verifica il risultato
    expect(result).toEqual({
      sensorMacAddress: "mac1",
      stats: {
        startDate: new Date("2025-05-20T14:30:00.000Z"),
        endDate: new Date("2025-05-20T14:58:00.000Z"),
        mean: 16.4,
        variance: 128.64,
        upperThreshold: 39.08391500601252,
        lowerThreshold: -6.283915006012521,
      },
      measurements: [
        {
          createdAt: new Date("2025-05-20T14:57:00.000Z"),
          value: 50,
          isOutlier: true, //outlier
        },
      ],
    });

    const measurementDTOs = [
      {
        createdAt: new Date("2025-05-20T14:48:00.000Z"),
        value: 10,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:49:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:50:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:51:00.000Z"),
        value: 13,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:52:00.000Z"),
        value: 14,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:53:00.000Z"),
        value: 15,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:54:00.000Z"),
        value: 16,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:55:00.000Z"),
        value: 12,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:56:00.000Z"),
        value: 11,
        isOutlier: false,
      },
      {
        createdAt: new Date("2025-05-20T14:57:00.000Z"),
        value: 50,
        isOutlier: true, //DA RIVEDERE
      },
    ];

    const statsDTO: Stats = {
      startDate: new Date("2025-05-20T14:30:00.000Z"),
      endDate: new Date("2025-05-20T14:58:00.000Z"),
      mean: 16.4,
      variance: 128.64,
      upperThreshold: 39.08391500601252,
      lowerThreshold: -6.283915006012521,
    };

    const measurementsDTO: Measurements = {
      sensorMacAddress: testSensorDAO.macAddress,
      stats: statsDTO,
      measurements: measurementDTOs,
    };

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      statsDTO,
      [
        {
          createdAt: new Date("2025-05-20T14:57:00.000Z"),
          value: 50,
          isOutlier: true, //outlier
        },
      ]
    );
  });

  it("getOutliersBySensorId without query: no measurements", async () => {
    mockSensorRepository.getSensorByMac.mockResolvedValue(testSensorDAO);
    mockMeasurementRepository.getMeasurementBySensor.mockResolvedValue([]);

    const result = await getOutliersBySensor("NET01", "gw1", "mac1", {});

    // Verifica il risultato
    expect(result).toEqual({
      sensorMacAddress: "mac1",
    });

    expect(createMeasurementsDTO).toHaveBeenNthCalledWith(
      2,
      testSensorDAO.macAddress,
      undefined,
      []
    );
  });
});
