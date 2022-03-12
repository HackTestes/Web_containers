#!/bin/node

const process = require('process');

// print process.argv
process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});