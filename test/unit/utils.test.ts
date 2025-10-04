import { parseStringArrayParam } from "@utils";

describe("Utils unit test", () =>{
    it("ParseStringArrayParam", () =>{

        const res = parseStringArrayParam({});

        expect(res).toBeUndefined();
    });

    it("ParseStringArrayParam", () =>{

        const res = parseStringArrayParam(["prova", 4]);

        expect(res).toStrictEqual(["prova"]);
    });
})