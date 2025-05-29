import { Sensor as SensorDTO } from "@models/dto/Sensor";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { mapSensorDAOToDTO } from "@services/mapperService";
import { AppError } from "@errors/AppError"

export async function getAllSensors(
  networkCode: string,
  gatewayMac: string
): Promise<SensorDTO[]> {
  const sensorRepo = new SensorRepository();

  //verifica esistenza network e gateway
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();
  await networkRepo.getNetworkByCode(networkCode);
  await gatewayRepo.getGatewayByMac(networkCode, gatewayMac);

  return (await sensorRepo.getAllSensors(networkCode, gatewayMac)).map(
    mapSensorDAOToDTO
  );
}

export async function getSensor(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string
): Promise<SensorDTO> {
  const sensorRepo = new SensorRepository();

  //verifica esistenza network e gateway
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();
  await networkRepo.getNetworkByCode(networkCode);
  await gatewayRepo.getGatewayByMac(networkCode, gatewayMac);

  return mapSensorDAOToDTO(
    await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac)
  );
}

export async function createSensor(
  networkCode: string,
  gatewayMac: string,
  sensorDto: SensorDTO
): Promise<void> {

  if (sensorDto.macAddress.trim().length == 0) {
    throw new AppError("MAC Address cannot be empty", 500);
  }else{

    const sensorRepo = new SensorRepository();

    //verifica esistenza network e gateway
    const gatewayRepo = new GatewayRepository();
    await gatewayRepo.getGatewayByMac(networkCode, gatewayMac);

    await sensorRepo.createSensor(
      gatewayMac,
      sensorDto.macAddress,
      sensorDto.name,
      sensorDto.description,
      sensorDto.variable,
      sensorDto.unit
    );
  }
}

export async function deleteSensor(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string
): Promise<void> {
  const sensorRepo = new SensorRepository();

  //verifica esistenza network e gateway
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();
  await networkRepo.getNetworkByCode(networkCode);
  await gatewayRepo.getGatewayByMac(networkCode, gatewayMac);

  await sensorRepo.deleteSensor(networkCode, gatewayMac, sensorMac);
}

export async function updateSensor(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  sensorDto: SensorDTO
): Promise<void> {
  if (sensorDto.macAddress.trim().length == 0) {
    throw new AppError("MAC Address cannot be empty", 500);
  }else{
    const sensorRepo = new SensorRepository();

    //verifica esistenza network e gateway
    const gatewayRepo = new GatewayRepository();
    const networkRepo = new NetworkRepository();
    await networkRepo.getNetworkByCode(networkCode);
    await gatewayRepo.getGatewayByMac(networkCode, gatewayMac);

    await sensorRepo.updateSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorDto.macAddress,
      sensorDto.name,
      sensorDto.description,
      sensorDto.variable,
      sensorDto.unit
    );
  }
}
