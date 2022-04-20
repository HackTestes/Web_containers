#!/bin/node

const fs = require('fs');

function read_strace(input)
{
    let formatted_output = "";
    let syscalls_set = new Set(); // Uisng a set to prevent repeted syscalls (Arguments are ignored!)

    let input_list = input.split("\n");

    // Get syscalls names
    for(entry of input_list)
    {
        let parenthesis_index = entry.indexOf("("); // All syscalls names finish before '(' -> syscall_name(args) = return_value [info]\n
        if(parenthesis_index != -1)
        {
            syscalls_set.add(entry.slice(0, parenthesis_index)); // Get syscall name only
        }
    }

    // Generate the string
    for(syscall of syscalls_set)
    {
        formatted_output += syscall + ",";
    }

    formatted_output = formatted_output.slice(0, -1);

    console.log(formatted_output);

    //console.log(input); // In case you want to see the raw input
}

// Read from stdin descriptor
read_strace( fs.readFileSync(0).toString() );