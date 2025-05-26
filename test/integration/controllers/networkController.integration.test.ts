import * as networkController from "@controllers/networkController";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { Network as NetworkDTO } from "@models/dto/Network";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { Not } from "typeorm";

jest.mock("@repositories/NetworkRepository");


describe("NetworkController integration", () =>{
    let mockRepo: jest.Mocked<NetworkRepository>;

    beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
        getNetworkByCode: jest.fn(),
        getAllNetworks: jest.fn(),
        createNetwork: jest.fn(),
        deleteNetwork: jest.fn(),
        updateNetwork: jest.fn()
    } as any;

    (NetworkRepository as jest.Mock).mockImplementation(() => mockRepo);
    });

    describe("Create network", () =>{

        it("Create network: ok", async ()=>{
            const fakeNetworkDAO: NetworkDAO = {
                id: 1,
                code: "NET01",
                name: "NAME01",
                description: "first network",
                gateways: []
            };

            mockRepo.createNetwork.mockResolvedValue(fakeNetworkDAO);

            await networkController.createNetwork(fakeNetworkDAO);

            expect(mockRepo.createNetwork).toHaveBeenCalledWith(
                fakeNetworkDAO.code,
                fakeNetworkDAO.name,
                fakeNetworkDAO.description 
            );
        });

        it("Create network: ok, solo campi obbligatori", async () =>{
           const fakeNetworkDAO: NetworkDAO = {
                id: 1,
                code: "NET01",
                name: undefined,
                description: undefined,
                gateways: []
            };

            await networkController.createNetwork(fakeNetworkDAO);

            expect(mockRepo.createNetwork).toHaveBeenCalledWith(
                fakeNetworkDAO.code,
                fakeNetworkDAO.name,
                fakeNetworkDAO.description 
            ); 
        });

        it("Create network: code already in use", async () =>{
            const fakeNetworkDAO: NetworkDAO = {
                id: 1,
                code: "NET01",
                name: undefined,
                description: undefined,
                gateways: []
            };

            mockRepo.createNetwork.mockRejectedValue(new ConflictError("Entity with code NET01 already exists"));

            await expect(
                networkController.createNetwork(fakeNetworkDAO)
            ).rejects.toThrow(new ConflictError("Entity with code NET01 already exists"));
        });
    });

    describe("Get all networks", () =>{
        
        it("Get all networks: ok, array vuoto", async () =>{
            
            mockRepo.getAllNetworks.mockResolvedValue([] as Array<NetworkDAO>)

            const res = await networkController.getAllNetworks();

            expect(res).toBeInstanceOf(Array<NetworkDTO>);
            expect(res.length).toBe(0);
        });

        it("Get all networks: ok, tre networks", async () =>{

            let fakeSensor : SensorDAO = {
                id: 1,
                gateway: {} as GatewayDAO,
                macAddress: "MAC1",
                name: "SENSOR1",
                description: "first sensor",
                variable: "Temperature",
                unit: "K",
                measurements: [],
            };

            let fakeGateway1 : GatewayDAO = {
                id: 1,
                network: {} as NetworkDAO,
                macAddress: "MAC1",
                name: "GATEWAY1",
                sensors: [fakeSensor],
            };

            let fakeGateway2 : GatewayDAO = {
                id: 2,
                network: {} as NetworkDAO,
                macAddress: "MAC2",
                name: "GATEWAY2",
                sensors: [],
            };

            const fakeDao1 : NetworkDAO = {
                id: 1,
                code: "NET01",
                name: "NAME01",
                description: "first network",
                gateways: [fakeGateway1]
            };

            const fakeDao2 : NetworkDAO = {
                id: 2,
                code: "NET02",
                name: undefined,
                description: "second network",
                gateways: [fakeGateway2]
            };

            const fakeDao3 : NetworkDAO = {
                id: 3,
                code: "NET03",
                name: undefined,
                description: undefined,
                gateways: []
            };

            fakeSensor.gateway=fakeGateway1;
            fakeGateway1.network = fakeDao1;
            fakeGateway2.network = fakeDao2;

            mockRepo.getAllNetworks.mockResolvedValue([fakeDao1, fakeDao2, fakeDao3]);

            const res = await networkController.getAllNetworks();

            expect(res).toBeInstanceOf(Array<NetworkDTO>);
            expect(res.length).toBe(3);
            expect(res[0]).toMatchObject({
                code: "NET01",
                name: "NAME01",
                description: "first network",
                gateways: [{
                    macAddress: "MAC1",
                    name: "GATEWAY1",
                    sensors: [{
                        macAddress: "MAC1",
                        name: "SENSOR1",
                        description: "first sensor",
                        variable: "Temperature",
                        unit: "K",
                    }],
                }]
            });
            expect(res[0]).not.toHaveProperty("id");
            expect(res[1]).toMatchObject({
                code: "NET02",
                description: "second network",
                gateways: [{
                    macAddress: "MAC2",
                    name: "GATEWAY2",
                }]
            });
            expect(res[1]).not.toHaveProperty("id");
            expect(res[1]).not.toHaveProperty("name");

            expect(res[2]).toMatchObject({
                code: "NET03"
            });
            expect(res[2]).not.toHaveProperty("id");
            expect(res[2]).not.toHaveProperty("name");
            expect(res[2]).not.toHaveProperty("description");
            expect(res[2]).not.toHaveProperty("gateways");
        });
    });
    describe("Get specific network", () =>{
        it("Get specific network: ok, tutti i campi", async () =>{
            let fakeSensor : SensorDAO = {
                id: 1,
                gateway: {} as GatewayDAO,
                macAddress: "MAC1",
                name: "SENSOR1",
                description: "first sensor",
                variable: "Temperature",
                unit: "K",
                measurements: [],
            };

            let fakeGateway1 : GatewayDAO = {
                id: 1,
                network: {} as NetworkDAO,
                macAddress: "MAC1",
                name: "GATEWAY1",
                sensors: [fakeSensor],
            };

            let fakeGateway2 : GatewayDAO = {
                id: 2,
                network: {} as NetworkDAO,
                macAddress: "MAC2",
                name: "GATEWAY2",
                sensors: [],
            };

            const fakeDAO : NetworkDAO = {
                id: 1,
                code: "NET01",
                name: "NAME01",
                description: "first network",
                gateways: [fakeGateway1, fakeGateway2]
            };
            
            fakeSensor.gateway=fakeGateway1;
            fakeGateway1.network = fakeDAO;
            fakeGateway2.network = fakeDAO;


            mockRepo.getNetworkByCode.mockResolvedValue(fakeDAO);

            const res = await networkController.getNetwork(fakeDAO.code);

            expect(res).toBeInstanceOf(Object as NetworkDTO);
            expect(res).toMatchObject({
                code: "NET01",
                name: "NAME01",
                description: "first network",
                gateways: [
                    {
                    macAddress: "MAC1",
                    name: "GATEWAY1",
                    sensors: [{
                        macAddress: "MAC1",
                        name: "SENSOR1",
                        description: "first sensor",
                        variable: "Temperature",
                        unit: "K",
                    }],
                }, 
                {
                    macAddress: "MAC2",
                    name: "GATEWAY2",
                }]
            });
            expect(res).not.toHaveProperty("id");
        });


        it("Get specific network: ok, no name", async () =>{
            const fakeDAO : NetworkDAO = {
                id: 1,
                code: "NET01",
                name: undefined,
                description: "first network",
                gateways: []
            };
            
            mockRepo.getNetworkByCode.mockResolvedValue(fakeDAO);

            const res = await networkController.getNetwork(fakeDAO.code);

            expect(res).toBeInstanceOf(Object as NetworkDTO);
            expect(res).toMatchObject({
                code: "NET01",
                description: "first network",
            });
            expect(res).not.toHaveProperty("id");
            expect(res).not.toHaveProperty("name");
            expect(res).not.toHaveProperty("gateways");
        });


        it("Get specific network: ok, no name & description", async () =>{
            const fakeDAO : NetworkDAO = {
                id: 1,
                code: "NET01",
                name: undefined,
                description: undefined,
                gateways: []
            };
            
            mockRepo.getNetworkByCode.mockResolvedValue(fakeDAO);

            const res = await networkController.getNetwork(fakeDAO.code);

            expect(res).toBeInstanceOf(Object as NetworkDTO);
            expect(res).toMatchObject({
                code: "NET01",
            });
            expect(res).not.toHaveProperty("id");
            expect(res).not.toHaveProperty("name");
            expect(res).not.toHaveProperty("description");
            expect(res).not.toHaveProperty("gateways");
        });

        it("Get specific network: code not found", async () =>{
            mockRepo.getNetworkByCode.mockRejectedValue(new NotFoundError("Entity not found"));

            await expect(
                networkController.getNetwork("ghost")
            ).rejects.toThrow(new NotFoundError("Entity not found"));
        });
    });

    describe("Update network", () =>{
        it("Update network: ok, cambio campi opzionali", async () =>{

            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME02",
                description: "second network",
            }

            await networkController.updateNetwork("NET01", newNetwork);

            expect(mockRepo.updateNetwork).toHaveBeenCalledWith(
                "NET01",
                "NET01",
                "NAME02",
                "second network"
            );
        });

        it("Update network: ok, cambio tutti i campi", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET02",
                name: "NAME02",
                description: "second network",
            }

            await networkController.updateNetwork("NET01", newNetwork);

            expect(mockRepo.updateNetwork).toHaveBeenCalledWith(
                "NET01",
                "NET02",
                "NAME02",
                "second network"
            );
        });
        it("Update network: code not found", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET02",
                name: "NAME02",
                description: "second network",
            }
            mockRepo.updateNetwork.mockRejectedValue(new NotFoundError("Entity not found"));

            await expect(
                networkController.updateNetwork("ghost", newNetwork)
            ).rejects.toThrow(new NotFoundError("Entity not found"));
        });

        it("Update network: code already used", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET02",
                name: "NAME02",
                description: "second network",
            }
            mockRepo.updateNetwork.mockRejectedValue(new ConflictError("Entity with code NET01 already exists"));

            await expect(
                networkController.updateNetwork("NET01", newNetwork)
            ).rejects.toThrow(new ConflictError("Entity with code NET01 already exists"));
        });
    });

    describe("Delete network", () =>{
        it("Delete network: ok", async () =>{
            
            await networkController.deleteNetwork("NET01");

            expect(mockRepo.deleteNetwork).toHaveBeenCalledWith("NET01");
        });

        it("Delete network: code not found", async () =>{
            mockRepo.deleteNetwork.mockRejectedValue(new NotFoundError("Entity not found"));

            await expect(
                networkController.deleteNetwork("ghost")
            ).rejects.toThrow(new NotFoundError("Entity not found"));
        });
    });
})