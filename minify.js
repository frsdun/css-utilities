#!/usr/bin/env node

// A simple script meant to used from your cli to minify a .css file.
// You must specify 2 arguments: 1. Input path (the .css file you want to minify) 2. Output path (the file that will be created)
// Note that the paths must be relative to this script.
// Eg: "node minify.js css/styles.css css/styles.min.css"

const fs = require('fs');
const path = require('path');

const start_time = new Date();

if (process.argv.length != 4) return console.error('You must specify two arguments. (input path and output path)');
if (!process.argv[2].endsWith('.css') || !process.argv[3].endsWith('.css')) return console.error('Both the input path and output path must point to ".css" files');

const input_path = path.join(__dirname, process.argv[2]);
const output_path = path.join(__dirname, process.argv[3]);

let data = read_file_to_string(input_path);
data = minify(data);
write_string_to_file(output_path, data);

// Stats
const start_size_in_kilobytes = calculate_file_size(input_path) * 0.001;
const end_size_in_kilobytes = calculate_file_size(output_path) * 0.001;
const kilobytes_saved = start_size_in_kilobytes - end_size_in_kilobytes;
const saving = kilobytes_saved / start_size_in_kilobytes * 100;
const time = new Date() - start_time;

console.log(`\nCSS minify complete.\nCreate: "${output_path}"\n${start_size_in_kilobytes.toFixed(4)}kb to ${end_size_in_kilobytes.toFixed(4)}kb in ${time}ms ${saving.toFixed(2)}% saving.\n`);

function minify(str) {
    // https://github.com/purple-force/css-minify/blob/master/lib/minify.js
    str = str.replace(/\/\*(.|\n)*?\*\//g, ""); //Delete comment
    str = str.replace(/\s*(\{|\}|\[|\]|\(|\)|\:|\;|\,)\s*/g, "$1"); //Remove the spaces around the parentheses, brackets, braces, colon, comma, and semicolon to remove the comment
    str = str.replace(/#([\da-fA-F])\1([\da-fA-F])\2([\da-fA-F])\3/g, "#$1$2$3"); //Color value #aabbcc converted to #abc
    str = str.replace(/:[\+\-]?0(rem|em|ec|ex|px|pc|pt|vh|vw|vmin|vmax|%|mm|cm|in)/g, ":0"); //Delete the unit with a value of 0
    str = str.replace(/\n/g, ""); //Delete line breaks
    str = str.replace(/;\}/g, "}"); //Delete the semicolon of the last line of the statement
    str = str.replace(/^\s+|\s+$/g, ""); //Delete the leading and trailing whitespace
    return str;
};

function read_file_to_string(file_path) {
    if (!fs.existsSync(file_path)) throw `Path: "${file_path}" does not exist`;
    return fs.readFileSync(file_path, { encoding: 'utf8' });
}

function write_string_to_file(file_path, str) {
    if (!fs.existsSync(path.dirname(file_path))) {
        fs.mkdirSync(path.dirname(file_path));
    }
    fs.writeFileSync(file_path, str, { encoding: 'utf8' });
}

function calculate_file_size(file_path) {
    let stats = fs.statSync(file_path)
    let file_size_in_bytes = stats["size"]
    return file_size_in_bytes
}