#!/bin/node

const { time } = require('console');
const fs = require('fs');

function ReadSyscalls(strace_output)
{
    let syscalls = strace_output.split("----------------\n");
    syscalls = syscalls[1].split("\n");
    syscalls.pop(); // empty element

    let syscall_list = {"syscalls":""};

    for(syscall of syscalls)
    {
        syscall_list["syscalls"] += syscall + " ";
    }
    syscall_list["syscalls"] = syscall_list["syscalls"].slice(0, -1); // remove last char ','

    return syscall_list;
}

function FilterEmptyArray(value)
{
    if(value!="")
    {
        return value
    }
}

// Read a semi-formatted time array and returns a key_value object
// Main Category (time)
//  - sub entry
//  - ...
function Read_SubKeyValue(array, kay_value_sep, real_output_length)
{
    let command = `${array[0].replace(/\n/g, "")} - `;
    let start_positon = array.length - real_output_length; // skips the program output
    let key_value_object = {};

    for(let i = start_positon; i < array.length; ++i)
    {
        let key_value_array = array[i].split(kay_value_sep);
        key_value_object[`${command}${key_value_array[0].replace(/\n|\t/g, "")}`] = key_value_array[1].replace(/\n/g, "").replace(/,/g, ".");
    }

    return key_value_object;
}

function Read_SecuritySettings(capsh_output)
{
    let capsh_array = capsh_output.replace(/ =|: =|=/g, ": ").replace(/ euid/g, "\neuid").split("\n").filter(FilterEmptyArray);
    let key_value_object = {};

    for(let i = 0; i < capsh_array.length; ++i)
    {
        let key_value_array = capsh_array[i].split(": ");
        key_value_object[`capsh - ${key_value_array[0].trim()}`] = key_value_array[1].replace(/,/g, " ");
    }

    return key_value_object;
}

function ArrayToCsv(tests_array, sep)
{
    let csv_output = "";

    //tests_array = tests_array.splice((tests_array.length - 1), 1);

    // Header
    csv_output += Object.keys(tests_array[0]).join(sep) + "\n";

    // Rows
    for(test_obj of tests_array)
    {
        csv_output += Object.values(test_obj).join(sep) + "\n";
    }

    return csv_output.replace(/"|'/g, "");
}

function read_benchmark(input)
{
    // System configuration
    let system_config = input.split("\n\n-------------------------------- TEST START --------------------------------\n\n\n")[0];
    let formatted_tests_speed = [];
    let formatted_tests_syscall = [];
    let formatted_tests_security = [];
    let formatted_tests_native = [];

    // Each test
    let tests = input.split("\n\n-------------------------------- TEST START --------------------------------\n\n\n")[1].split("\n\n//-----------------------------------------------------------------------------//\n\n");
    tests.pop(); // removes last  empty value

    for(let i = 0; i < tests.length; ++i)
    {
        let test_output = {};
        let test_number = i;

        let test_header = {};
        let header_items = 4;

        let test_entries = tests[test_number].split(".....................................");

        for(let i = 0; i < header_items; ++i)
        {
            let key_value = tests[test_number].split(".....................................")[i].replace(/\n/g, "").split(": ");
            test_header[key_value[0]] = key_value[1].trim(); // remove first space char
        }

        if(test_header["Test type"] == 'speed')
        {
            let formatted_time = Read_SubKeyValue(test_entries[4].split("\n").filter( FilterEmptyArray ), "\t", 3);
            let formatted_usr_bin_time = Read_SubKeyValue(test_entries[5].split("\n").filter( FilterEmptyArray ), ": ", 23);
            let formatted_date = Read_SubKeyValue(test_entries[6].split("\n").filter( FilterEmptyArray ), ":", 3);

            test_output = Object.assign(test_header, formatted_time, formatted_usr_bin_time, formatted_date);

            formatted_tests_speed.push(test_output);
        }
        else if(test_header["Test type"] == 'syscall')
        {
            test_output = Object.assign(test_header, ReadSyscalls(test_entries[4]));
            formatted_tests_syscall.push(test_output);
        }
        else if(test_header["Test type"] == 'native')
        {
            let formatted_time = Read_SubKeyValue(test_entries[4].split("\n").filter( FilterEmptyArray ), "\t", 3);
            let formatted_usr_bin_time = Read_SubKeyValue(test_entries[5].split("\n").filter( FilterEmptyArray ), ": ", 23);
            let formatted_date = Read_SubKeyValue(test_entries[6].split("\n").filter( FilterEmptyArray ), ":", 3);

            test_output = Object.assign(test_header, formatted_time, formatted_usr_bin_time, formatted_date);

            formatted_tests_native.push(test_output);
        }
        else if(test_header["Test type"] == 'security')
        {
            test_output = Object.assign(test_header, Read_SecuritySettings(test_entries[4]));
            formatted_tests_security.push(test_output);
        }
        else
        {
            test_output = Object.assign(test_header, {"placeholder": 'placeholder'});
        }

        //formatted_tests_array.push(test_output);
    }

    //console.log(formatted_tests_security);
    console.log( ArrayToCsv(formatted_tests_native, "\t"));
    console.log("\n\n");
    console.log( ArrayToCsv(formatted_tests_speed, "\t"));
    console.log("\n\n");
    console.log(ArrayToCsv(formatted_tests_syscall, "\t"));
    console.log("\n\n");
    console.log(ArrayToCsv(formatted_tests_security, "\t"));

}

// Read from stdin descriptor
read_benchmark( fs.readFileSync(0).toString() );