const nearley = require("nearley");
const grammar = require("./generated/expressGrammar.js");
const fs = require('fs');
const readline = require('readline');


let parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
let fileName = 'testExpress'
let jsonObj = {
    schema: null,
    header: [],
    types: {},
    entities: {},
    functions: {},
    rules: {}
};
const rl = readline.createInterface({
    input: fs.createReadStream(`./Data/${fileName}.exp`),
    crlfDelay: Infinity
});

rl.on('line', (l) => {
    line = l.trim();
    //console.log(line);
    parser.feed(line);
    if (parser.results.length != 0) {
        if (parser.results[0] != null) {
            expEnt = parser.results[0];
            if (expEnt.ifcType == "type") jsonObj.types[expEnt.name] = expEnt;
            else if (expEnt.ifcType == "entity") jsonObj.entities[expEnt.name] = expEnt;
            else if (expEnt.ifcType == "function") jsonObj.functions[expEnt.name] = expEnt;
            else if (expEnt.ifcType == "rule") jsonObj.rules[expEnt.name] = expEnt;
            else if (expEnt.ifcType == "comment") jsonObj.header = expEnt.value;
            else if (expEnt.name == "schema") jsonObj.schema = expEnt.version;
            else jsonObj[expEnt.name] = expEnt;
            parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
        }
    } else if (parser.results.length > 1) {
        console.log("AMBIGUOUS LINE! Line" + line);
    } else {
    }
});
rl.on('close', () => {
    fs.writeFile(
        `out/${fileName}.json`,
        JSON.stringify(jsonObj, null, 2),
        (err) => {
            // In case of a error throw err. 
            if (err) throw err;
        })
    console.log('Finished writting')
});