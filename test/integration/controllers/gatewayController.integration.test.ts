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
    
    

    
    it("Create gateway con solo campi obbligatori", async () => {
      const networkCode = "NET001";
      const gatewayDTO: GatewayDTO = {
        macAddress: "11:22:33:44:55:66"
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

      expect(mockGatewayRepository.createGateway).toHaveBeenCalledWith(
        networkCode,
        gatewayDTO.macAddress,
        undefined,
        undefined
      );
    });
    
  });


  describe("Get All Gateways", () => {
    it("Get All Gateways: Ritorna DTO mappato correttamente per una network valida", async () => {
      const networkCode = "NET001";
      const fakeNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      const fakeSensorDAO: SensorDAO = {
        id: 1,
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Temperature Sensor",
        description: "Outdoor temperature sensor",
        variable: "temperature",
        unit: "°C",
        gateway: {} as GatewayDAO,
        measurements: []
      };

      const fakeGatewayDAO: GatewayDAO = {
        id: 1,
        macAddress: "11:22:33:44:55:66",
        name: "Gateway 1",
        description: "Main gateway",
        network: fakeNetworkDAO,
        sensors: [fakeSensorDAO]
      };

      const expectedDTO: GatewayDTO = {
        macAddress: fakeGatewayDAO.macAddress,
        name: fakeGatewayDAO.name,
        description: fakeGatewayDAO.description,
        sensors: [{
          macAddress: fakeSensorDAO.macAddress,
          name: fakeSensorDAO.name,
          description: fakeSensorDAO.description,
          variable: fakeSensorDAO.variable,
          unit: fakeSensorDAO.unit
        }]
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue(fakeNetworkDAO);
      mockGatewayRepository.getAllGateways.mockResolvedValue([fakeGatewayDAO]);

      const result = await gatewayController.getAllGateways(networkCode);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(networkCode);
      expect(mockGatewayRepository.getAllGateways).toHaveBeenCalledWith(networkCode);
      console.log(result);
      expect(result).toEqual([expectedDTO]);
    });


    it("Get All Gateways: network senza gateway (array vuoto)", async () => {
      const networkCode = "NET001";
      const fakeNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue(fakeNetworkDAO);
      mockGatewayRepository.getAllGateways.mockResolvedValue([]);

      const result = await gatewayController.getAllGateways(networkCode);

      expect(result).toEqual([]);
    });

});
describe("Get Gateway By MacAddress", () => {
    it("Get Gateway By MacAddress: Ritorna DTO mappato correttamente per una network valida e un gateway validi", async () => {
      const networkCode = "NET001";
      const gatewayMac = "11:22:33:44:55:66";
      
      const fakeNetworkDAO: NetworkDAO = {
        id: 1,
        code: networkCode,
        name: "Test Network",
        description: "Test Description",
        gateways: []
      };

      const fakeGatewayDAO: GatewayDAO = {
        id: 1,
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "Test gateway description",
        network: fakeNetworkDAO,
        sensors: []
      };

      const expectedDTO: GatewayDTO = {
        macAddress: fakeGatewayDAO.macAddress,
        name: fakeGatewayDAO.name,
        description: fakeGatewayDAO.description,
        sensors: []
      };

      mockNetworkRepository.getNetworkByCode.mockResolvedValue(fakeNetworkDAO);
      mockGatewayRepository.getGatewayByMac.mockResolvedValue(fakeGatewayDAO);

      const result = await gatewayController.getGateway(networkCode, gatewayMac);

      expect(mockNetworkRepository.getNetworkByCode).toHaveBeenCalledWith(networkCode);
      expect(mockGatewayRepository.getGatewayByMac).toHaveBeenCalledWith(networkCode, gatewayMac);
      
      expect(result).toEqual(expectedDTO);
    });


    // test qui

  });
// fine describe







});
  