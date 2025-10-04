import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as userController from "@controllers/userController";
import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

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


  describe("GET /api/v1/users/:username", () => {
    it("Get User By Username: success", async () => {
      const mockUser: UserDTO = { username: "testuser", type: UserType.Viewer };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/v1/users/testuser")
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin
      ]);
      expect(userController.getUser).toHaveBeenCalledWith("testuser");
    });

    it("Get User By Username: 401 UnauthorizedError (token non valido)", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token");
      });

      const response = await request(app)
        .get("/api/v1/users/testuser")
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Get User By Username: 403 InsufficientRightsError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .get("/api/v1/users/testuser")
        .set("Authorization", token);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("Get User By Username: 404 NotFoundError", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getUser as jest.Mock).mockRejectedValue(
        new NotFoundError("User with username 'nonexistent' not found")
      );

      const response = await request(app)
        .get("/api/v1/users/nonexistent")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("Get User By Username: username con caratteri speciali", async () => {
      const mockUser: UserDTO = { username: "test@user.com", type: UserType.Viewer };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/v1/users/test@user.com")
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(userController.getUser).toHaveBeenCalledWith("test@user.com");
    });
  });


  describe("DELETE /api/v1/users/:username", () => {
    it("Delete User: success", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.deleteUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete("/api/v1/users/testuser")
        .set("Authorization", token);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin
      ]);
      expect(userController.deleteUser).toHaveBeenCalledWith("testuser");
    });

  

    it("Delete User: 401 UnauthorizedError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: Invalid token");
      });

      const response = await request(app)
        .delete("/api/v1/users/testuser")
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });

    it("Delete User: 403 InsufficientRightsError", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .delete("/api/v1/users/testuser")
        .set("Authorization", token);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("Delete User: 404 NotFoundError", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.deleteUser as jest.Mock).mockRejectedValue(
        new NotFoundError("User with username 'nonexistent' not found")
      );

      const response = await request(app)
        .delete("/api/v1/users/nonexistent")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("Delete User: username con caratteri speciali", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.deleteUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete("/api/v1/users/test@user.com")
        .set("Authorization", token);

      expect(response.status).toBe(204);
      expect(userController.deleteUser).toHaveBeenCalledWith("test@user.com");
    });

    
  });

  describe("Casi limite e gestione degli errori", () => {
    

    it("Username molto lunghi", async () => {
      const longUsername = "a".repeat(1000);
      const mockUser: UserDTO = { username: longUsername, type: UserType.Viewer };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/v1/users/${longUsername}`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(userController.getUser).toHaveBeenCalledWith(longUsername);
    });

    it("URL encoded characters in username", async () => {
      const encodedUsername = "test%40example.com";
      const decodedUsername = "test@example.com";
      const mockUser: UserDTO = { username: decodedUsername, type: UserType.Viewer };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/v1/users/${encodedUsername}`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(userController.getUser).toHaveBeenCalledWith(decodedUsername);
    });

    
  });

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
