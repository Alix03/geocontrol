import { Sensor as SensorDTO } from "@models/dto/Sensor";
import { SensorRepository } from "@repositories/SensorRepository";
import { mapSensorDAOToDTO } from "@services/mapperService";


export async function getAllSensors(networkCode : string, gatewayMac: string): Promise<SensorDTO[]> {
  const sensorRepo = new SensorRepository();
  return (await sensorRepo.getAllSensors(networkCode, gatewayMac)).map(mapSensorDAOToDTO);  
  
}

export async function getSensor(networkCode : string, gatewayMac: string, sensorMac: string): Promise<SensorDTO> {
  const sensorRepo = new SensorRepository();
  return mapSensorDAOToDTO(await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac));
  //devo controllare che faccia parte del gateway e del network?

}

export async function createSensor(networkCode : string, gatewayMac: string, sensorDto: SensorDTO): Promise<void> {
  const sensorRepo = new SensorRepository();
  //devo controllare che il gateway faccia parte del network?
  await sensorRepo.createSensor(gatewayMac, sensorDto.macAddress, sensorDto.name, sensorDto.description, sensorDto.variable, sensorDto.unit);
}

export async function deleteSensor(networkCode : string, gatewayMac: string, sensorMac: string): Promise<void> {
  const sensorRepo = new SensorRepository();
  //controlli?
  await sensorRepo.deleteSensor(networkCode, gatewayMac, sensorMac);
}

export async function updateSensor(networkCode: string, gatewayMac: string, sensorMac: string, sensorDto: SensorDTO): Promise<void> {
  const sensorRepo = new SensorRepository();
  //controlli?
  await sensorRepo.updateSensor(networkCode, gatewayMac, sensorMac, sensorDto.macAddress, sensorDto.name, sensorDto.description, sensorDto.variable, sensorDto.unit);
}
