@{%
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

%}
@preprocessor typescript
@lexer lexer

main -> type {% id %} 
        | comment {% id %}
        | schemaTag {% id %}
        | entity {% id %}
        | function {% id %}
        | rule {% id %}
        | %schema_end _ ";" {%
            function(data) {
                return null
            }
        %}

schemaTag -> %schema _ word _ ";" {%
    function(data) {
        return {
            name: "schema",
            version: data[2]
        }
    }
%}

comment -> %cmnt_start (_ %anything):+ _ %cmnt_end {% 
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
%}

rule -> "RULE" _ word _ "FOR" _ "(" _ word _ ")" _ ";" _ functionContent _ "END_RULE" _ ";" {%
    function(data) {
        return {
            ifcType: "rule",
            name: data[2],
            for: data[8]
        }
    }
%}
function -> "FUNCTION" 
            _ word 
            _ "(" _ functionArgs _ ")" 
            _ ":" 
            _ functionReturn _ ";"
            _ functionContent
            _ "END_FUNCTION" _ ";"
            {%
                function(data) {
                    return {
                        ifcType: "function",
                        name: data[2],
                        arguments: data[6],
                        returns: data[12]
                    }
                }
            %}

functionArgs -> functionArg (_ ";" _ functionArg):* {%
    function(data) {
        var obj = {}
        data[0].names.forEach(name => obj[name] = data[0].type)
        if(data[1]) data[1].forEach(d => {
            d[3].names.forEach(name => obj[name] = d[3].type)
        })
        return obj
    }
%}
functionArg -> word (_ "," _ word):* _ ":" _ ("GENERIC" _ ":"):? _ typeInput {%
    function(data){
        var names = [data[0]]
        data[1].forEach(d => names.push(d[3]))
        return {
            names: names,
            type: {
                type: data[7],
                generic: data[5] ? true : false
            }
        }
    }
%}
functionReturn -> ("GENERIC" _ ":"):? _ typeInput{%
    function(data){
        return {
            type: data[2],
            generic:  data[0] ? true : false
        }
    }
%}
functionContent -> %unsupported (( _ (anything|string)):+ _ ";"):+ {% 

    function(data) {
        return null
    }
%}

entity -> "ENTITY" 
        _ word 
        _ "ABSTRACT":? 
        _ subtypes:? _ supertype:? _ ";" 
        _ entityProps:? 
        _ entDerive:? 
        _ uniques:? 
        _ inverse:? 
        _ typeWhere:? 
        _ %ent_end _ ";" 
        {%
            function(data) {
                var props = {};
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
        %}

supertype -> "SUBTYPE" _ "OF" _ "(" _ word _ ")" {% (data) => data[6] %}
subtypes -> "SUPERTYPE" _ "OF" _ "(" _ supertypeInput _ ")" {% (data) => data[6]%}
supertypeInput -> word {% id %}
                | "ONEOF" _ parenList {% (data) => data[2] %}

entityProps -> entityProp:* {% id %}
entityProp -> _ word _ ":" _ "OPTIONAL":? _ entityPropType _ ";" {%
    function(data) {
        return {
            name: data[1],
            type: data[7],
            optional: data[5]? true : false
        }
    }
%}
entityPropType -> typeInput {% id %}

uniques -> "UNIQUE" _ uniqueProps {%
    function(data) {
        return data[2]
    }
%}
uniqueProps -> (_ uniqueProp):* {%
    function(data) {
        var  obj = {}
        data[0].forEach(d => {
            obj[d[1].name] = { type: d[1].type }
            if (d[1].other) obj[d[1].name]["other"] = d[1].other
        })
        return obj
    }
%}
uniqueProp -> word _ ":" _ word (_ "," _ word):? _ ";" {% 
    function(data) {
        return {
            name: data[0],
            type: data[4],
            other: data[5]? data[5][3]:null
            
        }
    }
%}

type -> "TYPE" _ word _ "=" _ typeInput _ ";" _ typeWhere:? _ "END_TYPE" _ ";" {%
    function(data) {
        return {
            ifcType: "type",
            name: data[2],
            type: data[6],
        }
    }
%}

typeInput -> %primitive {% (data) => data[0].text %}
            | listDef {% id %}
            | word {% id %}
            | stringDef {% id %}
            | enumeration {% id %}
            | select {% id %}


listDef -> %list 
        _ ("[" _ (number | word) _ ":" _ (number | "?" {%(data) => [null] %} | word) _ "]"):? 
        _ "OF" 
        _ ("UNIQUE" | "GENERIC" _ ":"):? 
        _ ( listDef | %word {%(data)=> [data[0].text] %} | %primitive {%(data)=>[data[0].text] %}) {%
    function(data) {
        return {
            type: data[0].text,
            contains: data[8][0],
            minSize: data[2] ? data[2][2][0] : null,
            maxSize: data[2]? data[2][6][0] : null,
        }
    }
%}

entDerive -> "DERIVE" (( _ (anything|string)):+ _ ";"):+ {% 
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
%}

inverse -> "INVERSE" (_ inverseProp):* {%
    function(data) {
        let obj = {}
        data[1].forEach(d => {
            obj[d[1].name] = {
                type: d[1].type,
                for: d[1].for
            }
        })
        return obj
    }
%}

inverseProp -> word _ ":" _ (listDef | word) _ "FOR" _ word _ ";"{%
    function(data) {
        return {
            name: data[0],
            type: data[4][0],
            for: data[8]
        }
    }
%}

entInverse -> "INVERSE" (( _ (anything|string)):+ _ ";"):+ {% 
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
%}

typeWhere -> "WHERE" (( _ (anything|string)):+ _ ";"):+ {% 
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
%}

enumeration -> "ENUMERATION" _ "OF" _ parenList {% 
    function(data) {
        return {
            type: "enum",
            values: data[4]
        }
    }
%}

select -> "SELECT" _ parenList {% 
    function(data) {
        return {
            type: "select",
            values: data[2]
        }
    }
%}

stringDef -> "STRING" _ "(" _ number _ ")" (_ "FIXED"):? {%
    function(data) {
        return {
            type: "STRING",
            maxSize: data[4],
            fixed: data[7] ? true : false
        }
    }
%}

parenList -> "(" _ word (_ "," _ word):* _ ")" {% extractArray %}

word -> %word {% (data) => data[0].text %}
anything -> %anything {% (data) => data[0].text %}
string -> "'" %string "'" {% (data) => data[1].text %}
number -> %number {% (data) => data[0].text %}
_ -> null | %space {% function(d) { return null; } %}


@{%

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

%}