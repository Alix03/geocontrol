import {Network as NetworkDTO} from "@dto/Network"
import { NetworkRepository } from "@repositories/NetworkRepository"
import { mapNetworkDAOToDTO } from "@services/mapperService";
import AppError from "@models/errors/AppError";

export async function getAllNetworks(): Promise<NetworkDTO[]> {
  const networkRepo = new NetworkRepository();
  return (await networkRepo.getAllNetworks()).map(mapNetworkDAOToDTO);
}


export async function createNetwork(networkDto: NetworkDTO): Promise<void> {
  if (networkDto.code.trim().length == 0) {
    throw new AppError("Network code cannot be empty", 500);
  } else {
    const networkRepo = new NetworkRepository();
    await networkRepo.createNetwork(networkDto.code, networkDto.name, networkDto.description);
  }
}

export async function getNetwork(code: string): Promise<NetworkDTO> {
  const networkRepo = new NetworkRepository();
  return mapNetworkDAOToDTO(await networkRepo.getNetworkByCode(code));
}

export async function deleteNetwork(code: string): Promise<void> {
  const networkRepo = new NetworkRepository();
  await networkRepo.deleteNetwork(code);
}
export async function updateNetwork(currentCode, networkDto: NetworkDTO): Promise<void> {
  if (networkDto.code.trim().length == 0) {
    throw new AppError("Network code cannot be empty", 500);
  } else {
    const networkRepo = new NetworkRepository();
    await networkRepo.updateNetwork(currentCode, networkDto.code, networkDto.name, networkDto.description);
  }
}







