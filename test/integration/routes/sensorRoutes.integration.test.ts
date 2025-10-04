import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as sensorController from "@controllers/SensorController";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { UserType } from "@models/UserType";

jest.mock("@services/authService");
jest.mock("@controllers/SensorController");

describe("SensorRoutes integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "NET001";
  const gatewayMac = "00:11:22:33:44:55";

  const mockSensor: SensorDTO = {
    macAddress: "AA:BB:CC:DD:EE:FF",
    name: "Temperature Sensor",
    description: "Outdoor temperature sensor",
    variable: "temperature",
    unit: "°C",
  };

  const mockSensors: SensorDTO[] = [
    mockSensor,
    {
      macAddress: "11:22:33:44:55:66",
      name: "Humidity Sensor",
      description: "Indoor humidity sensor",
      variable: "humidity",
      unit: "%",
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Create Sensor", () => {
    const newSensor: SensorDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "New Sensor",
      description: "Newly created sensor",
      variable: "temperature",
      unit: "°C",
    };

    it("Create Sensor: success (Admin user)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send(newSensor);

      expect(response.status).toBe(201);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator,
      ]);
      expect(sensorController.createSensor).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        newSensor
      );
    });

    it("Create Sensor: success (Operator user)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send(newSensor);

      expect(response.status).toBe(201);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator,
      ]);
    });

    it("Create Sensor: 401 Unauthorized)", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", "Bearer invalid")
        .send(newSensor);

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Create Sensor: 403 Insufficient rights", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send(newSensor);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.name).toBe("InsufficientRightsError");
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("Create Sensor: 404 Not Found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      const response = await request(app)
        .post(`/api/v1/networks/NONEXISTENT/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send(newSensor);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });

    it("Create Sensor: 409 Conflict (macAddress already in use)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockRejectedValue(
        new ConflictError(
          "Sensor with macAddress AA:BB:CC:DD:EE:FF already exists"
        )
      );

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send(newSensor);

      expect(response.status).toBe(409);
      expect(response.body.code).toBe(409);
      expect(response.body.name).toBe("ConflictError");
      expect(response.body.message).toMatch(/already exists/);
    });
  });

  describe("Get All Sensors", () => {
    it("Get All Sensors: success (authenticated user)", async () => {
      // Arrange
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getAllSensors as jest.Mock).mockResolvedValue(
        mockSensors
      );

      // Act
      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSensors);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator,
        UserType.Viewer,
      ]);
      expect(sensorController.getAllSensors).toHaveBeenCalledWith(
        networkCode,
        gatewayMac
      );
    });

    it("Get All Sensors: 401 UnauthorizedError", async () => {
      // Arrange
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      // Act
      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", "Bearer invalid");

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Get All Sensors: 404 Not Found Error", async () => {
      // Arrange
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getAllSensors as jest.Mock).mockRejectedValue(
        new NotFoundError("Entity not found")
      );

      // Act
      const response = await request(app)
        .get(`/api/v1/networks/NONEXISTENT/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Entity not found/);
    });
  });

  //////////////////////////////////// FINIRE GET SENSOR, PATCH SENSOR, DELETE SENSOR ////////////////////////////////////
  describe("Get Sensor", () => {
    it("Get Sensor: success", async () => {
      // Arrange
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      const sensorMac = mockSensor.macAddress;
      (sensorController.getSensor as jest.Mock).mockResolvedValue(mockSensor);

      // Act
      const response = await request(app)
        .get(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSensor);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator,
        UserType.Viewer,
      ]);
      expect(sensorController.getSensor).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        sensorMac
      );
    });

    it("Get Sensor: 401 UnauthorizedError", async () => {
      // Arrange
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });
      const sensorMac = mockSensor.macAddress;

      // Act
      const response = await request(app)
        .get(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", "Bearer invalid");

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Get Sensor: 404 Not Found Error (sensore inesistente)", async () => {
      // Arrange
      const sensorMac = "INVALID_MAC";
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Sensor not found")
      );

      // Act
      const response = await request(app)
        .get(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Sensor not found/);
    });

    it("Get Sensor: 404 Not Found Error (Gateway inesistente)", async () => {
      // Arrange
      const sensorMac = "INVALID_MAC";
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Gateway not found")
      );

      // Act
      const response = await request(app)
        .get(
          `/api/v1/networks/${networkCode}/gateways/NONEXISTENT_GATEWAY/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Gateway not found/);
    });
  });

  describe("Delete Sensor", () => {
    it("Delete Sensor: success (admin user)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensor as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await request(app)
        .delete(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator,
      ]);
      expect(sensorController.deleteSensor).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        sensorMac
      );
    });

    it("Delete Sensor: success (operator user)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensor as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await request(app)
        .delete(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(204);
    });

    it("Delete Sensor: 401 UnauthorizedError", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      // Act
      const response = await request(app)
        .delete(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", "Bearer invalid");

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Delete Sensor: 403 InsufficientRightsError", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      // Act
      const response = await request(app)
        .delete(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.name).toBe("InsufficientRightsError");
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("Delete Sensor: 404 NotFoundError (network inesistente)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Network not found")
      );

      // Act
      const response = await request(app)
        .delete(
          `/api/v1/networks/NONEXISTENT_NETWORK/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Network not found/);
    });

    it("Delete Sensor: 404 NotFoundError (gateway inesistente)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Gateway not found")
      );

      // Act
      const response = await request(app)
        .delete(
          `/api/v1/networks/${networkCode}/gateways/NONEXISTENT_GATEWAY/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Gateway not found/);
    });

    it("Delete Sensor: 404 NotFoundError (sensor inesistente)", async () => {
      // Arrange
      const sensorMac = "INVALID_MAC";
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Sensor not found")
      );

      // Act
      const response = await request(app)
        .delete(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Sensor not found/);
    });
  });

  describe("Update Sensor", () => {
    const updatedSensor: SensorDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF", // Updated MAC
      name: "Updated Sensor Name",
      description: "Updated description",
      variable: "humidity",
      unit: "%",
    };

    it("Update Sensor: success (admin user)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await request(app)
        .patch(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token)
        .send(updatedSensor);

      // Assert
      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator,
      ]);
      expect(sensorController.updateSensor).toHaveBeenCalledWith(
        networkCode,
        gatewayMac,
        sensorMac,
        updatedSensor
      );
    });

    it("Update Sensor: success (operator user)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await request(app)
        .patch(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token)
        .send(updatedSensor);

      // Assert
      expect(response.status).toBe(204);
    });

    it("Update Sensor: 401 UnauthorizedError", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token format");
      });

      // Act
      const response = await request(app)
        .patch(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", "Bearer invalid")
        .send(updatedSensor);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.code).toBe(401);
      expect(response.body.name).toBe("UnauthorizedError");
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Update Sensor: 403 InsufficientRightsError", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      // Act
      const response = await request(app)
        .patch(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token)
        .send(updatedSensor);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.name).toBe("InsufficientRightsError");
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("Update Sensor: 404 NotFoundError (network inesistente)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Network not found")
      );

      // Act
      const response = await request(app)
        .patch(
          `/api/v1/networks/NONEXISTENT_NETWORK/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token)
        .send(updatedSensor);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Network not found/);
    });

    it("Update Sensor: 404 NotFoundError (gateway inesistente)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Gateway not found")
      );

      // Act
      const response = await request(app)
        .patch(
          `/api/v1/networks/${networkCode}/gateways/NONEXISTENT_GATEWAY/sensors/${sensorMac}`
        )
        .set("Authorization", token)
        .send(updatedSensor);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Gateway not found/);
    });

    it("Update Sensor: 404 NotFoundError (sensor inesistente)", async () => {
      // Arrange
      const sensorMac = "INVALID_MAC";
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockRejectedValue(
        new NotFoundError("Sensor not found")
      );

      // Act
      const response = await request(app)
        .patch(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token)
        .send(updatedSensor);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toMatch(/Sensor not found/);
    });

    it("Update Sensor: 409 ConflictError (macAddress esistente)", async () => {
      // Arrange
      const sensorMac = mockSensor.macAddress;
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockRejectedValue(
        new ConflictError(
          "Sensor with macAddress AA:BB:CC:DD:EE:FF already exists"
        )
      );

      // Act
      const response = await request(app)
        .patch(
          `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`
        )
        .set("Authorization", token)
        .send(updatedSensor);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.code).toBe(409);
      expect(response.body.name).toBe("ConflictError");
      expect(response.body.message).toMatch(/already exists/);
    });
  });
});
