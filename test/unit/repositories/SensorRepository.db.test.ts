import { SensorRepository } from "@repositories/SensorRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource,
} from "@test/setup/test-datasource";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { createNetwork } from "@controllers/networkController";

// Helper function to create a test network
const createTestNetwork = async (code: string = "TEST_NET") => {
  const networkRepo = TestDataSource.getRepository(NetworkDAO);
  return await networkRepo.save({
    code,
    name: "Test Network",
    description: "Test description",
  });
};
// Helper function to create a test gateway
const createTestGateway = async (
  networkCode: string,
  macAddress: string = "GATEWAY_MAC"
) => {
  const networkRepo = TestDataSource.getRepository(NetworkDAO);
  const gatewayRepo = TestDataSource.getRepository(GatewayDAO);

  // Trova o crea la rete associata
  let network = await networkRepo.findOne({ where: { code: networkCode } });
  if (!network) {
    network = await networkRepo.save({
      code: networkCode,
      name: "Test Network",
      description: "Test description",
    });
  }

  // Crea e salva il gateway
  return await gatewayRepo.save({
    macAddress,
    name: "Test Gateway",
    description: "Test Gateway Description",
    network: network,
  });
};

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(NetworkDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(SensorDAO).clear();
});

const repo = new SensorRepository();

//INIZIO TEST
describe("SensorRepository: SQLite in-memory", () => {
  it("Create new Sensor: success", async () => {
    // Create a test network
    const network = await createTestNetwork("TEST_NET");

    // Create a test gateway associated with the network
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Create a sensor associated with the gateway
    const sensor = await repo.createSensor(
      gateway.macAddress,
      "SENSOR_MAC",
      "Test Sensor",
      "Test Sensor Description",
      "Temperature",
      "Celsius"
    );

    // Verify that the sensor was created successfully
    expect(network.code).toBe("TEST_NET");
    expect(gateway.macAddress).toBe("GATEWAY_MAC");
    expect(sensor.macAddress).toBe("SENSOR_MAC");
    expect(sensor.name).toBe("Test Sensor");
    expect(sensor.description).toBe("Test Sensor Description");
    expect(sensor.variable).toBe("Temperature");
    expect(sensor.unit).toBe("Celsius");
  });

  it("Create new Sensor (solo campi obbligatori): success", async () => {
    // Create a test network
    const network = await createTestNetwork("TEST_NET");

    // Create a test gateway associated with the network
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Create a sensor with only mandatory fields
    const sensor = await repo.createSensor(gateway.macAddress, "SENSOR_MAC");

    // Verify that the sensor was created successfully
    //expect(network.code).toBe("TEST_NET");
    expect(gateway.macAddress).toBe("GATEWAY_MAC");
    expect(sensor.macAddress).toBe("SENSOR_MAC");
    expect(sensor.name).toBeNull();
    expect(sensor.description).toBeNull();
    expect(sensor.variable).toBeNull();
    expect(sensor.unit).toBeNull();
  });

  it("Create new Sensor: MacAddress già esistente associato ad un altro sensore", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Create a sensor with a specific MAC address
    await repo.createSensor(
      gateway.macAddress,
      "SENSOR_MAC",
      "Test Sensor",
      "Test Sensor Description",
      "Temperature",
      "Celsius"
    );
    // Attempt to create another sensor with the same MAC address
    await expect(
      repo.createSensor(
        gateway.macAddress,
        "SENSOR_MAC",
        "Duplicate Sensor",
        "Duplicate Sensor Description",
        "Humidity",
        "Percentage"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("Create new Sensor: MacAddress già esistente associato ad un gateway", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Attempt to create another sensor with the same MAC address
    await expect(
      repo.createSensor(
        gateway.macAddress,
        "GATEWAY_MAC",
        "Duplicate Sensor",
        "Duplicate Sensor Description",
        "Humidity",
        "Percentage"
      )
    ).rejects.toThrow(ConflictError);
  });
});

describe("Get Sensor By macAddress", () => {
  it("Get Sensor By macAddress: success", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    // Create a sensor associated with the gateway
    await sensorRepo.save({
      macAddress: "SENSOR_MAC",
      name: "Test Sensor",
      description: "Test description",
      variable: "Temperature",
      unit: "Celsius",
      network,
      gateway,
    });

    const sensor = await repo.getSensorByMac(
      network.code,
      gateway.macAddress,
      "SENSOR_MAC"
    );
    expect(sensor.macAddress).toBe("SENSOR_MAC");
    expect(sensor.name).toBe("Test Sensor");
    expect(sensor.description).toBe("Test description");
    expect(sensor.variable).toBe("Temperature");
    expect(sensor.unit).toBe("Celsius");
  });

  it("Get Sensor By macAddress: macAddress inesistente", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Attempt to get a sensor with a non-existent macAddress
    await expect(
      repo.getSensorByMac(network.code, gateway.macAddress, "NON_EXISTENT_MAC")
    ).rejects.toThrow(NotFoundError);
  });

  it("Restituisce tutti i sensori associati alla rete quando sensorArray è undefined", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    // Crea sensori associati alla rete
    await sensorRepo.save({
      macAddress: "SENSOR_MAC_1",
      name: "Sensor 1",
      description: "Description 1",
      variable: "Temperature",
      unit: "Celsius",
      gateway,
    });

    await sensorRepo.save({
      macAddress: "SENSOR_MAC_2",
      name: "Sensor 2",
      description: "Description 2",
      variable: "Humidity",
      unit: "Percentage",
      gateway,
    });

    // Chiama il metodo con sensorArray undefined
    const sensors = await repo.getSensorsByNetwork(network.code);

    // Verifica che tutti i sensori siano restituiti
    expect(sensors.length).toBe(2);
    expect(sensors[0].macAddress).toBe("SENSOR_MAC_1");
    expect(sensors[1].macAddress).toBe("SENSOR_MAC_2");
  });

  it("Restituisce solo i sensori specificati in sensorArray", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    // Crea sensori associati alla rete
    await sensorRepo.save({
      macAddress: "SENSOR_MAC_1",
      name: "Sensor 1",
      description: "Description 1",
      variable: "Temperature",
      unit: "Celsius",
      gateway,
    });

    await sensorRepo.save({
      macAddress: "SENSOR_MAC_2",
      name: "Sensor 2",
      description: "Description 2",
      variable: "Humidity",
      unit: "Percentage",
      gateway,
    });

    await sensorRepo.save({
      macAddress: "SENSOR_MAC_3",
      name: "Sensor 3",
      description: "Description 3",
      variable: "Pressure",
      unit: "Pascal",
      gateway,
    });

    // Chiama il metodo con sensorArray contenente alcuni MAC address
    const sensors = await repo.getSensorsByNetwork(network.code, [
      "SENSOR_MAC_1",
      "SENSOR_MAC_3",
    ]);

    // Verifica che solo i sensori specificati siano restituiti
    expect(sensors.length).toBe(2);
    expect(sensors[0].macAddress).toBe("SENSOR_MAC_1");
    expect(sensors[1].macAddress).toBe("SENSOR_MAC_3");
  });
});

describe("Get all Sensor", () => {
  it("Get all Sensor: success", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    // Create multiple sensors associated with the gateway
    await sensorRepo.save({
      macAddress: "SENSOR_MAC_1",
      name: "Sensor 1",
      description: "Description 1",
      variable: "Temperature",
      unit: "Celsius",
      network,
      gateway,
    });

    await sensorRepo.save({
      macAddress: "SENSOR_MAC_2",
      name: "Sensor 2",
      description: "Description 2",
      variable: "Humidity",
      unit: "Percentage",
      network,
      gateway,
    });

    const sensors = await repo.getAllSensors(network.code, gateway.macAddress);
    expect(sensors.length).toBe(2);
    expect(sensors[0].macAddress).toBe("SENSOR_MAC_1");
    expect(sensors[1].macAddress).toBe("SENSOR_MAC_2");
  });

  it("Get all Sensor: Nessun sensore associato al gateway", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Attempt to get sensors when none exist
    const sensors = await repo.getAllSensors(network.code, gateway.macAddress);
    expect(sensors.length).toBe(0);
  });

  it("Get all Sensor: Filtra solo i sensori appartenenti al gateway", async () => {
    const network1 = await createTestNetwork("TEST_NET_1");
    const network2 = await createTestNetwork("TEST_NET_2");

    const gateway1 = await createTestGateway(network1.code, "GATEWAY_MAC_1");
    const gateway2 = await createTestGateway(network2.code, "GATEWAY_MAC_2");

    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    // Create sensors for gateway1
    await sensorRepo.save({
      macAddress: "SENSOR_MAC_1",
      name: "Sensor 1",
      description: "Description 1",
      variable: "Temperature",
      unit: "Celsius",
      gateway: gateway1,
    });

    await sensorRepo.save({
      macAddress: "SENSOR_MAC_2",
      name: "Sensor 2",
      description: "Description 2",
      variable: "Humidity",
      unit: "Percentage",
      gateway: gateway1,
    });

    // Create sensors for gateway2
    await sensorRepo.save({
      macAddress: "SENSOR_MAC_3",
      name: "Sensor 3",
      description: "Description 3",
      variable: "Pressure",
      unit: "Pascal",
      gateway: gateway2,
    });

    // Attempt to get all sensors for gateway1
    const sensors = await repo.getAllSensors(
      network1.code,
      gateway1.macAddress
    );

    // Verify that only sensors belonging to gateway1 are returned
    expect(sensors.length).toBe(2);
    expect(sensors[0].macAddress).toBe("SENSOR_MAC_1");
    expect(sensors[1].macAddress).toBe("SENSOR_MAC_2");

    // Ensure that sensors from gateway2 are not included
    const sensorMacs = sensors.map((sensor) => sensor.macAddress);
    expect(sensorMacs).not.toContain("SENSOR_MAC_3");
  });
});

describe("Delete Sensor", () => {
  it("Delete Sensor: success", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    // Create a sensor associated with the gateway
    const sensor = await sensorRepo.save({
      macAddress: "SENSOR_MAC",
      name: "Test Sensor",
      description: "Test description",
      variable: "Temperature",
      unit: "Celsius",
      network,
      gateway,
    });

    // Delete the sensor
    await repo.deleteSensor(
      network.code,
      gateway.macAddress,
      sensor.macAddress
    );

    // Verify that the sensor was deleted
    await expect(
      repo.getSensorByMac(network.code, gateway.macAddress, sensor.macAddress)
    ).rejects.toThrow(NotFoundError);
  });

  it("Delete Sensor: Sensor inesistente", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Attempt to delete a non-existent sensor
    await expect(
      repo.deleteSensor(network.code, gateway.macAddress, "NON_EXISTENT_MAC")
    ).rejects.toThrow(NotFoundError);
  });
});

describe("Update Sensor", () => {
  it("Update Sensor: success", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");
    const sensorRepo = TestDataSource.getRepository(SensorDAO);
    // Create a sensor associated with the gateway
    const sensor = await sensorRepo.save({
      macAddress: "SENSOR_MAC",
      name: "Test Sensor",
      description: "Test description",
      variable: "Temperature",
      unit: "Celsius",
      network,
      gateway,
    });
    // Update the sensor's details
    const updatedSensor = await repo.updateSensor(
      network.code,
      gateway.macAddress,
      sensor.macAddress,
      "UPDATED_SENSOR_MAC",
      "Updated Sensor Name",
      "Updated Sensor Description",
      "Humidity",
      "Percentage"
    );
    // Verify that the sensor was updated successfully
    expect(updatedSensor.macAddress).toBe("UPDATED_SENSOR_MAC");
    expect(updatedSensor.name).toBe("Updated Sensor Name");
    expect(updatedSensor.description).toBe("Updated Sensor Description");
    expect(updatedSensor.variable).toBe("Humidity");
    expect(updatedSensor.unit).toBe("Percentage");
  });

  it("Update Sensor: campi opzionali vuoti", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");
    const sensorRepo = TestDataSource.getRepository(SensorDAO);
    // Create a sensor associated with the gateway
    const sensor = await sensorRepo.save({
      macAddress: "SENSOR_MAC",
      network,
      gateway,
    });
    // Update the sensor's details
    const updatedSensor = await repo.updateSensor(
      network.code,
      gateway.macAddress,
      sensor.macAddress,
      "UPDATED_SENSOR_MAC"
    );
    // Verify that the sensor was updated successfully
    expect(updatedSensor.macAddress).toBe("UPDATED_SENSOR_MAC");
    expect(updatedSensor.name).toBe(null);
    expect(updatedSensor.description).toBe(null);
    expect(updatedSensor.variable).toBe(null);
    expect(updatedSensor.unit).toBe(null);
  });

  it("Update Sensor: macAddress già esistente", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Crea due sensori con macAddress diversi
    const sensor1 = await repo.createSensor(
      gateway.macAddress,
      "SENSOR_MAC_1",
      "Sensor 1",
      "Description 1",
      "Temperature",
      "Celsius"
    );

    const sensor2 = await repo.createSensor(
      gateway.macAddress,
      "SENSOR_MAC_2",
      "Sensor 2",
      "Description 2",
      "Humidity",
      "Percentage"
    );

    // Tenta di aggiornare il macAddress di sensor1 con quello di sensor2
    await expect(
      repo.updateSensor(
        network.code,
        gateway.macAddress,
        "SENSOR_MAC_1", // oldMacAddress
        "SENSOR_MAC_2", // macAddress già esistente
        "Updated Sensor 1",
        "Updated Description 1",
        "Pressure",
        "Pascal"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("Update Sensor: macAddress inesistente", async () => {
    const network = await createTestNetwork("TEST_NET");
    const gateway = await createTestGateway(network.code, "GATEWAY_MAC");

    // Attempt to update a sensor with a non-existent macAddress
    await expect(
      repo.updateSensor(
        network.code,
        gateway.macAddress,
        "NON_EXISTENT_MAC", // oldMacAddress
        "UPDATED_SENSOR_MAC" // newMacAddress
      )
    ).rejects.toThrow(NotFoundError);
  });
});
