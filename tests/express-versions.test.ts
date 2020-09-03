import { ExpressParser } from "../src";
import fs from 'fs'

const testFiles = {
    IFC2X3: "./Data/IFC2X3.exp",
    IFC2X3_TC1: "./Data/IFC2X3 TC1.exp",
    IFC4: "./Data/IFC4.exp",
    IFC4_ADD1: "./Data/IFC4 ADD1.exp",
    IFC4_ADD2: "./Data/IFC4 ADD2.exp",
    IFC4_ADD2_TC1: "./Data/IFC4 ADD2 TC1.exp",
    IFC4X1: "./Data/IFC4X1.exp",
    IFC4X2: "./Data/IFC4X2.exp",
    IFC4X3: "./Data/IFC4X3 RC1.exp",
}

describe('Express Parser Tests', () => {
    Object.keys(testFiles).forEach(key => {
        it(key, async () => {
            await new ExpressParser().parse(testFiles[key])
                .then(schema => {
                    const data = JSON.stringify(schema, null, 4)
                    fs.writeFileSync('results/' + key + '.json', data)
                    expect(schema).toEqual(expect.anything())
                })
        })
    })
})