// test/repositories/GatewayRepository.db.test.ts
import { GatewayRepository } from "@repositories/GatewayRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  // pulizia tabelle per isolamento completo
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("GatewayRepository: SQLite in-memory", () => {
  const repo = new GatewayRepository();

  const baseNetwork = {
    code: "NET1",
    name: "Main network",
    description: "Rete di test"
  };

  it("Create new gateway: success", async () => {
    // Preparo la rete a cui il gateway deve appartenere
    await TestDataSource.getRepository(NetworkDAO).save(baseNetwork);

    // Chiamo createGateway
    const gateway = await repo.createGateway(
      "NET1",
      "AA:BB:CC:DD:EE:FF",
      "Gateway 1",
      "Gateway desc"
    );

    expect(gateway).toMatchObject({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Gateway desc"
    });

    // Verifichiamo che sia realmente stato salvato
    const saved = await repo.getGatewayByMac("NET1", "AA:BB:CC:DD:EE:FF");
    expect(saved.macAddress).toBe("AA:BB:CC:DD:EE:FF");
  });

  it("Create new gateway: network inesistente (NotFoundError)", async () => {
    await expect(
      repo.createGateway("MISSING", "11:22", "GW", "Descr")
    ).rejects.toThrow(NotFoundError);
  });

  it("Create new Gatewat: macAddress già presente (ConflictError)", async () => {
    await TestDataSource.getRepository(NetworkDAO).save(baseNetwork);
    await repo.createGateway("NET1", "AA:BB:CC:DD:EE:FF");

    await expect(
      repo.createGateway("NET1", "AA:BB:CC:DD:EE:FF", "Duplicato")
    ).rejects.toThrow(ConflictError);
  });

  
});
