import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { NetworkDAO } from "@models/dao/NetworkDAO";

export class GatewayRepository{
  private repo: Repository<GatewayDAO>;

  constructor(){
    this.repo = AppDataSource.getRepository(GatewayDAO);
  }

  getAllGateways(networkCode: string): Promise<GatewayDAO[]>{
    return this.repo.find({ where: {
      network: {
        code: networkCode
      }},
      relations: ["network"]
  })
  }


  async getGatewayByMac(networkCode: string, macAddress: string) : Promise<GatewayDAO>{
    return findOrThrowNotFound(
      await this.repo.find({
        where: {
        macAddress,
        network: {
          code: networkCode
        }},
        relations: ["network"]
      }),
      () => true,
      `Gateway with MAC address ${macAddress} not found`
    );
  }


  async createGateway(
    networkCode: string,
    macAddress: string,
    name?: string,
    description?: string,
  ):
  Promise<GatewayDAO>{
    throwConflictIfFound(
      await this.repo.find({where: {macAddress}}),
      () => true,
      `Gateway with MAC address ${macAddress} already exists`
    );

    const network = findOrThrowNotFound(
      await AppDataSource.getRepository(NetworkDAO).find({where : {code: networkCode}}),
      () => true,
      `Network with code '${networkCode}' not found`
    );

    return this.repo.save({
      macAddress: macAddress,
        name: name,
        description: description,
        network: network
    });
  }

  async deleteGateway(networkCode: string, macAddress: string): Promise<void>{
    await this.repo.delete({macAddress});
  }

  async updateGateway(
    networkCode: string,
    oldAddress: string,
    newAddress: string,
    name?: string,
    description?: string,
  ): Promise<GatewayDAO> {
    const gateway = await this.getGatewayByMac(networkCode, oldAddress); 
    
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
