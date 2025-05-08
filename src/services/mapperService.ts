import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { SensorDAO } from "@models/dao/SensorDAO";
import { UserDAO } from "@models/dao/UserDAO";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { UserType } from "@models/UserType";

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


async function findSensorsByNetworkGateway(networkCode: string, gatewayMac: string): Promise<SensorDAO[]> {
  
  const networkDAO = await this.networkRepo.findOne(networkCode);

  // 2. Verifica appartenenza gateway al network
  const gatewayDAO = await this.gatewayRepo.findOne({
    where: { macAddress: gatewayMac, network: { id: network.id } },
  });

  // 3. Recupera i sensori
  return this.sensorRepo.findByGatewayId(gatewayDAO.id);

}