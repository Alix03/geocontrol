import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { mapGatewayDAOToDTO } from "@services/mapperService";

export async function getAllGateways(networkCode  : string): Promise<GatewayDTO[]> {
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();

  await networkRepo.getNetworkByCode(networkCode);

  return (await gatewayRepo.getAllGateways(networkCode)).map(gateway => mapGatewayDAOToDTO(gateway));
  
}

export async function getGateway(networkCode : string, gatewayMac: string): Promise<GatewayDTO> {
  const gatewayRepo = new GatewayRepository(); 
  // manca controllo su networkCode se esiste o meno -> se non esiste deve lanciare eccezione
  const gatewayDAO= await gatewayRepo.getGatewayByMac(networkCode,gatewayMac);
  
  const gatewayDTO = mapGatewayDAOToDTO(gatewayDAO);

  return gatewayDTO ;
}

export async function createGateway(networkCode : string, gatewayDTO: GatewayDTO ): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  // controllo su networkCode fatto nella repo
  await gatewayRepo.createGateway(networkCode, gatewayDTO.macAddress, gatewayDTO.name, gatewayDTO.description);
}

export async function deleteGateway( networkCode : string ,gatewayMac: string): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  //controllo su networkcode? non so se necessario perchè al massimo non elimino nulla se non esiste
  await gatewayRepo.deleteGateway(networkCode, gatewayMac);
}

export async function updateGateway(networkCode : string, oldAddress: string, gatewayDTO: GatewayDTO): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  //controllo su network code non viene fatto nè qui e nè nella repo
  await gatewayRepo.updateGateway(networkCode, oldAddress, gatewayDTO.macAddress, gatewayDTO.name, gatewayDTO.description);
}