import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as networkController from "@controllers/networkController";
import { UserType } from "@models/UserType";
import { Network as NetworkDTO } from "@dto/Network";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@services/authService");
jest.mock("@controllers/networkController");

describe("NetworkRoutes integration", () => {
    const token = "Bearer faketoken";

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("get all networks", () => {
        it("get all networks: ok", async () => {
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

        it("get all networks: 401 UnauthorizedError", async () => {
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
});
