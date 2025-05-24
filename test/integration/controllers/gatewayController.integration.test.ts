import * as gatewayController from "@controllers/gatewayController";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";

jest.mock("@repositories/GatewayRepository");
jest.mock("@repositories/NetworkRepository");

describe("GatewayController integration", () => {
  let mockGatewayRepository: jest.Mocked<GatewayRepository>;
  let mockNetworkRepository: jest.Mocked<NetworkRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGatewayRepository = {
      getAllGateways: jest.fn(),
      getGatewayByMac: jest.fn(),
      createGateway: jest.fn(),
      deleteGateway: jest.fn(),
      updateGateway: jest.fn()
    } as any;

    mockNetworkRepository = {
      getNetworkByCode: jest.fn(),
      getAllNetworks: jest.fn(),
      createNetwork: jest.fn(),
      deleteNetwork: jest.fn(),
      updateNetwork: jest.fn()
    } as any;

    (GatewayRepository as jest.Mock).mockImplementation(() => mockGatewayRepository);
    (NetworkRepository as jest.Mock).mockImplementation(() => mockNetworkRepository);
  });



  describe("Create gateway", () => {
    it("Create gateway: success", async () => {
      const networkCode = "NET001";
      const gatewayDTO: GatewayDTO = {
        macAddress: "11:22:33:44:55:66",
        name: "New Gateway",
        description: "New gateway description"
      };

      const fakeNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue(fakeNetworkDAO);
      mockGatewayRepository.createGateway.mockResolvedValue({} as GatewayDAO);

      await gatewayController.createGateway(networkCode, gatewayDTO);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(networkCode);
      expect(mockGatewayRepository.createGateway).toHaveBeenCalledWith(
        networkCode,
        gatewayDTO.macAddress,
        gatewayDTO.name,
        gatewayDTO.description
      );
    });

    



    // test qui

    
  });
// fine describe







});
  