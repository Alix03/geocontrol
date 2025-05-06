import {Network as NetworkDTO} from "@dto/Network"
import { NetworkRepository } from "@repositories/NetworkRepository"
import { mapNetworkDAOToDTO } from "@services/mapperService";

export async function getAllNetworks(): Promise<NetworkDTO[]> {
  const networkRepo = new NetworkRepository();
  return (await networkRepo.getAllNetworks()).map(mapNetworkDAOToDTO);
}


export async function createNetwork(networkDto: NetworkDTO): Promise<void> {
  const networkRepo = new NetworkRepository();
  await networkRepo.createNetwork(networkDto.code, networkDto.name, networkDto.description);
}






