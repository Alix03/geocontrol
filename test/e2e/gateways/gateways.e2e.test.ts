import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("Gateway API (e2e)", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const testNetworkCode = "TEST_NETWORK_001";
  const nonExistentNetworkCode = "NON_EXISTENT_NETWORK";
  const testGatewayMac = "00:11:22:33:44:55";
  const testGatewayMac2 = "AA:BB:CC:DD:EE:FF";
  const nonExistentGatewayMac = "99:99:99:99:99:99";

  beforeAll(async () => {
    await beforeAllE2e();
    
    // Generate tokens for all user types
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
    
    // Create test network first (assuming network creation endpoint exists)
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: testNetworkCode,
        name: "Test Network",
        description: "Network for gateway testing"
      });
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  // getAll gateways per un network
  describe("GET /networks/{networkCode}/gateways", () => {
    describe("Casi di successo", () => {
      it("Ritorna un array vuoto quando un network non ha gateways (admin user)", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });

      it("Ritorna un array vuoto quando un network non ha gateways (operator user)", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${operatorToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });

      it("Ritorna un array vuoto quando un network non ha gateways (viewer user)", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${viewerToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });
    

    });

    describe("Casi di errore", () => {
      it("401 UnauthorizedError: token non presente", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${testNetworkCode}/gateways`);

        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

      it("401 UnauthorizedError: token non valido", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", "Bearer invalid_token");

        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

      it("401 UnauthorizedError: formato del token non valido", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", "InvalidFormat token");

        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

      it("404 NotFoundError: network inestente", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${nonExistentNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.code).toBe(404);
        expect(res.body.name).toBe("NotFoundError");
      });
    });



  



        
    // fine describe
});


// Create gateway
describe("POST /networks/{networkCode}/gateways", () => {
    describe("Casi di successo", () => {
      it("Crea un gateway con tutti i campi (admin user)", async () => {
        const gatewayData = {
          macAddress: testGatewayMac,
          name: "Test Gateway",
          description: "Gateway for testing purposes"
        };

        const res = await request(app)
          .post(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(gatewayData);

        expect(res.status).toBe(201);
      });

      it("Crea un gateway con solo i campi obbligatori (operator user)", async () => {
        const gatewayData = {
          macAddress: testGatewayMac2
        };

        const res = await request(app)
          .post(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${operatorToken}`)
          .send(gatewayData);

        expect(res.status).toBe(201);
      });

      it("Crea un gateway ignorando eventuali sensori annidati", async () => {
        const gatewayData = {
          macAddress: "11:22:33:44:55:66",
          name: "Gateway with Sensors",
          description: "This gateway has nested sensors that should be ignored",
          sensors: [
            {
              macAddress: "sensor1",
              name: "Temperature Sensor",
              description: "Measures temperature",
              variable: "temperature",
              unit: "°C"
            }
          ]
        };

        const res = await request(app)
          .post(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(gatewayData);

        expect(res.status).toBe(201);
      });
    });

    describe("Casi di errore", () => {
      it("400 Invalid input data: macAddress non presente", async () => {
        const gatewayData = {
          name: "Gateway without MAC",
          description: "This should fail"
        };

        const res = await request(app)
          .post(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(gatewayData);

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(400);
      });

      it("400 Invalid input data: macAddress stringa vuota", async () => {
        const gatewayData = {
          macAddress: "",
          name: "Gateway with empty MAC"
        };

        const res = await request(app)
          .post(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(gatewayData);

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(400);
      });

      it("401 UnauthorizedError: token non presente", async () => {
        const gatewayData = {
          macAddress: "new:gateway:mac"
        };

        const res = await request(app)
          .post(`/api/v1/networks/${testNetworkCode}/gateways`)
          .send(gatewayData);

        expect(res.status).toBe(401);
        expect(res.body.code).toBe(401);
        expect(res.body.name).toBe("UnauthorizedError");
      });

      it("403 InsufficientRightsError: viewer prova a creare un network", async () => {
        const gatewayData = {
          macAddress: "viewer:cannot:create"
        };

        const res = await request(app)
          .post(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${viewerToken}`)
          .send(gatewayData);

        expect(res.status).toBe(403);
        expect(res.body.code).toBe(403);
        expect(res.body.name).toBe("InsufficientRightsError");
      });

      it("404 NotFoundError: network inesistente", async () => {
        const gatewayData = {
          macAddress: "network:not:found"
        };

        const res = await request(app)
          .post(`/api/v1/networks/${nonExistentNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(gatewayData);

        expect(res.status).toBe(404);
        expect(res.body.code).toBe(404);
        expect(res.body.name).toBe("NotFoundError");
      });

      it("409 ConflictError: macAddress già in uso", async () => {
        const gatewayData = {
          macAddress: testGatewayMac, // This MAC was already created in success tests
          name: "Duplicate Gateway"
        };

        const res = await request(app)
          .post(`/api/v1/networks/${testNetworkCode}/gateways`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(gatewayData);

        expect(res.status).toBe(409);
        expect(res.body.code).toBe(409);
        expect(res.body.name).toBe("ConflictError");
      });
    });


  });

// fine 
});