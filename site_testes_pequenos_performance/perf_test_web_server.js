#!/usr/bin/node --unhandled-rejections=strict

const cors = require('cors');
const express = require('express');
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const util = require('util');
const child_process = require('child_process');
const { exit } = require('process');

//const ExecFileAsync = util.promisify(child_process.execFile);
//const ExecAsync = util.promisify(child_process.exec);
//const SpawnAsync = util.promisify(child_process.spawn);

const app = express();
//app.use(cors());

app.use(function(req, res, next)
{
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
});

app.use(express.json());

wasm_path = __dirname + '/C_CPP_Benchmarks/WASM_dir/';

let call_main_js = fs.readFileSync('./callMain.js', {encoding:'utf8', flag:'r'});
let HTML_template = fs.readFileSync('./fetch.html', {encoding:'utf8', flag:'r'});

let browser_process_signal;
let browser_alias = process.argv.pop();

function Program_args_obj(program_name, program_arguments, number_of_executions)
{
    return {name: program_name, args: program_arguments, times_to_execute: number_of_executions}
}

function Result_To_Tsv(results_array_obj, sep)
{
    let tsv = '';
    let header = Object.keys(results_array_obj[0]);

    // Build the header (columns)
    //tsv += header.join(sep) + '\n';

    // Build all the rows
    for(result_obj of results_array_obj)
    {
        //tsv += Object.values(result_obj).join(sep) + '\n';
        tsv += `${result_obj['Command']}${sep}${result_obj['Alias']}${sep}${result_obj['Test_program']}${sep}${result_obj['Args']}${sep}${result_obj['Type']}${sep}${result_obj['Exit_code']}${sep}${result_obj['Nanoseconds']}${sep}${result_obj['Microseconds']}${sep}${result_obj['Miliseconds']}${sep}${result_obj['Runtime_startup_time_miliseconds']}\n`;
    }

    return tsv;
}

let results = [];

let startup_executios = 200;
let normal_tests_executions = 10;

let current_test = 0;
let test_list = 
[
    Program_args_obj('return_0', '""', startup_executios),
    Program_args_obj('linear_search', '"199999999"', normal_tests_executions),
    Program_args_obj('bubble_sort', '"99999"', normal_tests_executions),
    Program_args_obj('prime_number', '"6620830889"', normal_tests_executions),
    Program_args_obj('prime_number_multi', '"6620830889", "6"', normal_tests_executions),
    Program_args_obj('matrix_addition_multi', '"199999999", "6", "1", "multi"', normal_tests_executions),
    Program_args_obj('fibonnaci_multi', '"10999999999", "6"', normal_tests_executions),
    Program_args_obj('single_thread_no_op_loop', '"10999999999"', normal_tests_executions),
    Program_args_obj('multi_thread_no_op_loop', '"10999999999", "6"', normal_tests_executions),
    Program_args_obj('TEST_END', '', 0)
]

function Build_HTML_Template(test_name, current_test_script, perf_test_script)
{
    return HTML_template.replace(/TEST_NAME/g, test_name).replace(/PERF_TEST_SCRIPT/g, perf_test_script).replace(/CURRENT_TEST_SCRIPT/g, current_test_script);
}

function Build_Call_Main(args, number_of_executions)
{
    return call_main_js.replace(/ARGUMENTS/g, args).replace(/NUMBER_OF_EXECUTIONS/g, number_of_executions);
}

app.get(`/WASM/:file_name`, async (req, res) =>
{
    let last_dot_index = req.params.file_name.lastIndexOf('.');
    let file_name_without_extension = req.params.file_name.substring(0, last_dot_index);
    let file_extension = req.params.file_name.substring(last_dot_index);

    if(file_extension == '.html')
    {
        console.error(`Current test: ${file_name_without_extension}`);
        res.send( Build_HTML_Template(file_name_without_extension, `${file_name_without_extension}.js`, `callMain.js`) );
    }

    else if(req.params.file_name == 'callMain.js')
    {
        res.send( Build_Call_Main(`${test_list[current_test].args}`, test_list[current_test].times_to_execute) );
    }

    else
    {
        res.sendFile( wasm_path + req.params.file_name );
    }
});

app.post(`/WASM/result`, (req, res) =>
{
    req.body['Command'] = `${process.argv[2]} ${process.argv.slice(3)}`;
    req.body['Alias'] = browser_alias;
    console.error(req.body);
    results.push(req.body);
    ++current_test;

    if(test_list[current_test].name == 'TEST_END')
    {
        process.stdout.write(Result_To_Tsv(results, "\t"));
        browser_process_signal.kill('SIGTERM');
        exit(0);
    }

    res.json({Response: req.body, New_link: `http://127.0.0.1:3000/WASM/${test_list[current_test].name}.html`});
});

port_listen = 3000;
app.listen(port_listen, () =>
{
    console.error(`Server: OK \nPort: ${port_listen} \nURL: http://127.0.0.1:${port_listen}/WASM/${test_list[current_test].name}.html`);
    browser_process_signal = child_process.spawn(`${process.argv[2]}`, process.argv.slice(3).concat([`http://127.0.0.1:${port_listen}/WASM/${test_list[current_test].name}.html`]));
});
