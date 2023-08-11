const fs = require("fs");

function lexer(input) {
    const regex = /"(?:\\.|[^"])*"|true|false|null|(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|[{}[\]:,]|\S+/g;
    const tokens = input.match(regex) || [];

    // Check for unescaped control characters in strings
    for (const token of tokens) {
        // eslint-disable-next-line no-control-regex
        if (token.startsWith("\"") && /[\x00-\x1F\x7F]/.test(token.slice(1, -1).replace(/\\./g, ""))) {
            console.log("Debug (Lexer): Unescaped control character in string:", token);
            return null; // Indicate invalid input
        }
    }

    return tokens;
}

function validateNumber(token) {
    return /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(token);
}

function parseValue(tokens, depth = 0) {
    const token = tokens.shift();

    if (token === "{") return parseObject(tokens, depth + 1);
    if (token === "[") return parseArray(tokens, depth + 1);
    if (token === "true" || token === "false" || token === "null") return true;
    if (validateNumber(token)) return true;

    // Check if the token is a valid string
    if (token.startsWith("\"") && token.endsWith("\"")) {
        const inner = token.slice(1, -1);
        if (/^(?:[^"\\]|\\["\\/bfnrt]|\\u[0-9a-fA-F]{4})*$/.test(inner)) {
            return true;
        } else {
            console.log("Debug: Invalid string:", token);
            return false;
        }
    }

    console.log("Debug: Unexpected token:", token);
    return false;
}

const MAX_DEPTH = 19;

function parseObject(tokens, depth = 0) {
    if (depth > MAX_DEPTH) {
        console.log("Debug: Nested objects too deep");
        return false;
    }

    if (tokens[0] === "}") {
        tokens.shift(); // Remove closing brace
        return true;
    }

    while (tokens.length) {
        const key = tokens.shift();
        if (!key.startsWith("\"") || !key.endsWith("\"")) {
            console.log("Debug (Object): Expected string key.");
            return false;
        }
        if (tokens.shift() !== ":") {
            console.log("Debug (Object): Expected colon.");
            return false;
        }
        if (!parseValue(tokens, depth)) return false; // Parse value

        if (tokens[0] === "}") {
            tokens.shift(); // Remove closing brace
            return true;
        }

        if (tokens.shift() !== ",") {
            console.log("Debug (Object): Expected comma or closing brace.");
            return false;
        }
    }

    return false;
}

function parseArray(tokens, depth = 0) {
    if (depth > MAX_DEPTH) {
        console.log("Debug: Nested arrays too deep");
        return false;
    }

    if (tokens[0] === "]") {
        tokens.shift(); // Remove closing bracket
        return true;
    }

    while (tokens.length) {
        if (!parseValue(tokens, depth)) return false; // Parse value

        if (tokens[0] === "]") {
            tokens.shift(); // Remove closing bracket
            return true;
        }

        if (tokens.shift() !== ",") {
            console.log("Debug (Array): Expected comma or closing bracket.");
            return false;
        }
    }

    return false;
}

function main(input) {
    const tokens = lexer(input);
    if (tokens === null) {
        console.log("Invalid JSON");
        return 1; // Invalid
    }

    const firstToken = tokens[0];

    // Check for invalid tokens (i.e., tokens that don't match any valid pattern)
    if (tokens.some(token => !/^(?:"(?:\\.|[^"])*"|true|false|null|(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|[{}[\]:,])$/.test(token))) {
        console.log("Invalid JSON");
        return 1; // Invalid
    }
  
    const isValid = parseValue(tokens);

    // Check if the top-level payload is an object or array
    if (isValid && tokens.length === 0 && (firstToken === "{" || firstToken === "[")) {
        console.log("Valid JSON");
        return 0; // Valid
    } else {
        console.log("Invalid JSON");
        return 1; // Invalid
    }
}

function processFile(filePath) {
    const input = fs.readFileSync(filePath, "utf8");
    return main(input);
}

function testDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
        console.log(`Processing file: ${file}`);
        const resultCode = processFile(`${directoryPath}/${file}`);
        if (resultCode === 0) {
            console.log(`${file} is Valid JSON\n`);
        } else {
            console.log(`${file} is Invalid JSON\n`);
        }
    }
}

testDirectory("test/");

module.exports = {
  lexer,
  validateNumber,
  parseValue,
  parseObject,
  parseArray,
  main,
  processFile,
  testDirectory
};
