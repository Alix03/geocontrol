import { createAppError } from "@services/errorService"
import { ErrorDTO } from "@models/dto/ErrorDTO";
import AppError from "@models/errors/AppError";

describe("ErrorService unit test", () =>{
    it("createAppError: no message", ()=>{
        const expectedError: ErrorDTO = {
            code: 500,
            message : "Internal Server Error"
        }

        const res = createAppError(Error);
    
        expect(res).toMatchObject(expectedError);
    });

    it("createAppError: appError given", () =>{
        const expectedError: ErrorDTO = {
            code: 500,
            name: "Error",
            message : "Generic AppError"
        }

        const res = createAppError(new AppError("Generic AppError", 500));
    
        expect(res).toMatchObject(expectedError);
    });

    it("createAppError: Error with status", () =>{
        const expectedError = {
            code: 500,
            name: "Internal Server Error",
            message: "InternalServerError"
        }
        const res = createAppError({
            status: 500,
            name: "Internal Server Error",
            message: "InternalServerError"
            } as Error);

        expect(res).toMatchObject(expectedError);
    })
})