import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class GatewayRepository{
  private repo: Repository<GatewayDAO>;

  constructor(){
    this.repo = AppDataSource.getRepository(GatewayDAO);
  }

  getAllGateways(): Promise<GatewayDAO[]>{
    return this.repo.find();
  }

  async getGatewaysByNetworkId(networkId: string): Promise<GatewayDAO[]> {
    return await this.repo.find({
      relations: ["network"], 
      where: {
        network: {
          code: networkId},
      },
    });
  }

  async getGatewayByMac(macAddress: string) : Promise<GatewayDAO>{
    return findOrThrowNotFound(
      await this.repo.find({where: {macAddress}}),
      () => true,
      `Gateway with MAC address ${macAddress} not found`
    );
  }


  async createGateway(
    macAddress: string,
    name: string,
    description: string,
  ):
  Promise<GatewayDAO>{
    throwConflictIfFound(
      await this.repo.find({where: {macAddress}}),
      () => true,
      `Gateway with MAC address ${macAddress} already exists`
    );
    return this.repo.save({
      macAddress: macAddress,
        name: name,
        description: description
    });
  }

  async deleteGateway(macAddress: string): Promise<void>{
    await this.repo.remove(await this.getGatewayByMac(macAddress));
  }

  async updateGateway(
    oldAddress: string,
    macAddress: string,
    name?: string,
    description?: string,
  ): Promise<GatewayDAO> {
    const gateway = await this.getGatewayByMac(oldAddress); 
    
    if (oldAddress != macAddress){
      await this.repo.remove(gateway);
      gateway.macAddress=macAddress;
    }

    if (name !== undefined) {
      gateway.name = name;
    }
  
    if (description !== undefined) {
      gateway.description = description;
    }

    return this.repo.save(gateway); 
  }
}
