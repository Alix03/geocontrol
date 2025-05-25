import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as gatewayController from "@controllers/gatewayController";
import { UserType } from "@models/UserType";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";


jest.mock("@services/authService");
jest.mock("@controllers/gatewayController");

describe("GatewayRoutes integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "NET001";
  const gatewayMac = "00:11:22:33:44:55";

  const mockSensor: SensorDTO = {
    macAddress: "AA:BB:CC:DD:EE:FF",
    name: "Temperature Sensor",
    description: "Outdoor temperature sensor",
    variable: "temperature",
    unit: "°C"
  };

  const mockGateway: GatewayDTO = {
    macAddress: gatewayMac,
    name: "Main Gateway",
    description: "Primary gateway for network",
    sensors: [mockSensor]
  };

  const mockGateways: GatewayDTO[] = [
    mockGateway,
    {
      macAddress: "11:22:33:44:55:66",
      name: "Secondary Gateway",
      description: "Backup gateway",
      sensors: []
    }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

describe("Create Gateway", () => {
    const newGateway: GatewayDTO = {
      macAddress: "77:88:99:AA:BB:CC",
      name: "New Gateway",
      description: "Newly created gateway",
      sensors: []
    };

    it("Create Gateway: success (Admin user)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.createGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send(newGateway);

      expect(response.status).toBe(201);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator
      ]);
      expect(gatewayController.createGateway).toHaveBeenCalledWith(
        networkCode,
        newGateway
      );
    });

    it("Create Gateway: success (Operator user)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.createGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send(newGateway);

      expect(response.status).toBe(201);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator
      ]);
    });

    it("Create Gateway: utente non autorizzato (token non valido, 401 error)", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", "Bearer invalid")
        .send(newGateway);

        
      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
      
    });

    it("Create Gateway: 403 Insufficient rights", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send(newGateway);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.name).toBe("InsufficientRightsError");
      expect(response.body.message).toMatch(/Insufficient rights/);
    });


    it("Create Gateway: error 404 Not Found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.createGateway as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .post("/api/v1/networks/NONEXISTENT/gateways")
        .set("Authorization", token)
        .send(newGateway);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });


    it("Create Gateway: 409 error (macAddress già in uso)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.createGateway as jest.Mock).mockRejectedValue(
        new ConflictError("Entity with code 77:88:99:AA:BB:CC already exists")
      );

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send(newGateway);

      expect(response.status).toBe(409);
      expect(response.body.code).toBe(409);
      expect(response.body.name).toBe("ConflictError");
      expect(response.body.message).toMatch(/already exists/);
    });



      
    
    


    
    


    
});


describe("Get All Gateways", () => {
    it("Get All Gateways : success (user autenticato)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getAllGateways as jest.Mock).mockResolvedValue(mockGateways);

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGateways);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator,
        UserType.Viewer
      ]);
      expect(gatewayController.getAllGateways).toHaveBeenCalledWith(networkCode);
    });


     it("Get All Gateways: 401 UnauthorizedError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Get All Gateways: 404 Not Found Error", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getAllGateways as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .get("/api/v1/networks/NONEXISTENT/gateways")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });


  });

describe("Get Gateway By MacAddress", () => {
    it("Get Gateway By MacAddress: success (user autenticato)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getGateway as jest.Mock).mockResolvedValue(mockGateway);

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGateway);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator,
        UserType.Viewer
      ]);
      expect(gatewayController.getGateway).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
    });

    it("Get Gateway By MacAddress: 401 UnauthorizedError ", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", "Bearer expired");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Get Gateway By MacAddress:  404 NotFoundError (network inesistente)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getGateway as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .get("/api/v1/networks/NONEXISTENT/gateways/00:11:22:33:44:55")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });

    it("Get Gateway By MacAddress:  404 NotFoundError (macAddress inesistente)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getGateway as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/FF:FF:FF:FF:FF:FF`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });
    

});

describe("Update Gateway", () => {
    const updatedGateway: GatewayDTO = {
      macAddress: "00:11:22:33:44:66", // Changed MAC
      name: "Updated Gateway Name",
      description: "Updated description",
      sensors: [mockSensor]
    };

    it("Update Gateway: success (admin user)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send(updatedGateway);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator
      ]);
      expect(gatewayController.updateGateway).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        updatedGateway
      );
      
      
    });
    it("Update Gateway: success (operator user)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send(updatedGateway);

      expect(response.status).toBe(204);
    });

    it("Update Gateway: 401 UnauthorizedError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", "Bearer invalid")
        .send(updatedGateway);

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });


    it("Update Gateway: 403 InsufficientRightsError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send(updatedGateway);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.name).toBe("InsufficientRightsError");
      expect(response.body.message).toMatch(/Insufficient rights/);
    });


     it("Update Gateway: 404 NotFound (network inesistente)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .patch("/api/v1/networks/NONEXISTENT/gateways/00:11:22:33:44:55")
        .set("Authorization", token)
        .send(updatedGateway);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });


    it("Update Gateway: 404 NotFound (macAdrress inesistente)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/FF:FF:FF:FF:FF:FF`)
        .set("Authorization", token)
        .send(updatedGateway);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });


    it("Update Gateway: 409 ConflictError (macAddress esistente) ", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockRejectedValue(
        new ConflictError("Entity with code 00:11:22:33:44:66 already exists")
      );

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send(updatedGateway);

      expect(response.status).toBe(409);
      expect(response.body.code).toBe(409);
      expect(response.body.name).toBe("ConflictError");
      expect(response.body.message).toMatch(/already exists/);
    });
    
  });

 describe("Delete Gateway", () => {
    it("Delete Gateway : success (admin user)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.deleteGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator
      ]);
      expect(gatewayController.deleteGateway).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
    });

    it("Delete Gateway : success (operator user)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.deleteGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(204);
    });

    it("Delete Gateway: 401 UnauthorizedError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Delete Gateway: 403 InsufficientRightsError ", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.name).toBe("InsufficientRightsError");
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("Delete Gateway: 404 NotFoundError (network inesistente)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.deleteGateway as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .delete("/api/v1/networks/NONEXISTENT/gateways/00:11:22:33:44:55")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });

    it("Delete Gateway: 404 NotFoundError (macAddress inesistente)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.deleteGateway as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/FF:FF:FF:FF:FF:FF`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });

  });


  // fine
});