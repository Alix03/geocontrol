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



    it("Create Gateway: macAddress già esistente", async () => {
      
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
      mockGatewayRepo.createGateway.mockRejectedValue(new Error("Gateway already exists"));

      
      await expect(gatewayController.createGateway(networkCode, gatewayDTO)).rejects.toThrow("Gateway already exists");
    });

    it("Create Gateway: Errore nella repository", async () => {
      
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
      mockGatewayRepo.createGateway.mockRejectedValue(new Error("Database error"));

      
      await expect(gatewayController.createGateway(networkCode, gatewayDTO)).rejects.toThrow("Database error");
    });
    
    describe("Get All Gateways", () => {
    it("Get all Gateways : success", async () => {
      
      const networkCode = "NET001";
      const mockNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      const mockGatewayDAO: GatewayDAO = {
        id: 1,
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Test Gateway",
        description: "Test Gateway Description",
        network: mockNetworkDAO,
        sensors: []
      };

      const mockGatewayDTO: GatewayDTO = {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Test Gateway",
        description: "Test Gateway Description",
        sensors: []
      };

      mockNetworkRepo.getNetworkByCode.mockResolvedValue(mockNetworkDAO);
      mockGatewayRepo.getAllGateways.mockResolvedValue([mockGatewayDAO]);
      mockMapGatewayDAOToDTO.mockReturnValue(mockGatewayDTO);

      
      const result = await gatewayController.getAllGateways(networkCode);

      
      expect(mockNetworkRepo.getNetworkByCode).toHaveBeenCalledWith(networkCode);
      expect(mockGatewayRepo.getAllGateways).toHaveBeenCalledWith(networkCode);
      expect(mockMapGatewayDAOToDTO).toHaveBeenCalledWith(mockGatewayDAO);
      expect(result).toEqual([mockGatewayDTO]);
    });


    it("Get All Gateways: network senza gateways ritorna array vuoto", async () => {
      
      const networkCode = "NET001";
      const mockNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      mockNetworkRepo.getNetworkByCode.mockResolvedValue(mockNetworkDAO);
      mockGatewayRepo.getAllGateways.mockResolvedValue([]);

      
      const result = await gatewayController.getAllGateways(networkCode);

      
      expect(result).toEqual([]);
      expect(mockMapGatewayDAOToDTO).not.toHaveBeenCalled();
    });


    it("Get All Gateways: network inesistente", async () => {
      
      const networkCode = "INVALID";
      mockNetworkRepo.getNetworkByCode.mockRejectedValue(new Error("Network not found"));

      
      await expect(gatewayController.getAllGateways(networkCode)).rejects.toThrow("Network not found");
      expect(mockGatewayRepo.getAllGateways).not.toHaveBeenCalled();
    });
    it("Get All Gateways: Errore nella repository", async () => {
      
      const networkCode = "NET001";
      const mockNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      mockNetworkRepo.getNetworkByCode.mockResolvedValue(mockNetworkDAO);
      mockGatewayRepo.getAllGateways.mockRejectedValue(new Error("Database error"));

      
      await expect(gatewayController.getAllGateways(networkCode)).rejects.toThrow("Database error");
    });

  });


  describe("Get Gateway By MacAddress", () => {
    it("Get Gateway By MacAddress : success", async () => {
      // Arrange
      const networkCode = "NET001";
      const gatewayMac = "AA:BB:CC:DD:EE:FF";
      
      const mockNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      const mockGatewayDAO: GatewayDAO = {
        id: 1,
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
        network: mockNetworkDAO,
        sensors: []
      };

      const mockGatewayDTO: GatewayDTO = {
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test Gateway Description",
        sensors: []
      };

      mockNetworkRepo.getNetworkByCode.mockResolvedValue(mockNetworkDAO);
      mockGatewayRepo.getGatewayByMac.mockResolvedValue(mockGatewayDAO);
      mockMapGatewayDAOToDTO.mockReturnValue(mockGatewayDTO);

      
      const result = await gatewayController.getGateway(networkCode, gatewayMac);

      
      expect(mockNetworkRepo.getNetworkByCode).toHaveBeenCalledWith(networkCode);
      expect(mockGatewayRepo.getGatewayByMac).toHaveBeenCalledWith(networkCode, gatewayMac);
      expect(mockMapGatewayDAOToDTO).toHaveBeenCalledWith(mockGatewayDAO);
      expect(result).toEqual(mockGatewayDTO);
    });
    
    


    
    it("Get Gateway By MacAddress: network inesistente", async () => {
      // Arrange
      const networkCode = "INVALID";
      const gatewayMac = "AA:BB:CC:DD:EE:FF";
      mockNetworkRepo.getNetworkByCode.mockRejectedValue(new Error("Network not found"));

      // Act & Assert
      await expect(gatewayController.getGateway(networkCode, gatewayMac)).rejects.toThrow("Network not found");
      expect(mockGatewayRepo.getGatewayByMac).not.toHaveBeenCalled();
    });
    

    

});

    // fine getGatewayByMac

});














});