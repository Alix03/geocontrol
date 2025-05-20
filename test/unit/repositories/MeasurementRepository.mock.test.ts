import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { SensorDAO } from "@models/dao/SensorDAO";

const mockFind = jest.fn();
const mockFindOne = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      findOne: mockFindOne,
      save: mockSave,
      remove: mockRemove
    })
  }
}));

describe("UserRepository: mocked database", () => {
  const repo = new MeasurementRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create measurement", async () => {
    
    const sensor = new SensorDAO();
    sensor.id = 1;
    sensor.macAddress = "mac1";
    /*
    sensor.name = "sensor1";
    sensor.description = "description";
    sensor.variable = "temperature";
    sensor.unit = "C";
    */

    const mockDate = new Date("20 May 2025 14:48 UTC");   
   
    mockFind.mockResolvedValue([]);
    mockFindOne.mockResolvedValue([sensor.macAddress]);

    const savedMeasurement = new MeasurementDAO();
    savedMeasurement.id = 1;
    savedMeasurement.createdAt = mockDate;
    savedMeasurement.value = 5;
    savedMeasurement.sensor = sensor;

    mockSave.mockResolvedValue(savedMeasurement);

    const result = await repo.createMeasurement(new Date("20 May 2025 14:48 UTC"), 5, "mac1");

    expect(result).toBeInstanceOf(MeasurementDAO);
    expect(result.id).toBe(1);
    expect(result.createdAt.toISOString()).toBe("2025-05-20T14:48:00.000Z");
    expect(result.value).toBe(5);
    expect(result.sensor.macAddress).toBe("mac1");
    expect(mockSave).toHaveBeenCalledWith({
      createdAt: mockDate, 
      value: 5, 
      sensor: sensor,
    });
  });

  
  it("create measurement without existing sensor: sensor not found", async () => {   
    mockFindOne.mockResolvedValue([]);

    await expect(
      repo.createMeasurement(new Date("20 May 2025 14:48 UTC"), 5, "mac1")
    ).rejects.toThrow(NotFoundError);
  });

  it("create measurement without right gateway: sensor not found", async () => {   
    mockFindOne.mockResolvedValue([]);

    await expect(
      repo.createMeasurement(new Date("20 May 2025 14:48 UTC"), 5, "mac1")  //da aggiungere gateway e network come parametri
    ).rejects.toThrow(NotFoundError);
  });

  it("create measurement without right network: sensor not found", async () => {   
    mockFindOne.mockResolvedValue([]);

    await expect(
      repo.createMeasurement(new Date("20 May 2025 14:48 UTC"), 5, "mac1")  //da aggiungere gateway e network come parametri
    ).rejects.toThrow(NotFoundError);
  });
/*
  it("find measurement by network", async () => {
    const foundUser = new UserDAO();
    foundUser.username = "john";
    foundUser.password = "pass123";
    foundUser.type = UserType.Operator;

    mockFind.mockResolvedValue([foundUser]);

    const result = await repo.getUserByUsername("john");
    expect(result).toBe(foundUser);
    expect(result.type).toBe(UserType.Operator);
  });

  it("find user by username: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.getUserByUsername("ghost")).rejects.toThrow(
      NotFoundError
    );
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
  */
});

