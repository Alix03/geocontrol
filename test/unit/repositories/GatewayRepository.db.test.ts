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
  it("Create gateway : success con soli campi obbligatori", async () => {
    await TestDataSource.getRepository(NetworkDAO).save(baseNetwork);

    const gw = await repo.createGateway("NET1", "11:22:33:44:55:66");

    // name/description opzionali -> null
    expect(gw.name).toBeNull();
    expect(gw.description).toBeNull();
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

  it("Create new gateway: MAC duplicato su reti diverse (ConflictError)", async () => {
    const secondNetwork = { code: "NET2", name: "Secondary", description: "Rete 2" };
    await TestDataSource.getRepository(NetworkDAO).save([baseNetwork, secondNetwork]);

    await repo.createGateway("NET1", "AA:BB:CC:DD:EE:FF", "GW-1", "GW-1 desc");

    // stesso MAC ma su rete differente → deve comunque andare in conflitto
    await expect(
      repo.createGateway("NET2", "AA:BB:CC:DD:EE:FF", "GW-dup", "GW-dup desc")
    ).rejects.toThrow(ConflictError);
  });

   it("Create new gateway: l'entità è collegata alla rete giusta", async () => {
    await TestDataSource.getRepository(NetworkDAO).save(baseNetwork);

    const gw = await repo.createGateway(
      "NET1",
      "CC:DD:EE:FF:00:11",
      "Gateway-Rel",
      "Desc-Rel"
    );

    // l'oggetto appena salvato deve essere legato alla rete con code NET1
    expect(gw.network.code).toBe("NET1");

    // verifica ulteriore via query (con relations) per sicurezza
    const saved = await TestDataSource.getRepository(GatewayDAO).findOne({
      where: { macAddress: "CC:DD:EE:FF:00:11" },
      relations: ["network"],
    });
    expect(saved?.network.code).toBe("NET1");
  });

  describe("Get All Gateways", () => {

  })
  
});
