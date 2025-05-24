import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurement } from "@models/dto/Measurement";
import { NotFoundError } from "@models/errors/NotFoundError";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { SensorRepository } from "@repositories/SensorRepository";
import { createMeasurement } from "@controllers/measurementController";

jest.mock("@repositories/MeasurementRepository");
jest.mock("@services/mapperService");
jest.mock("@controllers/sensorController");

describe("measurementController: mocked repositories and services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  testMeasurement.createdAt = new Date ("2025-05-20T14:48:00.000Z");
  testMeasurement.id = 1;
  testMeasurement.value = 5;
  testMeasurement.sensor = testSensorDAO;

  /*
    CREATE MEASUREMENT
  */
  it("create measurement: success", async () => {
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorByMac: jest.fn().mockResolvedValue(testSensorDAO),
    }));

     (MeasurementRepository as jest.Mock).mockImplementation(() => ({
      createMeasurement: jest.fn().mockResolvedValue(testMeasurement),
    }));
    const measurementDTO: Measurement = {createdAt:new Date ("2025-05-20T14:48:00.000Z"),
      value: 5
    }
    const result = createMeasurement("NET01", "gw1", "mac1", [measurementDTO])
    expect(result).toBeUndefined();
    // Verifica che la funzione sia stata chiamata con i parametri corretti
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.createMeasurement).toHaveBeenCalledWith(
      measurementDTO.createdAt,
      measurementDTO.value,
      "mac1"
    );

    // Verifica che il sensore sia stato cercato
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith("NET01", "gw1", "mac1");
  });

   it("create measurement: invalid network code/ gateway mac/ sensor mac", async () => {
    // Mock getSensorByMac per far lanciare NotFoundError
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorByMac: jest.fn().mockRejectedValue(
        new NotFoundError("Entity not found")
      ),
    }));

    const measurementDTO: Measurement = {
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 5
    };

    // Verifica che createMeasurement propaghi l'errore
    await expect(
      createMeasurement("INVALID", "gw1", "mac1", [measurementDTO])
    ).rejects.toThrow(NotFoundError);

    // Verifica che getSensorByMac sia stato chiamato
    const sensorRepo = new SensorRepository();
    expect(sensorRepo.getSensorByMac).toHaveBeenCalledWith("INVALID", "gw1", "mac1");

    // Verifica che createMeasurement non sia mai stato chiamato
    const measurementRepo = new MeasurementRepository();
    expect(measurementRepo.createMeasurement).not.toHaveBeenCalled();
  });

});