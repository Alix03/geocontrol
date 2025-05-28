import request from "supertest";
import { app } from "@app";
import * as authController from "@controllers/authController";
import {Token as TokenDTO} from "@models/dto/Token"
import { UserType } from "@models/UserType";
import { User as UserDTO, UserToJSON } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@controllers/authController");
jest.mock("@controllers/userController");

describe("AuthenticationRoutes integration", () =>{

    const user: UserDTO ={
                username : "fakeUser",
                password : "fakePw",
                type: UserType.Admin,
            }
            const expectedToken: TokenDTO = {
                token: "expected token"
            };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST '/auth' ", () =>{
        it("Authenticate: ok", async () =>{

            (authController.getToken as jest.Mock).mockResolvedValue(expectedToken);

            const response = await request(app)
                .post("/api/v1/auth")
                .send(UserToJSON(user));

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(expectedToken);
            
        });

        it("Authenticate: 401 Unauthorized", async () =>{

            (authController.getToken as jest.Mock).mockRejectedValue(new UnauthorizedError("Invalid token format"));

            const response = await request(app)
                .post("/api/v1/auth")
                .send(UserToJSON(user));

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject(/Unauthorized/);
            
        });

        it("Authenticate: 404 UserNotFound", async () =>{

            (authController.getToken as jest.Mock).mockRejectedValue(new NotFoundError("User not found"));

            const response = await request(app)
                .post("/api/v1/auth")
                .send(UserToJSON(user));

            expect(response.status).toBe(404);
            expect(response.body.code).toBe(404);
        });
    });
});