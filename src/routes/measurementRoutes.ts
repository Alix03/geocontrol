import { CONFIG } from "@config";
import { authenticateUser } from "@middlewares/authMiddleware";
import AppError from "@models/errors/AppError";
import { UserType } from "@models/UserType";
import { create } from "domain";
import { Router } from "express";
import { createMeasurement } from "@controllers/measurementController";

const router = Router();

// Store a measurement for a sensor (Admin & Operator)

router.post(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try{
      const sensorMac = req.params.sensorMac;
      const measurement = req.body;
      await createMeasurement(sensorMac, measurement);
      res.status(201).json({
        message: "Measurement created successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

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