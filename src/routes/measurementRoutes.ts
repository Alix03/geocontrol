import { CONFIG } from "@config";
import { authenticateUser } from "@middlewares/authMiddleware";
import AppError from "@models/errors/AppError";
import { UserType } from "@models/UserType";
import { create } from "domain";
import { Router } from "express";
import {
  createMeasurement,
  getMeasurementByNetworkId,
  getMeasurementBySensorId,
  getStatsByNetworkId,
  getStatsBySensorId,
  getOutliersByNetworkId,
  getOutliersBySensorId,
} from "@controllers/measurementController";
import { query } from "winston";

const router = Router();

// Store a measurement for a sensor (Admin & Operator)

router.post(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      const networkCode = req.params.networkCode;
      const gatewayMac = req.params.gatewayMac;
      const sensorMac = req.params.sensorMac;
      const measurement = req.body;
      await createMeasurement(networkCode, gatewayMac, sensorMac, measurement);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const networkCode = req.params.networkCode;
      res
        .status(200)
        .json(await getMeasurementByNetworkId(networkCode, req.query));
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const networkCode = req.params.networkCode;
      const gatewayMac = req.params.gatewayMac;
      const sensorMac = req.params.sensorMac;
      res
        .status(200)
        .json(
          await getMeasurementBySensorId(
            networkCode,
            gatewayMac,
            sensorMac,
            req.query
          )
        );
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const networkCode = req.params.networkCode;
      const gatewayMac = req.params.gatewayMac;
      const sensorMac = req.params.sensorMac;
      res
        .status(200)
        .json(
          await getStatsBySensorId(
            networkCode,
            gatewayMac,
            sensorMac,
            req.query
          )
        );
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const networkCode = req.params.networkCode;
      const gatewayMac = req.params.gatewayMac;
      const sensorMac = req.params.sensorMac;
      res
        .status(200)
        .json(
          await getOutliersBySensorId(
            networkCode,
            gatewayMac,
            sensorMac,
            req.query
          )
        );
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const networkCode = req.params.networkCode;
      res.status(200).json(await getStatsByNetworkId(networkCode, req.query));
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const networkCode = req.params.networkCode;
      res
        .status(200)
        .json(await getOutliersByNetworkId(networkCode, req.query));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
