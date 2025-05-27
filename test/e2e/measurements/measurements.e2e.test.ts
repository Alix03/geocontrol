import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { Measurements } from "@models/dto/Measurements";

describe("GET /network/{networkCode}/measurements (e2e)", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const testNetworkCode = "NET01";
  const testGatewayMac = "GW1";
  const testGatewayMac2 = "GW2";
  const testSensorMac = "SENSOR1";
  const testSensorMac2 = "SENSOR2";
  const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing",
    type: "temperature",
    unit: "Celsius",
  };
  const sensorData2 = {
    macAddress: testSensorMac2,
    name: "Test Sensor 2",
    description: "Second sensor for testing",
    type: "humidity",
    unit: "Percent",
  };

  const testMeasurements = [
    {
      value: 30,
      createdAt: "2025-05-20T14:48:00.000Z",
    },
    {
        value: 10,
        createdAt: "2025-05-20T14:58:00.000Z"
      }
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
  });
  afterEach(async () => {
    // Cleanup: Delete test network and gateways
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
    const Measurements: Measurements[] = [
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
            createdAt: new Date("2025-05-20T14:48:00.000Z"),
            value: 30,
            isOutlier: false,
          },
          {
            createdAt: new Date("2025-05-20T14:58:00.000Z"),
            value: 10,
            isOutlier: false,
          },
        ],
      },
    ];

    // Create a measurement for the sensor
    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}/measurements`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(testMeasurements);

    const res = await request(app)
      .get(`/api/v1/networks/${testNetworkCode}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(Measurements);
  });
});
