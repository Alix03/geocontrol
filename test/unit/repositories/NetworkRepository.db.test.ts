import {NetworkRepository} from "@repositories/NetworkRepository"
import {
    initializeTestDataSource,
    closeTestDataSource,
    TestDataSource
}from "@test/setup/test-datasource"
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { NetworkDAO } from "@dao/NetworkDAO"


beforeAll(async () => {
    await initializeTestDataSource();
});

afterAll(async () =>{
    await closeTestDataSource();
});

beforeEach(async () =>{
    await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("NetworkRepository: SQLite in-memory", () =>{
    const repo = new NetworkRepository();

    describe("create network", () =>{
        
        it("Create new network: all fields", async () =>{
            const network = await repo.createNetwork(
                "NET01",
                "NAME01",
                "first network"
            );

            expect(network.code).toBe("NET01");
            expect(network.name).toBe("NAME01");
            expect(network.description).toBe("first network");
        });

        it("Create new network: no description", async () =>{
            const network = await repo.createNetwork(
                "NET01",
                "NAME01",
            );

            expect(network.code).toBe("NET01");
            expect(network.name).toBe("NAME01");
            expect(network.description).toBeNull();
        });

        it("Create new network: no name", async () =>{
            const network = await repo.createNetwork(
                "NET01",
                undefined,
                "first network",
            );

            expect(network.code).toBe("NET01");
            expect(network.name).toBeNull();
            expect(network.description).toBe("first network");
        });

        it("Create new network: no name & description", async () =>{
            const network = await repo.createNetwork(
                "NET01"
            );

            expect(network.code).toBe("NET01");
            expect(network.name).toBeNull();
            expect(network.description).toBeNull();
        });

        it("Create new network: conflict", async () =>{
            await repo.createNetwork("NET01");

            await expect(
                repo.createNetwork("NET01")
            ).rejects.toThrow(ConflictError);
        });
    });

    describe("Get all networks", () =>{
        it("Get all networks: ok, no networks presenti", async () =>{
            const networks = await repo.getAllNetworks();
            expect(networks).toStrictEqual([]);
            expect(networks).toBeInstanceOf(Array<NetworkDAO>);
        });

        it("Get all networks: ok, due networks presenti", async () =>{
            await repo.createNetwork("NET01","NAME01", "first network");
            await repo.createNetwork("NET02","NAME02", "second network");
            const networks = await repo.getAllNetworks();

            expect(networks).toBeInstanceOf(Array<NetworkDAO>);
            expect(networks.length).toBe(2);

            expect(networks[0].code).toBe("NET01");
            expect(networks[0].name).toBe("NAME01");
            expect(networks[0].description).toBe("first network");

            expect(networks[1].code).toBe("NET02");
            expect(networks[1].name).toBe("NAME02");
            expect(networks[1].description).toBe("second network");
        });
    }); 

    describe("Get specific network", () =>{
        it("Get specific network: ok", async () =>{
            const network = await repo.createNetwork("NET01","NAME01", "first network");

            const res = await repo.getNetworkByCode(network.code);

            expect(res).toBeInstanceOf(NetworkDAO);
            expect(res.code).toBe("NET01");
            expect(res.name).toBe("NAME01");
            expect(res.description).toBe("first network");
        });

        it("Get specific network: network not found", async () =>{
            await expect(
                repo.getNetworkByCode("NET01")
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("Update network", () =>{
        it("Update network: ok, change all", async () =>{
            await repo.createNetwork("NET01","NAME01", "first network");

            await repo.updateNetwork("NET01", "NET02", "NAME02","second network");

            const res = await repo.getNetworkByCode("NET02");

            expect(res.code).toBe("NET02");
            expect(res.name).toBe("NAME02");
            expect(res.description).toBe("second network");
        });

        it("Update network: ok, change only optionals", async () =>{
            await repo.createNetwork("NET01","NAME01", "first network");

            await repo.updateNetwork("NET01", "NET01", "NAME02" ,"second network");

            const res = await repo.getNetworkByCode("NET01");

            expect(res.code).toBe("NET01");
            expect(res.name).toBe("NAME02");
            expect(res.description).toBe("second network");
        });

        it("Update network: ok, change only code", async () =>{
            await repo.createNetwork("NET01","NAME01", "first network");

            await repo.updateNetwork("NET01", "NET02");

            const res = await repo.getNetworkByCode("NET02");

            expect(res.code).toBe("NET02");
            expect(res.name).toBe("NAME01");
            expect(res.description).toBe("first network");
        });

        it("Update network: network not found", async () =>{
            await expect(
                repo.updateNetwork("NET01", "NET01")
            ).rejects.toThrow(NotFoundError);
        });

        it("Update network: network code already in use", async () =>{
            await repo.createNetwork("NET01","NAME01", "first network");
            await repo.createNetwork("NET02","NAME02", "second network");

            await expect(
                repo.updateNetwork("NET01","NET02")
            ).rejects.toThrow(ConflictError);
        });
    });

    describe("Delete network", () =>{
        it("Delete network: ok", async ()=>{
            await repo.createNetwork("NET01","NAME01", "first network");
            await repo.deleteNetwork("NET01");

            const res = await repo.getAllNetworks();

            expect(res.length).toBe(0);
            await expect(
                repo.getNetworkByCode("NET01")
            ).rejects.toThrow(NotFoundError);
        });

        it("Delete network: network not found", async ()=>{
            await expect(
                repo.deleteNetwork("NET01")
            ).rejects.toThrow(NotFoundError);
        });
    })
})