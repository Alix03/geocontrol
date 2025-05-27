import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

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
