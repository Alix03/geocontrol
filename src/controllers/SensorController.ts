import { Sensor as SensorDTO } from "@models/dto/Sensor";

export async function getAllSensors(networkCode : string, gatewayMac: string): Promise<SensorDTO[]> {
  const sensorRepo = new SensorRepository();
  return (await sensorRepo.getAllSensors(networkCode, gatewayMac)).map(mapSensorDAOToDTO);  //forse non serve networkCode
  
}

export async function getSensor(networkCode : string, gatewayMac: string, sensorMac: string): Promise<SensorDTO> {
  const sensorRepo = new SensorRepository();
  return mapSensorDAOToDTO(await sensorRepo.getSensorByMac(sensorMac));
  //devo controllare che faccia parte del gateway e del network?

}

export async function createSensor(networkCode : string, gatewayMac: string, sensorDto: SensorDTO): Promise<void> {
  const sensorRepo = new SensorRepository();
  //devo controllare che il gateway faccia parte del network?
  await sensorRepo.createSensor(sensorDto.macAddress, sensorDto.name, sensorDto.description, sensorDto.variable, sensorDto.unit, gatewayMac);
}

export async function deleteSensor(sensorMac: string): Promise<void> {
  const sensorRepo = new SensorRepository();
  //controlli?
  await sensorRepo.deleteSensor(sensorMac);
}

export async function updateNetwork(sensorDto: SensorDTO): Promise<void> {
  const sensorRepo = new SensorRepository();
  //controlli?
  await sensorRepo.updateSensor(sensorDto.macAddress, sensorDto.name, sensorDto.description, sensorDto.variable, sensorDto.unit);
}
