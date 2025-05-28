import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UserDAO } from "@models/dao/UserDAO";
import { UserRepository } from "@repositories/UserRepository";
import * as authService from "@services/authService";
import { NotFoundError } from "@models/errors/NotFoundError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";



jest.mock("@repositories/UserRepository");


describe("AuthService: mocked UserRepository", () => {
    let mockRepo : jest.Mocked<UserRepository>;

    mockRepo = {
        getUserByUsername : jest.fn(),
    } as any;

    (UserRepository as jest.Mock).mockImplementation(() => mockRepo);
    const user: UserDAO = {
        username: "username",
        password: "password",
        type: UserType.Admin,
    };

    const token = authService.generateToken(user);
    const authHeader = `Bearer ${token}`;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Process Token: ok", async () =>{

        mockRepo.getUserByUsername.mockResolvedValue(user);

        const result = await authService.processToken(authHeader, [UserType.Admin]);

        expect(result).toBeUndefined();
    });

    it("Process Token: ok, no allowed roles", async () =>{

        mockRepo.getUserByUsername.mockResolvedValue(user);

        const result = await authService.processToken(authHeader);

        expect(result).toBeUndefined();
    });

    it("Process Token: 404 User not found", async () =>{
        mockRepo.getUserByUsername.mockRejectedValue(new NotFoundError("Unauthorized: user username not found"));

        await expect(
            authService.processToken(authHeader, [UserType.Admin])
        ).rejects.toThrow(new NotFoundError("Unauthorized: user username not found"));
    });

    it("Process Token: 403 Insufficient Rights", async () =>{
        mockRepo.getUserByUsername.mockResolvedValue(user);

        await expect(
            authService.processToken(authHeader, [UserType.Operator])
        ).rejects.toThrow(new InsufficientRightsError("Forbidden: Insufficient rights"));
    });

    it("Process Token: 401 Invalid token format", async () =>{
        mockRepo.getUserByUsername.mockResolvedValue(user);

        await expect(
            authService.processToken("Bearer fake", [UserType.Admin])
        ).rejects.toThrow(new UnauthorizedError("Unauthorized: jwt malformed"));
    });

    it("Process Token: 401 No token provided", async () =>{
        mockRepo.getUserByUsername.mockResolvedValue(user);

        await expect(
            authService.processToken("", [UserType.Admin])
        ).rejects.toThrow(new UnauthorizedError("Unauthorized: No token provided"));
    });

    it("Process Token: 401 Invalid token format", async () =>{
        mockRepo.getUserByUsername.mockResolvedValue(user);

        await expect(
            authService.processToken("fakeBearer", [UserType.Admin])
        ).rejects.toThrow(new UnauthorizedError("Unauthorized: Invalid token format"));
    });

    it("Process Token: 401 Corrupted token", async () =>{
        mockRepo.getUserByUsername.mockResolvedValue(user);

        await expect(
            authService.processToken(authHeader.replace('c','d'), [UserType.Operator])
        ).rejects.toThrow(new InsufficientRightsError("Unauthorized: invalid token"));
    });

});