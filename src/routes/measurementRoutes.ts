/*

import { CONFIG } from "@config";
import AppError from "@models/errors/AppError";
import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import {
  createMeasurement,
  getMeasurementBySensorId,
  getOutliersBySensorId,
  getMeasurementByNetworkId,
  getOutliersByNetworkId,
} from "@controllers/measurementController";
import { MeasurementFromJSON } from "@models/dto/Measurement";



const router = Router();

// Store a measurement for a sensor (Admin & Operator)
router.post(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const measurement = MeasurementFromJSON(req.body);
     // await createMeasurement(measurement);
      res.status(201).send();
    } catch (error) {
      next(error);
  }
});

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve statistics for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

export default router;
*/
