# JSON Parser

This script provides functionality to validate JSON files in a given directory.

## Installation
To install this package, navigate to your project directory and run the command 
`npm install symbioticlove-json-parser` 
or download the assets here.

## Functions

### `lexer(input)`
Takes a JSON string and returns an array of tokens. If an unescaped control character is found, it returns `null`.

### `validateNumber(token)`
Returns `true` if the token is a valid JSON number.

### `parseValue(tokens, depth)`
Parses a value from the token list and returns `true` if it's valid.

### `parseObject(tokens, depth)`
Parses an object from the token list, returning `true` if it's valid.

### `parseArray(tokens, depth)`
Parses an array from the token list, returning `true` if it's valid.

### `main(input)`
The main validation function that checks if the input is a valid JSON. Returns `0` if valid and `1` if invalid.

### `processFile(filePath)`
Reads the file at the given path and passes its content to `main(input)` for validation.

### `testDirectory(directoryPath)`
Reads all files in the specified directory and checks them for valid JSON using `processFile(filePath)`.

## Constants

- `MAX_DEPTH`: Controls the maximum allowed nesting depth for objects and arrays.

## Usage

The script will process all files in the `test/` directory and print whether they are valid or invalid JSON.
