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
});


describe("MeasurementRepository: SQLite in-memory", () => {
  const repo = new MeasurementRepository();
/*
  it("create measurement", async () => {
    const measurement = await repo.createMeasurement(new Date("20 May 2025 14:48 UTC"), 5, UserType.Admin);
    expect(user).toMatchObject({
      username: "john",
      password: "pass123",
      type: UserType.Admin
    });

    const found = await repo.getUserByUsername("john");
    expect(found.username).toBe("john");
  });

  it("find user by username: not found", async () => {
    await expect(repo.getUserByUsername("ghost")).rejects.toThrow(
      NotFoundError
    );
  });

  it("create user: conflict", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);
    await expect(
      repo.createUser("john", "anotherpass", UserType.Viewer)
    ).rejects.toThrow(ConflictError);
  });
  */
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

  it("should get measurements by network with list of sensors mac with no measurements", async () => {
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
        description: "Test sensor 1",
        variable: "temperature",
        unit: "C",
        gateway: gateway
      },
      {
        macAddress: "mac2",
        name: "Sensor 2",
        description: "Test sensor 2",
        variable: "humidity",
        unit: "%",
        gateway: gateway
      }
    ]);

    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1", "mac2"]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should get measurements by network with invalid network code", async () => {
    const result = await repo.getMeasurementByNetworkId("INVALID");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should create and retrieve multiple measurements for the same sensor", async () => {
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

    const sensor = await sensorRepo.save({
      macAddress: "mac1",
      name: "Sensor 1",
      description: "Test sensor 1",
      variable: "temperature",
      unit: "C",
      gateway: gateway
    });

    // Create multiple measurements
    const measurements = [
      await repo.createMeasurement(new Date("2025-05-20T14:48:00.000Z"), 20.5, "mac1"),
      await repo.createMeasurement(new Date("2025-05-20T14:49:00.000Z"), 21.0, "mac1"),
      await repo.createMeasurement(new Date("2025-05-20T14:50:00.000Z"), 21.5, "mac1")
    ];

    // Retrieve and verify
    const result = await repo.getMeasurementByNetworkId("NET01", ["mac1"]);
    expect(result.length).toBe(3);
    expect(result.map(m => m.value)).toEqual([20.5, 21.0, 21.5]);
  });

  it("should get measurements with timezone different from UTC", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({
      code: "NET01",
      name: "Test Network"
    });

    const gateway = await gatewayRepo.save({
      macAddress: "00:11:22:33:44:55",
      network: network
    });

    const sensor = await sensorRepo.save({
      macAddress: "mac1",
      name: "Sensor 1",
      variable: "temperature",
      unit: "C",
      gateway: gateway
    });

    // Create a measurement at UTC time
    await repo.createMeasurement(new Date("2025-05-20T12:00:00.000Z"), 20.5, "mac1");

    // Query using a different timezone (UTC+2)
    const result = await repo.getMeasurementByNetworkId(
      "NET01", 
      ["mac1"],
      new Date("2025-05-20T13:00:00+02:00"),
      new Date("2025-05-20T15:00:00+02:00")
    );

    expect(result.length).toBe(1);
    expect(result[0].value).toBe(20.5);
  });

});
