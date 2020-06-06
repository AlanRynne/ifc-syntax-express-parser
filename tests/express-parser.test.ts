import { ExpressParser } from "../src";

const testFiles = {
    TestExpress: "./Data/testExpress.exp",
    //Ifc2x3: "./Data/ifc2x3.exp",
    Ifc4x2: "./Data/ifc4x2.exp",
    Ifc4x3: "./Data/ifc4x3.exp"
}

describe('Express Parser Tests', () => {
    Object.keys(testFiles).forEach(key => {
        it(key, async () => {
            await new ExpressParser().parse(testFiles[key])
                .then(schema => {
                    expect(schema).toEqual(expect.anything())
                })
        })
    })
})