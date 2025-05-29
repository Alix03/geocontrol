import * as sensorController from "@controllers/SensorController";
import { SensorRepository } from "@repositories/SensorRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { SensorDAO } from "@models/dao/SensorDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import AppError from "@models/errors/AppError";

jest.mock("@repositories/SensorRepository");
jest.mock("@repositories/GatewayRepository");
jest.mock("@repositories/NetworkRepository");

describe("SensorController integration", () => {
  let mockSensorRepository: jest.Mocked<SensorRepository>;
  let mockGatewayRepository: jest.Mocked<GatewayRepository>;
  let mockNetworkRepository: jest.Mocked<NetworkRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSensorRepository = {
      getAllSensors: jest.fn(),
      getSensorByMac: jest.fn(),
      createSensor: jest.fn(),
      updateSensor: jest.fn(),
      deleteSensor: jest.fn(),
    } as any;

    mockGatewayRepository = {
      getGatewayByMac: jest.fn(),
      getAllGateways: jest.fn(),
      createGateway: jest.fn(),
      deleteGateway: jest.fn(),
      updateGateway: jest.fn(),
    } as any;

    mockNetworkRepository = {
      getNetworkByCode: jest.fn(),
      getAllNetworks: jest.fn(),
      createNetwork: jest.fn(),
      deleteNetwork: jest.fn(),
      updateNetwork: jest.fn(),
    } as any;

    (SensorRepository as jest.Mock).mockImplementation(
      () => mockSensorRepository
    );
    (GatewayRepository as jest.Mock).mockImplementation(
      () => mockGatewayRepository
    );
    (NetworkRepository as jest.Mock).mockImplementation(
      () => mockNetworkRepository
    );
  });

  describe("Create sensor", () => {
    it("Create sensor: succes", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const fakeSensorDAO = {
        id: 1,
        macAddress: "SENSOR_MAC",
        name: "Test Sensor",
        description: "Test Sensor Description",
        variable: "Temperature",
        unit: "Celsius",
      } as SensorDAO;

      const sensorDto = {
        macAddress: "SENSOR_MAC",
        name: "Test Sensor",
        description: "Test Sensor Description",
        variable: "Temperature",
        unit: "Celsius",
      };

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.createSensor.mockResolvedValue(fakeSensorDAO);

      // Act
      await sensorController.createSensor(networkCode, gatewayMac, sensorDto);

      // Assert
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledTimes(1);
      expect(mockSensorRepository.createSensor).toHaveBeenCalledWith(
        gatewayMac,
        sensorDto.macAddress,
        sensorDto.name,
        sensorDto.description,
        sensorDto.variable,
        sensorDto.unit
      );
    });

    it("Create sensor with only required fields", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorDto = {
        macAddress: "SENSOR_MAC",
        name: "Test Sensor", // Campo obbligatorio
        description: undefined, // Campo opzionale
        variable: undefined, // Campo opzionale
        unit: undefined, // Campo opzionale
      };

      const fakeSensorDAO = {
        id: 1,
        macAddress: "SENSOR_MAC",
        name: "Test Sensor",
        description: null,
        variable: null,
        unit: null,
      } as SensorDAO;

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.createSensor.mockResolvedValue(fakeSensorDAO);

      // Act
      await sensorController.createSensor(networkCode, gatewayMac, sensorDto);

      // Assert
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.createSensor).toHaveBeenCalledWith(
        gatewayMac,
        sensorDto.macAddress,
        sensorDto.name,
        sensorDto.description,
        sensorDto.variable,
        sensorDto.unit
      );
    });

    it("should throw an error if the sensor already exists", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorDto = {
        macAddress: "SENSOR_MAC",
        name: "Test Sensor",
        description: "Test Sensor Description",
        variable: "Temperature",
        unit: "Celsius",
      };

      const fakeSensorDAO = {
        id: 1,
        macAddress: "SENSOR_MAC",
        name: "Test Sensor",
        description: "Test Sensor Description",
        variable: "Temperature",
        unit: "Celsius",
      } as SensorDAO;

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      // Simula un errore quando si tenta di creare un sensore con un MAC già esistente
      mockSensorRepository.createSensor.mockRejectedValue(
        new ConflictError("Sensor with this MAC address already exists")
      );

      // Act & Assert
      await expect(
        sensorController.createSensor(networkCode, gatewayMac, sensorDto)
      ).rejects.toThrow(ConflictError);

      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.createSensor).toHaveBeenCalledWith(
        gatewayMac,
        sensorDto.macAddress,
        sensorDto.name,
        sensorDto.description,
        sensorDto.variable,
        sensorDto.unit
      );
    });

    it("should throw an error if MAC Address is unreadable", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorDto = {
        macAddress: "    \t   \n",
        name: "Test Sensor",
        description: "Test Sensor Description",
        variable: "Temperature",
        unit: "Celsius",
      };

      const fakeSensorDAO = {
        id: 1,
        macAddress: "SENSOR_MAC",
        name: "Test Sensor",
        description: "Test Sensor Description",
        variable: "Temperature",
        unit: "Celsius",
      } as SensorDAO;

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);


      // Act & Assert
      await expect(
        sensorController.createSensor(networkCode, gatewayMac, sensorDto)
      ).rejects.toThrow(AppError);
    });
  });

  describe("Get sensor", () => {
    it("Get sensor: success", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "SENSOR_MAC";

      const fakeSensorDAO = {
        macAddress: "SENSOR_MAC",
        name: "Test Sensor",
        description: "Test Sensor Description",
        variable: "Temperature",
        unit: "Celsius",
      } as SensorDAO;

      const expectedDTO = {
        macAddress: fakeSensorDAO.macAddress,
        name: fakeSensorDAO.name,
        description: fakeSensorDAO.description,
        variable: fakeSensorDAO.variable,
        unit: fakeSensorDAO.unit,
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.getSensorByMac.mockResolvedValue(fakeSensorDAO);

      // Act
      const result = await sensorController.getSensor(
        networkCode,
        gatewayMac,
        sensorMac
      );

      // Assert
      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.getSensorByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        sensorMac
      );
      expect(result).toEqual(expectedDTO);
    });

    it("should throw an error if the network does not exist", async () => {
      // Arrange
      const networkCode = "INVALID_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "SENSOR_MAC";

      mockNetworkRepository.getNetworkByCode.mockRejectedValue(
        new NotFoundError("Network not found")
      );

      // Act & Assert
      await expect(
        sensorController.getSensor(networkCode, gatewayMac, sensorMac)
      ).rejects.toThrow(NotFoundError);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).not.toHaveBeenCalled();
      expect(mockSensorRepository.getSensorByMac).not.toHaveBeenCalled();
    });

    it("should throw an error if the gateway does not exist", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "INVALID_GATEWAY";
      const sensorMac = "SENSOR_MAC";

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockRejectedValue(
        new NotFoundError("Gateway not found")
      );

      // Act & Assert
      await expect(
        sensorController.getSensor(networkCode, gatewayMac, sensorMac)
      ).rejects.toThrow(NotFoundError);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.getSensorByMac).not.toHaveBeenCalled();
    });
  });

  describe("Get all sensors", () => {
    it("Get all sensors: success", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";

      const fakeSensorDAO1 = {
        macAddress: "SENSOR_MAC_1",
        name: "Sensor 1",
        description: "Description 1",
        variable: "Temperature",
        unit: "Celsius",
      } as SensorDAO;

      const fakeSensorDAO2 = {
        macAddress: "SENSOR_MAC_2",
        name: "Sensor 2",
        description: "Description 2",
        variable: "Humidity",
        unit: "Percentage",
      } as SensorDAO;

      const expectedDTO1 = {
        macAddress: fakeSensorDAO1.macAddress,
        name: fakeSensorDAO1.name,
        description: fakeSensorDAO1.description,
        variable: fakeSensorDAO1.variable,
        unit: fakeSensorDAO1.unit,
      };

      const expectedDTO2 = {
        macAddress: fakeSensorDAO2.macAddress,
        name: fakeSensorDAO2.name,
        description: fakeSensorDAO2.description,
        variable: fakeSensorDAO2.variable,
        unit: fakeSensorDAO2.unit,
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.getAllSensors.mockResolvedValue([
        fakeSensorDAO1,
        fakeSensorDAO2,
      ]);

      // Act
      const result = await sensorController.getAllSensors(
        networkCode,
        gatewayMac
      );

      // Assert
      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.getAllSensors).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );

      // Verifica che il risultato corrisponda agli oggetti DTO attesi
      expect(result).toEqual([expectedDTO1, expectedDTO2]);
    });

    it("should throw an error if the network does not exist", async () => {
      // Arrange
      const networkCode = "INVALID_NET";
      const gatewayMac = "GATEWAY_MAC";

      mockNetworkRepository.getNetworkByCode.mockRejectedValue(
        new NotFoundError("Network not found")
      );

      // Act & Assert
      await expect(
        sensorController.getAllSensors(networkCode, gatewayMac)
      ).rejects.toThrow(NotFoundError);
      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).not.toHaveBeenCalled();
      expect(mockSensorRepository.getAllSensors).not.toHaveBeenCalled();
    });

    it("should throw an error if the gateway does not exist", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "INVALID_GATEWAY";

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockRejectedValue(
        new NotFoundError("Gateway not found")
      );

      // Act & Assert
      await expect(
        sensorController.getAllSensors(networkCode, gatewayMac)
      ).rejects.toThrow(NotFoundError);
      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.getAllSensors).not.toHaveBeenCalled();
    });

    it("should return an empty array if no sensors are found", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.getAllSensors.mockResolvedValue([]);

      // Act
      const result = await sensorController.getAllSensors(
        networkCode,
        gatewayMac
      );

      // Assert
      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.getAllSensors).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(result).toHaveLength(0);
    });
  });

  describe("Delete sensor", () => {
    it("Delete sensor: success", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "SENSOR_MAC";

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.deleteSensor.mockResolvedValue();

      // Act
      await sensorController.deleteSensor(networkCode, gatewayMac, sensorMac);

      // Assert
      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.deleteSensor).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        sensorMac
      );
    });

    it("should throw an error if the network does not exist", async () => {
      // Arrange
      const networkCode = "INVALID_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "SENSOR_MAC";

      mockNetworkRepository.getNetworkByCode.mockRejectedValue(
        new NotFoundError("Network not found")
      );

      // Act & Assert
      await expect(
        sensorController.deleteSensor(networkCode, gatewayMac, sensorMac)
      ).rejects.toThrow(NotFoundError);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).not.toHaveBeenCalled();
      expect(mockSensorRepository.deleteSensor).not.toHaveBeenCalled();
    });

    it("should throw an error if the gateway does not exist", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "INVALID_GATEWAY";
      const sensorMac = "SENSOR_MAC";

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockRejectedValue(
        new NotFoundError("Gateway not found")
      );

      // Act & Assert
      await expect(
        sensorController.deleteSensor(networkCode, gatewayMac, sensorMac)
      ).rejects.toThrow(NotFoundError);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.deleteSensor).not.toHaveBeenCalled();
    });

    it("should throw an error if the sensor does not exist", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "INVALID_SENSOR";

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.deleteSensor.mockRejectedValue(
        new NotFoundError("Sensor not found")
      );

      // Act & Assert
      await expect(
        sensorController.deleteSensor(networkCode, gatewayMac, sensorMac)
      ).rejects.toThrow(NotFoundError);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.deleteSensor).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        sensorMac
      );
    });
  });

  describe("Update sensor", () => {
    it("should update a sensor successfully", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "SENSOR_MAC";
      const updatedSensorDto = {
        macAddress: "UPDATED_SENSOR_MAC",
        name: "Updated Sensor",
        description: "Updated Description",
        variable: "Pressure",
        unit: "Pascal",
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.updateSensor.mockResolvedValue(undefined);

      // Act
      await sensorController.updateSensor(
        networkCode,
        gatewayMac,
        sensorMac,
        updatedSensorDto
      );

      // Assert
      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.updateSensor).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        sensorMac,
        updatedSensorDto.macAddress,
        updatedSensorDto.name,
        updatedSensorDto.description,
        updatedSensorDto.variable,
        updatedSensorDto.unit
      );
    });

    it("should throw an error if the network does not exist", async () => {
      // Arrange
      const networkCode = "INVALID_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "SENSOR_MAC";
      const updatedSensorDto = {
        macAddress: "UPDATED_SENSOR_MAC",
        name: "Updated Sensor",
        description: "Updated Description",
        variable: "Pressure",
        unit: "Pascal",
      };

      mockNetworkRepository.getNetworkByCode.mockRejectedValue(
        new NotFoundError("Network not found")
      );

      // Act & Assert
      await expect(
        sensorController.updateSensor(
          networkCode,
          gatewayMac,
          sensorMac,
          updatedSensorDto
        )
      ).rejects.toThrow(NotFoundError);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).not.toHaveBeenCalled();
      expect(mockSensorRepository.updateSensor).not.toHaveBeenCalled();
    });

    it("should throw an error if the gateway does not exist", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "INVALID_GATEWAY";
      const sensorMac = "SENSOR_MAC";
      const updatedSensorDto = {
        macAddress: "UPDATED_SENSOR_MAC",
        name: "Updated Sensor",
        description: "Updated Description",
        variable: "Pressure",
        unit: "Pascal",
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockRejectedValue(
        new NotFoundError("Gateway not found")
      );

      // Act & Assert
      await expect(
        sensorController.updateSensor(
          networkCode,
          gatewayMac,
          sensorMac,
          updatedSensorDto
        )
      ).rejects.toThrow(NotFoundError);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.updateSensor).not.toHaveBeenCalled();
    });

    it("should throw an error if the sensor does not exist", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "INVALID_SENSOR";
      const updatedSensorDto = {
        macAddress: "UPDATED_SENSOR_MAC",
        name: "Updated Sensor",
        description: "Updated Description",
        variable: "Pressure",
        unit: "Pascal",
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue({
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
      } as NetworkDAO);

      mockGatewayRepository.getGatewayByMac.mockResolvedValue({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
      } as GatewayDAO);

      mockSensorRepository.updateSensor.mockRejectedValue(
        new NotFoundError("Sensor not found")
      );

      // Act & Assert
      await expect(
        sensorController.updateSensor(
          networkCode,
          gatewayMac,
          sensorMac,
          updatedSensorDto
        )
      ).rejects.toThrow(NotFoundError);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(
        networkCode
      );
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
      expect(mockSensorRepository.updateSensor).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        sensorMac,
        updatedSensorDto.macAddress,
        updatedSensorDto.name,
        updatedSensorDto.description,
        updatedSensorDto.variable,
        updatedSensorDto.unit
      );
    });
    it("should throw an error if the sensor does not exist", async () => {
      // Arrange
      const networkCode = "TEST_NET";
      const gatewayMac = "GATEWAY_MAC";
      const sensorMac = "INVALID_SENSOR";
      const updatedSensorDto = {
        macAddress: "     \t   \n  ",
        name: "Updated Sensor",
        description: "Updated Description",
        variable: "Pressure",
        unit: "Pascal",
      };


      // Act & Assert
      await expect(
        sensorController.updateSensor(
          networkCode,
          gatewayMac,
          sensorMac,
          updatedSensorDto
        )
      ).rejects.toThrow(AppError);
    });
  });
});
