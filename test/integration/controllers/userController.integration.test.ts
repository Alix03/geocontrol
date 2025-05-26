import * as userController from "@controllers/userController";
import { UserDAO } from "@dao/UserDAO";
import { ConflictError } from "@models/errors/ConflictError";
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
      // Arrange
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

      // Act
      await userController.createUser(viewerDTO);

      // Assert
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        "newviewer",
        "viewerpass",
        UserType.Viewer
      );
    });

    

    

    it("Create user: ConflictError (user già esistente)", async () => {
      // Arrange
      const userDTO = {
        username: "existinguser",
        password: "password",
        type: UserType.Operator
      };

      const error = new ConflictError("User with username 'existinguser' already exists");
      mockUserRepository.createUser.mockRejectedValue(error);

      // Act & Assert
      await expect(userController.createUser(userDTO)).rejects.toThrow(ConflictError);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        "existinguser",
        "password",
        UserType.Operator
      );
    });

    it("Create user: Gestione di errori del database durante la creazione", async () => {
      // Arrange
      const userDTO = {
        username: "testuser",
        password: "testpass",
        type: UserType.Operator
      };

      const error = new Error("Database error");
      mockUserRepository.createUser.mockRejectedValue(error);

      // Act & Assert
      await expect(userController.createUser(userDTO)).rejects.toThrow("Database error");
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
