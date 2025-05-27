import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as networkController from "@controllers/networkController";
import { UserType } from "@models/UserType";
import { Network as NetworkDTO } from "@dto/Network";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/networkController");

describe("NetworkRoutes integration", () => {
    const token = "Bearer faketoken";

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Create network", () =>{
        it("Create network: ok", async () =>{

            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME01",
                description: "first network",
            };
            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.createNetwork as jest.Mock).mockResolvedValue(undefined);

            const response = await request(app)
                .post("/api/v1/networks")
                .set("Authorization", token)
                .send(newNetwork);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({});
            expect(authService.processToken).toHaveBeenCalledWith(token, [
                  UserType.Admin,
                  UserType.Operator
                ]);
            expect(networkController.createNetwork).toHaveBeenCalled();
        });

        it("Create network: ok, solo campi obbligatori", async () =>{

            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: undefined,
                description: undefined,
            };
            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.createNetwork as jest.Mock).mockResolvedValue(undefined);

            const response = await request(app)
                .post("/api/v1/networks")
                .set("Authorization", token)
                .send(newNetwork);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({});
            expect(authService.processToken).toHaveBeenCalledWith(token, [
                  UserType.Admin,
                  UserType.Operator
                ]);
            expect(networkController.createNetwork).toHaveBeenCalled();
        });

        it("Create network: 401 Unauthorized", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME01",
                description: "first network",
            };


            (authService.processToken as jest.Mock).mockImplementation(() => {
                throw new UnauthorizedError("Unauthorized: Invalid token format");
            });

            const resp = await request(app)
                .post("/api/v1/networks")
                .set("Authorization", "Bearer invalid")
                .send(newNetwork);

            expect(resp.status).toBe(401);
            expect(resp.body.code).toBe(401);
            expect(resp.body.name).toBe("UnauthorizedError");
            expect(resp.body.message).toMatch(/Unauthorized/);
        });

        it("Create network: 403 InsufficientRightsError", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME01",
                description: "first network",
            };
            
            (authService.processToken as jest.Mock).mockImplementation(() => {
                throw new InsufficientRightsError("Forbidden: Insufficient rights");
            });

            const resp = await request(app)
                .post("/api/v1/networks")
                .set("Authorization", "Bearer invalid")
                .send(newNetwork);
            
            expect(resp.status).toBe(403);
            expect(resp.body.code).toBe(403);
            expect(resp.body.name).toBe("InsufficientRightsError");
            expect(resp.body.message).toMatch("Forbidden: Insufficient rights");
        });

        it("Create network: 409 Network code already in use", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME01",
                description: "first network",
            };
            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.createNetwork as jest.Mock).mockImplementation( () => {
                throw new ConflictError(`Entity with code ${newNetwork.code} already exists`)
            });

            const resp = await request(app)
                .post("/api/v1/networks")
                .set("Authorization", token)
                .send(newNetwork);

            expect(resp.status).toBe(409);
            expect(resp.body.code).toBe(409);
            expect(resp.body.name).toBe("ConflictError");
            expect(resp.body.message).toMatch(`Entity with code ${newNetwork.code} already exists`);
            expect(networkController.createNetwork).toHaveBeenCalled();
        });
    });

    describe("Get all networks", () => {
        it("Get all networks: ok", async () => {
            const mockNetworks: NetworkDTO[] = [
                {
                    code: "NET01",
                    name: "NAME01",
                    description: "first network",
                    gateways: [
                        {
                            macAddress: "MAC01",
                            name: "GATE01",
                            description: "first gateway",
                            sensors: [
                                {
                                    macAddress: "MAC01",
                                    name: "SENSOR01",
                                    description: "first sensor"
                                }
                            ],
                        }
                    ]
                },
                {
                    code: "NET02",
                    name: "NAME02",
                    description: "second network",
                    gateways: [
                        {
                            macAddress: "MAC01",
                            name: "GATE01",
                            description: "first gateway",
                        }
                    ],
                }
            ];

            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.getAllNetworks as jest.Mock).mockResolvedValue(mockNetworks);

            const resp = await request(app)
                .get("/api/v1/networks")
                .set("Authorization", token);

            expect(resp.status).toBe(200);
            expect(resp.body).toEqual(mockNetworks);
            expect(authService.processToken).toHaveBeenCalledWith(token, [
                UserType.Admin,
                UserType.Operator,
                UserType.Viewer
            ]);
            expect(networkController.getAllNetworks).toHaveBeenCalled();
        });

        it("Get all networks: 401 UnauthorizedError", async () => {
            (authService.processToken as jest.Mock).mockImplementation(() => {
                throw new UnauthorizedError("Unauthorized: Invalid token format");
            });

            const resp = await request(app)
                .get("/api/v1/users")
                .set("Authorization", "Bearer invalid");

            expect(resp.status).toBe(401);
            expect(resp.body.code).toBe(401);
            expect(resp.body.name).toBe("UnauthorizedError");
            expect(resp.body.message).toMatch(/Unauthorized/);
            expect(networkController.getAllNetworks).not.toHaveBeenCalled();
        });
    });

    describe("Get network by code", () => {
        it("Get network by code: ok", async () =>{
            const mockNetwork: NetworkDTO ={
                code: "NET01",
                name: "NAME01",
                description: "first network",
                gateways: [
                    {
                        macAddress: "MAC01",                            
                        name: "GATE01",
                        description: "first gateway",
                        sensors: [
                            {
                                macAddress: "MAC01",
                                name: "SENSOR01",
                                description: "first sensor"
                            }
                        ],
                    }
                ]
            };
            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);

            const resp = await request(app)
                .get(`/api/v1/networks/${mockNetwork.code}}`)
                .set("Authorization", token);
            
            expect(resp.status).toBe(200);
            expect(resp.body).toEqual(mockNetwork);
            expect(authService.processToken).toHaveBeenCalledWith(token, [
                  UserType.Admin,
                  UserType.Operator,
                  UserType.Viewer,
                ]);
            expect(networkController.getNetwork).toHaveBeenCalled();
        });

        it("Get network by code: 401 UnauthorizedError", async () =>{
            
            (authService.processToken as jest.Mock).mockImplementation(() => {
                throw new UnauthorizedError("Unauthorized: Invalid token format");
            });
            

            const resp = await request(app)
                .get(`/api/v1/networks/NET01`)
                .set("Authorization", "Bearer invalid");

            expect(resp.status).toBe(401);
            expect(resp.body.code).toBe(401);
            expect(resp.body.name).toBe("UnauthorizedError");
            expect(resp.body.message).toMatch(/Unauthorized/);
        });

        it("Get network by code: 404 Network not found", async () =>{
            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.getNetwork as jest.Mock).mockImplementation(() =>{
                throw new NotFoundError("Entity not found")
            });

            const resp = await request(app)
                .get(`/api/v1/networks/NET01`)
                .set("Authorization", token);

            expect(resp.status).toBe(404);
            expect(resp.body.code).toBe(404);
            expect(resp.body.name).toBe("NotFoundError");
            expect(resp.body.message).toMatch("Entity not found");
        });
    });


    describe("Update network", () =>{
        const oldNetworkCode = "NET01";

        it("Update network: ok", async () =>{

            const newNetwork : NetworkDTO = {
                code: "NET02",
                name: "NAME02",
                description: "second network",
            };
            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);

            const response = await request(app)
                .patch(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", token)
                .send(newNetwork);

            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
            expect(authService.processToken).toHaveBeenCalledWith(token, [
                UserType.Admin,
                UserType.Operator
                ]);
            expect(networkController.updateNetwork).toHaveBeenCalledWith(oldNetworkCode, newNetwork);
        });

        it("Update network: ok, cambio solo opzionali", async () =>{

            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME02",
                description: "second network",
            };
            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);

            const resp = await request(app)
                .patch(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", token)
                .send(newNetwork);

            expect(resp.status).toBe(204);
            expect(resp.body).toEqual({});
            expect(authService.processToken).toHaveBeenCalledWith(token, [
                UserType.Admin,
                UserType.Operator
                ]);
            expect(networkController.updateNetwork).toHaveBeenCalledWith(oldNetworkCode, newNetwork);
        });

        it("Update network: 401 UnauthorizedError", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME02",
                description: "second network",
            };

            (authService.processToken as jest.Mock).mockImplementation(() => {
                throw new UnauthorizedError("Unauthorized: Invalid token format");
            });
            (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);
            

            const resp = await request(app)
                .patch(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", token)
                .send(newNetwork);

            expect(resp.status).toBe(401);
            expect(resp.body.code).toBe(401);
            expect(resp.body.name).toBe("UnauthorizedError");
            expect(resp.body.message).toMatch(/Unauthorized/);
        });

        it("Update network: 403 InsufficientRightsError", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME01",
                description: "first network",
            };
            
            (authService.processToken as jest.Mock).mockImplementation(() => {
                throw new InsufficientRightsError("Forbidden: Insufficient rights");
            });
            (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);
            

            const resp = await request(app)
                .patch(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", token)
                .send(newNetwork);
            
            expect(resp.status).toBe(403);
            expect(resp.body.code).toBe(403);
            expect(resp.body.name).toBe("InsufficientRightsError");
            expect(resp.body.message).toMatch("Forbidden: Insufficient rights");
        });

        it("Update network by code: 404 Network not found", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME01",
                description: "first network",
            };

            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.updateNetwork as jest.Mock).mockImplementation(() =>{
                throw new NotFoundError("Entity not found")
            });

            const resp = await request(app)
                .patch(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", token)
                .send(newNetwork);

            expect(resp.status).toBe(404);
            expect(resp.body.code).toBe(404);
            expect(resp.body.name).toBe("NotFoundError");
            expect(resp.body.message).toMatch("Entity not found");
        });

        it("Update network: 409 Network code already in use", async () =>{
            const newNetwork : NetworkDTO = {
                code: "NET01",
                name: "NAME01",
                description: "first network",
            };
            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.updateNetwork as jest.Mock).mockImplementation( () => {
                throw new ConflictError(`Entity with code ${newNetwork.code} already exists`)
            });

            const resp = await request(app)
                .patch(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", token)
                .send(newNetwork);

            expect(resp.status).toBe(409);
            expect(resp.body.code).toBe(409);
            expect(resp.body.name).toBe("ConflictError");
            expect(resp.body.message).toMatch(`Entity with code ${newNetwork.code} already exists`);
            expect(networkController.updateNetwork).toHaveBeenCalled();
        });
    }); 

    describe("Delete network", () =>{
        const oldNetworkCode = "NET01";
        it("Delete network: ok", async () =>{

            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);

            const response = await request(app)
                .delete(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", token)

            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
            expect(authService.processToken).toHaveBeenCalledWith(token, [
                  UserType.Admin,
                  UserType.Operator
                ]);
            expect(networkController.deleteNetwork).toHaveBeenCalled();
        });

        it("Delete network: 401 Unauthorized", async () =>{

            (authService.processToken as jest.Mock).mockImplementation(() => {
                throw new UnauthorizedError("Unauthorized: Invalid token format");
            });
            (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);

            const resp = await request(app)
                .delete(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", "Bearer invalid")

            expect(resp.status).toBe(401);
            expect(resp.body.code).toBe(401);
            expect(resp.body.name).toBe("UnauthorizedError");
            expect(resp.body.message).toMatch(/Unauthorized/);
        });

        it("Delete network: 403 InsufficientRightsError", async () =>{
            
            (authService.processToken as jest.Mock).mockImplementation(() => {
                throw new InsufficientRightsError("Forbidden: Insufficient rights");
            });
            (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);

            const resp = await request(app)
                .delete(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", "Bearer invalid")

            expect(resp.status).toBe(403);
            expect(resp.body.code).toBe(403);
            expect(resp.body.name).toBe("InsufficientRightsError");
            expect(resp.body.message).toMatch("Forbidden: Insufficient rights");
        });

        it("Delete network by code: 404 Network not found", async () =>{

            (authService.processToken as jest.Mock).mockResolvedValue(undefined);
            (networkController.deleteNetwork as jest.Mock).mockImplementation(() =>{
                throw new NotFoundError("Entity not found")
            });

            const resp = await request(app)
                .delete(`/api/v1/networks/${oldNetworkCode}`)
                .set("Authorization", "Bearer invalid")

            expect(resp.status).toBe(404);
            expect(resp.body.code).toBe(404);
            expect(resp.body.name).toBe("NotFoundError");
            expect(resp.body.message).toMatch("Entity not found");
            expect(networkController.deleteNetwork).toHaveBeenCalled();
        });        
        
    });
});
