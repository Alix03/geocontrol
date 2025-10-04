import { authenticateUser } from "@middlewares/authMiddleware";

describe("authMiddleware", () =>{
    it("authenticateUser with no params", () =>{
        const middlewareWithParam = authenticateUser([]);
        const middlewareDefault = authenticateUser();
        
        
        expect(typeof middlewareWithParam).toBe("function");
        expect(typeof middlewareDefault).toBe("function");

        
        expect(middlewareDefault.toString()).toBe(middlewareWithParam.toString());
    })
})