import { MeasurementRepository  } from "@repositories/MeasurementRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(MeasurementDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(SensorDAO).clear();
});


describe("MeasurementRepository: SQLite in-memory", () => {
  const repo = new MeasurementRepository();

    it("get measurement by network with list of sensors mac with all sensors of other networks", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    await networkRepo.save({
      code: "NET01",
      name: "Test Network",
      description: "Test description"
    });
  
    //dovrebbe tornare array vuoto
    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1", "mac2"]);  
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("get measurements by network with list of sensors mac with no measurements", async () => {
    // Setup: create network and sensors but no measurements
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({
      code: "NET01",
      name: "Test Network",
      description: "Test description"
    });

    const gateway = await gatewayRepo.save({
      macAddress: "00:11:22:33:44:55",
      network: network
    });

    await sensorRepo.save([
      {
        macAddress: "mac1",
        name: "Sensor 1",
        gateway: gateway
      },
      {
        macAddress: "mac2",
        name: "Sensor 2",
        gateway: gateway
      }
    ]);

    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1", "mac2"]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("create and retrieve multiple measurements for the same sensor", async () => {
    // Setup: create network, gateway, sensor
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({
      code: "NET01",
      name: "Test Network",
      description: "Test description"
    });

    const gateway = await gatewayRepo.save({
      macAddress: "00:11:22:33:44:55",
      network: network
    });

    await sensorRepo.save({
      macAddress: "mac1",
      name: "Sensor 1",
      description: "Test sensor 1",
      variable: "temperature",
      unit: "C",
      gateway: gateway
    });

    // Create multiple measurements
    await repo.createMeasurement(new Date("2025-05-20T14:48:00.000Z"), 20.5, "mac1"),
    await repo.createMeasurement(new Date("2025-05-20T14:49:00.000Z"), 21.0, "mac1"),
    await repo.createMeasurement(new Date("2025-05-20T14:50:00.000Z"), 21.5, "mac1")
    

    // Retrieve and verify
    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1"]);
    expect(result.length).toBe(3);
    expect(result.map(m => m.value)).toEqual([20.5, 21.0, 21.5]);
    expect(result[0]).toEqual({
      id: expect.any(Number),
      createdAt: new Date("2025-05-20T14:48:00.000Z"),
      value: 20.5,
      sensor: {
        id: expect.any(Number),
        macAddress: "mac1",
        name: "Sensor 1",
        description: "Test sensor 1",
        variable: "temperature",
        unit: "C",
        gateway: undefined,
        measurements: undefined
      } as SensorDAO
    } as MeasurementDAO)
  });

});
