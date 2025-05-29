import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { getAllSensors } from "@controllers/SensorController";
import AppError from "@models/errors/AppError";

describe("Sensor API (e2e)", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const testNetworkCode = "TEST_NETWORK_001";
  const testGatewayMac = "00:11:22:33:44:55";
  const testGatewayMac2 = "00:11:22:33:44:56";
  const testSensorMac = "AA:BB:CC:DD:EE:FF";
  const testSensorMac2 = "AA:BB:CC:DD:EE:KK";
  const nonExistentSensorMac = "99:99:99:99:99:99";

  const sensorData = {
    macAddress: testSensorMac,
    name: "Test Sensor",
    description: "Sensor for testing purposes",
    variable: "temperature",
    unit: "°C",
  };

  const sensor2Data = {
    macAddress: testSensorMac2,
    name: "Another Sensor",
    description: "Sensor for testing purposes",
    variable: "pressure",
    unit: "Pa",
  };

  beforeAll(async () => {
    await beforeAllE2e();

    // Generate tokens for all user types
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
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
      .post(`/api/v1/networks/${testNetworkCode}/gateways`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        macAddress: testGatewayMac2,
        name: "Test Gateway",
        description: "Gateway for sensor testing",
      });

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensorData);

    await request(app)
      .post(
        `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sensor2Data);
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

  afterAll(async () => {
    await afterAllE2e();
  });

  // GET all sensors
  describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors", () => {
    describe("Casi di successo", () => {
      it("Ritorna tutti i sensori associati a un gateway (admin user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              macAddress: "AA:BB:CC:DD:EE:FF",
              name: "Test Sensor",
              description: "Sensor for testing purposes",
              variable: "temperature",
              unit: "°C",
            }),
          ])
        );
      });

      it("Ritorna un array vuoto quando un gateway non ha sensori (admin user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac2}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });

      it("Ritorna un array vuoto quando un gateway non ha sensori (operator user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac2}/sensors`
          )
          .set("Authorization", `Bearer ${operatorToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });

      it("Ritorna un array vuoto quando un gateway non ha sensori (viewer user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac2}/sensors`
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
          macAddress: "11:22:33:44:55:65",
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
          macAddress: "11:22:33:44:55:66",
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
          macAddress: "11:22:33:44:55:67",
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
          macAddress: "11:22:33:44:55:68",
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

      it("403 Insufficient rights: utente non autorizzato", async () => {
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
        expect(res.body.name).toBe("InsufficientRightsError");
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
          name: "Test Sensor",
          description: "Sensor for testing purposes",
          variable: "temperature",
          unit: "°C",
        };

        const createRes = await request(app)
          .post(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensorData);

        expect(createRes.status).toBe(409); // Verifica che il sensore sia stato creato

        // Act: Tenta di creare un altro sensore con lo stesso macAddress
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

      it("500 MAC address cannot be empty", async () => {
        const sensorData = {
          macAddress: "    \t  \n",
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

        expect(res.status).toBe(500);
        expect(res.body.code).toBe(500);
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

      it("Ritorna un sensore specifico (operator user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${operatorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.macAddress).toBe(testSensorMac);
      });

      it("Ritorna un sensore specifico (viewer user)", async () => {
        const res = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${viewerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.macAddress).toBe(testSensorMac);
      });
    });

    describe("Casi di errore", () => {
      it("401 UnauthorizedError: token non presente", async () => {
        const res = await request(app).get(
          `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
        );
        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

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
      it("401 UnauthorizedError: token non presente", async () => {
        const res = await request(app).delete(
          `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
        );
        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

      it("403 Insufficient rights: utente non autorizzato", async () => {
        const res = await request(app)
          .delete(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${viewerToken}`);
        expect(res.status).toBe(403);
        expect(res.body.code).toBe(403);
        expect(res.body.name).toBe("InsufficientRightsError");
      });

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

  /// PATCH sensor
  describe("PATCH /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}", () => {
    describe("Casi di successo", () => {
      it("Aggiorna nome e descrizione di un sensore (admin user)", async () => {
        const updateData = {
          macAddress: testSensorMac,
          name: "Updated Sensor Name",
          description: "Updated description",
        };

        const res = await request(app)
          .patch(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(updateData);

        expect(res.status).toBe(204);

        const getRes = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(getRes.body.name).toBe(updateData.name);
        expect(getRes.body.description).toBe(updateData.description);
      });

      it("Aggiorna nome e descrizione di un sensore (operator user)", async () => {
        const updateData = {
          macAddress: testSensorMac,
          name: "Updated Sensor Name",
          description: "Updated description",
        };

        const res = await request(app)
          .patch(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${operatorToken}`)
          .send(updateData);

        expect(res.status).toBe(204);

        const getRes = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(getRes.body.name).toBe(updateData.name);
        expect(getRes.body.description).toBe(updateData.description);
      });

      it("Aggiorna tutti i campi del sensore (admin user)", async () => {
        const updateData = {
          macAddress: "AA:BB:CC:DD:EE:GG",
          name: "Updated Sensor Name",
          description: "Updated description",
          variable: "humidity",
          unit: "%",
        };

        const res = await request(app)
          .patch(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${operatorToken}`)
          .send(updateData);

        expect(res.status).toBe(204);

        const getRes = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${updateData.macAddress}`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        expect(getRes.body.macAddress).toBe(updateData.macAddress);
        expect(getRes.body.name).toBe(updateData.name);
        expect(getRes.body.description).toBe(updateData.description);
        expect(getRes.body.variable).toBe(updateData.variable);
        expect(getRes.body.unit).toBe(updateData.unit);
      });
    });

    describe("Casi di errore", () => {
      it("401 UnauthorizedError: token non presente", async () => {
        const updateData = {
          name: "Updated Sensor Name",
        };

        const res = await request(app)
          .patch(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .send(updateData);

        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

      it("403 Forbidden: utente non autorizzato", async () => {
        const updateData = {
          name: "Updated Sensor Name",
          description: "Updated description",
        };

        const res = await request(app)
          .patch(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}`
          )
          .set("Authorization", `Bearer ${viewerToken}`) // Token di un utente con permessi insufficienti
          .send(updateData);

        expect(res.status).toBe(403);
        expect(res.body.code).toBe(403);
        expect(res.body.name).toBe("InsufficientRightsError");
      });

      it("404 NotFoundError: sensore inesistente", async () => {
        const updateData = {
          macAddress: testSensorMac,
          name: "Updated Sensor Name",
          description: "Updated description",
        };

        const res = await request(app)
          .patch(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${nonExistentSensorMac}` // MAC address inesistente
          )
          .set("Authorization", `Bearer ${adminToken}`) // Token valido
          .send(updateData);

        expect(res.status).toBe(404);
        expect(res.body.code).toBe(404);
        expect(res.body.name).toBe("NotFoundError");
      });

      it("409 ConflictError: macAddress già in uso", async () => {
        const sensor2Data = {
          macAddress: testSensorMac2, // Stesso macAddress del sensore esistente
          name: "Another Sensor",
          description: "Sensor for testing purposes",
          variable: "pressure",
          unit: "Pa",
        };
        const arraySensor = await request(app)
          .get(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors`
          )
          .set("Authorization", `Bearer ${adminToken}`);

        console.log(arraySensor.body);

        const res = await request(app)
          .patch(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}` // Stesso macAddress del sensore esistente
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensor2Data);

        // Verifica che venga restituito un errore 409
        expect(res.status).toBe(409);
        expect(res.body.code).toBe(409);
        expect(res.body.name).toBe("ConflictError");
      });

      it("500 MAC address cannot be empty", async () => {
        const sensorData = {
          macAddress: "    \t   \n", 
          name: "Another Sensor",
          description: "Sensor for testing purposes",
          variable: "pressure",
          unit: "Pa",
        };

        const res = await request(app)
          .patch(
            `/api/v1/networks/${testNetworkCode}/gateways/${testGatewayMac}/sensors/${testSensorMac}` 
          )
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensorData);

        // Verifica che venga restituito un errore 500
        expect(res.status).toBe(500);
        expect(res.body.code).toBe(500);
        expect(res.body.name).toBe("Error");
      });
    });
  });
});
