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

 
});