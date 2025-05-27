import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { Measurements } from "@models/dto/Measurements";
import {
  createMeasurement,
  getMeasurementsByNetworkId,
  getMeasurementBySensorId,
  getStatsByNetworkId,
  getStatsBySensorId,
  getOutliersByNetworkId,
  getOutliersBySensorId,
} from "@controllers/measurementController";
import { UserType } from "@models/UserType";

jest.mock("@services/authService");
jest.mock("@controllers/measurementController");

describe("MeasurementRoutes integration", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("get all measurements of a network or of a set of sensor", async () => {
  const mockMeasurements: Measurements[] = [
    {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        mean: 5,
        variance: 0,
        upperThreshold: 5,
        lowerThreshold: 5
      },
      measurements: [
        {
          createdAt: new Date("2025-05-20T14:48:00.000Z"),
          value: 5,
          isOutlier: false
        }
      ]
    }
  ];

  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (getMeasurementsByNetworkId as jest.Mock).mockResolvedValue(mockMeasurements);

  const response = await request(app)
    .get("/api/v1/networks/NET01/measurements")
    .set("Authorization", token)
    .query({
      startDate: "2025-05-20T14:40:00.000Z",
      endDate: "2025-05-20T14:50:00.000Z",
      sensorMacs: "71:B1:CE:01:C6:A9"
    });

  expect(response.status).toBe(200);
  expect(response.body).toEqual(mockMeasurements);
  expect(authService.processToken).toHaveBeenCalledWith(token, [
    UserType.Admin,
    UserType.Operator,
    UserType.Viewer
  ]);
  expect(getMeasurementsByNetworkId).toHaveBeenCalledWith(
    "NET01",
    {
      startDate: "2025-05-20T14:40:00.000Z",
      endDate: "2025-05-20T14:50:00.000Z",
      sensorMacs: ["71:B1:CE:01:C6:A9"]
    }
  );
});

it("get all measurements: 401 UnauthorizedError", async () => {
  (authService.processToken as jest.Mock).mockImplementation(() => {
    throw new UnauthorizedError("Unauthorized: No token provided");
  });

  const response = await request(app)
    .get("/api/v1/networks/NET01/measurements")
    .set("Authorization", "Bearer invalid");

  expect(response.status).toBe(401);
  expect(response.body.message).toMatch(/Unauthorized/);
});

it("get all measurements: empty result", async () => {
  const mockMeasurements: Measurements[] = [];

  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (getMeasurementsByNetworkId as jest.Mock).mockResolvedValue(mockMeasurements);

  const response = await request(app)
    .get("/api/v1/networks/NET01/measurements")
    .set("Authorization", token);

  expect(response.status).toBe(200);
  expect(response.body).toEqual([]);
  });

  /*
  getMeasurementBySensor
  */
  it("get measurements for a specific sensor", async () => {
    const mockMeasurements: Measurements = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        mean: 5,
        variance: 0,
        upperThreshold: 5,
        lowerThreshold: 5
      },
      measurements: [
        {
          createdAt: new Date("2025-05-20T14:48:00.000Z"),
          value: 5,
          isOutlier: false
        }
      ]
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getMeasurementBySensorId as jest.Mock).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
      UserType.Viewer
    ]);
    expect(getMeasurementBySensorId).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "71:B1:CE:01:C6:A9",
      undefined
    );
  });

  it("getMeasurementBySensor return 401 when unauthorized", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("getMeasurementBySensor return empty measurements array when no measurement exists", async () => {
    const mockMeasurements: Measurements = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getMeasurementBySensorId as jest.Mock).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
  });

  it("getMeasurementBySensor: invalid date format in query parameters", async () => {

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getMeasurementBySensorId as jest.Mock).mockResolvedValue({});

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token)
      .query({
        startDate: "invalid-date",
        endDate: "2025-05-20T14:50:00.000Z"
      });

    expect(response.status).toBe(400);
    expect(getMeasurementBySensorId).not.toHaveBeenCalled();
  });

});
