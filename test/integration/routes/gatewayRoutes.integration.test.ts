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
    // test qui


    // fine createGateway
});




  // fine
});