import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as userController from "@controllers/userController";
import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/userController");

describe("UserRoutes integration", () => {
  const token = "Bearer faketoken";

  const validUser: UserDTO = {
    username: "testuser",
    password: "testpassword",
    type: UserType.Operator
  };

  afterEach(() => {
    jest.clearAllMocks();
  });



  describe("POST /api/v1/users", () => {
    it("Create user: success", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.createUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", token)
        .send(validUser);

      expect(response.status).toBe(201);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin
      ]);
      expect(userController.createUser).toHaveBeenCalledWith(validUser);
    });

  
    it("Create user: 401 UnauthorizedError: token non valido", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token");
      });

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", "Bearer invalid")
        .send(validUser);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Create user: 403 InsufficientRightsError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", token)
        .send(validUser);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("Create user: 400 BadRequest", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const invalidUser = { username: "testuser" }; // missing password and type

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", token)
        .send(invalidUser);

      expect(response.status).toBe(400);
    });

    it("Create user: 400 BadRequest (user type non valido)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const invalidUser = {
        username: "testuser",
        password: "password",
        type: "InvalidType"
      };

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", token)
        .send(invalidUser);

      expect(response.status).toBe(400);
    });

    

    it("Create user: 409 ConflictError (user esistente)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.createUser as jest.Mock).mockRejectedValue(
        new ConflictError("User with username 'testuser' already exists")
      );

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", token)
        .send(validUser);

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/);
    });

    it("Create user:  400 BadRequest (JSON non valido)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", token)
        .set("Content-Type", "application/json")
        .send("invalid json");

      expect(response.status).toBe(400);
    });

    it("Ceate user: success (admin type)", async () => {
      const adminUser = {
        username: "adminuser",
        password: "adminpass",
        type: UserType.Admin
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.createUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", token)
        .send(adminUser);

      expect(response.status).toBe(201);
      expect(userController.createUser).toHaveBeenCalledWith(adminUser);
    });

    it("Create user: success (viewer type)", async () => {
      const viewerUser = {
        username: "vieweruser",
        password: "viewerpass",
        type: UserType.Viewer
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.createUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", token)
        .send(viewerUser);

      expect(response.status).toBe(201);
      expect(userController.createUser).toHaveBeenCalledWith(viewerUser);
    });
  });

   describe("GET /api/v1/users", () => {
    it("Get All Users: success", async () => {
      const mockUsers: UserDTO[] = [
        { username: "admin", type: UserType.Admin },
        { username: "viewer", type: UserType.Viewer }
      ];

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin
      ]);
      expect(userController.getAllUsers).toHaveBeenCalled();
    });

    

    it("Get All Users: 401 UnauthorizedError (token non valido)", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Get All Users: 403 InsufficientRightsError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", token);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("Get All Users: 500 InternalServerError", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getAllUsers as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", token);

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch(/Database connection failed/);
    });

    it("Get All Users: success (array vuoto)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getAllUsers as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });


///////////

  it("get all users", async () => {
    const mockUsers: UserDTO[] = [
      { username: "admin", type: UserType.Admin },
      { username: "viewer", type: UserType.Viewer }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin
    ]);
    expect(userController.getAllUsers).toHaveBeenCalled();
  });

  it("get all users: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get all users: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });
});
