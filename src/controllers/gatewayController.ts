import { Gateway as GatewayDTO } from "@models/dto/Gateway";
//import { getAllSensors } from "@controllers/SensorController";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { mapGatewayDAOToDTO } from "@services/mapperService";

export async function getAllGateways(networkCode ? : string): Promise<GatewayDTO[]> {
  const gatewayRepo = new GatewayRepository();
  let gatewaysDAO= [];

  if (networkCode != undefined){
    gatewaysDAO = await gatewayRepo.getGatewaysByNetworkId(networkCode);
  }
  else {
    gatewaysDAO = await gatewayRepo.getAllGateways();
  }
  const gatewaysDTO: GatewayDTO[] = [];

  for (const gatewayDAO of gatewaysDAO) {
    const gatewayDTO = mapGatewayDAOToDTO(gatewayDAO);

    //gatewayDTO.sensors = getAllSensors(networkCode, gatewayDAO.macAddress);
    gatewaysDTO.push(gatewayDTO);
  }

  return gatewaysDTO ;
}

export async function getGateway( gatewayMac: string, networkCode? : string): Promise<GatewayDTO> {
  const gatewayRepo = new GatewayRepository(); 
  const gatewayDAO= await gatewayRepo.getGatewayByMac(gatewayMac);
  //controlli?
  const gatewayDTO = mapGatewayDAOToDTO(gatewayDAO);
  //gatewayDTO.sensors = getAllSensors(networkCode, gatewayDAO.macAddress);

  return gatewayDTO ;
}

export async function createGateway(gatewayDTO: GatewayDTO ,networkCode ?: string): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.createGateway(gatewayDTO.macAddress, gatewayDTO.name, gatewayDTO.description);
}

export async function deleteGateway( gatewayMac: string, networkCode ?: string): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  //controlli?
  await gatewayRepo.deleteGateway(gatewayMac);
}

export async function updateGateway( oldAddress: string, gatewayDTO: GatewayDTO, networkCode ?: string,): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  //controlli?
  await gatewayRepo.updateGateway(oldAddress, gatewayDTO.macAddress, gatewayDTO.name, gatewayDTO.description);
}