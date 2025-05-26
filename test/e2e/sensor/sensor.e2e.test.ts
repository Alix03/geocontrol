import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("Sensor API (e2e)", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const testNetworkCode = "TEST_NETWORK_001";
  const testGatewayMac = "00:11:22:33:44:55";
  const testSensorMac = "AA:BB:CC:DD:EE:FF";
  const nonExistentSensorMac = "99:99:99:99:99:99";

  beforeAll(async () => {
    await beforeAllE2e();

    // Generate tokens for all user types
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);

    // Create test network and gateway
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
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  // GET all sensors
  describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors", () => {
    describe("Casi di successo", () => {
      it("Ritorna un array vuoto quando un gateway non ha sensori (admin user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });

      it("Ritorna un array vuoto quando un gateway non ha sensori (operator user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${operatorToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });

      it("Ritorna un array vuoto quando un gateway non ha sensori (viewer user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${viewerToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });
    });

    describe("Casi di errore", () => {
      it("401 UnauthorizedError: token non presente", async () => {
        const res = await request(app).get(
          `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
        );

        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

      it("404 NotFoundError: gateway inesistente", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/NONEXISTENT_GATEWAY/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.code).toBe(404);
        expect(res.body.name).toBe("NotFoundError");
      });
    });
  });

  // POST create sensor
  describe("POST /networks/{networkCode}/gateways/{gatewayMac}/sensors", () => {
    describe("Casi di successo", () => {
      it("Crea un sensore con tutti i campi (admin user)", async () => {
        const sensorData = {
          macAddress: testSensorMac,
          name: "Test Sensor",
          description: "Sensor for testing purposes",
          variable: "temperature",
          unit: "°C",
        };

        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensorData);

        expect(res.status).toBe(201);
      });

      it("Crea un sensore con tutti i campi (operator user)", async () => {
        const sensorData = {
          macAddress: testSensorMac,
          name: "Test Sensor",
          description: "Sensor for testing purposes",
          variable: "temperature",
          unit: "°C",
        };

        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${operatorToken}`)
          .send(sensorData);

        expect(res.status).toBe(201);
      });

      it("Crea un sensore con solo i campi obbligatori (admin user)", async () => {
        const sensorData = {
          macAddress: "11:22:33:44:55:66",
        };

        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensorData);

        expect(res.status).toBe(201);
      });

      it("Crea un sensore con solo i campi obbligatori (operator user)", async () => {
        const sensorData = {
          macAddress: "11:22:33:44:55:66",
        };

        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${operatorToken}`)
          .send(sensorData);

        expect(res.status).toBe(201);
      });
    });

    describe("Casi di errore", () => {
      it("400 Invalid input data: macAddress non presente", async () => {
        const sensorData = {
          name: "Sensor without MAC",
        };

        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensorData);

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(400);
      });

      it("401 Unauthorized: token non presente", async () => {
        const sensorData = {
          macAddress: "11:22:33:44:55:66",
        };

        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .send(sensorData);

        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

      it("403 ForbiddenError: utente non autorizzato", async () => {
        const sensorData = {
          macAddress: "11:22:33:44:55:66",
        };

        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${viewerToken}`)
          .send(sensorData);

        expect(res.status).toBe(403);
        expect(res.body.code).toBe(403);
        expect(res.body.name).toBe("ForbiddenError");
      });

      it("404 NotFoundError: gateway inesistente", async () => {
        const sensorData = {
          macAddress: "11:22:33:44:55:66",
        };
        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/NONEXISTENT_GATEWAY/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensorData);
        expect(res.status).toBe(404);
        expect(res.body.code).toBe(404);
        expect(res.body.name).toBe("NotFoundError");
      });

      it("409 ConflictError: macAddress già in uso", async () => {
        const sensorData = {
          macAddress: testSensorMac,
        };

        const res = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensorData);

        expect(res.status).toBe(409);
        expect(res.body.code).toBe(409);
        expect(res.body.name).toBe("ConflictError");
      });
    });
  });

  // GET specific sensor
  describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}", () => {
    describe("Casi di successo", () => {
      it("Ritorna un sensore specifico (admin user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.macAddress).toBe(testSensorMac);
      });
    });

    describe("Casi di errore", () => {
      it("404 NotFoundError: sensore inesistente", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${nonExistentSensorMac}`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.code).toBe(404);
        expect(res.body.name).toBe("NotFoundError");
      });
    });
  });

  // DELETE sensor
  describe("DELETE /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}", () => {
    describe("Casi di successo", () => {
      it("Elimina un sensore (admin user)", async () => {
        const res = await request(app)
          .delete(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(204);
      });
    });

    describe("Casi di errore", () => {
      it("404 NotFoundError: sensore inesistente", async () => {
        const res = await request(app)
          .delete(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${nonExistentSensorMac}`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.code).toBe(404);
        expect(res.body.name).toBe("NotFoundError");
      });
    });
  });
});
