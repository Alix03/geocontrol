// GatewayRepository.mock.test.ts
import { GatewayRepository } from "@repositories/GatewayRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockGatewayFind = jest.fn();
const mockGatewayFindOne = jest.fn();
const mockGatewaySave = jest.fn();
const mockGatewayDelete = jest.fn();
const mockNetworkFind = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: (dao: unknown) => {
      if ((dao as any).name === "GatewayDAO") {
        return {
          find: mockGatewayFind,
          findOne: mockGatewayFindOne,
          save: mockGatewaySave,
          delete: mockGatewayDelete,
        };
      }
      if ((dao as any).name === "NetworkDAO") {
        return { find: mockNetworkFind };
      }
      return {};
    },
  },
}));

describe("GatewayRepository: mocked database", () => {
  const repo = new GatewayRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Create new Gateway", () => {
    it("Create new Gateway: success", async () => {
      mockGatewayFind.mockResolvedValue([]);
      const network = new NetworkDAO();
      network.id = 10;
      network.code = "NET01";
      network.name = "Network 01";
      network.description = "Test network";
      mockNetworkFind.mockResolvedValue([network]);

      const savedGateway = new GatewayDAO();
      savedGateway.id = 1;
      savedGateway.macAddress = "AA:BB:CC:DD:EE:FF";
      savedGateway.name = "GW-1";
      savedGateway.description = "Edge gateway";
      savedGateway.network = network;
      mockGatewaySave.mockResolvedValue(savedGateway);

      const result = await repo.createGateway(
        "NET01",
        "AA:BB:CC:DD:EE:FF",
        "GW-1",
        "Edge gateway"
      );

      expect(mockGatewayFind).toHaveBeenCalledWith({
        where: { macAddress: "AA:BB:CC:DD:EE:FF" },
      });
      expect(mockNetworkFind).toHaveBeenCalledWith({
        where: { code: "NET01" },
      });
      expect(mockGatewaySave).toHaveBeenCalledWith({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "GW-1",
        description: "Edge gateway",
        network,
      });
      expect(result).toBe(savedGateway);
    });

    it("Create new Gateway: macAddress già in uso", async () => {
      const existing = new GatewayDAO();
      existing.id = 99;
      existing.macAddress = "AA:BB:CC:DD:EE:FF";
      existing.name = "Gateway";
      existing.description = "Gateway già esistente";
      mockGatewayFind.mockResolvedValue([existing]);

      await expect(
        repo.createGateway("NET01", "AA:BB:CC:DD:EE:FF", "Gateway", "Gateway già esistente")
      ).rejects.toBeInstanceOf(ConflictError);

      expect(mockGatewaySave).not.toHaveBeenCalled();
      expect(mockNetworkFind).not.toHaveBeenCalled();
    });

    it("Create new Gateway: Network code inesistente", async () => {
      mockGatewayFind.mockResolvedValue([]);
      mockNetworkFind.mockResolvedValue([]);

      await expect(
        repo.createGateway("INVALID_NET", "AA:BB:CC:DD:EE:11", "GW-NEW", "Gateway")
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(mockGatewayFind).toHaveBeenCalledWith({
        where: { macAddress: "AA:BB:CC:DD:EE:11" },
      });
      expect(mockNetworkFind).toHaveBeenCalledWith({
        where: { code: "INVALID_NET" },
      });
    });

    it("Creazione Gateway: macAddress già in uso e network code inesistente", async () => {
      const existing = new GatewayDAO();
      existing.id = 100;
      existing.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([existing]);
      mockNetworkFind.mockResolvedValue([]);

      await expect(
        repo.createGateway("INVALID_NET", "AA:BB:CC:DD:EE:FF")
      ).rejects.toBeInstanceOf(ConflictError);

      expect(mockGatewaySave).not.toHaveBeenCalled();
      expect(mockNetworkFind).not.toHaveBeenCalled();
    });
  });

  describe("Get All Gateways", () => {
    it("Get All Gateways: success", async () => {
      const networkCode = "NET01";
      const gw1 = new GatewayDAO();
      gw1.id = 1;
      gw1.macAddress = "AA:AA:AA:AA:AA:AA";
      const gw2 = new GatewayDAO();
      gw2.id = 2;
      gw2.macAddress = "BB:BB:BB:BB:BB:BB";
      mockGatewayFind.mockResolvedValue([gw1, gw2]);

      const result = await repo.getAllGateways(networkCode);

      expect(mockGatewayFind).toHaveBeenCalledWith({
        where: { network: { code: networkCode } },
        relations: ["network"],
      });
      expect(result).toEqual([gw1, gw2]);
    });

    it("Get All Gateways: network code inesistente", async () => {
      const invalidCode = "MISSING_NET";
      mockGatewayFind.mockResolvedValue([]);

      const result = await repo.getAllGateways(invalidCode);

      expect(mockGatewayFind).toHaveBeenCalledWith({
        where: { network: { code: invalidCode } },
        relations: ["network"],
      });
      expect(result).toEqual([]);
      expect(mockNetworkFind).not.toHaveBeenCalled();
    });

    it("Get All Gateways: network senza gateways", async () => {
      const networkCode = "NET01";
      mockGatewayFind.mockResolvedValue([]);

      const result = await repo.getAllGateways(networkCode);

      expect(mockGatewayFind).toHaveBeenCalledWith({
        where: { network: { code: networkCode } },
        relations: ["network"],
      });
      expect(result).toEqual([]);
    });

    describe("Get Gateway By MacAddress", () => {
      it("Get Gateway By MacAddress: success", async () => {
        const networkCode = "NET01";
        const mac = "AA:BB:CC:DD:EE:FF";
        const gw = new GatewayDAO();
        const network = new NetworkDAO();

        network.code = networkCode;
        gw.id = 42;
        gw.macAddress = mac;
        gw.network = network;

        mockGatewayFind.mockResolvedValue([gw]);

        const result = await repo.getGatewayByMac(networkCode, mac);

        expect(mockGatewayFind).toHaveBeenCalledWith({
          where: { macAddress: mac, network: { code: networkCode } },
          relations: ["network"],
        });
        expect(result).toBe(gw);
      });

      it("Get Gateway By MacAddress: MacAddress inesistente", async () => {
        mockGatewayFind.mockResolvedValue([]);

        await expect(repo.getGatewayByMac("NET01", "00:11:22:33:44:55")).rejects.toBeInstanceOf(NotFoundError);

        expect(mockGatewayFind).toHaveBeenCalled();
      });
    });

    describe("Delete Gateway", () => {
      it("Delete Gateway: success", async () => {
          const mac = "AA:BB:CC:DD:EE:FF";
          const networkCode = "NET01";

          // Mock per getGatewayByMac (tramite mockGatewayFind)
          const fakeGateway = new GatewayDAO();
          fakeGateway.id = 1;
          fakeGateway.macAddress = mac;
          fakeGateway.network = { code: networkCode } as NetworkDAO;

          mockGatewayFind.mockResolvedValueOnce([fakeGateway]);

          // Mock per la delete
          mockGatewayDelete.mockResolvedValue({ affected: 1 });

          // Verifica che la delete funzioni
          await expect(repo.deleteGateway(networkCode, mac)).resolves.toBeUndefined();

          // Verifica che la delete sia stata chiamata correttamente
          expect(mockGatewayDelete).toHaveBeenCalledWith({ macAddress: mac });
          });
    });

    describe("Update Gateway", () => {
      it("Update Gateway: success", async () => {
        const netCode = "NET01";
        const oldMac = "AA:BB:CC:DD:EE:FF";
        const newMac = "11:22:33:44:55:66";

        const original = Object.assign(new GatewayDAO(), {
          id: 5,
          macAddress: oldMac,
          name: "GW-old",
          description: "old desc",
          network: { code: netCode } as any,
        });

        const updated = Object.assign({}, original, {
          macAddress: newMac,
          name: "GW-new",
          description: "new desc",
        }) as GatewayDAO;

        mockGatewayFind.mockResolvedValueOnce([original]);
        mockGatewayFindOne.mockResolvedValueOnce(undefined);
        mockGatewaySave.mockResolvedValueOnce(updated);

        const result = await repo.updateGateway(netCode, oldMac, newMac, "GW-new", "new desc");

        expect(mockGatewayFind).toHaveBeenCalledWith({
          where: { macAddress: oldMac, network: { code: netCode } },
          relations: ["network"],
        });
        expect(mockGatewayFindOne).toHaveBeenCalledWith({
          where: { macAddress: newMac },
        });
        expect(mockGatewaySave).toHaveBeenCalledWith(updated);
        expect(result).toBe(updated);
      });

      it("Update Gateway: macAddress già esistente", async () => {
        const netCode = "NET01";
        const oldMac = "AA:BB";
        const newMac = "11:22";

        const original = Object.assign(new GatewayDAO(), {
          macAddress: oldMac,
          network: { code: netCode },
        });
        const duplicate = Object.assign(new GatewayDAO(), { macAddress: newMac });

        mockGatewayFind.mockResolvedValueOnce([original]);
        mockGatewayFindOne.mockResolvedValueOnce(duplicate);

        await expect(repo.updateGateway(netCode, oldMac, newMac, "GW-new")).rejects.toBeInstanceOf(ConflictError);

        expect(mockGatewaySave).not.toHaveBeenCalled();
      });
    });
  });
});
