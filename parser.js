const fs = require('fs');

function lexer(input) {
  const regex = /"(?:\\.|[^"])*"|true|false|null|(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|[\{\}\[\]:,]/g;
  return input.match(regex) || [];
}


function validateNumber(token) {
  return /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(token);
}

function parseValue(tokens) {
  const token = tokens.shift();

  if (token === '{') return parseObject(tokens);
  if (token === '[') return parseArray(tokens);
  if (token === 'true' || token === 'false' || token === 'null') return true;
  if (validateNumber(token)) return true;

  // Check if the token is a valid string
  if (token.startsWith('"') && token.endsWith('"')) {
    const inner = token.slice(1, -1);
    if (/^(?:[^"\\]|\\["\\/bfnrt]|\\u[0-9a-fA-F]{4})*$/.test(inner)) {
      return true;
    } else {
      console.log('Debug: Invalid string:', token);
      return false;
    }
  }

  console.log('Debug: Unexpected token:', token);
  return false;
}

function parseObject(tokens) {
  if (tokens[0] === '}') {
    tokens.shift(); // Remove closing brace
    return true;
  }

  while (tokens.length) {
    const key = tokens.shift();
    if (!key.startsWith('"') || !key.endsWith('"')) {
      console.log('Debug (Object): Expected string key.');
      return false;
    }
    if (tokens.shift() !== ':') {
      console.log('Debug (Object): Expected colon.');
      return false;
    }
    if (!parseValue(tokens)) return false; // Parse value

    if (tokens[0] === '}') {
      tokens.shift(); // Remove closing brace
      return true;
    }

    if (tokens.shift() !== ',') {
      console.log('Debug (Object): Expected comma or closing brace.');
      return false;
    }
  }

  return false;
}

function parseArray(tokens) {
  if (tokens[0] === ']') {
    tokens.shift(); // Remove closing bracket
    return true;
  }

  while (tokens.length) {
    if (!parseValue(tokens)) return false; // Parse value

    if (tokens[0] === ']') {
      tokens.shift(); // Remove closing bracket
      return true;
    }

    if (tokens.shift() !== ',') {
      console.log('Debug (Array): Expected comma or closing bracket.');
      return false;
    }
  }

  return false;
}

function main(input) {
  const tokens = lexer(input);
  const isValid = parseValue(tokens);

  if (isValid && tokens.length === 0) {
    console.log("Valid JSON");
    return 0; // Valid
  } else {
    console.log("Invalid JSON");
    return 1; // Invalid
  }
}

function processFile(filePath) {
  const input = fs.readFileSync(filePath, 'utf8');
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

testDirectory('test/');
