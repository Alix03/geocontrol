import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { SensorDAO } from "@models/dao/SensorDAO";
import { Network as NetworkDTO } from "@dto/Network"
import { UserDAO } from "@models/dao/UserDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import {NetworkDAO} from "@models/dao/NetworkDAO"
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { UserType } from "@models/UserType";
import { Sensor as SensorDTO } from "@models/dto/Sensor";

export function createErrorDTO(
  code: number,
  message?: string,
  name?: string
): ErrorDTO {
  return removeNullAttributes({
    code,
    name,
    message
  }) as ErrorDTO;
}

export function createTokenDTO(token: string): TokenDTO {
  return removeNullAttributes({
    token: token
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
    password
  }) as UserDTO;
}


export function mapUserDAOToDTO(userDAO: UserDAO): UserDTO {
  return createUserDTO(userDAO.username, userDAO.type);
}

export function createGatewayDTO(
  macAddress: string,
  name: string,
  description: string,
): GatewayDTO{
  return removeNullAttributes({
    macAddress,
    name,
    description
  }) as GatewayDTO;
}

export function mapGatewayDAOToDTO(gatewayDAO: GatewayDAO): GatewayDTO{
  return createGatewayDTO(gatewayDAO.macAddress, gatewayDAO.name, gatewayDAO.description);
}

export function createNetworkDTO(
  code: string,
  name: string,
  description?: string
): NetworkDTO {
  return removeNullAttributes({
    code,
    name,
    description
  }) as NetworkDTO;
}

export function mapNetworkDAOToDTO(networkDAO: NetworkDAO): NetworkDTO {
  return createNetworkDTO(
    networkDAO.code,
    networkDAO.name,
    networkDAO.description
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
  return createSensorDTO(SensorDAO.macAddress, SensorDAO.name, SensorDAO.description, SensorDAO.variable, SensorDAO.unit);
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
  unit
  }) as SensorDTO;
}
