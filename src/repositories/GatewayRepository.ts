import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

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
    newAddress: string,
    name?: string,
    description?: string,
  ): Promise<GatewayDAO> {
    const gateway = await this.getGatewayByMac(oldAddress); 
    if (!gateway) {
      throw new NotFoundError(`Gateway with code '${oldAddress}' not found`);
    }


    
    if (oldAddress != newAddress){
      const existing = await this.repo.findOne({ where: { macAddress: newAddress } });
      if (existing) {
        throw new ConflictError(`Gateway with code '${newAddress}' already exists`);
      }
      gateway.macAddress=newAddress;
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
