import * as userController from "@controllers/userController";
import { UserDAO } from "@dao/UserDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { UserType } from "@models/UserType";
import { UserRepository } from "@repositories/UserRepository";

jest.mock("@repositories/UserRepository");

describe("UserController integration", () => {


  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = {
      getAllUsers: jest.fn(),
      getUserByUsername: jest.fn(),
      createUser: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
  });

  describe("Create user", () => {
    it("Create user: success", async () => {
      
      const userDTO = {
        username: "newuser",
        password: "newpass",
        type: UserType.Operator
      };

      mockUserRepository.createUser.mockResolvedValue({
        username: "newuser",
        password: "newpass",
        type: UserType.Operator
      });

    
      await userController.createUser(userDTO);

      
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        "newuser",
        "newpass",
        UserType.Operator
      );
      expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
    });

    it("Create user: success (admin user)", async () => {
      
      const adminDTO = {
        username: "newadmin",
        password: "adminpass",
        type: UserType.Admin
      };

      mockUserRepository.createUser.mockResolvedValue({
        username: "newadmin",
        password: "adminpass",
        type: UserType.Admin
      });

      
      await userController.createUser(adminDTO);

      
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        "newadmin",
        "adminpass",
        UserType.Admin
      );
    });

    it("Create user: success (viewer user)", async () => {
      
      const viewerDTO = {
        username: "newviewer",
        password: "viewerpass",
        type: UserType.Viewer
      };

      mockUserRepository.createUser.mockResolvedValue({
        username: "newviewer",
        password: "viewerpass",
        type: UserType.Viewer
      });
      
      await userController.createUser(viewerDTO);

      
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        "newviewer",
        "viewerpass",
        UserType.Viewer
      );
    });

    

    

    it("Create user: ConflictError (user già esistente)", async () => {
      
      const userDTO = {
        username: "existinguser",
        password: "password",
        type: UserType.Operator
      };

      const error = new ConflictError("User with username 'existinguser' already exists");
      mockUserRepository.createUser.mockRejectedValue(error);

      
      await expect(userController.createUser(userDTO)).rejects.toThrow(ConflictError);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        "existinguser",
        "password",
        UserType.Operator
      );
    });

    it("Create user: Gestione di errori del database durante la creazione", async () => {
      
      const userDTO = {
        username: "testuser",
        password: "testpass",
        type: UserType.Operator
      };

      const error = new Error("Database error");
      mockUserRepository.createUser.mockRejectedValue(error);

      
      await expect(userController.createUser(userDTO)).rejects.toThrow("Database error");
    });
  });

  describe("Get User", () => {
    it("Get User: success (user DTO senza password)", async () => {
      
      const fakeUserDAO: UserDAO = {
        username: "testuser",
        password: "secret",
        type: UserType.Operator
      };

      const expectedDTO = {
        username: fakeUserDAO.username,
        type: fakeUserDAO.type
      };

      mockUserRepository.getUserByUsername.mockResolvedValue(fakeUserDAO);

    
      const result = await userController.getUser("testuser");

      
      expect(result).toEqual(expectedDTO);
      expect(result).not.toHaveProperty("password");
      expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith("testuser");
      expect(mockUserRepository.getUserByUsername).toHaveBeenCalledTimes(1);
    });

    it("Get User: success (admin user)", async () => {
      
      const fakeAdminDAO: UserDAO = {
        username: "admin",
        password: "adminpass",
        type: UserType.Admin
      };

      mockUserRepository.getUserByUsername.mockResolvedValue(fakeAdminDAO);
      
      const result = await userController.getUser("admin");

      
      expect(result).toEqual({
        username: "admin",
        type: UserType.Admin
      });
      expect(result).not.toHaveProperty("password");
    });

    it("Get User: success (viewer user)", async () => {
      
      const fakeViewerDAO: UserDAO = {
        username: "viewer",
        password: "viewerpass",
        type: UserType.Viewer
      };

      mockUserRepository.getUserByUsername.mockResolvedValue(fakeViewerDAO);

    
      const result = await userController.getUser("viewer");

      
      expect(result).toEqual({
        username: "viewer",
        type: UserType.Viewer
      });
    });

    it("Get User: NotFoundError (user inesistente)", async () => {
      
      const error = new NotFoundError("User with username 'nonexistent' not found");
      mockUserRepository.getUserByUsername.mockRejectedValue(error);

      
      await expect(userController.getUser("nonexistent")).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith("nonexistent");
    });
  });


  describe("Get All User", () => {
    it("Get All User: success(array di user DTOs senza password)", async () => {
      
      const fakeUsersDAO: UserDAO[] = [
        {
          username: "admin",
          password: "adminpass",
          type: UserType.Admin
        },
        {
          username: "operator",
          password: "operatorpass", 
          type: UserType.Operator
        },
        {
          username: "viewer",
          password: "viewerpass",
          type: UserType.Viewer
        }
      ];

      const expectedDTOs = [
        { username: "admin", type: UserType.Admin },
        { username: "operator", type: UserType.Operator },
        { username: "viewer", type: UserType.Viewer }
      ];

      mockUserRepository.getAllUsers.mockResolvedValue(fakeUsersDAO);

      
      const result = await userController.getAllUsers();

      
      expect(result).toEqual(expectedDTOs);
      expect(result).toHaveLength(3);
      result.forEach(user => {
        expect(user).not.toHaveProperty("password");
      });
      expect(mockUserRepository.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it("Get All User: success (array vuoto se non ci sono users)", async () => {
      
      mockUserRepository.getAllUsers.mockResolvedValue([]);

      
      const result = await userController.getAllUsers();

      
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockUserRepository.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it("Gestione di errori nella repository", async () => {
    
      const error = new Error("Database connection failed");
      mockUserRepository.getAllUsers.mockRejectedValue(error);

      
      await expect(userController.getAllUsers()).rejects.toThrow("Database connection failed");
    });
  });

  describe("Delete User", () => {
    it("Delete User: success", async () => {
      
      mockUserRepository.deleteUser.mockResolvedValue();

    await userController.deleteUser("testuser");

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("testuser");
      expect(mockUserRepository.deleteUser).toHaveBeenCalledTimes(1);
    });

    it("Delete User: success (delete admin user)", async () => {
      
      mockUserRepository.deleteUser.mockResolvedValue();

      // Act
      await userController.deleteUser("admin");

      // Assert
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("admin");
    });

    it("Delete User: success (delete viewer user)", async () => {
      
      mockUserRepository.deleteUser.mockResolvedValue();

      
      await userController.deleteUser("viewer");

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("viewer");
    });

    it("Delete User: NotFoundError (user inesistente) ", async () => {
      
      const error = new NotFoundError("User with username 'nonexistent' not found");
      mockUserRepository.deleteUser.mockRejectedValue(error);

      
      await expect(userController.deleteUser("nonexistent")).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("nonexistent");
    });

    it("Delete User: Gestione errori del database durante l'eliminazione", async () => {
      
      const error = new Error("Database error during deletion");
      mockUserRepository.deleteUser.mockRejectedValue(error);

      
      await expect(userController.deleteUser("testuser")).rejects.toThrow("Database error during deletion");
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("testuser");
    });

    
  });



  it("get User: mapperService integration", async () => {
    const fakeUserDAO: UserDAO = {
      username: "testuser",
      password: "secret",
      type: UserType.Operator
    };

    const expectedDTO = {
      username: fakeUserDAO.username,
      type: fakeUserDAO.type
    };

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(fakeUserDAO)
    }));

    const result = await userController.getUser("testuser");

    expect(result).toEqual({
      username: expectedDTO.username,
      type: expectedDTO.type
    });
    expect(result).not.toHaveProperty("password");
  });
});
