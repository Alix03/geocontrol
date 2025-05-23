import { GatewayRepository } from "@repositories/GatewayRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("GatewayRepository: SQLite in-memory", () => {
  const repo = new GatewayRepository();

  // Helper function per creare una network di test
  const createTestNetwork = async (code: string = "TEST_NET") => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    return await networkRepo.save({
      code,
      name: "Test Network",
      description: "Test description"
    });
  };

  describe("Create new Gateway", () => {
    it("Create new Gateway: success", async () => {
      await createTestNetwork();
      
      const gateway = await repo.createGateway(
        "TEST_NET",
        "AA:BB:CC:DD:EE:01",
        "Test Gateway",
        "Test description"
      );

      expect(gateway.macAddress).toBe("AA:BB:CC:DD:EE:01");
      expect(gateway.name).toBe("Test Gateway");
      expect(gateway.description).toBe("Test description");
      expect(gateway.network.code).toBe("TEST_NET");
    });

    it("Create new Gateway (solo campi obbligatori): success", async () => {
      await createTestNetwork();
      
      const gateway = await repo.createGateway(
        "TEST_NET",
        "AA:BB:CC:DD:EE:01"
      );

      expect(gateway.macAddress).toBe("AA:BB:CC:DD:EE:01");
      expect(gateway.name).toBeNull();
      expect(gateway.description).toBeNull();
      expect(gateway.network.code).toBe("TEST_NET");
      expect(gateway.network.description).toBe("Test description");
    });

    it("Create new Gateway: MacAddress già esistente", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      // Crea gateway esistente
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Existing Gateway",
        network
      });

      await expect(
        repo.createGateway("TEST_NET", "AA:BB:CC:DD:EE:01", "New Gateway")
      ).rejects.toThrow(ConflictError);
    });

    it("Create new Gateway: network inesistente", async () => {
      await expect(
        repo.createGateway("NONEXISTENT_NET", "AA:BB:CC:DD:EE:01")
      ).rejects.toThrow(NotFoundError);
    });

    it("Create new Gateway: macAddress già esistente in un'altra network", async () => {
      const network1 = await createTestNetwork("NET_1");
      const network2 = await createTestNetwork("NET_2");
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      // Gateway esistente in NET_1
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Gateway in NET_1",
        network: network1
      });

      // Tentativo di creare gateway con stesso MAC in NET_2
      await expect(
        repo.createGateway("NET_2", "AA:BB:CC:DD:EE:01")
      ).rejects.toThrow(ConflictError);
    });
  });


  describe("Get All Gateways", () => {
    it("Get All Gateways: success (array vuoto)", async () => {
      await createTestNetwork();
      const gateways = await repo.getAllGateways("TEST_NET");
      expect(gateways).toEqual([]);
    });

    it("Get All Gateways: success", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      // Crea gateways per la network di test
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Gateway 1",
        description: "First gateway",
        network
      });
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:02",
        name: "Gateway 2",
        description: "Second gateway",
        network
      });

      const gateways = await repo.getAllGateways("TEST_NET");
      expect(gateways).toHaveLength(2);
      expect(gateways[0].macAddress).toBe("AA:BB:CC:DD:EE:01");
      expect(gateways[1].macAddress).toBe("AA:BB:CC:DD:EE:02");
      expect(gateways[0].network.code).toBe("TEST_NET");
    });

    it("Get All Gateways: con più reti deve ritornare solo i gateway della rete selezionata", async () => {
      const network1 = await createTestNetwork("NET_1");
      const network2 = await createTestNetwork("NET_2");
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      // Gateway per network1
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Gateway 1",
        network: network1
      });
      
      // Gateway per network2
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:02",
        name: "Gateway 2",
        network: network2
      });

      const gatewaysNet1 = await repo.getAllGateways("NET_1");
      const gatewaysNet2 = await repo.getAllGateways("NET_2");
      
      expect(gatewaysNet1).toHaveLength(1);
      expect(gatewaysNet2).toHaveLength(1);
      expect(gatewaysNet1[0].macAddress).toBe("AA:BB:CC:DD:EE:01");
      expect(gatewaysNet2[0].macAddress).toBe("AA:BB:CC:DD:EE:02");
      expect(gatewaysNet1[0].network.code).toBe("NET_1");
      expect(gatewaysNet2[0].network.code).toBe("NET_2");
    });
  });


  describe("Get Gateway By macAddress", () => {
    it("Get Gateway By macAddress: success", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Test Gateway",
        description: "Test description",
        network
      });

      const gateway = await repo.getGatewayByMac("TEST_NET", "AA:BB:CC:DD:EE:01");
      expect(gateway.macAddress).toBe("AA:BB:CC:DD:EE:01");
      expect(gateway.name).toBe("Test Gateway");
      expect(gateway.description).toBe("Test description");
    });

    it("Get Gateway By macAddress: macAddress inesistente", async () => {
      await createTestNetwork();
      
      await expect(
        repo.getGatewayByMac("TEST_NET", "NONEXISTENT:MAC")
      ).rejects.toThrow(NotFoundError);
    });

    it("Get Gateway By macAddress: macAddress esistente ma in un altra rete", async () => {
      const network1 = await createTestNetwork("NET_1");
      const network2 = await createTestNetwork("NET_2");
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      // Gateway in NET_1
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Gateway 1",
        network: network1
      });

      await expect(
        repo.getGatewayByMac("NET_2", "AA:BB:CC:DD:EE:01")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("Update Gateway", () => {
    it("Update Gateway: name and description senza cambiare macAddress", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Old Name",
        description: "Old Description",
        network
      });

      const updated = await repo.updateGateway(
        "TEST_NET",
        "AA:BB:CC:DD:EE:01",
        "AA:BB:CC:DD:EE:01",
        "New Name",
        "New Description"
      );

      expect(updated.macAddress).toBe("AA:BB:CC:DD:EE:01");
      expect(updated.name).toBe("New Name");
      expect(updated.description).toBe("New Description");
      
    });

    it("Update Gateway: update macAddress", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Test Gateway",
        network
      });

      const updated = await repo.updateGateway(
        "TEST_NET",
        "AA:BB:CC:DD:EE:01",
        "AA:BB:CC:DD:EE:02",
        "Updated Gateway"
      );

      expect(updated.macAddress).toBe("AA:BB:CC:DD:EE:02");
      expect(updated.name).toBe("Updated Gateway");
    });

    it("Update Gateway: Gateway non esistente", async () => {
      await createTestNetwork();
      
      await expect(
        repo.updateGateway(
          "TEST_NET",
          "NONEXISTENT:MAC",
          "NEW:MAC",
          "New Name"
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("Update Gateway: nuovo macAddress già esistente", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      // Crea due gateway
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Gateway 1",
        network
      });
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:02",
        name: "Gateway 2",
        network
      });

      await expect(
        repo.updateGateway(
          "TEST_NET",
          "AA:BB:CC:DD:EE:01",
          "AA:BB:CC:DD:EE:02",
          "Updated Name"
        )
      ).rejects.toThrow(ConflictError);
    });

    it("Update Gateway: aggiorna solo alcuni campi (gestione caso undefined)", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Original Name",
        description: "Original Description",
        network
      });

      // Aggiorna solo il nome
      const updated = await repo.updateGateway(
        "TEST_NET",
        "AA:BB:CC:DD:EE:01",
        "AA:BB:CC:DD:EE:01",
        "New Name",
        undefined
      );

      expect(updated.name).toBe("New Name");
      expect(updated.description).toBe("Original Description");
    });

    it("Update Gateway: Aggiorno con stringa vuota", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Original Name",
        description: "Original Description",
        network
      });

      const updated = await repo.updateGateway(
        "TEST_NET",
        "AA:BB:CC:DD:EE:01",
        "AA:BB:CC:DD:EE:01",
        "",
        ""
      );

      expect(updated.name).toBe("");
      expect(updated.description).toBe("");
    });

    it("Update Gateway: macAddress esistente in un altra network", async () => {
      const network1 = await createTestNetwork("NET_1");
      const network2 = await createTestNetwork("NET_2");
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Gateway in NET_1",
        network: network1
      });

      // Questo dovrebbe fallire perché getGatewayByMac cerca nella NET_2
      await expect(
        repo.updateGateway(
          "NET_2",
          "AA:BB:CC:DD:EE:01",
          "AA:BB:CC:DD:EE:02"
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("Delete Gateway", () => {
    it("Delete gateway: success", async () => {
      const network = await createTestNetwork();
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Gateway to delete",
        network
      });

      await repo.deleteGateway("TEST_NET", "AA:BB:CC:DD:EE:01");
      
      const deletedGateway = await gatewayRepo.findOne({
        where: { macAddress: "AA:BB:CC:DD:EE:01" }
      });
      expect(deletedGateway).toBeNull();
    });

    it("Delete gateway: gateway inesistente", async () => {
      await createTestNetwork();
      
      // Non dovrebbe lanciare errori anche se il gateway non esiste
      await expect(
        repo.deleteGateway("TEST_NET", "NONEXISTENT:MAC")
      ).resolves.not.toThrow();
    });

    it("should delete gateway regardless of network (current implementation)", async () => {
      const network1 = await createTestNetwork("NET_1");
      const network2 = await createTestNetwork("NET_2");
      const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
      
      await gatewayRepo.save({
        macAddress: "AA:BB:CC:DD:EE:01",
        name: "Gateway in NET_1",
        network: network1
      });

      // La deleteGateway attuale cancella per MAC senza controllare la network
      await repo.deleteGateway("NET_2", "AA:BB:CC:DD:EE:01");
      
      const deletedGateway = await gatewayRepo.findOne({
        where: { macAddress: "AA:BB:CC:DD:EE:01" }
      });
      expect(deletedGateway).toBeNull();
    });
  });


  describe("Edge cases", () => {
    it("Gestione di più gateway con operazioni in cascata", async () => {
      const network = await createTestNetwork();
      
      // Crea più gateways
      await repo.createGateway("TEST_NET", "AA:BB:CC:DD:EE:01", "Gateway 1");
      await repo.createGateway("TEST_NET", "AA:BB:CC:DD:EE:02", "Gateway 2");
      await repo.createGateway("TEST_NET", "AA:BB:CC:DD:EE:03", "Gateway 3");

      const allGateways = await repo.getAllGateways("TEST_NET");
      expect(allGateways).toHaveLength(3);

      // Elimina uno e verifica che gli altri rimangano
      await repo.deleteGateway("TEST_NET", "AA:BB:CC:DD:EE:02");
      
      const remainingGateways = await repo.getAllGateways("TEST_NET");
      expect(remainingGateways).toHaveLength(2);
      expect(remainingGateways.map(g => g.macAddress)).not.toContain("AA:BB:CC:DD:EE:02");
    });

    it("Integrità dei dati durante le operazioni", async () => {
      const network = await createTestNetwork();
      
      // Crea gateway
      const created = await repo.createGateway(
        "TEST_NET",
        "AA:BB:CC:DD:EE:01",
        "Original Gateway",
        "Original Description"
      );
      
      // Recupera gateway
      const retrieved = await repo.getGatewayByMac("TEST_NET", "AA:BB:CC:DD:EE:01");
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.network.code).toBe("TEST_NET");
      
      // Aggiorna gateway
      const updated = await repo.updateGateway(
        "TEST_NET",
        "AA:BB:CC:DD:EE:01",
        "AA:BB:CC:DD:EE:99",
        "Updated Gateway"
      );
      
      // Verifica che l'ID rimanga lo stesso ma i dati siano aggiornati
      expect(updated.id).toBe(created.id);
      expect(updated.macAddress).toBe("AA:BB:CC:DD:EE:99");
      expect(updated.name).toBe("Updated Gateway");
    });
  });

 
});