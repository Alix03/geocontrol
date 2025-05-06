import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";




export class NetworkRepository {
  private repo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(NetworkDAO);
  }

  getAllNetworks(): Promise<NetworkDAO[]> {
    return this.repo.find();
  }

  async getNetworkByCode(code: string): Promise<NetworkDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { code } }),
      () => true,
      `User with username '${code}' not found`
    );
  }

  async createNetwork(
    code: string,
    name: string,
    description: string
  ): Promise<NetworkDAO> {
    throwConflictIfFound(
      await this.repo.find({ where: { code } }),
      () => true,
      `Network with username '${code}' already exists`
    );

    return this.repo.save({
      code: code,
      name: name,
      description: description
    });
  }

  async deleteNetwork(code: string): Promise<void> {
    await this.repo.remove(await this.getNetworkByCode(code));
  }

  async updateNetwork(
    code: string,
    name?: string,
    description?: string
  ): Promise<NetworkDAO> {
    const network = await this.getNetworkByCode(code);
  
    if (name !== undefined) {
      network.name = name;
    }
  
    if (description !== undefined) {
      network.description = description;
    }
  
    return this.repo.save(network);
  }
}