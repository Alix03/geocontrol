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

  describe("Create new gateway", () => {
    it("Create new gateway: success", async () => {
      await TestDataSource.getRepository(NetworkDAO).save(baseNetwork);

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

      const saved = await repo.getGatewayByMac("NET1", "AA:BB:CC:DD:EE:FF");
      expect(saved.macAddress).toBe("AA:BB:CC:DD:EE:FF");
      expect(saved.network.code).toBe("NET1");
    
      
    });

    it("Create gateway: success con soli campi obbligatori", async () => {
      await TestDataSource.getRepository(NetworkDAO).save(baseNetwork);

      const gw = await repo.createGateway("NET1", "11:22:33:44:55:66");

      expect(gw.name).toBeNull();
      expect(gw.description).toBeNull();
    });

    it("Create new gateway: network inesistente (NotFoundError)", async () => {
      await expect(
        repo.createGateway("MISSING", "11:22", "GW", "Descr")
      ).rejects.toThrow(NotFoundError);
    });

    it("Create new gateway: macAddress già presente (ConflictError)", async () => {
      await TestDataSource.getRepository(NetworkDAO).save(baseNetwork);
      await repo.createGateway("NET1", "AA:BB:CC:DD:EE:FF");

      await expect(
        repo.createGateway("NET1", "AA:BB:CC:DD:EE:FF", "Duplicato")
      ).rejects.toThrow(ConflictError);
    });

    it("Create new gateway: MAC duplicato su reti diverse (ConflictError)", async () => {
      const secondNetwork = {
        code: "NET2",
        name: "Secondary",
        description: "Rete 2"
      };
      await TestDataSource.getRepository(NetworkDAO).save([baseNetwork, secondNetwork]);

      await repo.createGateway("NET1", "AA:BB:CC:DD:EE:FF", "GW-1", "GW-1 desc");

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

      expect(gw.network.code).toBe("NET1");

      const saved = await TestDataSource.getRepository(GatewayDAO).findOne({
        where: { macAddress: "CC:DD:EE:FF:00:11" },
        relations: ["network"]
      });
      expect(saved?.network.code).toBe("NET1");
    });
  });

  describe("Get All Gateways", () => {
    it("Get All Gateways: network senza gateway", async () => {
      await TestDataSource.getRepository(NetworkDAO).save(baseNetwork);

      const list = await repo.getAllGateways("NET1");
      expect(list).toEqual([]);
    });

    it("Get All Gateways: Restituisce tutti i gateway della rete", async () => {
      const net2 = {
        code: "NET2",
        name: "Secondaria",
        description: "Rete 2"
      };
      await TestDataSource.getRepository(NetworkDAO).save([baseNetwork, net2]);

      await repo.createGateway("NET1", "AA:AA:AA:AA:AA:AA", "GW1", "Desc1");
      await repo.createGateway("NET1", "BB:BB:BB:BB:BB:BB", "GW2", "Desc2");
      await repo.createGateway("NET2", "CC:CC:CC:CC:CC:CC", "GW3", "Desc3");

      const net1Gws = await repo.getAllGateways("NET1");
      expect(net1Gws).toHaveLength(2);

      const macs = net1Gws.map(g => g.macAddress);
      expect(macs).toEqual(
        expect.arrayContaining(["AA:AA:AA:AA:AA:AA", "BB:BB:BB:BB:BB:BB"])
      );

      const names = net1Gws.map(g => g.name);
      expect(names).toEqual(
        expect.arrayContaining(["GW1", "GW2"])
      );
    });

    it("Get All Gateways: Array vuoto (network non esistente)", async () => {
      const list = await repo.getAllGateways("NONEXISTENT");
      expect(list).toEqual([]);
    });
  });

   describe("Get Gateway By MacAddress", () => {
        it("Get Gateway By MacAddress: success", async () => {
    await TestDataSource.getRepository(NetworkDAO).save({
      code: "NET1",
      name: "MainNet",
      description: "Rete 1"
    });

    await repo.createGateway("NET1", "DD:EE:FF:00:11:22", "Gateway-Mac", "Test");

    const gw = await repo.getGatewayByMac("NET1", "DD:EE:FF:00:11:22");

    console.log(gw);
    console.log(gw.network);
    expect(gw).toBeDefined();
    expect(gw.macAddress).toBe("DD:EE:FF:00:11:22");
    expect(gw.name).toBe("Gateway-Mac");
    expect(gw.network.code).toBe("NET1"); 
  });

  it("Get Gateway By MacAddress: gateway inesistente (NotFoundError)", async () => {
    await TestDataSource.getRepository(NetworkDAO).save({
      code: "NET1",
      name: "MainNet",
      description: "Rete 1"
    });

    // non creo gateway

    await expect(
      repo.getGatewayByMac("NET1", "XX:XX:XX:XX:XX:XX")
    ).rejects.toThrow(NotFoundError);
  });

  it("Get Gateway By MacAddress: Gatway esistente, ma network code sbagliato ", async () => {
    await TestDataSource.getRepository(NetworkDAO).save([
      { code: "NET1", name: "Main", description: "1" },
      { code: "NET2", name: "Alt", description: "2" }
    ]);

    await repo.createGateway("NET1", "AA:BB:CC:DD:EE:FF", "GW");

    // stesso MAC, ma su rete sbagliata
    await expect(
      repo.getGatewayByMac("NET2", "AA:BB:CC:DD:EE:FF")
    ).rejects.toThrow(NotFoundError);
  });
   });


});
