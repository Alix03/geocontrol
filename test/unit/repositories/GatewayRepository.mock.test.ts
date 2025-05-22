// GatewayRepository.mock.test.ts
import { GatewayRepository } from "@repositories/GatewayRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

/* Dichiarazione dei mock per i metodi che il repository utilizza */

const mockGatewayFind  = jest.fn();
const mockGatewaySave  = jest.fn();
const mockNetworkFind  = jest.fn();


/* Mock di AppDataSource.getRepository:                           */
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


/* 3.  Test-suite                                                     */

describe("GatewayRepository: mocked database", () => {
  
  const repo = new GatewayRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    
  });

  // Creazione gateway con successo
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

  // ConflictError se il MAC è duplicato
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

  // NotFoundError se MAC unico ma network non esiste
  it("Create new Gateway: Network code inesistente", async ()=>{
            
    mockGatewayFind.mockResolvedValue([]);

    
    mockNetworkFind.mockResolvedValue([]);

    
    await expect(
      repo.createGateway("INVALID_NET", "AA:BB:CC:DD:EE:11", "GW-NEW", "Gateway"),
    ).rejects.toBeInstanceOf(NotFoundError);

    
    expect(mockGatewayFind).toHaveBeenCalledWith({
      where: { macAddress: "AA:BB:CC:DD:EE:11" },
    });
    expect(mockNetworkFind).toHaveBeenCalledWith({
      where: { code: "INVALID_NET" },
    });
  } );


  // ConflictError se MAC duplicato + network non esiste
  it("Creazione Gateway: macAddress già in uso e network code inesistente", async () => {
   
    const existing = new GatewayDAO();
    existing.id = 100;
    existing.macAddress = "AA:BB:CC:DD:EE:FF";
    mockGatewayFind.mockResolvedValue([existing]);

    
    mockNetworkFind.mockResolvedValue([]);

    
    await expect(
      repo.createGateway("INVALID_NET", "AA:BB:CC:DD:EE:FF"),
    ).rejects.toBeInstanceOf(ConflictError);

    

    expect(mockGatewaySave).not.toHaveBeenCalled();
    expect(mockNetworkFind).not.toHaveBeenCalled();
  });
});
