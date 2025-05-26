import { UserRepository } from "@repositories/UserRepository";
import { UserDAO } from "@dao/UserDAO";
import { UserType } from "@models/UserType";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove
    })
  }
}));

describe("UserRepository: mocked database", () => {
  const repo = new UserRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create user", async () => {
    mockFind.mockResolvedValue([]);

    const savedUser = new UserDAO();
    savedUser.username = "john";
    savedUser.password = "pass123";
    savedUser.type = UserType.Admin;

    mockSave.mockResolvedValue(savedUser);

    const result = await repo.createUser("john", "pass123", UserType.Admin);

    expect(result).toBeInstanceOf(UserDAO);
    expect(result.username).toBe("john");
    expect(result.password).toBe("pass123");
    expect(result.type).toBe(UserType.Admin);
    expect(mockSave).toHaveBeenCalledWith({
      username: "john",
      password: "pass123",
      type: UserType.Admin
    });
  });
  it("Create operator user ", async () => {
      mockFind.mockResolvedValue([]);

      const savedUser = new UserDAO();
      savedUser.username = "operator";
      savedUser.password = "op123";
      savedUser.type = UserType.Operator;

      mockSave.mockResolvedValue(savedUser);

      const result = await repo.createUser("operator", "op123", UserType.Operator);

      expect(result.type).toBe(UserType.Operator);
      expect(mockSave).toHaveBeenCalledWith({
        username: "operator",
        password: "op123",

        type: UserType.Operator
      });
    });
    it("Create viewer user", async () => {
      mockFind.mockResolvedValue([]);

      const savedUser = new UserDAO();
      savedUser.username = "viewer";
      savedUser.password = "view123";
      savedUser.type = UserType.Viewer;

      mockSave.mockResolvedValue(savedUser);

      const result = await repo.createUser("viewer", "view123", UserType.Viewer);

      expect(result.type).toBe(UserType.Viewer);
      expect(mockSave).toHaveBeenCalledWith({
        username: "viewer",
        password: "view123",
        type: UserType.Viewer
      });
    });


  it("create user: ConflictError", async () => {
    const existingUser = new UserDAO();
    existingUser.username = "john";
    existingUser.password = "pass123";
    existingUser.type = UserType.Admin;

    mockFind.mockResolvedValue([existingUser]);

    await expect(
      repo.createUser("john", "another", UserType.Viewer)
    ).rejects.toThrow(ConflictError);
  });

  it("create user: ConflictError con messaggio corretto", async () => {
      const existingUser = new UserDAO();
      existingUser.username = "duplicate";
      existingUser.password = "pass";
      existingUser.type = UserType.Admin;

      mockFind.mockResolvedValue([existingUser]);

      await expect(
        repo.createUser("duplicate", "newpass", UserType.Operator)
      ).rejects.toThrow("User with username 'duplicate' already exists");
    });

    it("Gestione errori del database durante il salvataggio", async () => {
      mockFind.mockResolvedValue([]);
      mockSave.mockRejectedValue(new Error("Database connection failed"));

      await expect(
        repo.createUser("test", "pass", UserType.Admin)
      ).rejects.toThrow("Database connection failed");
    });

    it("Gestione errori database durante il controllo di conflitto", async () => {
      mockFind.mockRejectedValue(new Error("Database query failed"));

      await expect(
        repo.createUser("test", "pass", UserType.Admin)
      ).rejects.toThrow("Database query failed");
    });

  it("find user by username", async () => {
    const foundUser = new UserDAO();
    foundUser.username = "john";
    foundUser.password = "pass123";
    foundUser.type = UserType.Operator;

    mockFind.mockResolvedValue([foundUser]);

    const result = await repo.getUserByUsername("john");
    expect(result).toBe(foundUser);
    expect(result.type).toBe(UserType.Operator);
  });


  it("Find admin user by username", async () => {
      const adminUser = new UserDAO();
      adminUser.username = "admin";
      adminUser.password = "admin123";
      adminUser.type = UserType.Admin;

      mockFind.mockResolvedValue([adminUser]);

      const result = await repo.getUserByUsername("admin");
      
      expect(result.type).toBe(UserType.Admin);
    });

    it("Find viewer user by username", async () => {
      const viewerUser = new UserDAO();
      viewerUser.username = "viewer";
      viewerUser.password = "view123";
      viewerUser.type = UserType.Viewer;

      mockFind.mockResolvedValue([viewerUser]);

      const result = await repo.getUserByUsername("viewer");
      
      expect(result.type).toBe(UserType.Viewer);
    });

  it("find user by username: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.getUserByUsername("ghost")).rejects.toThrow(
      NotFoundError
    );
  });


  it("find user by username: not found error con messaggio corretto", async () => {
      mockFind.mockResolvedValue([]);

      await expect(repo.getUserByUsername("nonexistent")).rejects.toThrow(
        "User with username 'nonexistent' not found"
      );
    });


    it("Gestione errori database durante find user by username", async () => {
      mockFind.mockRejectedValue(new Error("Database connection lost"));

      await expect(
        repo.getUserByUsername("test")
      ).rejects.toThrow("Database connection lost");
    });


    it("username con stringa vuota", async () => {
      mockFind.mockResolvedValue([]);

      await expect(repo.getUserByUsername("")).rejects.toThrow(NotFoundError);
      expect(mockFind).toHaveBeenCalledWith({ where: { username: "" } });
    });



    it("Gestione username con caratteri speciali", async () => {
      const specialUser = new UserDAO();
      specialUser.username = "user@domain.com";
      specialUser.password = "pass";
      specialUser.type = UserType.Viewer;

      mockFind.mockResolvedValue([specialUser]);

      const result = await repo.getUserByUsername("user@domain.com");
      
      expect(result.username).toBe("user@domain.com");
      expect(mockFind).toHaveBeenCalledWith({ where: { username: "user@domain.com" } });
    });


    it("Get All Users success", async () => {
      const users = [
        { username: "user1", password: "pass1", type: UserType.Admin },
        { username: "user2", password: "pass2", type: UserType.Operator },
        { username: "user3", password: "pass3", type: UserType.Viewer }
      ];

      mockFind.mockResolvedValue(users);

      const result = await repo.getAllUsers();

      expect(result).toEqual(users);
      expect(result).toHaveLength(3);
      expect(mockFind).toHaveBeenCalledWith();
    });

    it("Get All Users: success (array vuoto)", async () => {
      mockFind.mockResolvedValue([]);

      const result = await repo.getAllUsers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockFind).toHaveBeenCalledWith();
    });


     it("Get All Users: success (array con un solo user)", async () => {
      const singleUser = [{ username: "only", password: "pass", type: UserType.Admin }];
      mockFind.mockResolvedValue(singleUser);

      const result = await repo.getAllUsers();

      expect(result).toEqual(singleUser);
      expect(result).toHaveLength(1);
    });


    it("Get All Users: Gestione errori del database", async () => {
      mockFind.mockRejectedValue(new Error("Database timeout"));

      await expect(repo.getAllUsers()).rejects.toThrow("Database timeout");
    });



    it("Get All Users: users di diverso tipo", async () => {
      const mixedUsers = [
        { username: "admin1", password: "pass1", type: UserType.Admin },
        { username: "admin2", password: "pass2", type: UserType.Admin },
        { username: "op1", password: "pass3", type: UserType.Operator },
        { username: "viewer1", password: "pass4", type: UserType.Viewer },
        { username: "viewer2", password: "pass5", type: UserType.Viewer }
      ];

      mockFind.mockResolvedValue(mixedUsers);

      const result = await repo.getAllUsers();

      expect(result).toHaveLength(5);
      expect(result.filter(u => u.type === UserType.Admin)).toHaveLength(2);
      expect(result.filter(u => u.type === UserType.Operator)).toHaveLength(1);
      expect(result.filter(u => u.type === UserType.Viewer)).toHaveLength(2);
    });


  it("delete user", async () => {
    const user = new UserDAO();
    user.username = "john";
    user.password = "pass123";
    user.type = UserType.Admin;

    mockFind.mockResolvedValue([user]);
    mockRemove.mockResolvedValue(undefined);

    await repo.deleteUser("john");

    expect(mockRemove).toHaveBeenCalledWith(user);
  });

  it("Delete operator user", async () => {
      const operatorUser = new UserDAO();
      operatorUser.username = "operator";
      operatorUser.password = "pass";
      operatorUser.type = UserType.Operator;

      mockFind.mockResolvedValue([operatorUser]);
      mockRemove.mockResolvedValue(undefined);

      await repo.deleteUser("operator");

      expect(mockRemove).toHaveBeenCalledWith(operatorUser);
    });

    it("Delete viewer user", async () => {
      const viewerUser = new UserDAO();
      viewerUser.username = "viewer";
      viewerUser.password = "pass";
      viewerUser.type = UserType.Viewer;

      mockFind.mockResolvedValue([viewerUser]);
      mockRemove.mockResolvedValue(undefined);

      await repo.deleteUser("viewer");

      expect(mockRemove).toHaveBeenCalledWith(viewerUser);
    });

});
