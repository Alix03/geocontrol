import { UserRepository } from "@repositories/UserRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { UserType } from "@models/UserType";
import { UserDAO } from "@dao/UserDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(UserDAO).clear();
});

describe("UserRepository: SQLite in-memory", () => {
  const repo = new UserRepository();

  it("create user", async () => {
    const user = await repo.createUser("john", "pass123", UserType.Admin);
    expect(user).toMatchObject({
      username: "john",
      password: "pass123",
      type: UserType.Admin
    });

    const found = await repo.getUserByUsername("john");
    expect(found.username).toBe("john");
  });


  it("Create user: success (admin, operator, viewer)", async () => {
      // Test per ogni tipo di utente
      const adminUser = await repo.createUser("admin", "adminpass", UserType.Admin);
      expect(adminUser.type).toBe(UserType.Admin);
      
      const operatorUser = await repo.createUser("operator", "operatorpass", UserType.Operator);
      expect(operatorUser.type).toBe(UserType.Operator);
      
      const viewerUser = await repo.createUser("viewer", "viewerpass", UserType.Viewer);
      expect(viewerUser.type).toBe(UserType.Viewer);
      
      // Verifica che tutti siano stati salvati correttamente
      const allUsers = await repo.getAllUsers();
      expect(allUsers).toHaveLength(3);
    });


    it("Create User: success (caratteri speciali)", async () => {
      const specialUsername = "user@test.com";
      const specialPassword = "p@ssw0rd!#$%";
      
      const user = await repo.createUser(specialUsername, specialPassword, UserType.Admin);
      
      expect(user.username).toBe(specialUsername);
      expect(user.password).toBe(specialPassword);
      
      // Verifica che possa essere recuperato
      const foundUser = await repo.getUserByUsername(specialUsername);
      expect(foundUser.password).toBe(specialPassword);
    });

    it("ConflictError: user già esistente", async () => {
      const username = "duplicate";
      await repo.createUser(username, "first", UserType.Admin);
      
      await expect(
        repo.createUser(username, "second", UserType.Viewer)
      ).rejects.toThrow(
        new ConflictError(`User with username '${username}' already exists`)
      );
    });

    it("Create user: Non deve modificare user esistente in caso di conflitti", async () => {
      const username = "original";
      const originalUser = await repo.createUser(username, "originalpass", UserType.Admin);
      
      try {
        await repo.createUser(username, "newpass", UserType.Viewer);
      } catch (error) {
        // Ignora l'errore, vogliamo solo verificare che l'utente originale non sia cambiato
      }
      
      const unchangedUser = await repo.getUserByUsername(username);
      expect(unchangedUser).toMatchObject({
        username: "original",
        password: "originalpass",
        type: UserType.Admin
      });
    });


    
    











  it("find user by username: not found", async () => {
    await expect(repo.getUserByUsername("ghost")).rejects.toThrow(
      NotFoundError
    );
  });

  it("create user: conflict", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);
    await expect(
      repo.createUser("john", "anotherpass", UserType.Viewer)
    ).rejects.toThrow(ConflictError);
  });
});
