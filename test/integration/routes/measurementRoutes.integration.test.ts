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
import { NotFoundError } from "@models/errors/NotFoundError";

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

it("get all measurements: 400 Invalid input data", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);

  const response = await request(app)
    .get("/api/v1/networks/NET01/measurements")
    .set("Authorization", token)
    .query({
      startDate: "invalid-date"
    });
  expect(getMeasurementsByNetworkId).not.toHaveBeenCalled();

  expect(response.status).toBe(400);
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

it("get all measurements:404 Not Found", async () => {
  const mockMeasurements: Measurements[] = [];

  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (getMeasurementsByNetworkId as jest.Mock).mockImplementation(() => {
    throw new NotFoundError("Not Found");
  });

  const response = await request(app)
    .get("/api/v1/networks/INVALIDNET/measurements")
    .set("Authorization", token);

  expect(response.status).toBe(404);
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
      {}
    );
  });

  it("getMeasurementBySensor : 401 unauthorized", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("getMeasurementBySensor return empty measurements array when no measurement exists:200", async () => {
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

  it("getMeasurementBySensor: invalid date format in query parameters:400", async () => {

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

  it("get measurements for a specific sensor: 404 Not Found", async () => {

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (getMeasurementBySensorId as jest.Mock).mockImplementation(() => {
    throw new NotFoundError("Not Found");
  });

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
      UserType.Viewer
    ]);
    expect(getMeasurementBySensorId).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "71:B1:CE:01:C6:A9",
      {}
    );
  });

  /*
  getStatsByNetworkId tests
*/
describe("Get stats by network ID", () => {
  it("should get stats for all sensors in network", async () => {
    const mockStats: Measurements[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          mean: 5,
          variance: 0,
          upperThreshold: 5,
          lowerThreshold: 5
        }
      }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getStatsByNetworkId as jest.Mock).mockResolvedValue(mockStats);

    const response = await request(app)
      .get("/api/v1/networks/NET01/stats")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
    expect(getStatsByNetworkId).toHaveBeenCalledWith("NET01", {});
  });

  it("should get stats for specific sensors with date range", async () => {
    const mockStats: Measurements[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          mean: 15,
          variance: 25,
          upperThreshold: 25,
          lowerThreshold: 5,
          startDate: new Date("2025-05-20T14:40:00.000Z"),
          endDate: new Date("2025-05-20T14:50:00.000Z")
        }
      }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getStatsByNetworkId as jest.Mock).mockResolvedValue(mockStats);

    const response = await request(app)
      .get("/api/v1/networks/NET01/stats")
      .set("Authorization", token)
      .query({
        startDate: "2025-05-20T14:40:00.000Z",
        endDate: "2025-05-20T14:50:00.000Z",
        sensorMacs: "71:B1:CE:01:C6:A9"
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
    expect(getStatsByNetworkId).toHaveBeenCalledWith(
      "NET01", 
      {
        startDate: "2025-05-20T14:40:00.000Z",
        endDate: "2025-05-20T14:50:00.000Z",
        sensorMacs: ["71:B1:CE:01:C6:A9"]
      }
    );
  });

  it("should return 401 when unauthorized", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: Invalid token");
    });

    const response = await request(app)
      .get("/api/v1/networks/NET01/stats")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("should return 404 when network not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getStatsByNetworkId as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Network not found");
    });

    const response = await request(app)
      .get("/api/v1/networks/INVALID/stats")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Network not found/);
  });
});

/*
  getStatsBySensorId tests  
*/
  it("getStatsBySensorId: 200", async () => {
    const mockStats = {
      mean: 5,
      variance: 0,
      upperThreshold: 5,
      lowerThreshold: 5
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getStatsBySensorId as jest.Mock).mockResolvedValue(mockStats);

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/stats")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
    expect(getStatsBySensorId).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "71:B1:CE:01:C6:A9",
      {}
    );
  });

  it("getStatsBySensorId for specific date range: 200", async () => {
    const mockStats = {
      mean: 15,
      variance: 25,
      upperThreshold: 25,
      lowerThreshold: 5,
      startDate: new Date("2025-05-20T14:40:00.000Z"),
      endDate: new Date("2025-05-20T14:50:00.000Z")
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getStatsBySensorId as jest.Mock).mockResolvedValue(mockStats);

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/stats")
      .set("Authorization", token)
      .query({
        startDate: "2025-05-20T14:40:00.000Z",
        endDate: "2025-05-20T14:50:00.000Z"
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
    expect(getStatsBySensorId).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "71:B1:CE:01:C6:A9",
      {
        startDate: "2025-05-20T14:40:00.000Z",
        endDate: "2025-05-20T14:50:00.000Z"
      }
    );
  });

  it("getStatsBySensorId: return 401 when unauthorized", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: Invalid token");
    });

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/stats")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("getStatsBySensorId: return 404 when sensor not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getStatsBySensorId as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not found");
    });

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/invalid-mac/stats")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not found/);
  });

  it("getStatsBySensorId: return zero values when no measurements exist", async () => {
    const mockStats = {
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getStatsBySensorId as jest.Mock).mockResolvedValue(mockStats);

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/stats")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
  });

  /*
  getOutliersByNetworkId tests
*/

  it("getOutliersByNetworkId: 200", async () => {
    const mockMeasurements: Measurements[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          mean: 15,
          variance: 25,
          upperThreshold: 25,
          lowerThreshold: 5
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:48:00.000Z"),
            value: 30,
            isOutlier: true
          }
        ]
      }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getOutliersByNetworkId as jest.Mock).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/NET01/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(getOutliersByNetworkId).toHaveBeenCalledWith("NET01", {});
  });

  it("getOutliersByNetworkId with date range filter: 200", async () => {
    const mockMeasurements: Measurements[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          mean: 15,
          variance: 25,
          upperThreshold: 25,
          lowerThreshold: 5,
          startDate: new Date("2025-05-20T14:40:00.000Z"),
          endDate: new Date("2025-05-20T14:50:00.000Z")
        },
        measurements: [
          {
            createdAt: new Date("2025-05-20T14:48:00.000Z"),
            value: 30,
            isOutlier: true
          }
        ]
      }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getOutliersByNetworkId as jest.Mock).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/NET01/outliers")
      .set("Authorization", token)
      .query({
        startDate: "2025-05-20T14:40:00.000Z",
        endDate: "2025-05-20T14:50:00.000Z",
        sensorMacs: ["71:B1:CE:01:C6:A9"]
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(getOutliersByNetworkId).toHaveBeenCalledWith(
      "NET01", 
      {
        startDate: "2025-05-20T14:40:00.000Z",
        endDate: "2025-05-20T14:50:00.000Z",
        sensorMacs: ["71:B1:CE:01:C6:A9"]
      }
    );
  });

  it("getOutliersByNetworkId: return 401 when unauthorized", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: Invalid token");
    });

    const response = await request(app)
      .get("/api/v1/networks/NET01/outliers")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("should return 404 when network not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getOutliersByNetworkId as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Network not found");
    });

    const response = await request(app)
      .get("/api/v1/networks/INVALID/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Network not found/);
  });

  it("should return empty array when no outliers exist", async () => {
    const mockMeasurements: Measurements[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          mean: 15,
          variance: 25,
          upperThreshold: 25,
          lowerThreshold: 5
        },
        measurements: []
      }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getOutliersByNetworkId as jest.Mock).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/NET01/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
  });


/*
  getOutliersBySensorId tests
*/
  it("getOutliersBySensorId: 200", async () => {
    const mockMeasurements: Measurements = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        mean: 15,
        variance: 25,
        upperThreshold: 25,
        lowerThreshold: 5
      },
      measurements: [
        {
          createdAt: new Date("2025-05-20T14:48:00.000Z"),
          value: 30,
          isOutlier: true
        }
      ]
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getOutliersBySensorId as jest.Mock).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(getOutliersBySensorId).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "71:B1:CE:01:C6:A9",
      {}
    );
  });

  it("getOutliersBySensorId with date range filter: 200", async () => {
    const mockMeasurements: Measurements = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        mean: 15,
        variance: 25,
        upperThreshold: 25,
        lowerThreshold: 5,
        startDate: new Date("2025-05-20T14:40:00.000Z"),
        endDate: new Date("2025-05-20T14:50:00.000Z")
      },
      measurements: [
        {
          createdAt: new Date("2025-05-20T14:48:00.000Z"),
          value: 30,
          isOutlier: true
        }
      ]
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getOutliersBySensorId as jest.Mock).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/outliers")
      .set("Authorization", token)
      .query({
        startDate: "2025-05-20T14:40:00.000Z",
        endDate: "2025-05-20T14:50:00.000Z"
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(getOutliersBySensorId).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "71:B1:CE:01:C6:A9",
      {
        startDate: "2025-05-20T14:40:00.000Z",
        endDate: "2025-05-20T14:50:00.000Z"
      }
    );
  });

  it("getOutliersBySensorId: return 401 when unauthorized", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: Invalid token");
    });

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/outliers")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("getOutliersBySensorId: return 404 when entity not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getOutliersBySensorId as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not found");
    });

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/invalid-mac/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not found/);
  });

  it("getOutliersBySensorId: return empty measurements when no outliers exist", async () => {
    const mockMeasurements: Measurements = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        mean: 15,
        variance: 25,
        upperThreshold: 25,
        lowerThreshold: 5
      },
      measurements: []
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (getOutliersBySensorId as jest.Mock).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
  });


  /*
  createMeasurement
  */
  it("createMeasurement: 201", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (createMeasurement as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token)
      .send([{
        value: 30,
        createdAt: "2025-05-20T14:48:00.000Z"
      }]);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
          UserType.Admin,
          UserType.Operator
        ]);
    expect(createMeasurement).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "71:B1:CE:01:C6:A9",
      [{
        value: 30,
        createdAt: "2025-05-20T14:48:00.000Z"
      }]
    );
  });

  it("createMeasurement: 400 invalid measurement data", async () => {
    const invalidMeasurements = [{
      // Missing required value field
      createdAt: "2025-05-20T14:48:00.000Z"
    }];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token)
      .send(invalidMeasurements);

    expect(response.status).toBe(400);
    expect(createMeasurement).not.toHaveBeenCalled();
  });

  it("createMeasurement: 400 invalid date format", async () => {
    const invalidMeasurements = [{
      value: 30,
      createdAt: "invalid-date"
    }];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token)
      .send(invalidMeasurements);

    expect(response.status).toBe(400);
    expect(createMeasurement).not.toHaveBeenCalled();
  });

  it("createMeasurement: 401 handle unauthorized access", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: Invalid token");
    });

    const response = await request(app)
      .post("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", "Bearer invalid")
      .send([{
        value: 30,
        createdAt: "2025-05-20T14:48:00.000Z"
      }]);

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("createMeasurement: 403 handle insufficient rights", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .post("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token)
      .send([{
        value: 30,
        createdAt: "2025-05-20T14:48:00.000Z"
      }]);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("createMeasurement: 404 non-existent sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (createMeasurement as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not found");
    });

    const response = await request(app)
      .post("/api/v1/networks/NET01/gateways/gw1/sensors/invalid-mac/measurements")
      .set("Authorization", token)
      .send([{
        value: 30,
        createdAt: "2025-05-20T14:48:00.000Z"
      }]);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not found/);
  });

  it("createMeasurement: 201 handle multiple measurements", async () => {
    const measurements = [
      {
        value: 30,
        createdAt: "2025-05-20T14:48:00.000Z"
      },
      {
        value: 25,
        createdAt: "2025-05-20T14:49:00.000Z"
      }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (createMeasurement as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/v1/networks/NET01/gateways/gw1/sensors/71:B1:CE:01:C6:A9/measurements")
      .set("Authorization", token)
      .send(measurements);

    expect(response.status).toBe(201);
    expect(createMeasurement).toHaveBeenCalledWith(
      "NET01",
      "gw1",
      "71:B1:CE:01:C6:A9",
      measurements
    );
  });

});
