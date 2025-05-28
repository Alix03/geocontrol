import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { UserType } from "@models/UserType";

describe("GET /users (e2e)", () => {
  

  let token: string;
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
    token = generateToken(TEST_USERS.admin);
  });
 

  afterAll(async () => {
    await afterAllE2e();
  });


  // Get All Users
  describe("GET /users", () => {
    it("Get All Users: success (admin user)", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);

      const usernames = res.body.map((u: any) => u.username).sort();
      const types = res.body.map((u: any) => u.type).sort();

      expect(usernames).toEqual(["admin", "operator", "viewer"]);
      expect(types).toEqual(["admin", "operator", "viewer"]);

      // Verify passwords are not returned
      res.body.forEach((user: any) => {
        expect(user.password).toBeUndefined();
      });
    });

    it("Get All Users: 403 InsufficientRightsError (operator user)", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
      expect(res.body.name).toBe("InsufficientRightsError");
    });

    it("Get All Users: 403 InsufficientRightsErro (viewer user)", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
      expect(res.body.name).toBe("InsufficientRightsError");
    });

    it("Get All Users: 401 UnauthorizedError (token non presente)", async () => {
      const res = await request(app).get("/api/v1/users");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("Get All Users: 401 UnauthorizedError (token non valido)", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("Get All Users: 401 UnauthorizedError (token formato invalido)", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", "InvalidFormat token");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });
  });



  // Create User
  describe("POST /users", () => {
    const testUser = {
      username: "testuser",
      password: "testpass123",
      type: UserType.Viewer
    };

    afterEach(async () => {
      // Cleanup: delete test user if it exists
      try {
        await request(app)
          .delete(`/api/v1/users/${testUser.username}`)
          .set("Authorization", `Bearer ${adminToken}`);
      } catch (error) {
        // Ignore error if user doesn't exist
      }
    });

    it("Create user: success (admin user)", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(testUser);

      expect(res.status).toBe(201);

      // Verify user was created by getting it
      const getRes = await request(app)
        .get(`/api/v1/users/${testUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.username).toBe(testUser.username);
      expect(getRes.body.type).toBe(testUser.type);
      expect(getRes.body.password).toBeUndefined();
    });

    it("Create user: 403 InsufficientRightsError (operator user prova a creare un user) ", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${operatorToken}`)
        .send(testUser);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
      expect(res.body.name).toBe("InsufficientRightsError");
    });

    it("Create user: 403 InsufficientRightsError (viewer user prova a creare un user)", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send(testUser);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
      expect(res.body.name).toBe("InsufficientRightsError");
    });

    it("Create user: 401 UnauthorizedError (token non presente)", async () => {
      const res = await request(app).post("/api/v1/users").send(testUser);

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("Create user: 409 ConflictError (username già esistente)", async () => {
      // First create the user
      await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(testUser);

      // Try to create again with same username
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.code).toBe(409);
      expect(res.body.name).toBe("ConflictError");
    });

    it("Create user: 400 BadRequest (username mancante)", async () => {
      const invalidUser = {
        password: "testpass123",
        type: UserType.Viewer
      };

      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it("Create user: 400 BadRequest (password mancante)", async () => {
      const invalidUser = {
        username: "testuser",
        type: UserType.Viewer
      };

      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it("Create user: 400 BadRequest (type user mancante)", async () => {
      const invalidUser = {
        username: "testuser",
        password: "testpass123"
      };

      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it("Create user: 400 BadRequest  (user type non valido)", async () => {
      const invalidUser = {
        username: "testuser",
        password: "testpass123",
        type: "invalidtype"
      };

      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it("Create user: success (crea user di tipo admin)", async () => {
      const adminUser = {
        username: "testadmin",
        password: "testpass123",
        type: UserType.Admin
      };

      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(adminUser);

      expect(res.status).toBe(201);

      // Cleanup
      await request(app)
        .delete(`/api/v1/users/${adminUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);
    });

    it("Create user: success (crea user di tipo operator)", async () => {
      const operatorUser = {
        username: "testoperator",
        password: "testpass123",
        type: UserType.Operator
      };

      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(operatorUser);

      expect(res.status).toBe(201);

      // Cleanup
      await request(app)
        .delete(`/api/v1/users/${operatorUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);
    });
  });

  // Get Specific User
  describe("GET /users/{userName}", () => {
    it("Get User: success", async () => {
      const res = await request(app)
        .get("/api/v1/users/admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("admin");
      expect(res.body.type).toBe("admin");
      expect(res.body.password).toBeUndefined();
    });

    it("Get User: success", async () => {
      const res = await request(app)
        .get("/api/v1/users/operator")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("operator");
      expect(res.body.type).toBe("operator");
      expect(res.body.password).toBeUndefined();
    });

    it("Get User: success success", async () => {
      const res = await request(app)
        .get("/api/v1/users/viewer")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("viewer");
      expect(res.body.type).toBe("viewer");
      expect(res.body.password).toBeUndefined();
    });

    it("Get User: 404 NotFoundError (user inesistente)", async () => {
      const res = await request(app)
        .get("/api/v1/users/nonexistent")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe(404);
      expect(res.body.name).toBe("NotFoundError");
    });

    it("Get User: 403 InsufficientRightsError (operator user)", async () => {
      const res = await request(app)
        .get("/api/v1/users/admin")
        .set("Authorization", `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
      expect(res.body.name).toBe("InsufficientRightsError");
    });

    it("Get User: 403 InsufficientRightsError (viewer user)", async () => {
      const res = await request(app)
        .get("/api/v1/users/admin")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
      expect(res.body.name).toBe("InsufficientRightsError");
    });

    it("Get User: 401 UnauthorizedError (token assente)", async () => {
      const res = await request(app).get("/api/v1/users/admin");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("Get User: 401 UnauthorizedError (toeken non valido)", async () => {
      const res = await request(app)
        .get("/api/v1/users/admin")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });
  });


  // delete user
  describe("DELETE /users/{userName}", () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user for deletion tests
      testUser = {
        username: `testuser_${Date.now()}`,
        password: "testpass123",
        type: UserType.Viewer
      };

      await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(testUser);
    });

    afterEach(async () => {
      // Cleanup: try to delete test user if it still exists
      try {
        await request(app)
          .delete(`/api/v1/users/${testUser.username}`)
          .set("Authorization", `Bearer ${adminToken}`);
      } catch (error) {
        // Ignore error if user doesn't exist
      }
    });

    it("Delete user: success", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});

      // Verify user was deleted
      const getRes = await request(app)
        .get(`/api/v1/users/${testUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });

    it("Delete user: 404 NotFoundError (user inesistente)", async () => {
      const res = await request(app)
        .delete("/api/v1/users/nonexistent")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe(404);
      expect(res.body.name).toBe("NotFoundError");
    });

    it("Delete user: 403 InsufficientRightsError (operator prova ad eliminare un user)", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUser.username}`)
        .set("Authorization", `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
      expect(res.body.name).toBe("InsufficientRightsError");
    });

    it("Delete user: 403 InsufficientRightsError (viewer prova ad eliminare un user)", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUser.username}`)
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
      expect(res.body.name).toBe("InsufficientRightsError");
    });

    it("Delete user: 401 UnauthorizedError (token non presente)", async () => {
      const res = await request(app).delete(`/api/v1/users/${testUser.username}`);

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("Delete user: 401 UnauthorizedError (token non valido)", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUser.username}`)
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("Delete user: success (admin elimina admin)", async () => {
      // Create another admin user first
      const adminUser = {
        username: `testadmin_${Date.now()}`,
        password: "testpass123",
        type: UserType.Admin
      };

      await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(adminUser);

      const res = await request(app)
        .delete(`/api/v1/users/${adminUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it("Delete user: success  (admin elimina operator)", async () => {
      // Create an operator user first
      const operatorUser = {
        username: `testoperator_${Date.now()}`,
        password: "testpass123",
        type: UserType.Operator
      };

      await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(operatorUser);

      const res = await request(app)
        .delete(`/api/v1/users/${operatorUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });
  });

  describe("Casi limite autenticazione ", () => {
    it("401 UnauthorizedError: authorization header vuoto", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", "");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("401 UnauthorizedError: bearer token vuoto", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", "Bearer ");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("401 UnauthorizedError: formato del token sbagliato", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", "Bearer token extra part");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });

    it("401 UnauthorizedError: Token malformato", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", "Bearer not.a.valid.jwt.token");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(401);
      expect(res.body.name).toBe("UnauthorizedError");
    });
  });

  describe("Scenari", () => {
    it("Gestine user lifecycle completo (create, get, delete)", async () => {
      const newUser = {
        username: `lifecycle_user_${Date.now()}`,
        password: "testpass123",
        type: UserType.Operator
      };

      // Create user
      const createRes = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newUser);
      expect(createRes.status).toBe(201);

      // Get user
      const getRes = await request(app)
        .get(`/api/v1/users/${newUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.username).toBe(newUser.username);
      expect(getRes.body.type).toBe(newUser.type);

      
      const listRes = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);
      const usernames = listRes.body.map((u: any) => u.username);
      expect(usernames).toContain(newUser.username);

      // Delete user
      const deleteRes = await request(app)
        .delete(`/api/v1/users/${newUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(204);

      
      const getDeletedRes = await request(app)
        .get(`/api/v1/users/${newUser.username}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(getDeletedRes.status).toBe(404);
    });

    it("Gestione di creazioni e cancellazioni multiple di user", async () => {
      const users = [
        { username: `multi_user_1_${Date.now()}`, password: "pass1", type: UserType.Viewer },
        { username: `multi_user_2_${Date.now()}`, password: "pass2", type: UserType.Operator },
        { username: `multi_user_3_${Date.now()}`, password: "pass3", type: UserType.Admin }
      ];

      // Create all users
      for (const user of users) {
        const res = await request(app)
          .post("/api/v1/users")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(user);
        expect(res.status).toBe(201);
      }

      // Verifica user esistono
      const listRes = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);
      
      const usernames = listRes.body.map((u: any) => u.username);
      users.forEach(user => {
        expect(usernames).toContain(user.username);
      });

      // Delete all users
      for (const user of users) {
        const res = await request(app)
          .delete(`/api/v1/users/${user.username}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(204);
      }
    });
  });


  it("get all users", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const usernames = res.body.map((u: any) => u.username).sort();
    const types = res.body.map((u: any) => u.type).sort();

    expect(usernames).toEqual(["admin", "operator", "viewer"]);
    expect(types).toEqual(["admin", "operator", "viewer"]);
  });



  
});
