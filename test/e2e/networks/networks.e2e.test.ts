import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("Gateway API (e2e)", () => {
    let adminToken: string;
    let operatorToken: string;
    let viewerToken: string;


    beforeAll(async () => {
        await beforeAllE2e();
        adminToken = generateToken(TEST_USERS.admin);
        operatorToken = generateToken(TEST_USERS.operator);
        viewerToken = generateToken(TEST_USERS.viewer);

    });

    afterAll(async () => {
        await afterAllE2e();
    });

    describe("GET /networks", () =>{
        describe("Casi di successo", () =>{

            const network1 = {
                code: "NET1",
                name: "NAME1",
                description: "first network",
            };

            const network2 = {
                code: "NET2",
                name: "NAME2",
            };

            const network3 = {
                code: "NET3",
            };

            it("Array vuoto, no networks esistenti (admin user)", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual([]);
            });

            it("Array vuoto, no networks esistenti (operator user)", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks")
                    .set("Authorization", `Bearer ${operatorToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual([]);
            });

            it("Array vuoto, no networks esistenti (viewer user)", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks")
                    .set("Authorization", `Bearer ${viewerToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual([]);
            });


            it("Ritorna un con tre entry (admin user)", async () =>{
                await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(network1);

                await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(network2);

                await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(network3);

                const res = await request(app)
                    .get("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toMatchObject([network1, network2, network3]);
            });

            it("Ritorna un con tre entry (operator user)", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks")
                    .set("Authorization", `Bearer ${operatorToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toMatchObject([network1, network2, network3]);
            });

            it("Ritorna un con tre entry (viewer user)", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks")
                    .set("Authorization", `Bearer ${viewerToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toMatchObject([network1, network2, network3]);
            });
        });

        describe("Casi di errore", () =>{
            it("401 UnauthorizedError: token non presente", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks")
                    .set("Authorization", `Bearer token invalid`);
                
                expect(res.status).toBe(401);
                expect(res.body.code).toBe(401);
            });
        });
    });

    describe("POST /networks", ()=>{
        describe("Casi di successo", () =>{
            it("Crea un network con tutti i campi (admin user)", async () =>{
                const network = {
                    code: "NET01",
                    name: "NAME01",
                    description: "first network",
                };

                const resp = await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(network);

                expect(resp.status).toBe(201);
                expect(resp.body).toStrictEqual({});
            });

            it("Crea un network con solo campi obbligatori (admin user)", async () =>{
                const network = {
                    code: "NET02",
                    name: undefined,
                    description : undefined
                };

                const resp = await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(network);

                expect(resp.status).toBe(201);
                expect(resp.body).toStrictEqual({});
            });

            it("Crea un network con tutti i campi (operator user)", async () =>{
                const network = {
                    code: "NET03",
                    name: "NAME03",
                    description: "third network",
                };

                const resp = await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${operatorToken}`)
                    .send(network);

                expect(resp.status).toBe(201);
                expect(resp.body).toStrictEqual({});
            });

            it("Crea un network con solo campi obbligatori (operator user)", async () =>{
                const network = {
                    code: "NET04"
                };

                const resp = await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${operatorToken}`)
                    .send(network);

                expect(resp.status).toBe(201);
                expect(resp.body).toStrictEqual({});
            });
        });

        describe("Casi di errore", () =>{
            it("400 Invalid input data: networkCode non presente", async () =>{
                const network ={
                    name: "NAME04",
                    description: "fourth network"
                };

                const res = await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(network);
                
                expect(res.status).toBe(400);
                expect(res.body.code).toBe(400);
            });

            it("401 Unauthorized: invalid token format", async () =>{
                const network={
                    code: "NET05"
                };

                const res= await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", "Bearer invalid")
                    .send(network);

                expect(res.status).toBe(401);
                expect(res.body.code).toBe(401);
            });
            
            it("403 Insufficient rights: utente non autorizzato", async () =>{
                const network={
                    code: "NET06"
                };

                const res= await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${viewerToken}`)
                    .send(network);

                expect(res.status).toBe(403);
                expect(res.body.code).toBe(403);
            });

            it("409 Network code already in use: codice già usato", async ()=>{
                const usedNetwork = {
                    code: "NET01",
                    name: "NAME01",
                    description: "first network",
                };

                const resp = await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(usedNetwork);

                expect(resp.status).toBe(409);
                expect(resp.body.code).toBe(409);
            });

            it("500 Network code cannot be empty" , async () =>{
                const usedNetwork = {
                    code: "   \t   ",
                    name: "NAME01",
                    description: "first network",
                };

                const resp = await request(app)
                    .post("/api/v1/networks")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(usedNetwork);

                expect(resp.status).toBe(500);
                expect(resp.body.code).toBe(500);
            });
        });
    });
    describe("GET /networks/{networkCode}",  () =>{

        beforeEach(async () =>{
            const network = {
                code: "NET01",
                name: "NAME01",
                description: "first network"
            };

            const networkOnlyRequired ={
                code: "NET02"
            };

            await request(app)
                .post("/api/v1/networks")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(network);
            await request(app)
                .post("/api/v1/networks")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(networkOnlyRequired);
        });
        
        describe("Casi di successo", () =>{
            it("Get di network dal codice (admin user)", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toMatchObject({
                    code: "NET01",
                    name: "NAME01",
                    description: "first network"
                });
            });

            it("Get di network dal codice (operator user)", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks/NET02")
                    .set("Authorization", `Bearer ${operatorToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toMatchObject({
                    code: "NET02"
                });
            });

            it("Get di network dal codice (viewer user)", async () =>{
                const res = await request(app)
                    .get("/api/v1/networks/NET02")
                    .set("Authorization", `Bearer ${viewerToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toMatchObject({
                    code: "NET02"
                });
            });
        });

        describe("Casi di errore", () =>{
            it("401 UnauthorizedError: invalid format token", async () => {
                const res = await request(app).get(
                "/api/v1/networks/NET01");
                expect(res.status).toBe(401);
                expect(res.body.code).toBe(401);
            });

            it("404 NotFoundError: network inesistente", async () => {
                const res = await request(app)
                .get("/api/v1/networks/ghost")
                .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(404);
                expect(res.body.code).toBe(404);
            });
        });
    });

    describe("DELETE /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}", () => {
        beforeEach(async () => {
            const network = {
                code: "NET01",
                name: "NAME01",
                description: "first network"
            };

            await request(app)
                .post(
                `/api/v1/networks`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(network);
        });

        describe("Casi di successo", () => {
            it("Elimina un network (admin user)", async () => {
                const res = await request(app)
                    .delete( "/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(204);

                const res1 = await request(app)
                    .get("/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${adminToken}`);

                expect(res1.status).toBe(404);
            });

            it("Elimina un network (operator user)", async () => {
                const res = await request(app)
                    .delete( "/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${operatorToken}`);

                expect(res.status).toBe(204);

                const res1 = await request(app)
                    .get("/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${operatorToken}`);

                expect(res1.status).toBe(404);
            });
        });

        describe("Casi di errore", () => {
            it("401 UnauthorizedError: token non presente", async () => {
                const res = await request(app).delete("/api/v1/networks/NET01" );

                expect(res.status).toBe(401);
                expect(res.body.code).toBe(401);
                expect(res.body.name).toBe("UnauthorizedError");
            });

            it("403 Insufficient rights: utente non autorizzato", async () => {
                const res = await request(app).delete("/api/v1/networks/NET01" )
                    .set("Authorization", `Bearer ${viewerToken}`);

                expect(res.status).toBe(403);
                expect(res.body.code).toBe(403);
            });

            it("404 NotFoundError: network inesistente", async () => {
                const res = await request(app)
                .delete("/api/v1/networks/ghost")
                .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(404);
                expect(res.body.code).toBe(404);
            });
        });
    });

    describe("PATCH /networks/{networkCode}", () => {
        beforeEach(async () => {
            const network = {
                code: "NET01",
                name: "NAME01",
                description: "first network"
            };

            await request(app)
                .post(
                `/api/v1/networks`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(network);

            
        });

        describe("Casi di successo", () => {
            it("Update di un network (admin user)", async () => {
                const updatedNetwork = {
                    code: "NET10",
                    name: "NAME02",
                    description: "updated network"
                };

                const res = await request(app)
                    .patch(
                        "/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(updatedNetwork);

                expect(res.status).toBe(204);
                
                const res1 = await request(app)
                    .get("/api/v1/networks/NET10")
                    .set("Authorization", `Bearer ${adminToken}`)
                
                expect(res1.body).toMatchObject(updatedNetwork);
            });

            it("Update di un network. network code invariato (operator user)", async () => {
                const updatedNetwork = {
                    code: "NET01",
                    name: "NAME02",
                    description: "updated network"
                };

                const res = await request(app)
                    .patch(
                        "/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${operatorToken}`)
                    .send(updatedNetwork);

                expect(res.status).toBe(204);
                
                const res1 = await request(app)
                    .get("/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${operatorToken}`)
                
                expect(res1.body).toMatchObject(updatedNetwork);
            });
        });

        describe("Casi di errore", () =>{
            it("401 UnauthorizedError: invalid token format", async () => {
                const updatedNetwork = {
                    code: "NET01",
                    name: "NAME02",
                    description: "updated network"
                };

                const res = await request(app)
                    .patch(
                        "/api/v1/networks/NET01")
                    .send(updatedNetwork);

                expect(res.status).toBe(401);
                expect(res.body.code).toBe(401);
            });

            it("401 InsufficientRightsError: utente non autorizzato", async () => {
                const updatedNetwork = {
                    code: "NET01",
                    name: "NAME02",
                    description: "updated network"
                };

                const res = await request(app)
                    .patch(
                        "/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${viewerToken}`)
                    .send(updatedNetwork);

                expect(res.status).toBe(403);
                expect(res.body.code).toBe(403);
            });

            it("404 NotFoundError: network non esistente", async () => {
                const updatedNetwork = {
                    code: "NET01",
                    name: "NAME02",
                    description: "updated network"
                };

                const res = await request(app)
                    .patch(
                        "/api/v1/networks/ghost")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(updatedNetwork);

                expect(res.status).toBe(404);
                expect(res.body.code).toBe(404);
            });

            it("409 ConflictError: network code already in use", async () =>{
                const updatedNetwork = {
                    code: "NET02",
                    name: "NAME02",
                    description: "updated network"
                };

                const res = await request(app)
                    .patch(
                        "/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(updatedNetwork);

                expect(res.status).toBe(409);
                expect(res.body.code).toBe(409);
            });

            it("500 Network cannot be empty", async () =>{
                const updatedNetwork = {
                    code: "   \t \n   ",
                    name: "NAME02",
                    description: "updated network"
                };

                const res = await request(app)
                    .patch(
                        "/api/v1/networks/NET01")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .send(updatedNetwork);

                expect(res.status).toBe(500);
                expect(res.body.code).toBe(500);
            });
        });
    });
});


