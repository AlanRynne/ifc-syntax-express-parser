const fs = require('fs');

const readline = require('readline');
console.log("Convering to C#....");
const notImpl = "throw new NotImplementedException()";
var projectPath = '';
var IfcSchema = null;
ReadJSON('testExpress.json', ConvertSchema);

var primitivesDict = {
    REAL: "eDouble",
    NUMBER: "eDouble",
    INTEGER: "eInteger",
    STRING: "eString",
    BOOLEAN: "eBoolean",
    BINARY: "eBinary",
    LIST: "eList",
    BAG: "eBag",
    SET: "eSet",
    ARRAY: "eArray",
    LOGICAL: "eLogical"
};

function ConvertSchema(schema) {
    IfcSchema = schema;
    projectPath = schema.schema + '.Net/';
    fs.mkdir(projectPath + "types/", () => console.log("Error creating types folder"));
    fs.mkdir(projectPath + "entities/", () => console.log("Error creating entities folder"));
    fs.mkdir(projectPath + "functions/", () => console.log("Error creating functions folder"));
    fs.mkdir(projectPath + "rules/", () => console.log("Error creating rules folder"));

    Object.keys(schema.types).forEach(key => {
        let type = schema.types[key];
        var filePath = projectPath + 'types/' + type.name + '.cs';
        let contents = ExpressToCSharpFileString([type], schema.schema + "", ConvertTypeToCsharpString);
        WriteStringToFile(filePath, contents);
    });
    Object.keys(schema.entities).forEach(key => {
        console.log(key);
        let entity = schema.entities[key];
        var filePath = projectPath + 'entities/' + entity.name + '.cs';
        let contents = ExpressToCSharpFileString([entity], schema.schema + "", ConvertEntityToCsharpString);
        WriteStringToFile(filePath, contents);
    });
    Object.keys(schema.functions).forEach(key => {
        console.log(key);
        let entity = schema.functions[key];
        var filePath = projectPath + 'functions/' + entity.name + '.cs';
        let contents = ExpressToCSharpFileString([entity], schema.schema + "", ConvertFunctionToCsharp);
        WriteStringToFile(filePath, contents);
    });
    // Object.keys(schema.entities).forEach(key => ConvertEntityToCsharp(schema.entities[key]));
    // Object.keys(schema.functions).forEach(key => ConvertFunctionToCsharp(schema.functions[key]));
    // Object.keys(schema.rules).forEach(key => ConvertRuleToCsharp(schema.rules[key]));
}

var translatePrimitive = function (type) {
    if (Object.keys(primitivesDict).includes(type))
        return primitivesDict[type];
    else if (typeof type == 'string') return type; // type is a word but not a keyword, meaning its an ifcClass
    else if (["ARRAY", "SET", "LIST", "BAG"].includes(type.type)) return translatePrimitive(type.type) + "<" + translatePrimitive(type.contains) + ">";
    else if (type.type == "STRING") return translatePrimitive(type.type);
    else return "";
};

function ExpressToCSharpFileString(typeArray, namespaceName, conversionFunction) {
    var using = "\n";
    var u = ["System", namespaceName].forEach(item => using += "using " + item + ";\n");
    using += "\n\n"
    var comment = "// This is a placeholder file for the following express types:\n//\n";
    var namespaceStart = "namespace " + namespaceName + " { \n\n";
    var namespaceEnd = "\n\n}";

    let fileString = "";
    typeArray.forEach(type => {
        comment += "//\t\t- " + type.name + "\n";
        fileString += conversionFunction(type);
    });

    let fileContents = comment + using + namespaceStart + fileString + namespaceEnd;
    return fileContents;
}

function ConvertTypeToCsharpString(expType) {
    var constructor = "\t\tpublic " + expType.name + "(" + translatePrimitive(expType.type) + " value) : base(value) { }";
    var typeClass = "\tpublic class " + expType.name + ": " + translatePrimitive(expType.type) + " {\n\n";
    var typeClassEnd = "\n\t}";

    var enumeration = function (expType) {
        var enumStart = "\tpublic enum " + expType.name + " {\n\t\t";
        var enumValues = expType.type.values.join(",\n\t\t");
        var enumEnd = "\n\t}\n";
        return enumStart + enumValues + enumEnd;
    };

    var expClass = expType.type.type == "enum" || expType.type.type == "select" ?
        enumeration(expType) : typeClass + constructor + typeClassEnd;

    return expClass;
}

function WriteStringToFile(filePath, fileContents) {
    fs.writeFile(filePath, fileContents, (err) => {
        // In case of a error throw err. 
        if (err)
            throw err;
    });
}

function getAllProps(entity, camelCase, nameOnly) {
    return getEntityInheritedProps(entity, camelCase, nameOnly).concat(getEntityLocalProps(entity, camelCase, nameOnly));
}

function getEntityLocalProps(entity, camelCase?, nameOnly?) {
    let propStringArray = [];
    if (entity.properties) {
        Object.keys(entity.properties).forEach(key => {
            let property = entity.properties[key];
            let primitive = translatePrimitive(property.type);
            let optional = property.optional ? "?" : "";
            let name = camelCase ? "_" + key.charAt(0).toLowerCase() + key.slice(1) : key;
            if (!nameOnly) propStringArray.push(primitive + " " + name);
            else propStringArray.push(name);
        });
    }
    return propStringArray;
}

function getEntityInheritedProps(entity, camelCase, nameOnly) {
    let propStringArray = [];

    if (entity.supertype) {
        let temp = getAllProps(IfcSchema.entities[entity.supertype], camelCase, nameOnly);
        return temp.concat(propStringArray);
    }
    return propStringArray;
}

function ConvertEntityToCsharpString(entity) {
    var inheritance = entity.supertype ? ": " + entity.supertype : ": eObject";
    let abstract = entity.abstract ? " abstract" : "";

    let propArray = getAllProps(entity, true, false);
    let props = "";
    getEntityLocalProps(entity).forEach(item => props += "\n\t\tpublic " + item + ";");
    let constructorPropString = propArray.length != 0 ? "\n\t\t\t" + propArray.join(",\n\t\t\t") : "";
    let baseProps = getEntityInheritedProps(entity, true, true).join(",\n\t\t\t\t");

    function localPropAssignments() {
        let upper = getEntityLocalProps(entity, false, true);
        let lower = getEntityLocalProps(entity, true, true);
        let string = "\n";
        for (let i = 0; i < upper.length; i++) {
            string += "\t\t\t\t\t" + upper[i] + " = " + lower[i] + ";\n";
        }
        return string;
    }

    let inverseProps = "";
    if (entity.inverse) {
        inverseProps = "\n\n\n\t\t// Inverse Properties\n";
        Object.keys(entity.inverse).forEach(key => {
            let property = entity.inverse[key];
            let propString = "\t\tpublic " + translatePrimitive(property.type) + " " + key + " => " + notImpl + ";\n";
            inverseProps += propString;
        });
    }

    let constructor = "\n\n\t\tpublic " + entity.name + "(" + constructorPropString + ")\n\t\t\t: base(" + baseProps + ") {" + localPropAssignments() + "\t\t\t\t}";
    let entityDeclaration = "\tpublic" + abstract + " class " + entity.name + inheritance + "\n\t{\n";
    let entityEnd = "\n\t}\n";
    return entityDeclaration + props + inverseProps + constructor + entityEnd;
}

function getFunctionArguments(expFunc, camelCase, nameOnly) {
    let propStringArray = [];
    if (expFunc.arguments) {
        Object.keys(expFunc.arguments).forEach(key => {
            let property = expFunc.arguments[key];
            let primitive = translatePrimitive(property.type);
            let optional = property.optional ? "?" : "";
            let name = camelCase ? key.charAt(0).toLowerCase() + key.slice(1) : key;
            if (!nameOnly) propStringArray.push(primitive + " " + name);
            else propStringArray.push(name);
        });
    }
    return propStringArray;
}
function ConvertFunctionToCsharp(expFunction) {
    let classStart = "\tpublic static partial class Functions {\n";
    let returns = expFunction.returns ? translatePrimitive(expFunction.returns.type) : "void";
    let args = getFunctionArguments(expFunction, false, false);
    let funcStart = "\n\t\tpublic static " + returns + " " + expFunction.name + "(" + args + ")\n\t\t{\n\t\t\t" + notImpl + ";\n\t\t}\n";
    let classEnd = "\t}";

    return classStart + funcStart + classEnd;
}

function ConvertRuleToCsharp(rule) {

}

function ReadJSON(filePath, callback) {
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
    });
    var schema = "";
    rl.on('line', (l) => {
        schema += l;
    });
    rl.on('close', () => {
        callback(JSON.parse(schema));
    });

}