import { ExpressParser } from "../src";

const testFiles = {
    TestExpress: "./Data/testExpress.exp",
    // IFC2X: "./Data/IFC2X.exp",
    // IFC2X_ADD1: "./Data/IFC2X ADD1.exp",
    // IFC2X2: "./Data/IFC2X2.exp",
    // IFC2X2_ADD1: "./Data/IFC2X2 ADD1.exp",
    // IFC2X3: "./Data/IFC2X3.exp",
    // IFC2X3_TC1: "./Data/IFC2X3 TC1.exp",
    //IFC4: "./Data/IFC4.exp",
    //IFC4_ADD1: "./Data/IFC4 ADD1.exp",
    // IFC4_ADD2: "./Data/IFC4 ADD2.exp",
    // IFC4_ADD2_TC1: "./Data/IFC4 ADD2 TC1.exp",
    // IFC4X1: "./Data/IFC4X1.exp",
    // IFC4X2: "./Data/IFC4X1.exp",
    // IFC4X3: "./Data/IFC4X1.exp",
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