import nearley from "nearley";
import grammar from "./grammar/expressGrammar";
import fs from 'fs';
import readline from 'readline';

export interface IIfcSchema {
    schema: string
    header: string[]
    types: any
    entities: any
    functions: any
    rules: any
}

export class ExpressParser {
    private parser: nearley.Parser

    constructor() {
        this.parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    }

    parse(filePath: string): Promise<IIfcSchema> {
        return new Promise((resolve, reject) => {
            let expressSchema: IIfcSchema = {
                schema: null,
                header: [],
                types: {},
                entities: {},
                functions: {},
                rules: {}
            };

            const stream = fs.createReadStream(filePath)
            stream.on('error', (err) =>
                reject(err)
            )

            const rl = readline.createInterface({
                input: stream,
                crlfDelay: Infinity
            });

            rl.on('line', (l) => {
                var line = l.trim();
                try {
                    this.parser.feed(line);
                } catch (err) {
                    reject(err)
                }
                if (this.parser.results.length != 0) {
                    if (this.parser.results[0] != null) {
                        var expEnt = this.parser.results[0];
                        if (expEnt.ifcType == "type") expressSchema.types[expEnt.name] = expEnt;
                        else if (expEnt.ifcType == "entity") expressSchema.entities[expEnt.name] = expEnt;
                        else if (expEnt.ifcType == "function") expressSchema.functions[expEnt.name] = expEnt;
                        else if (expEnt.ifcType == "rule") expressSchema.rules[expEnt.name] = expEnt;
                        else if (expEnt.ifcType == "comment") expressSchema.header = expEnt.value;
                        else if (expEnt.name == "schema") expressSchema.schema = expEnt.version;
                        else expressSchema[expEnt.name] = expEnt;
                        this.parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
                    }
                } else if (this.parser.results.length > 1) {
                    reject("AMBIGUOUS LINE! Line" + line)
                }
            });

            rl.on('close', () => {
                resolve(expressSchema)
            });
        })
    }
}
