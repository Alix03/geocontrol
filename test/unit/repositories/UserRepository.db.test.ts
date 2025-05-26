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

  describe("Create user", () => {
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

  });


    describe("Get All Users", () => {
    it("Get All Users: success (array vuoto)", async () => {
      const users = await repo.getAllUsers();
      expect(users).toEqual([]);
      expect(users).toHaveLength(0);
    });

    it("Get All Users: success", async () => {
      // Crea diversi utenti con tipi diversi
      await repo.createUser("admin1", "adminpass", UserType.Admin);
      await repo.createUser("operator1", "operatorpass", UserType.Operator);
      await repo.createUser("viewer1", "viewerpass", UserType.Viewer);

      const users = await repo.getAllUsers();
      
      expect(users).toHaveLength(3);
      expect(users.map(u => u.username)).toContain("admin1");
      expect(users.map(u => u.username)).toContain("operator1");
      expect(users.map(u => u.username)).toContain("viewer1");
      
      // Verifica che tutti i tipi di utente siano presenti
      const userTypes = users.map(u => u.type);
      expect(userTypes).toContain(UserType.Admin);
      expect(userTypes).toContain(UserType.Operator);
      expect(userTypes).toContain(UserType.Viewer);
    });

    it("Get All Users: ritona un array con un solo user se ne esiste solo 1", async () => {
      await repo.createUser("singleuser", "password123", UserType.Admin);
      
      const users = await repo.getAllUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe("singleuser");
      expect(users[0].type).toBe(UserType.Admin);
    });

  });


   describe("Get User By Username", () => {
    it("Get User By Username: success", async () => {
      const createdUser = await repo.createUser("testuser", "testpass", UserType.Operator);
      
      const foundUser = await repo.getUserByUsername("testuser");
      
      expect(foundUser).toMatchObject({
        username: "testuser",
        password: "testpass",
        type: UserType.Operator
      });
      expect(foundUser.username).toBe(createdUser.username);
      expect(foundUser.password).toBe(createdUser.password);
      expect(foundUser.type).toBe(createdUser.type);
    });

    it("Get User By Username: success (caseSensitive)", async () => {
      await repo.createUser("CaseSensitive", "pass123", UserType.Admin);
      
      // Username con case diverso dovrebbe fallire
      await expect(repo.getUserByUsername("casesensitive")).rejects.toThrow(NotFoundError);
      await expect(repo.getUserByUsername("CASESENSITIVE")).rejects.toThrow(NotFoundError);
      
      // Case corretto dovrebbe funzionare
      const user = await repo.getUserByUsername("CaseSensitive");
      expect(user.username).toBe("CaseSensitive");
    });

    it("Get User By Username: NotFoundError", async () => {
      const username = "nonexistentuser";
      
      await expect(repo.getUserByUsername(username)).rejects.toThrow(
        new NotFoundError(`User with username '${username}' not found`)
      );
    });
  });


  describe("Delete User", () => {
    it("Delete User: success", async () => {
      // Crea un utente
      await repo.createUser("todelete", "password", UserType.Operator);
      
      // Verifica che esista
      const userBefore = await repo.getUserByUsername("todelete");
      expect(userBefore.username).toBe("todelete");
      
      // Elimina l'utente
      await repo.deleteUser("todelete");
      
      // Verifica che non esista più
      await expect(repo.getUserByUsername("todelete")).rejects.toThrow(NotFoundError);
    });

    it("Delete User: NotFoundError (utente inesistente)", async () => {
      const username = "nonexistent";
      
      await expect(repo.deleteUser(username)).rejects.toThrow(
        new NotFoundError(`User with username '${username}' not found`)
      );
    });

    it("Delete user: success (se elimino un user gli altri rimangono invariati)", async () => {
      // Crea più utenti
      await repo.createUser("user1", "pass1", UserType.Admin);
      await repo.createUser("user2", "pass2", UserType.Operator);
      await repo.createUser("user3", "pass3", UserType.Viewer);
      
      // Elimina uno
      await repo.deleteUser("user2");
      
      // Verifica che gli altri esistano ancora
      const user1 = await repo.getUserByUsername("user1");
      const user3 = await repo.getUserByUsername("user3");
      
      expect(user1.username).toBe("user1");
      expect(user3.username).toBe("user3");
      
      // Verifica che user2 non esista
      await expect(repo.getUserByUsername("user2")).rejects.toThrow(NotFoundError);
      
      // Verifica il conteggio totale
      const allUsers = await repo.getAllUsers();
      expect(allUsers).toHaveLength(2);
    });

    it("Delete User: username con caratteri speciali", async () => {
      const specialUsername = "user@special.com";
      
      await repo.createUser(specialUsername, "password", UserType.Admin);
      await repo.deleteUser(specialUsername);
      
      await expect(repo.getUserByUsername(specialUsername)).rejects.toThrow(NotFoundError);
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
