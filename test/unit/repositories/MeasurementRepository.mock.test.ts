import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { SensorDAO } from "@models/dao/SensorDAO";
import { Between, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";

const mockFind = jest.fn();
const mockFindOne = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      findOne: mockFindOne,
      save: mockSave,
      remove: mockRemove
    })
  }
}));

describe("UserRepository: mocked database", () => {
  const repo = new MeasurementRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*
    CREATE MEASUREMENT
  */
  it("create measurement", async () => {
    
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";
    

    const mockDate = new Date("20 May 2025 14:48 UTC");   
   
    mockFindOne.mockResolvedValue(sensor);

    const savedMeasurement = new MeasurementDAO();
    savedMeasurement.id = 1;
    savedMeasurement.createdAt = mockDate;
    savedMeasurement.value = 5;
    savedMeasurement.sensor = sensor;

    mockSave.mockResolvedValue(savedMeasurement);

    const result = await repo.createMeasurement(new Date("20 May 2025 14:48 UTC"), 5, "mac1");

    expect(result).toBeInstanceOf(MeasurementDAO);
    expect(result).toBe(savedMeasurement);
    expect(result.id).toBe(1);
    expect(result.createdAt.toISOString()).toBe("2025-05-20T14:48:00.000Z");
    expect(result.value).toBe(5);
    expect(result.sensor.macAddress).toBe("mac1");
    expect(mockSave).toHaveBeenCalledWith({
      createdAt: mockDate, 
      value: 5, 
      sensor: sensor,
    });
  });

  
  it("create measurement: sensor not found", async () => {   
    mockFindOne.mockResolvedValue(null);

    await expect(
      repo.createMeasurement(new Date("20 May 2025 14:48 UTC"), 5, "mac1")
    ).rejects.toThrow(NotFoundError);
  });

 /*
    GET MEASUREMENTS BY NETWORK
  */
  it("get measurement by network", async () => {

    const network = new NetworkDAO();
    network.id = 1;
    network.code = "NET01";

    const gateway = new GatewayDAO();
    gateway.id = 1;
    gateway.macAddress = "gmac1";
    gateway.network = network;

    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";
    sensor.gateway = gateway;

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor;

    mockFind.mockResolvedValue([foundMeasurement]);

    const result = await repo.getMeasurementByNetworkId("NET01"); 
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0].id).toBe(1);
    expect(result[0].createdAt.toISOString()).toBe("2025-05-20T14:48:00.000Z");
    expect(result[0].value).toBe(5);
    expect(result[0].sensor.macAddress).toBe("mac1");
  });

  it("get measurement by network with list of sensors mac", async () => {

    const network = new NetworkDAO();
    network.id = 1;
    network.code = "NET01";

    const gateway = new GatewayDAO();
    gateway.id = 1;
    gateway.macAddress = "gmac1";
    gateway.network = network;

    const sensor1 = new SensorDAO();
    sensor1.id = 1;
    sensor1.macAddress = "mac1";
    sensor1.name = "sensor1";
    sensor1.description = "description";
    sensor1.variable = "temperature";
    sensor1.unit = "C";
    sensor1.gateway = gateway;

    const sensor2 = new SensorDAO();
    sensor2.id = 1;
    sensor2.macAddress = "mac2";
    sensor2.name = "sensor2";
    sensor2.description = "description";
    sensor2.variable = "temperature";
    sensor2.unit = "C";
    sensor2.gateway = gateway;

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor1;

    const foundMeasurement2 = new MeasurementDAO();
    foundMeasurement2.createdAt = new Date("21 May 2025 14:48 UTC");
    foundMeasurement2.id = 2;
    foundMeasurement2.value = 6;
    foundMeasurement2.sensor = sensor2;

    sensor1.measurements = [foundMeasurement];
    sensor2.measurements =[foundMeasurement2];

    mockFind.mockResolvedValue([foundMeasurement, foundMeasurement2]);
    const result = await repo.getMeasurementByNetworkId("NET01",  ["mac1", "mac2"] );  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0].id).toBe(1);
    expect(result[0].createdAt.toISOString()).toBe("2025-05-20T14:48:00.000Z");
    expect(result[0].value).toBe(5);
    expect(result[0].sensor.macAddress).toBe("mac1");
    expect(result[1].id).toBe(2);
    expect(result[1].createdAt.toISOString()).toBe("2025-05-21T14:48:00.000Z");
    expect(result[1].value).toBe(6);
    expect(result[1].sensor.macAddress).toBe("mac2");
  });

  it("get measurement by network with list of sensors mac with some unvalid sensors", async () => {

    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor;

    mockFind.mockResolvedValue([foundMeasurement]);

    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1", "mac2"]);  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0].id).toBe(1);
    expect(result[0].createdAt.toISOString()).toBe("2025-05-20T14:48:00.000Z");
    expect(result[0].value).toBe(5);
    expect(result[0].sensor.macAddress).toBe("mac1");
  });

    it("get measurement by network with list of sensors mac with all unvalid sensors", async () => {
    //dovrebbe tornare array vuoto
    mockFind.mockResolvedValue([]);

    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1", "mac2"]);  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("get measurement by network with start date and end date", async () => {

    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor;

    const startDate = new Date("2025-05-20T14:40:00.000Z");
    const endDate = new Date("2025-05-20T14:50:00.000Z");

    mockFind.mockResolvedValue([foundMeasurement]);
    //quando non è specificato il set of sensors il controller recupera tutti i sensors del network
    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1"], new Date("2025-05-20T14:40:00.000Z"), new Date("2025-05-20T14:50:00.000Z") );  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0]).toBe(foundMeasurement);

    expect(mockFind).toHaveBeenCalledWith({
      where: { 
        sensor:{ macAddress: In( ["mac1"]) },
        createdAt: Between(startDate, endDate)
    },
    relations: {
        sensor: true,
      }
    });
  });

  it("get measurement by network with list of sensors and start date and end date in local time zone", async () => {

    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor;

    mockFind.mockResolvedValue([foundMeasurement]);

    const result = await repo.getMeasurementByNetworkId("NET01",  ["mac1", "mac2"], new Date( "2025-05-20T15:40:00+01:00"), new Date("2025-05-20T15:50:00+01:00") );  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0]).toStrictEqual(foundMeasurement);
    expect(result[0].createdAt.toISOString()).toBe("2025-05-20T14:48:00.000Z");
  });

  it("get measurement by network with start date and end date in local time zone", async () => {

    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor;

    const startDate = new Date("2025-05-20T14:40:00.000Z");
    const endDate = new Date("2025-05-20T14:50:00.000Z");

    mockFind.mockResolvedValue([foundMeasurement]);

    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1"],  new Date("2025-05-20T15:40:00+01:00"), new Date("2025-05-20T15:50:00+01:00" ) );  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0]).toStrictEqual(foundMeasurement);

    expect(mockFind).toHaveBeenCalledWith({
      where: { 
        sensor:{ macAddress: In( ["mac1"]) },
        createdAt: Between(startDate, endDate)
    },
    relations: {
        sensor: true,
      }
    });
  });

  it("get measurement by network with only start date", async () => {
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor;

    const startDate = new Date("2025-05-20T14:40:00.000Z");

    mockFind.mockResolvedValue([foundMeasurement]);

    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1"], new Date("2025-05-20T14:40:00.000Z"));
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0]).toBe(foundMeasurement);

    expect(mockFind).toHaveBeenCalledWith({
      where: { 
        sensor:{ macAddress: In( ["mac1"]) },
        createdAt: MoreThanOrEqual(startDate)
      },
      relations: {
        sensor: true,
      }
    });
});

it("get measurement by network with only end date", async () => {
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor;

    const endDate = new Date("2025-05-20T14:50:00.000Z");

    mockFind.mockResolvedValue([foundMeasurement]);

    const result = await repo.getMeasurementByNetworkId("NET01",["mac1"], undefined, new Date( "2025-05-20T14:50:00.000Z" ));
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0]).toBe(foundMeasurement);

    expect(mockFind).toHaveBeenCalledWith({
      where: { 
        sensor:{ macAddress: In( ["mac1"]) },
        createdAt: LessThanOrEqual(endDate)
      },
      relations: {
        sensor: true,
      }
    });
});

  it("get measurement by network with list of sensors mac with some unvalid sensors", async () => {

    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";

    const foundMeasurement = new MeasurementDAO();
    foundMeasurement.createdAt = new Date("20 May 2025 14:48 UTC");
    foundMeasurement.id = 1;
    foundMeasurement.value = 5;
    foundMeasurement.sensor = sensor;

    mockFind.mockResolvedValue([foundMeasurement]);

    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1", "mac2"]);  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(MeasurementDAO);
    expect(result[0].id).toBe(1);
    expect(result[0].createdAt.toISOString()).toBe("2025-05-20T14:48:00.000Z");
    expect(result[0].value).toBe(5);
    expect(result[0].sensor.macAddress).toBe("mac1");
  });

    it("get measurement by network with list of sensors mac with all empty string", async () => {
    mockFind.mockResolvedValue([]);

    const result = await repo.getMeasurementByNetworkId("NET01", ["", ""]);  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

 /*
    GET MEASUREMENTS BY SENSOR
  */

 it("get measurements by sensor with no date filters", async () => {
    const network = new NetworkDAO();
    network.id = 1;
    network.code = "NET01";
    
    const gateway = new GatewayDAO();
    gateway.id = 1;
    gateway.macAddress = "gmac1";
    gateway.network = network;
    
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.gateway = gateway;  
  
    const measurement = new MeasurementDAO();
    measurement.id = 1;
    measurement.createdAt = new Date("2025-05-20T14:48:00.000Z");
    measurement.value = 25.5;
    measurement.sensor = sensor;

    mockFind.mockResolvedValue([measurement]);

    const result = await repo.getMeasurementBySensorMac(
      "NET01",
      "gmac1",
      "mac1",
    );

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(25.5);
    expect(result[0].sensor.macAddress).toBe("mac1");
  });

  it("get measurements by sensor with start and end date", async () => {
    const network = new NetworkDAO();
    network.id = 1;
    network.code = "NET01";
    
    const gateway = new GatewayDAO();
    gateway.id = 1;
    gateway.macAddress = "gmac1";
    gateway.network = network;
    
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.gateway = gateway;  
    
    const measurement = new MeasurementDAO();
    measurement.id = 1;
    measurement.createdAt = new Date("2025-05-20T14:48:00.000Z");
    measurement.value = 25.5;
    measurement.sensor = sensor;

    mockFind.mockResolvedValue([measurement]);

    const result = await repo.getMeasurementBySensorMac(
      "NET01",
      "gmac1",
      "mac1",
      new Date( "2025-05-20T00:00:00.000Z"),
      new Date("2025-05-21T00:00:00.000Z")
    );

    expect(result).toHaveLength(1);
    expect(mockFind).toHaveBeenCalledWith(
      {
        where: expect.objectContaining({
          createdAt: expect.any(Object)
        }),
        relations: { sensor: { gateway: { network: true } } },
      }
    );
  });

  it("get measurements by sensor with only start date", async () => {
        const network = new NetworkDAO();
    network.id = 1;
    network.code = "NET01";
    
    const gateway = new GatewayDAO();
    gateway.id = 1;
    gateway.macAddress = "gmac1";
    gateway.network = network;
    
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.gateway = gateway;  

    const measurement = new MeasurementDAO();
    measurement.id = 1;
    measurement.createdAt = new Date("2025-05-20T14:48:00.000Z");
    measurement.value = 25.5;
    measurement.sensor = sensor;

    mockFind.mockResolvedValue([measurement]);

    const result = await repo.getMeasurementBySensorMac(
      "NET01",
      "gmac1",
      "mac1",
      
        new Date( "2025-05-20T00:00:00.000Z")
      
    );

    expect(result).toHaveLength(1);
    expect(mockFind).toHaveBeenCalledWith(
      {
        where: expect.objectContaining({
          createdAt: expect.any(Object)
        }),
        relations: { sensor: { gateway: { network: true } } },
      }
    );
  });

  it("get measurements by sensor with only end date", async () => {
        const network = new NetworkDAO();
    network.id = 1;
    network.code = "NET01";
    
    const gateway = new GatewayDAO();
    gateway.id = 1;
    gateway.macAddress = "gmac1";
    gateway.network = network;
    
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.gateway = gateway;  

    const measurement = new MeasurementDAO();
    measurement.id = 1;
    measurement.createdAt = new Date("2025-05-20T14:48:00.000Z");
    measurement.value = 25.5;
    measurement.sensor = sensor;

    mockFind.mockResolvedValue([measurement]);

    const result = await repo.getMeasurementBySensorMac(
      "NET01",
      "gmac1",
      "mac1",
      
        new Date( "2025-05-21T00:00:00.000Z")
      
    );

    expect(result).toHaveLength(1);
    expect(mockFind).toHaveBeenCalledWith(
      {
        where: expect.objectContaining({
          createdAt: expect.any(Object)
        }),
        relations: { sensor: { gateway: { network: true } } },
      }
    );
  });

  it("get measurements by sensor : empty array when no measurements found", async () => {
    mockFind.mockResolvedValue([]);

    const result = await repo.getMeasurementBySensorMac(
      "NET01",
      "gmac1",
      "mac1",
     
    );

    expect(result).toHaveLength(0);
  });

  it("get measurements by sensor with more than one measurements", async () => {
        const network = new NetworkDAO();
    network.id = 1;
    network.code = "NET01";
    
    const gateway = new GatewayDAO();
    gateway.id = 1;
    gateway.macAddress = "gmac1";
    gateway.network = network;
    
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    sensor.gateway = gateway;  

    const measurement1 = new MeasurementDAO();
    measurement1.id = 1;
    measurement1.createdAt = new Date("2025-05-20T14:48:00.000Z");
    measurement1.value = 25.5;
    measurement1.sensor = sensor;

    const measurement2 = new MeasurementDAO();
    measurement2.id = 2;
    measurement2.createdAt = new Date("2025-05-20T14:48:00.000Z");
    measurement2.value = 30.0;
    measurement2.sensor = sensor;

    mockFind.mockResolvedValue([measurement1, measurement2]);

    const result = await repo.getMeasurementBySensorMac(
      "NET01",
      "gmac1",
      "mac1",
    
    );

    expect(result).toHaveLength(2);
    expect(result[0].sensor.macAddress).toBe("mac1");
    expect(result[0].id).toBe(1);
    expect(result[1].sensor.macAddress).toBe("mac1");
    expect(result[1].id).toBe(2);
  });

});

