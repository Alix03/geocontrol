import * as gatewayController from "@controllers/gatewayController";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { mapGatewayDAOToDTO } from "@services/mapperService";

jest.mock("@repositories/GatewayRepository");
jest.mock("@repositories/NetworkRepository");
jest.mock("@services/mapperService");

describe("GatewayController", () => {
  let mockGatewayRepo: jest.Mocked<GatewayRepository>;
  let mockNetworkRepo: jest.Mocked<NetworkRepository>;
  let mockMapGatewayDAOToDTO: jest.MockedFunction<typeof mapGatewayDAOToDTO>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGatewayRepo = {
      getAllGateways: jest.fn(),
      getGatewayByMac: jest.fn(),
      createGateway: jest.fn(),
      deleteGateway: jest.fn(),
      updateGateway: jest.fn(),
    } as any;

    mockNetworkRepo = {
      getNetworkByCode: jest.fn(),
    } as any;

    mockMapGatewayDAOToDTO = mapGatewayDAOToDTO as jest.MockedFunction<typeof mapGatewayDAOToDTO>;

    (GatewayRepository as jest.Mock).mockImplementation(() => mockGatewayRepo);
    (NetworkRepository as jest.Mock).mockImplementation(() => mockNetworkRepo);
  });

  describe("Create Gateway: integration", () => {
    it("Create Gateway: success ", async () => {
      
      const networkCode = "NET001";
      const gatewayDTO: GatewayDTO = {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "New Gateway",
        description: "New Gateway Description"
      };

      const mockNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      mockNetworkRepo.getNetworkByCode.mockResolvedValue(mockNetworkDAO);
      mockGatewayRepo.createGateway.mockResolvedValue(undefined);

      
      await gatewayController.createGateway(networkCode, gatewayDTO);

      
      expect(mockNetworkRepo.getNetworkByCode).toHaveBeenCalledWith(networkCode);
      expect(mockGatewayRepo.createGateway).toHaveBeenCalledWith(
        networkCode,
        gatewayDTO.macAddress,
        gatewayDTO.name,
        gatewayDTO.description
      );
    });

    it("Create gateway: network inesistente", async () => {
      
      const networkCode = "INVALID";
      const gatewayDTO: GatewayDTO = {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "New Gateway",
        description: "New Gateway Description"
      };

      mockNetworkRepo.getNetworkByCode.mockRejectedValue(new Error("Network not found"));

      
      await expect(gatewayController.createGateway(networkCode, gatewayDTO)).rejects.toThrow("Network not found");
      expect(mockGatewayRepo.createGateway).not.toHaveBeenCalled();
    });

    // fine createGateway
});














});