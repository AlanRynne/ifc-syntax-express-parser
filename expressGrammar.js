// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require('moo');

const lexer = moo.states({
    main: {
        space: { match: /\s+/, lineBreaks: true },
        ';': ';',
        ent_start: { match: ['ENTITY', 'TYPE', 'FUNCTION', 'RULE'], push: 'ifcEntity' },
        cmnt_start: { match: "(*", push: 'comment'},
        word: {match:/[a-zA-Z0-9_]+/, type: moo.keywords({
            schema: 'SCHEMA',
            schema_end: 'END_SCHEMA'
        })}
    },
    ifcEntity: {
        space: { match: /\s+/, lineBreaks: true },
        number: /\d+/,
        punctuation: ['=', ';', ',',':','[',']','(',')','?'],
        "'": {match:"'", push:'string'},
        enum: { match: ['ENUMERATION','SELECT'], push: 'enumValues' },
        ent_end: { match: ['END_ENTITY','END_TYPE','END_FUNCTION','END_RULE'], pop: true },
        unsupported: { match: ['DERIVE','WHERE','LOCAL','CASE','IF', 'RETURN'], next: 'unsupported' },
        word: {match: /\w+/, type: moo.keywords({
            list: ['LIST','ARRAY','BAG','SET'],
            primitive: ['REAL','BINARY','LOGICAL','BOOLEAN','NUMBER','INTEGER','STRING'],
            keywords: ['OF', 'IN', 'SELF', 'OR', 'INVERSE','UNIQUE']
        })} 
    },
    string: {
        "'": { match: '\'', pop: true },
        string: { match: /[^\']+/, lineBreaks: true}
    },
    comment: {
        cmnt_end: {match:"*)", pop: true},
        anything: { match: /[^*)]+/, lineBreaks: true},
    },
    unsupported: {
        ';': ';',
        str_start: { match: '\'', push: 'string' },
        ent_end: { match: ['END_ENTITY','END_TYPE','END_FUNCTION','END_RULE'], pop: true },
        space: { match: /\s+/, lineBreaks: true },
        anything: { match: /[^\s\'\;]+/, lineBreaks: true }
    },
    enumValues: {
        space: { match: /\s+/, lineBreaks: true },
        "(":"(",
        ",":",",
        ")": {match: ")", pop: true},
        word: {match: /\w+/, type: moo.keywords({
            "OF": "OF",
        })}
    }
});




function extractPair(kv, output) {
    if(kv[0]) { output[kv[0]] = kv[1]; }
}

function extractObject(d) {
    let output = {};

    extractPair(d[1], output);

    for (let i in d[3]) {
        extractPair(d[3][i][3], output);
    }

    return output;
}

function extractArray(d) {
    let output = [d[2]];

    for (let i in d[3]) {
        output.push(d[3][i][3]);
    }

    return output;
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["type"], "postprocess": id},
    {"name": "main", "symbols": ["comment"], "postprocess": id},
    {"name": "main", "symbols": ["schemaTag"], "postprocess": id},
    {"name": "main", "symbols": ["entity"], "postprocess": id},
    {"name": "main", "symbols": ["function"], "postprocess": id},
    {"name": "main", "symbols": ["rule"], "postprocess": id},
    {"name": "main", "symbols": [(lexer.has("schema_end") ? {type: "schema_end"} : schema_end), "_", {"literal":";"}], "postprocess": 
        function(data) {
            return null
        }
                },
    {"name": "schemaTag", "symbols": [(lexer.has("schema") ? {type: "schema"} : schema), "_", "word", "_", {"literal":";"}], "postprocess": 
        function(data) {
            return {
                name: "schema",
                version: data[2]
            }
        }
        },
    {"name": "comment$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("anything") ? {type: "anything"} : anything)]},
    {"name": "comment$ebnf$1", "symbols": ["comment$ebnf$1$subexpression$1"]},
    {"name": "comment$ebnf$1$subexpression$2", "symbols": ["_", (lexer.has("anything") ? {type: "anything"} : anything)]},
    {"name": "comment$ebnf$1", "symbols": ["comment$ebnf$1", "comment$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "comment", "symbols": [(lexer.has("cmnt_start") ? {type: "cmnt_start"} : cmnt_start), "comment$ebnf$1", "_", (lexer.has("cmnt_end") ? {type: "cmnt_end"} : cmnt_end)], "postprocess":  
        function(data) {
            let newData = []
            data[1].forEach(array => {
                newData.push(array[1].text)
            });
            return {
                ifcType: "comment",
                name: "comment",
                value: newData
            }
        }
        },
    {"name": "rule", "symbols": [{"literal":"RULE"}, "_", "word", "_", {"literal":"FOR"}, "_", {"literal":"("}, "_", "word", "_", {"literal":")"}, "_", {"literal":";"}, "_", "functionContent", "_", {"literal":"END_RULE"}, "_", {"literal":";"}], "postprocess": 
        function(data) {
            return {
                ifcType: "rule",
                name: data[2],
                for: data[8]
            }
        }
        },
    {"name": "function", "symbols": [{"literal":"FUNCTION"}, "_", "word", "_", {"literal":"("}, "_", "functionArgs", "_", {"literal":")"}, "_", {"literal":":"}, "_", "functionReturn", "_", {"literal":";"}, "_", "functionContent", "_", {"literal":"END_FUNCTION"}, "_", {"literal":";"}], "postprocess": 
        function(data) {
            return {
                ifcType: "function",
                name: data[2],
                arguments: data[6],
                returns: data[12]
            }
        }
                    },
    {"name": "functionArgs$ebnf$1", "symbols": []},
    {"name": "functionArgs$ebnf$1$subexpression$1", "symbols": ["_", {"literal":";"}, "_", "functionArg"]},
    {"name": "functionArgs$ebnf$1", "symbols": ["functionArgs$ebnf$1", "functionArgs$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "functionArgs", "symbols": ["functionArg", "functionArgs$ebnf$1"], "postprocess": 
        function(data) {
            obj = {}
            data[0].names.forEach(name => obj[name] = data[0].type)
            if(data[1]) data[1].forEach(d => {
                d[3].names.forEach(name => obj[name] = d[3].type)
            })
            return obj
        }
        },
    {"name": "functionArg$ebnf$1", "symbols": []},
    {"name": "functionArg$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "word"]},
    {"name": "functionArg$ebnf$1", "symbols": ["functionArg$ebnf$1", "functionArg$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "functionArg$ebnf$2$subexpression$1", "symbols": [{"literal":"GENERIC"}, "_", {"literal":":"}]},
    {"name": "functionArg$ebnf$2", "symbols": ["functionArg$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "functionArg$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "functionArg", "symbols": ["word", "functionArg$ebnf$1", "_", {"literal":":"}, "_", "functionArg$ebnf$2", "_", "typeInput"], "postprocess": 
        function(data){
            names = [data[0]]
            data[1].forEach(d => names.push(d[3]))
            return {
                names: names,
                type: {
                    type: data[7],
                    generic: data[5] ? true : false
                }
            }
        }
        },
    {"name": "functionReturn$ebnf$1$subexpression$1", "symbols": [{"literal":"GENERIC"}, "_", {"literal":":"}]},
    {"name": "functionReturn$ebnf$1", "symbols": ["functionReturn$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "functionReturn$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "functionReturn", "symbols": ["functionReturn$ebnf$1", "_", "typeInput"], "postprocess": 
        function(data){
            return {
                type: data[2],
                generic:  data[0] ? true : false
            }
        }
        },
    {"name": "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1", "symbols": ["anything"]},
    {"name": "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1", "symbols": ["string"]},
    {"name": "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["_", "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "functionContent$ebnf$1$subexpression$1$ebnf$1", "symbols": ["functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$1"]},
    {"name": "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1", "symbols": ["anything"]},
    {"name": "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1", "symbols": ["string"]},
    {"name": "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$2", "symbols": ["_", "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1"]},
    {"name": "functionContent$ebnf$1$subexpression$1$ebnf$1", "symbols": ["functionContent$ebnf$1$subexpression$1$ebnf$1", "functionContent$ebnf$1$subexpression$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "functionContent$ebnf$1$subexpression$1", "symbols": ["functionContent$ebnf$1$subexpression$1$ebnf$1", "_", {"literal":";"}]},
    {"name": "functionContent$ebnf$1", "symbols": ["functionContent$ebnf$1$subexpression$1"]},
    {"name": "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1", "symbols": ["anything"]},
    {"name": "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1", "symbols": ["string"]},
    {"name": "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$1", "symbols": ["_", "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "functionContent$ebnf$1$subexpression$2$ebnf$1", "symbols": ["functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$1"]},
    {"name": "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1", "symbols": ["anything"]},
    {"name": "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1", "symbols": ["string"]},
    {"name": "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$2", "symbols": ["_", "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1"]},
    {"name": "functionContent$ebnf$1$subexpression$2$ebnf$1", "symbols": ["functionContent$ebnf$1$subexpression$2$ebnf$1", "functionContent$ebnf$1$subexpression$2$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "functionContent$ebnf$1$subexpression$2", "symbols": ["functionContent$ebnf$1$subexpression$2$ebnf$1", "_", {"literal":";"}]},
    {"name": "functionContent$ebnf$1", "symbols": ["functionContent$ebnf$1", "functionContent$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "functionContent", "symbols": [(lexer.has("unsupported") ? {type: "unsupported"} : unsupported), "functionContent$ebnf$1"], "postprocess":  
        
        function(data) {
            return null
        }
        },
    {"name": "entity$ebnf$1", "symbols": [{"literal":"ABSTRACT"}], "postprocess": id},
    {"name": "entity$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entity$ebnf$2", "symbols": ["subtypes"], "postprocess": id},
    {"name": "entity$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entity$ebnf$3", "symbols": ["supertype"], "postprocess": id},
    {"name": "entity$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entity$ebnf$4", "symbols": ["entityProps"], "postprocess": id},
    {"name": "entity$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entity$ebnf$5", "symbols": ["entDerive"], "postprocess": id},
    {"name": "entity$ebnf$5", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entity$ebnf$6", "symbols": ["uniques"], "postprocess": id},
    {"name": "entity$ebnf$6", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entity$ebnf$7", "symbols": ["inverse"], "postprocess": id},
    {"name": "entity$ebnf$7", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entity$ebnf$8", "symbols": ["typeWhere"], "postprocess": id},
    {"name": "entity$ebnf$8", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entity", "symbols": [{"literal":"ENTITY"}, "_", "word", "_", "entity$ebnf$1", "_", "entity$ebnf$2", "_", "entity$ebnf$3", "_", {"literal":";"}, "_", "entity$ebnf$4", "_", "entity$ebnf$5", "_", "entity$ebnf$6", "_", "entity$ebnf$7", "_", "entity$ebnf$8", "_", (lexer.has("ent_end") ? {type: "ent_end"} : ent_end), "_", {"literal":";"}], "postprocess": 
        function(data) {
            props = {};
            if(data[12] == null) props = null
            else data[12].forEach(d => props[d.name] = {type: d.type, optional: d.optional})
            return {
                ifcType: "entity",
                name: data[2],
                abstract: data[4]? true:false,
                supertype: data[8],
                subtypes: data[6],
                properties: props,
                unique: data[16],
                derive: null,
                inverse: data[18],
                where: null
            }
        }
                },
    {"name": "supertype", "symbols": [{"literal":"SUBTYPE"}, "_", {"literal":"OF"}, "_", {"literal":"("}, "_", "word", "_", {"literal":")"}], "postprocess": (data) => data[6]},
    {"name": "subtypes", "symbols": [{"literal":"SUPERTYPE"}, "_", {"literal":"OF"}, "_", {"literal":"("}, "_", "supertypeInput", "_", {"literal":")"}], "postprocess": (data) => data[6]},
    {"name": "supertypeInput", "symbols": ["word"], "postprocess": id},
    {"name": "supertypeInput", "symbols": [{"literal":"ONEOF"}, "_", "parenList"], "postprocess": (data) => data[2]},
    {"name": "entityProps$ebnf$1", "symbols": []},
    {"name": "entityProps$ebnf$1", "symbols": ["entityProps$ebnf$1", "entityProp"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "entityProps", "symbols": ["entityProps$ebnf$1"], "postprocess": id},
    {"name": "entityProp$ebnf$1", "symbols": [{"literal":"OPTIONAL"}], "postprocess": id},
    {"name": "entityProp$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "entityProp", "symbols": ["_", "word", "_", {"literal":":"}, "_", "entityProp$ebnf$1", "_", "entityPropType", "_", {"literal":";"}], "postprocess": 
        function(data) {
            return {
                name: data[1],
                type: data[7],
                optional: data[5]? true : false
            }
        }
        },
    {"name": "entityPropType", "symbols": ["typeInput"], "postprocess": id},
    {"name": "uniques", "symbols": [{"literal":"UNIQUE"}, "_", "uniqueProps"], "postprocess": 
        function(data) {
            return data[2]
        }
        },
    {"name": "uniqueProps$ebnf$1", "symbols": []},
    {"name": "uniqueProps$ebnf$1$subexpression$1", "symbols": ["_", "uniqueProp"]},
    {"name": "uniqueProps$ebnf$1", "symbols": ["uniqueProps$ebnf$1", "uniqueProps$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "uniqueProps", "symbols": ["uniqueProps$ebnf$1"], "postprocess": 
        function(data) {
            obj = {}
            data[0].forEach(d => {
                obj[d[1].name] = { type: d[1].type }
                if (d[1].other) obj[d[1].name]["other"] = d[1].other
            })
            return obj
        }
        },
    {"name": "uniqueProp$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "word"]},
    {"name": "uniqueProp$ebnf$1", "symbols": ["uniqueProp$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "uniqueProp$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "uniqueProp", "symbols": ["word", "_", {"literal":":"}, "_", "word", "uniqueProp$ebnf$1", "_", {"literal":";"}], "postprocess":  
        function(data) {
            return {
                name: data[0],
                type: data[4],
                other: data[5]? data[5][3]:null
                
            }
        }
        },
    {"name": "type$ebnf$1", "symbols": ["typeWhere"], "postprocess": id},
    {"name": "type$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "type", "symbols": [{"literal":"TYPE"}, "_", "word", "_", {"literal":"="}, "_", "typeInput", "_", {"literal":";"}, "_", "type$ebnf$1", "_", {"literal":"END_TYPE"}, "_", {"literal":";"}], "postprocess": 
        function(data) {
            return {
                ifcType: "type",
                name: data[2],
                type: data[6],
            }
        }
        },
    {"name": "typeInput", "symbols": [(lexer.has("primitive") ? {type: "primitive"} : primitive)], "postprocess": (data) => data[0].text},
    {"name": "typeInput", "symbols": ["listDef"], "postprocess": id},
    {"name": "typeInput", "symbols": ["word"], "postprocess": id},
    {"name": "typeInput", "symbols": ["stringDef"], "postprocess": id},
    {"name": "typeInput", "symbols": ["enumeration"], "postprocess": id},
    {"name": "typeInput", "symbols": ["select"], "postprocess": id},
    {"name": "listDef$ebnf$1$subexpression$1$subexpression$1", "symbols": ["number"]},
    {"name": "listDef$ebnf$1$subexpression$1$subexpression$1", "symbols": ["word"]},
    {"name": "listDef$ebnf$1$subexpression$1$subexpression$2", "symbols": ["number"]},
    {"name": "listDef$ebnf$1$subexpression$1$subexpression$2", "symbols": [{"literal":"?"}], "postprocess": (data) => [null]},
    {"name": "listDef$ebnf$1$subexpression$1$subexpression$2", "symbols": ["word"]},
    {"name": "listDef$ebnf$1$subexpression$1", "symbols": [{"literal":"["}, "_", "listDef$ebnf$1$subexpression$1$subexpression$1", "_", {"literal":":"}, "_", "listDef$ebnf$1$subexpression$1$subexpression$2", "_", {"literal":"]"}]},
    {"name": "listDef$ebnf$1", "symbols": ["listDef$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "listDef$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "listDef$ebnf$2$subexpression$1", "symbols": [{"literal":"UNIQUE"}]},
    {"name": "listDef$ebnf$2$subexpression$1", "symbols": [{"literal":"GENERIC"}, "_", {"literal":":"}]},
    {"name": "listDef$ebnf$2", "symbols": ["listDef$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "listDef$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "listDef$subexpression$1", "symbols": ["listDef"]},
    {"name": "listDef$subexpression$1", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": (data)=> [data[0].text]},
    {"name": "listDef$subexpression$1", "symbols": [(lexer.has("primitive") ? {type: "primitive"} : primitive)], "postprocess": (data)=>[data[0].text]},
    {"name": "listDef", "symbols": [(lexer.has("list") ? {type: "list"} : list), "_", "listDef$ebnf$1", "_", {"literal":"OF"}, "_", "listDef$ebnf$2", "_", "listDef$subexpression$1"], "postprocess": 
        function(data) {
            return {
                type: data[0].text,
                contains: data[8][0],
                minSize: data[2] ? data[2][2][0] : null,
                maxSize: data[2]? data[2][6][0] : null,
            }
        }
        },
    {"name": "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1", "symbols": ["anything"]},
    {"name": "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1", "symbols": ["string"]},
    {"name": "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["_", "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "entDerive$ebnf$1$subexpression$1$ebnf$1", "symbols": ["entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$1"]},
    {"name": "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1", "symbols": ["anything"]},
    {"name": "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1", "symbols": ["string"]},
    {"name": "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$2", "symbols": ["_", "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1"]},
    {"name": "entDerive$ebnf$1$subexpression$1$ebnf$1", "symbols": ["entDerive$ebnf$1$subexpression$1$ebnf$1", "entDerive$ebnf$1$subexpression$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "entDerive$ebnf$1$subexpression$1", "symbols": ["entDerive$ebnf$1$subexpression$1$ebnf$1", "_", {"literal":";"}]},
    {"name": "entDerive$ebnf$1", "symbols": ["entDerive$ebnf$1$subexpression$1"]},
    {"name": "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1", "symbols": ["anything"]},
    {"name": "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1", "symbols": ["string"]},
    {"name": "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$1", "symbols": ["_", "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "entDerive$ebnf$1$subexpression$2$ebnf$1", "symbols": ["entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$1"]},
    {"name": "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1", "symbols": ["anything"]},
    {"name": "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1", "symbols": ["string"]},
    {"name": "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$2", "symbols": ["_", "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1"]},
    {"name": "entDerive$ebnf$1$subexpression$2$ebnf$1", "symbols": ["entDerive$ebnf$1$subexpression$2$ebnf$1", "entDerive$ebnf$1$subexpression$2$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "entDerive$ebnf$1$subexpression$2", "symbols": ["entDerive$ebnf$1$subexpression$2$ebnf$1", "_", {"literal":";"}]},
    {"name": "entDerive$ebnf$1", "symbols": ["entDerive$ebnf$1", "entDerive$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "entDerive", "symbols": [{"literal":"DERIVE"}, "entDerive$ebnf$1"], "postprocess":  
        function(data) {
            let newData = []
            if(data[1] == null) return null
            data[1].forEach(array => {
                newData.push(array[1][0])
            });
            return {
                type: "anything",
                value: newData
            }
        }
        },
    {"name": "inverse$ebnf$1", "symbols": []},
    {"name": "inverse$ebnf$1$subexpression$1", "symbols": ["_", "inverseProp"]},
    {"name": "inverse$ebnf$1", "symbols": ["inverse$ebnf$1", "inverse$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "inverse", "symbols": [{"literal":"INVERSE"}, "inverse$ebnf$1"], "postprocess": 
        function(data) {
            obj = {}
            data[1].forEach(d => {
                obj[d[1].name] = {
                    type: d[1].type,
                    for: d[1].for
                }
            })
            return obj
        }
        },
    {"name": "inverseProp$subexpression$1", "symbols": ["listDef"]},
    {"name": "inverseProp$subexpression$1", "symbols": ["word"]},
    {"name": "inverseProp", "symbols": ["word", "_", {"literal":":"}, "_", "inverseProp$subexpression$1", "_", {"literal":"FOR"}, "_", "word", "_", {"literal":";"}], "postprocess": 
        function(data) {
            return {
                name: data[0],
                type: data[4][0],
                for: data[8]
            }
        }
        },
    {"name": "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1", "symbols": ["anything"]},
    {"name": "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1", "symbols": ["string"]},
    {"name": "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["_", "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "entInverse$ebnf$1$subexpression$1$ebnf$1", "symbols": ["entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$1"]},
    {"name": "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1", "symbols": ["anything"]},
    {"name": "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1", "symbols": ["string"]},
    {"name": "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$2", "symbols": ["_", "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1"]},
    {"name": "entInverse$ebnf$1$subexpression$1$ebnf$1", "symbols": ["entInverse$ebnf$1$subexpression$1$ebnf$1", "entInverse$ebnf$1$subexpression$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "entInverse$ebnf$1$subexpression$1", "symbols": ["entInverse$ebnf$1$subexpression$1$ebnf$1", "_", {"literal":";"}]},
    {"name": "entInverse$ebnf$1", "symbols": ["entInverse$ebnf$1$subexpression$1"]},
    {"name": "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1", "symbols": ["anything"]},
    {"name": "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1", "symbols": ["string"]},
    {"name": "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$1", "symbols": ["_", "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "entInverse$ebnf$1$subexpression$2$ebnf$1", "symbols": ["entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$1"]},
    {"name": "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1", "symbols": ["anything"]},
    {"name": "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1", "symbols": ["string"]},
    {"name": "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$2", "symbols": ["_", "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1"]},
    {"name": "entInverse$ebnf$1$subexpression$2$ebnf$1", "symbols": ["entInverse$ebnf$1$subexpression$2$ebnf$1", "entInverse$ebnf$1$subexpression$2$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "entInverse$ebnf$1$subexpression$2", "symbols": ["entInverse$ebnf$1$subexpression$2$ebnf$1", "_", {"literal":";"}]},
    {"name": "entInverse$ebnf$1", "symbols": ["entInverse$ebnf$1", "entInverse$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "entInverse", "symbols": [{"literal":"INVERSE"}, "entInverse$ebnf$1"], "postprocess":  
        function(data) {
            let newData = []
            if(data[1] == null) return null
            data[1].forEach(array => {
                newData.push(array[1][0])
            });
            return {
                type: "anything",
                value: newData
            }
        }
        },
    {"name": "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1", "symbols": ["anything"]},
    {"name": "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1", "symbols": ["string"]},
    {"name": "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["_", "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "typeWhere$ebnf$1$subexpression$1$ebnf$1", "symbols": ["typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$1"]},
    {"name": "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1", "symbols": ["anything"]},
    {"name": "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1", "symbols": ["string"]},
    {"name": "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$2", "symbols": ["_", "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$2$subexpression$1"]},
    {"name": "typeWhere$ebnf$1$subexpression$1$ebnf$1", "symbols": ["typeWhere$ebnf$1$subexpression$1$ebnf$1", "typeWhere$ebnf$1$subexpression$1$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "typeWhere$ebnf$1$subexpression$1", "symbols": ["typeWhere$ebnf$1$subexpression$1$ebnf$1", "_", {"literal":";"}]},
    {"name": "typeWhere$ebnf$1", "symbols": ["typeWhere$ebnf$1$subexpression$1"]},
    {"name": "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1", "symbols": ["anything"]},
    {"name": "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1", "symbols": ["string"]},
    {"name": "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$1", "symbols": ["_", "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "typeWhere$ebnf$1$subexpression$2$ebnf$1", "symbols": ["typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$1"]},
    {"name": "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1", "symbols": ["anything"]},
    {"name": "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1", "symbols": ["string"]},
    {"name": "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$2", "symbols": ["_", "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$2$subexpression$1"]},
    {"name": "typeWhere$ebnf$1$subexpression$2$ebnf$1", "symbols": ["typeWhere$ebnf$1$subexpression$2$ebnf$1", "typeWhere$ebnf$1$subexpression$2$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "typeWhere$ebnf$1$subexpression$2", "symbols": ["typeWhere$ebnf$1$subexpression$2$ebnf$1", "_", {"literal":";"}]},
    {"name": "typeWhere$ebnf$1", "symbols": ["typeWhere$ebnf$1", "typeWhere$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "typeWhere", "symbols": [{"literal":"WHERE"}, "typeWhere$ebnf$1"], "postprocess":  
        function(data) {
            let newData = []
            if(data[1] == null) return null
            data[1].forEach(array => {
                newData.push(array[1][0])
            });
            return {
                type: "anything",
                value: newData
            }
        }
        },
    {"name": "enumeration", "symbols": [{"literal":"ENUMERATION"}, "_", {"literal":"OF"}, "_", "parenList"], "postprocess":  
        function(data) {
            return {
                type: "enum",
                values: data[4]
            }
        }
        },
    {"name": "select", "symbols": [{"literal":"SELECT"}, "_", "parenList"], "postprocess":  
        function(data) {
            return {
                type: "select",
                values: data[2]
            }
        }
        },
    {"name": "stringDef$ebnf$1$subexpression$1", "symbols": ["_", {"literal":"FIXED"}]},
    {"name": "stringDef$ebnf$1", "symbols": ["stringDef$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "stringDef$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "stringDef", "symbols": [{"literal":"STRING"}, "_", {"literal":"("}, "_", "number", "_", {"literal":")"}, "stringDef$ebnf$1"], "postprocess": 
        function(data) {
            return {
                type: "STRING",
                maxSize: data[4],
                fixed: data[7] ? true : false
            }
        }
        },
    {"name": "parenList$ebnf$1", "symbols": []},
    {"name": "parenList$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "word"]},
    {"name": "parenList$ebnf$1", "symbols": ["parenList$ebnf$1", "parenList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "parenList", "symbols": [{"literal":"("}, "_", "word", "parenList$ebnf$1", "_", {"literal":")"}], "postprocess": extractArray},
    {"name": "word", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": (data) => data[0].text},
    {"name": "anything", "symbols": [(lexer.has("anything") ? {type: "anything"} : anything)], "postprocess": (data) => data[0].text},
    {"name": "string", "symbols": [{"literal":"'"}, (lexer.has("string") ? {type: "string"} : string), {"literal":"'"}], "postprocess": (data) => data[1].text},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": (data) => data[0].text},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": function(d) { return null; }}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
