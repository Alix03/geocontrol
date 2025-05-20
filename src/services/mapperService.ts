import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { SensorDAO } from "@models/dao/SensorDAO";
import { Network as NetworkDTO } from "@dto/Network";
import { UserDAO } from "@models/dao/UserDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { UserType } from "@models/UserType";
import { Sensor as SensorDTO } from "@models/dto/Sensor";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { Stats as StatsDTO } from "@dto/Stats";
import { createMeasurement } from "@controllers/measurementController";
import { Measurements as MeasurementsDTO } from "@models/dto/Measurements";

export function createErrorDTO(
  code: number,
  message?: string,
  name?: string
): ErrorDTO {
  return removeNullAttributes({
    code,
    name,
    message,
  }) as ErrorDTO;
}

export function createTokenDTO(token: string): TokenDTO {
  return removeNullAttributes({
    token: token,
  }) as TokenDTO;
}

export function createUserDTO(
  username: string,
  type: UserType,
  password?: string
): UserDTO {
  return removeNullAttributes({
    username,
    type,
    password,
  }) as UserDTO;
}

export function mapUserDAOToDTO(userDAO: UserDAO): UserDTO {
  return createUserDTO(userDAO.username, userDAO.type);
}

export function createGatewayDTO(
  macAddress: string,
  name: string,
  description: string,
  sensors: SensorDAO[]
): GatewayDTO {
  return removeNullAttributes({
    macAddress,
    name,
    description,
    sensors,
  }) as GatewayDTO;
}

export function mapGatewayDAOToDTO(gatewayDAO: GatewayDAO): GatewayDTO {
  return createGatewayDTO(
    gatewayDAO.macAddress,
    gatewayDAO.name,
    gatewayDAO.description,
    gatewayDAO.sensors
  );
}

export function createNetworkDTO(
  code: string,
  name: string,
  description: string,
  gateways: GatewayDAO[]
): NetworkDTO {
  return removeNullAttributes({
    code,
    name,
    description,
    gateways,
  }) as NetworkDTO;
}

export function mapNetworkDAOToDTO(networkDAO: NetworkDAO): NetworkDTO {
  return createNetworkDTO(
    networkDAO.code,
    networkDAO.name,
    networkDAO.description,
    networkDAO.gateways
  );
}
export function createMeasurementsDTO(
  sensorMacAddress: string,
  stats?: StatsDTO,
  measurements?: MeasurementDTO[]
): MeasurementsDTO {
  const measurement= {
    sensorMacAddress,
    ...removeNullAttributes({
      stats,
      measurements
    })
  } as MeasurementsDTO;
 
  return measurement;

}



export function createMeasurementDTO(
  createdAt: Date,
  value: number,
  sensorMac: string,
  isOutlier?: boolean
): MeasurementDTO {
  return removeNullAttributes({
    createdAt,
    value,
    sensorMac,
    isOutlier,
  }) as MeasurementDTO;
}

export function mapMeasurementDAOToDTO(measurementDAO: MeasurementDAO ): MeasurementDTO {
   return createMeasurementDTO(
     measurementDAO.createdAt,
     measurementDAO.value,
     measurementDAO.sensor.macAddress,
     measurementDAO.isOutlier
 );
}

function removeNullAttributes<T>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as Partial<T>;
}

export function mapSensorDAOToDTO(SensorDAO: SensorDAO): SensorDTO {
  return createSensorDTO(
    SensorDAO.macAddress,
    SensorDAO.name,
    SensorDAO.description,
    SensorDAO.variable,
    SensorDAO.unit
  );
}

export function createSensorDTO(
  macAddress: string,
  name: string,
  description: string,
  variable: string,
  unit: string
): SensorDTO {
  return removeNullAttributes({
    macAddress,
    name,
    description,
    variable,
    unit,
  }) as SensorDTO;
}

export function createStatsDTO(
  mean: number,
  variance: number,
  upperThreshold: number,
  lowerThreshold: number,
  startDate?: Date,
  endDate?: Date
): StatsDTO {
  
  return removeNullAttributes({
    startDate,
    endDate,
    mean,
    variance,
    upperThreshold,
    lowerThreshold,
  }) as StatsDTO;
}

export function computeStats(
  measurements: MeasurementDTO[],
  startDate?: Date,
  endDate?: Date
): StatsDTO {


  const n = measurements.length;
  if (n === 0) {
    return null;
  }
  const mean = measurements.reduce((sum, m) => sum + m.value, 0) / n;
  const variance =
    measurements.reduce((sum, m) => sum + (m.value - mean) **2, 0) / n;

  const sigma = Math.sqrt(variance);
  const upperThreshold = mean + 2 * sigma;
  const lowerThreshold = mean - 2 * sigma;

  return createStatsDTO(
    mean,
    variance,
    upperThreshold,
    lowerThreshold,
    startDate,
    endDate
  );
}

export function setOUtliers(measurements: MeasurementsDTO): MeasurementsDTO { 

  if (measurements.measurements == undefined)
      return measurements;

    const lowerThreshold = measurements.stats.lowerThreshold;
    const upperThreshold = measurements.stats.upperThreshold;
    const measurementArray = measurements.measurements;
    
    measurementArray.forEach((y) => {
      if (y.value > upperThreshold || y.value < lowerThreshold) {
        y.isOutlier = true;
      } else {
        y.isOutlier = false;
      }
    });

  return measurements;
}
