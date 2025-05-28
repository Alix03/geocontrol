import { getToken } from "@controllers/authController";
import { UserType } from "@models/UserType";
import { UserRepository } from "@repositories/UserRepository";
import {Token as TokenDTO} from "@models/dto/Token"
import { UnauthorizedError } from "@models/errors/UnauthorizedError";


jest.mock("@repositories/UserRepository");

describe("AuthController integration", () =>{
    let mockRepo : jest.Mocked<UserRepository>;

    mockRepo = {
        getUserByUsername : jest.fn(),
    } as any;

    (UserRepository as jest.Mock).mockImplementation(() => mockRepo);

    describe("getToken", () =>{
        it("Create token: ok", async () =>{
            const userDTO = {
                username: "username1",
                password: "password",
                type: UserType.Admin,
            }

            mockRepo.getUserByUsername.mockResolvedValue(userDTO);

            const res = await getToken(userDTO);

            expect(res).toHaveProperty("token");
        });

        it("Create token: invalid password", async () =>{
            const wrongUserDTO = {
                username: "username1",
                password: "wrong_password",
                type: UserType.Admin,
            }

            const rightUserDTO = {
                username: "username1",
                password: "right_password",
                type: UserType.Admin,
            }

            mockRepo.getUserByUsername.mockResolvedValue(rightUserDTO);

            await expect(
                getToken(wrongUserDTO)
            ).rejects.toThrow(new UnauthorizedError("Invalid password"));
        })
    })
});