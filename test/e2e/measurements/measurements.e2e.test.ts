import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { AppDataSource } from "@database";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

let adminToken: string;
let operatorToken: string;
let viewerToken: string;
const testNetworkCode = "NET01";
const testGatewayMac = "GW1";
const testSensorMac = "SENSOR1";

describe("GET /network/{networkCode}/measurements (e2e)", () => {
  const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing",
    type: "temperature",
    unit: "Celsius",
  };

  const testMeasurements = [
    {
      value: 30,
      createdAt: "2025-05-20T14:48:00.000Z",
    },
    {
      value: 10,
      createdAt: "2025-05-20T14:58:00.000Z",
    },
  ];

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  beforeEach(async () => {
    // Create test network, gateway and sensor
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: testNetworkCode,
        name: "Test Network",
        description: "Network for sensor testing",
      });

    await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        macAddress: testGatewayMac,
        name: "Test Gateway",
        description: "Gateway for sensor testing",
      });

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensorData);

    // Create a measurement for the sensor
    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(testMeasurements);
  });
  afterEach(async () => {
    // Cleanup: Delete test network, gateway and sensor e measurements
    const MeasurementRepository = AppDataSource.getRepository(MeasurementDAO);
    await MeasurementRepository.delete({});

    // Elimina rete, gateway e sensore dopo ogni test
    await request(app)
      .delete(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
      )
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("get all measurements", async () => {
    const Measurements = [
      {
        sensorMacAddress: testSensorMac,
        stats: {
          mean: 20,
          variance: 100,
          upperThreshold: 40,
          lowerThreshold: 0,
        },
        measurements: [
          {
            createdAt: "2025-05-20T14:48:00.000Z",
            value: 30,
            isOutlier: false,
          },
          {
            createdAt: "2025-05-20T14:58:00.000Z",
            value: 10,
            isOutlier: false,
          },
        ],
      },
    ];

    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(Measurements);
  });

  it("get all measurements with startDate and endDate", async () => {
    const Measurements = [
      {
        sensorMacAddress: testSensorMac,
        stats: {
          startDate: "2025-05-20T14:48:00.000Z",
          endDate: "2025-05-20T14:58:00.000Z",
          mean: 20,
          variance: 100,
          upperThreshold: 40,
          lowerThreshold: 0,
        },
        measurements: [
          {
            createdAt: "2025-05-20T14:48:00.000Z",
            value: 30,
            isOutlier: false,
          },
          {
            createdAt: "2025-05-20T14:58:00.000Z",
            value: 10,
            isOutlier: false,
          },
        ],
      },
    ];

    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2025-05-20T14:48:00.000Z",
        endDate: "2025-05-20T14:58:00.000Z",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(Measurements);
  });

  it("get measurements with specific sensor filter", async () => {
    const Measurements = [
      {
        sensorMacAddress: testSensorMac,
        stats: {
          mean: 20,
          variance: 100,
          upperThreshold: 40,
          lowerThreshold: 0,
        },
        measurements: [
          {
            createdAt: "2025-05-20T14:48:00.000Z",
            value: 30,
            isOutlier: false,
          },
          {
            createdAt: "2025-05-20T14:58:00.000Z",
            value: 10,
            isOutlier: false,
          },
        ],
      },
    ];

    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({ sensorMacs: testSensorMac });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(Measurements);
  });

  it("get measurements with unauthorized token", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/measurements`)
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
  });

  it("get measurements for non-existent network", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NONEXISTENT/measurements")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it("get measurements with viewer token", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/measurements`)
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
  });
});
describe("POST /measurements", () => {
  const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing",
    type: "temperature",
    unit: "Celsius",
  };

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  beforeEach(async () => {
    // Create test network, gateway and sensor
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: testNetworkCode,
        name: "Test Network",
        description: "Network for sensor testing",
      });

    await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        macAddress: testGatewayMac,
        name: "Test Gateway",
        description: "Gateway for sensor testing",
      });

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensorData);
  });
  afterEach(async () => {
    // Cleanup: Delete test network, gateway and sensor

    // Elimina rete, gateway e sensore dopo ogni test
    await request(app)
      .delete(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
      )
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("create measurements with operator token", async () => {
    const newMeasurements = [
      {
        value: 25,
        createdAt: "2025-05-20T15:00:00.000Z",
      },
    ];

    const res = await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(newMeasurements);

    expect(res.status).toBe(201);

    // Verify measurement was created
    const getMeasurements = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getMeasurements.body[0].measurements).toContainEqual({
      value: 25,
      createdAt: "2025-05-20T15:00:00.000Z",
      isOutlier: false,
    });
  });

  it("create measurements with viewer token should fail", async () => {
    const newMeasurements = [
      {
        value: 25,
        createdAt: "2025-05-20T15:00:00.000Z",
      },
    ];

    const res = await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(newMeasurements);

    expect(res.status).toBe(403);
  });

  it("create measurement with invalid data format", async () => {
    const invalidMeasurements = [{
      value: "not a number",
      createdAt: "2025-05-20T15:00:00.000Z"
    }];

    const res = await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(invalidMeasurements);

    expect(res.status).toBe(400);
  });

  it("create measurement with missing required field", async () => {
    const invalidMeasurements = [{
      value: 25
      // missing createdAt
    }];

    const res = await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(invalidMeasurements);

    expect(res.status).toBe(400);
  });

  it("create measurement for non-existent sensor", async () => {
    const measurements = [{
      value: 25,
      createdAt: "2025-05-20T15:00:00.000Z"
    }];

    const res = await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/NONEXISTENT/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(measurements);

    expect(res.status).toBe(404);
  });
});

describe("GET /network/{networkCode}/stats (e2e)", () => {
  const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing",
    type: "temperature",
    unit: "Celsius",
  };

  const testMeasurements = [
    {
      value: 30,
      createdAt: "2025-05-20T14:48:00.000Z",
    },
    {
      value: 10,
      createdAt: "2025-05-20T14:58:00.000Z",
    },
  ];

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  beforeEach(async () => {
    // Create test network, gateway and sensor
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: testNetworkCode,
        name: "Test Network",
        description: "Network for sensor testing",
      });

    await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        macAddress: testGatewayMac,
        name: "Test Gateway",
        description: "Gateway for sensor testing",
      });

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensorData);

    // Create a measurement for the sensor
    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(testMeasurements);
  });
  afterEach(async () => {
    // Cleanup: Delete test network, gateway and sensor e measurements
    const MeasurementRepository = AppDataSource.getRepository(MeasurementDAO);
    await MeasurementRepository.delete({});

    // Elimina rete, gateway e sensore dopo ogni test
    await request(app)
      .delete(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
      )
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("get stats for all sensors", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/stats`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      sensorMacAddress: testSensorMac,
      stats: {
        mean: 20,
        variance: 100,
        upperThreshold: 40,
        lowerThreshold: 0,
      },
    });
  });

  it("get stats with date range", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/stats`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2025-05-20T14:48:00.000Z",
        endDate: "2025-05-20T14:58:00.000Z",
      });

    expect(res.status).toBe(200);
    expect(res.body[0].stats).toHaveProperty("startDate");
    expect(res.body[0].stats).toHaveProperty("endDate");
  });
});

describe("GET /network/{networkCode}/outliers (e2e)", () => {
  const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing",
    type: "temperature",
    unit: "Celsius",
  };

  const testMeasurements = [];
  [10, 12, 11, 13, 14, 15, 16, 12, 11, 50].map((value, index) => {
    const measurement = {
      createdAt: `2025-05-20T14:${48 + index}:00.000Z`,
      value: value,
    };
    testMeasurements.push(measurement);
  });

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  beforeEach(async () => {
    // Create test network, gateway and sensor
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: testNetworkCode,
        name: "Test Network",
        description: "Network for sensor testing",
      });

    await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        macAddress: testGatewayMac,
        name: "Test Gateway",
        description: "Gateway for sensor testing",
      });

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensorData);

    // Create measurements with onr outlier for the sensor
    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(testMeasurements);

  });
  afterEach(async () => {
    // Cleanup: Delete test network, gateway and sensor e measurements
    const MeasurementRepository = AppDataSource.getRepository(MeasurementDAO);
    await MeasurementRepository.delete({});

    // Elimina rete, gateway e sensore dopo ogni test
    await request(app)
      .delete(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
      )
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("get outliers for all sensors", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/outliers`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body[0].measurements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 50,
          isOutlier: true,
        }),
      ])
    );
  });

  it("get outliers with date filter", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/outliers`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2025-05-20T14:50:00.000Z",
        endDate: "2025-05-20T15:01:00.000Z",
      });

    expect(res.status).toBe(200);
    expect(res.body[0].measurements).toHaveLength(1);
    expect(res.body[0].measurements[0]).toEqual({
      value: 50,
      createdAt: "2025-05-20T14:57:00.000Z",
      isOutlier: true,
    });
  });
});

describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/measurements (e2e)", () => {
const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing",
    type: "temperature",
    unit: "Celsius",
  };

  const testMeasurements = [
    {
      value: 30,
      createdAt: "2025-05-20T14:48:00.000Z",
    },
    {
      value: 10,
      createdAt: "2025-05-20T14:58:00.000Z",
    },
  ];

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  beforeEach(async () => {
    // Create test network, gateway and sensor
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: testNetworkCode,
        name: "Test Network",
        description: "Network for sensor testing",
      });

    await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        macAddress: testGatewayMac,
        name: "Test Gateway",
        description: "Gateway for sensor testing",
      });

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensorData);

    // Create a measurement for the sensor
    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(testMeasurements);
  });
  afterEach(async () => {
    // Cleanup: Delete test network, gateway and sensor e measurements
    const MeasurementRepository = AppDataSource.getRepository(MeasurementDAO);
    await MeasurementRepository.delete({});

    // Elimina rete, gateway e sensore dopo ogni test
    await request(app)
      .delete(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
      )
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("get measurements for specific sensor", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sensorMacAddress: testSensorMac,
      stats: {
        mean: 20,
        variance: 100,
        upperThreshold: 40,
        lowerThreshold: 0
      },
      measurements: [
        {
          createdAt: "2025-05-20T14:48:00.000Z",
          value: 30,
          isOutlier: false
        },
        {
          createdAt: "2025-05-20T14:58:00.000Z", 
          value: 10,
          isOutlier: false
        }
      ]
    });
  });

  it("get measurements for specific sensor with date range", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2025-05-20T14:48:00.000Z",
        endDate: "2025-05-20T14:58:00.000Z"
      });

    expect(res.status).toBe(200);
    expect(res.body.stats).toHaveProperty("startDate");
    expect(res.body.stats).toHaveProperty("endDate");
  });

  it("get measurements for non-existent sensor", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/NONEXISTENT/measurements`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it("get measurements with invalid date format", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "invalid-date",
        endDate: "2025-05-20T14:58:00.000Z"
      });

    expect(res.status).toBe(400);
  });
});

describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/stats (e2e)", () => {
  const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing",
    type: "temperature",
    unit: "Celsius",
  };

  const testMeasurements = [
    {
      value: 30,
      createdAt: "2025-05-20T14:48:00.000Z",
    },
    {
      value: 10,
      createdAt: "2025-05-20T14:58:00.000Z",
    },
  ];

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  beforeEach(async () => {
    // Create test network, gateway and sensor
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: testNetworkCode,
        name: "Test Network",
        description: "Network for sensor testing",
      });

    await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        macAddress: testGatewayMac,
        name: "Test Gateway",
        description: "Gateway for sensor testing",
      });

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensorData);

    // Create a measurement for the sensor
    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(testMeasurements);
  });
  afterEach(async () => {
    // Cleanup: Delete test network, gateway and sensor e measurements
    const MeasurementRepository = AppDataSource.getRepository(MeasurementDAO);
    await MeasurementRepository.delete({});

    // Elimina rete, gateway e sensore dopo ogni test
    await request(app)
      .delete(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
      )
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("get stats for specific sensor", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/stats`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      mean: 20,
      variance: 100,
      upperThreshold: 40,
      lowerThreshold: 0
    });
  });

  it("get stats with date range", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/stats`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2025-05-20T14:48:00.000Z",
        endDate: "2025-05-20T14:58:00.000Z"
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("startDate");
    expect(res.body).toHaveProperty("endDate");
  });
});

describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/outliers (e2e)", () => {
  const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing",
    type: "temperature",
    unit: "Celsius",
  };

  const testMeasurements = [];
  [10, 12, 11, 13, 14, 15, 16, 12, 11, 50].map((value, index) => {
    const measurement = {
      createdAt: `2025-05-20T14:${48 + index}:00.000Z`,
      value: value,
    };
    testMeasurements.push(measurement);
  });

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  beforeEach(async () => {
    // Create test network, gateway and sensor
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: testNetworkCode,
        name: "Test Network",
        description: "Network for sensor testing",
      });

    await request(app)
      .post(`/api/v1/networks/${testNetworkCode}/gateways`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        macAddress: testGatewayMac,
        name: "Test Gateway",
        description: "Gateway for sensor testing",
      });

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensorData);

    // Create measurements with onr outlier for the sensor
    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(testMeasurements);

  });
  afterEach(async () => {
    // Cleanup: Delete test network, gateway and sensor e measurements
    const MeasurementRepository = AppDataSource.getRepository(MeasurementDAO);
    await MeasurementRepository.delete({});

    // Elimina rete, gateway e sensore dopo ogni test
    await request(app)
      .delete(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
      )
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app)
      .delete(`/api/v1/networks/${testNetworkCode}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("get outliers for specific sensor", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/outliers`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sensorMacAddress: testSensorMac,
      stats: {
        mean: 16.4,
        variance: 128.64,
        upperThreshold: 39.08391500601252,
        lowerThreshold: -6.283915006012521
      },
      measurements: [{
        value: 50,
        createdAt: "2025-05-20T14:57:00.000Z",
        isOutlier: true
      }]
    });
  });

  it("get outliers with date filter", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/outliers`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2025-05-20T14:50:00.000Z",
        endDate: "2025-05-20T15:01:00.000Z"
      });

    expect(res.status).toBe(200);
    expect(res.body.measurements).toHaveLength(1);
    expect(res.body.measurements[0]).toEqual({
      value: 50,
      createdAt: "2025-05-20T14:57:00.000Z",
      isOutlier: true
    });
  });

  it("get outliers for non-existent sensor", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/NONEXISTENT/outliers`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
