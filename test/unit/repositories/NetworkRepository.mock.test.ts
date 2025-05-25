import { NetworkRepository } from "@repositories/NetworkRepository";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockFind = jest.fn();
const mockFindOne = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
    AppDataSource: {
        getRepository: () => ({
            find: mockFind,
            findOne: mockFindOne,
            save : mockSave,
            remove: mockRemove
        })
    }
}));

describe("NetworkRepository: mocked database", () => {
    const repo = new NetworkRepository();

    beforeEach(() =>{
        jest.clearAllMocks();
    });

    describe("CreateNetwork: mocked database", () => {
        it("create network", async () =>{
            mockFind.mockResolvedValue([]);

            const savedNetwork = new NetworkDAO();
            savedNetwork.id = 1;
            savedNetwork.code = "NET01";
            savedNetwork.name = "NAME01";
            savedNetwork.description = "first network created";
            savedNetwork.gateways = [];

            mockSave.mockResolvedValue(savedNetwork);

            const result = await repo.createNetwork("NET01", "NAME01", "first network created");


            expect(result).toBeInstanceOf(NetworkDAO);
            expect(result.id).toBe(1);
            expect(result.code).toBe("NET01");
            expect(result.name).toBe("NAME01");
            expect(result.description).toBe("first network created");
            expect(result.gateways).toStrictEqual([]);
            expect(mockSave).toHaveBeenCalledWith({
                code:"NET01",
                name:"NAME01",
                description: "first network created"
            })
        })

        it("create network: no description", async () => {
            mockFind.mockResolvedValue([]);

            const savedNetwork = new NetworkDAO();
            savedNetwork.id = 2;
            savedNetwork.code = "NET02";
            savedNetwork.name = "NAME02";
            savedNetwork.description = undefined;
            savedNetwork.gateways = [];

            mockSave.mockResolvedValue(savedNetwork);

            const result = await repo.createNetwork("NET02", "NAME02");

            expect(result).toBeInstanceOf(NetworkDAO);
            expect(result.id).toBe(2);
            expect(result.code).toBe("NET02");
            expect(result.name).toBe("NAME02");
            expect(result.description).toBeUndefined();
            expect(result.gateways).toStrictEqual([]);

            expect(mockSave).toHaveBeenCalledWith({
                code: "NET02",
                name: "NAME02",
                description: undefined,
            });
        });

        it("create network: no name", async () => {
            mockFind.mockResolvedValue([]);

            const savedNetwork = new NetworkDAO();
            savedNetwork.id = 3;
            savedNetwork.code = "NET03";
            savedNetwork.name = undefined;
            savedNetwork.description = "desc03";
            savedNetwork.gateways = [];

            mockSave.mockResolvedValue(savedNetwork);

            const result = await repo.createNetwork("NET03", undefined, "desc03");

            expect(result).toBeInstanceOf(NetworkDAO);
            expect(result.id).toBe(3);
            expect(result.code).toBe("NET03");
            expect(result.name).toBeUndefined();
            expect(result.description).toBe("desc03");
            expect(result.gateways).toStrictEqual([]);

            expect(mockSave).toHaveBeenCalledWith({
                code: "NET03",
                name: undefined,
                description: "desc03",
            });
        });

        it("create network: no name and no description", async () => {
            mockFind.mockResolvedValue([]);

            const savedNetwork = new NetworkDAO();
            savedNetwork.id = 4;
            savedNetwork.code = "NET04";
            savedNetwork.name = undefined;
            savedNetwork.description = undefined;
            savedNetwork.gateways = [];

            mockSave.mockResolvedValue(savedNetwork);

            const result = await repo.createNetwork("NET04");

            expect(result).toBeInstanceOf(NetworkDAO);
            expect(result.id).toBe(4);
            expect(result.code).toBe("NET04");
            expect(result.name).toBeUndefined();
            expect(result.description).toBeUndefined();
            expect(result.gateways).toStrictEqual([]);

            expect(mockSave).toHaveBeenCalledWith({
                code: "NET04",
                name: undefined,
                description: undefined,
            });
});


        it("create network: conflict", async () => {
            const existingNetwork = new NetworkDAO();
            existingNetwork.code = "NET01";
            existingNetwork.name = "NAME01";
            existingNetwork.description = "first network created";
            existingNetwork.gateways = [];

            mockFind.mockResolvedValue([existingNetwork]);

            await expect(
                repo.createNetwork("NET01", "NAME01", "first network created")
            ).rejects.toThrow(ConflictError);
            
            expect(mockFind).toHaveBeenCalledWith({ where: { code: "NET01" } });
        });
    });

    describe("getAllNetworks: mocked database", () =>{
        
        it("get all networks: no entries", async () =>{
            mockFind.mockResolvedValue([]);
            const result = await repo.getAllNetworks();

            expect(result).toBeInstanceOf(Array<NetworkDAO>);
            expect(result.length).toBe(0);
        });

        it("get all networks: two entries", async () =>{
            const net1 = new NetworkDAO();
            const net2 = new NetworkDAO();
            net1.code = "NET01";
            net1.name = "NAME01";
            net1.description = "first network created";
            net1.gateways = [];

            net2.code = "NET02";
            net2.name = "NAME02";
            net2.description = "second network created";
            net2.gateways = [];

            mockFind.mockResolvedValue([net1, net2]);

            const result = await repo.getAllNetworks();

            
            expect(mockFind).toHaveBeenCalledTimes(1);

            expect(result).toBeInstanceOf(Array<NetworkDAO>)
            expect(result.length).toBe(2);

            expect(result[0]).toBe(net1);
            expect(result[0].code).toBe("NET01");
            expect(result[0].name).toBe("NAME01");
            expect(result[0].description).toBe("first network created");
            expect(result[0].gateways).toStrictEqual([]);

            expect(result[1]).toBe(net2);
            expect(result[1].code).toBe("NET02");
            expect(result[1].name).toBe("NAME02");
            expect(result[1].description).toBe("second network created");
            expect(result[1].gateways).toStrictEqual([]);

        })
    })

    describe("getNetworkByCode: mocked database", () => {
        it("get network by code", async () => {
            const foundNetwork = new NetworkDAO();
            foundNetwork.code = "NET01";
            foundNetwork.name = "NAME01";
            foundNetwork.description = "first network created";
            foundNetwork.gateways = [];

            mockFind.mockResolvedValue([foundNetwork]);

            const result = await repo.getNetworkByCode("NET01");
            expect(result).toBe(foundNetwork);
            expect(result.code).toBe("NET01");
            expect(result.name).toBe("NAME01");
            expect(result.description).toBe("first network created");
            expect(result.gateways).toStrictEqual([]);

            expect(mockFind).toHaveBeenCalledWith({ where: { code: "NET01" }});
        })

        it("find network by code: not found", async () =>{
            mockFind.mockReturnValue([]);

            await expect(repo.getNetworkByCode("ghost")).rejects.toThrow(
                NotFoundError
            );

            expect(mockFind).toHaveBeenCalledWith({ where: { code: "ghost" } });
        });
    });

    describe("deleteNetwork: mocked database", () =>{
        it( "delete network by code", async () => {
            const network = new NetworkDAO();
            network.code = "NET01";
            network.name = "NAME01";
            network.description=  "first network created";
            mockFind.mockResolvedValue([network]);
            mockRemove.mockResolvedValue(undefined);

            await repo.deleteNetwork("NET01");
            expect(mockRemove).toHaveBeenCalledWith(network);

        });

        it("remove network by code: not found", async () =>{
            mockFind.mockReturnValue([]);

            await expect(repo.deleteNetwork("ghost")).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe("updateNetwork: mocked database", () =>{

        it("update network: change name", async () => {
            const existingNetwork = new NetworkDAO();
            existingNetwork.code = "NET01";
            existingNetwork.name = "OLDNAME";
            existingNetwork.description = "old description";
            existingNetwork.gateways = [];

            mockFind.mockResolvedValue([existingNetwork]);

            mockSave.mockResolvedValue(undefined);

            await repo.updateNetwork("NET01", "NET01", "NEWNAME");

            expect(mockSave).toHaveBeenCalledWith({
                ...existingNetwork,
                name: "NEWNAME",
            });
        });

        it("update network: change description", async () => {
            const existingNetwork = new NetworkDAO();
            existingNetwork.code = "NET01";
            existingNetwork.name = "OLDNAME";
            existingNetwork.description = "old description";
            existingNetwork.gateways = [];

            mockFind.mockResolvedValue([existingNetwork]);

            mockSave.mockResolvedValue(undefined);

            await repo.updateNetwork("NET01", "NET01", undefined , "new description");

            expect(mockSave).toHaveBeenCalledWith({
                ...existingNetwork,
                description: "new description",
            });
        });

        it("update network: change name & description", async () => {
            const existingNetwork = new NetworkDAO();
            existingNetwork.code = "NET01";
            existingNetwork.name = "OLDNAME";
            existingNetwork.description = "old description";
            existingNetwork.gateways = [];

            mockFind.mockResolvedValue([existingNetwork]);

            mockSave.mockResolvedValue(undefined);

            await repo.updateNetwork("NET01", "NET01", "NEWNAME", "new description");

            expect(mockSave).toHaveBeenCalledWith({
                ...existingNetwork,
                name: "NEWNAME",
                description: "new description",
            });
        });

        it("update network: change of code", async () => {
            const existingNetwork = new NetworkDAO();
            existingNetwork.code = "NET01";
            existingNetwork.name = "OLDNAME";
            existingNetwork.description = "old description";
            existingNetwork.gateways = [];

            mockFind.mockResolvedValue([existingNetwork]);

            mockSave.mockResolvedValue(undefined);

            await repo.updateNetwork("NET01", "NET02", "NEWNAME", "new description");

            expect(mockSave).toHaveBeenCalledWith({
                ...existingNetwork,
                code: "NET02",
                name: "NEWNAME",
                description: "new description",
            });

            expect(mockFindOne).toHaveBeenCalledWith({"where": {"code": "NET02"}});
        });

        it("update network: network not found", async () => {
            mockFind.mockResolvedValue([]);

            await expect(
                repo.updateNetwork("NET01", "NET02", "NEWNAME", "new description")
            ).rejects.toThrow(NotFoundError);

            expect(mockSave).not.toHaveBeenCalled();
        });

        it("update network: new code already exists", async () => {
            const existingNetwork = new NetworkDAO();
            existingNetwork.code = "NET01";
            existingNetwork.name = "OLDNAME";
            existingNetwork.description = "old description";
            existingNetwork.gateways = [];

            const conflictingNetwork = new NetworkDAO();
            conflictingNetwork.code = "NET02";

            mockFind.mockResolvedValueOnce([existingNetwork]);
            mockFindOne.mockResolvedValueOnce(conflictingNetwork);

            await expect(
                repo.updateNetwork("NET01", "NET02", "NEWNAME", "new description")
            ).rejects.toThrow(ConflictError);

            expect(mockSave).not.toHaveBeenCalled();
        });
    })
})
