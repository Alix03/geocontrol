// GatewayRepository.mock.test.ts
import { GatewayRepository } from "@repositories/GatewayRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";

/* ------------------------------------------------------------------ */
/* 1.  Dichiarazione dei mock per i metodi che il repository utilizza */
/* ------------------------------------------------------------------ */
const mockGatewayFind  = jest.fn();
const mockGatewaySave  = jest.fn();
const mockNetworkFind  = jest.fn();

/* ------------------------------------------------------------------ */
/* 2.  Mock di AppDataSource.getRepository:                           */
/*     – per GatewayDAO → espone find & save                          */
/*     – per NetworkDAO → espone find                                 */
/* ------------------------------------------------------------------ */
jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: (dao: unknown) => {
      if ((dao as any).name === "GatewayDAO") {
        return { find: mockGatewayFind, save: mockGatewaySave };
      }
      if ((dao as any).name === "NetworkDAO") {
        return { find: mockNetworkFind };
      }
      return {};
    },
  },
}));

/* ------------------------------------------------------------------ */
/* 3.  Test-suite                                                     */
/* ------------------------------------------------------------------ */
describe("GatewayRepository: mocked database", () => {
  const repo = new GatewayRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Create new Gateway: success", async () => {
    
    // Nessun gateway con lo stesso MAC → nessun conflitto
    mockGatewayFind.mockResolvedValue([]);

    // Network esistente
    const network = new NetworkDAO();
    network.id          = 10;
    network.code        = "NET01";
    network.name        = "Network 01";
    network.description = "Test network";
    mockNetworkFind.mockResolvedValue([network]);

    
    const savedGateway = new GatewayDAO();
    savedGateway.id          = 1;
    savedGateway.macAddress  = "AA:BB:CC:DD:EE:FF";
    savedGateway.name        = "GW-1";
    savedGateway.description = "Edge gateway";
    savedGateway.network     = network;
    mockGatewaySave.mockResolvedValue(savedGateway);

    
    const result = await repo.createGateway(
      "NET01",
      "AA:BB:CC:DD:EE:FF",
      "GW-1",
      "Edge gateway",
    );

    
    expect(mockGatewayFind).toHaveBeenCalledWith({
      where: { macAddress: "AA:BB:CC:DD:EE:FF" },
    });
    expect(mockNetworkFind).toHaveBeenCalledWith({
      where: { code: "NET01" },
    });
    expect(mockGatewaySave).toHaveBeenCalledWith({
      macAddress:  "AA:BB:CC:DD:EE:FF",
      name:        "GW-1",
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
    existing.description = "Gateway già esistente"
    mockGatewayFind.mockResolvedValue([existing]);

    

    await expect(repo.createGateway(
        "NET01",
        "AA:BB:CC:DD:EE:FF",
        "Gateway",
        "Gateway già esistente"),).rejects.toBeInstanceOf(ConflictError);
    expect(mockGatewaySave).not.toHaveBeenCalled();
    expect(mockNetworkFind).not.toHaveBeenCalled();
  });


});
