import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NotFoundError } from "@errors/NotFoundError";
import { ConflictError } from "@errors/ConflictError";



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
      `Network with '${code}' not found`
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
    currentCode: string,
    newCode: string,
    name?: string,
    description?: string
  ): Promise<void> {
    // 1. Cerca direttamente il network attuale
    const network = await this.repo.findOne({ where: { code: currentCode } });
    if (!network) {
      throw new NotFoundError(`Network with code '${currentCode}' not found`);
    }
  
    // 2. Se il codice è cambiato, verifica che quello nuovo non esista già
    if (newCode !== currentCode) {
      const existing = await this.repo.findOne({ where: { code: newCode } });
      if (existing) {
        throw new ConflictError(`Network with code '${newCode}' already exists`);
      }
      network.code = newCode;
    }
  
    // 3. Aggiorna gli altri campi se forniti
    if (name !== undefined) {
      network.name = name;
    }
  
    if (description !== undefined) {
      network.description = description;
    }
  
    await this.repo.save(network);
  }
 
}