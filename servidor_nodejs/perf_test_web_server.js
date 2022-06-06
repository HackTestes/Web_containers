#!/usr/bin/node --unhandled-rejections=strict

const cors = require('cors');
const express = require('express');
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const util = require('util');
const { exit } = require('process');

const app = express();
//app.use(cors());

app.use(function(req, res, next)
{
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
});

app.use(express.json());

wasm_path = '/media/caioh/EXTERNAL_HDD1/TCC_CAIO/site_testes_pequenos_performance/C_CPP_Benchmarks/WASM_dir/'

//wasm_path = '/home/note/Documentos/TCC/Web_containers/site_testes_pequenos_performance/C_CPP_Benchmarks/WASM_dir/'

let call_main_js = fs.readFileSync('./callMain.js', {encoding:'utf8', flag:'r'});
let HTML_template = fs.readFileSync('./fetch.html', {encoding:'utf8', flag:'r'});

function Program_args_obj(program_name, program_arguments)
{
    return {name: program_name, args: program_arguments}
}

/*tests_obj =
{
    'return_0': '""',
    'cpu_single_thread_no_op_loop': '"1000000"',
    'prime_number': '"919393"',
    'prime_number': '"2147483647"',
    'matrix_addition_single_multi': '"10000", "10", "1", "multi"',
    'cpu_multi_thread_no_op_loop': '"1000000000", "12"',
    'prime_number_multi': '"2147483647", "12"',
    'fibonnaci_multi': '"999999999", "12"',
    'TEST_END': ''
}*/

function Result_To_Tsv(results_array_obj, sep)
{
    let tsv = '';
    let header = Object.keys(results_array_obj[0]);

    // Build the header (columns)
    tsv += header.join(sep) + '\n';

    /*
    for (key of header)
    {
        tsv += key + sep;
    }
    tsv += '\n';
    */

    // Build all the rows
    for(result_obj of results_array_obj)
    {
        tsv += Object.values(result_obj).join(sep) + '\n';

        /*
        for (result_key in result_obj)
        {
            tsv += result_obj[result_key] + sep;
        }
        tsv += '\n';
        */
    }

    console.log(tsv);
}

let results = [];

let current_test = 0;
let test_list = 
[
    Program_args_obj('return_0', '""'),
    Program_args_obj('cpu_single_thread_no_op_loop', '"1000000"'),
    Program_args_obj('prime_number', '"919393"'),
    Program_args_obj('prime_number', '"2147483647"'),
    Program_args_obj('matrix_addition_single_multi', '"10000", "10", "1", "multi"'),
    Program_args_obj('cpu_multi_thread_no_op_loop', '"1000000000", "12"'),
    Program_args_obj('prime_number_multi', '"2147483647", "12"'),
    Program_args_obj('fibonnaci_multi', '"999999999", "12"'),
    Program_args_obj('TEST_END', '')
]

function Build_HTML_Template(test_name, current_test_script, perf_test_script)
{
    return HTML_template.replace(/TEST_NAME/g, test_name).replace(/PERF_TEST_SCRIPT/g, perf_test_script).replace(/CURRENT_TEST_SCRIPT/g, current_test_script);
}

function Build_Call_Main(args)
{
    return call_main_js.replace(/ARGUMENTS/g, args);
}

app.get(`/WASM/:file_name`, (req, res) =>
{
    let last_dot_index = req.params.file_name.lastIndexOf('.');
    let file_name_without_extension = req.params.file_name.substring(0, last_dot_index);
    let file_extension = req.params.file_name.substring(last_dot_index);

    if(file_extension == '.html')
    {
        res.send( Build_HTML_Template(file_name_without_extension, `${file_name_without_extension}.js`, `callMain.js`) );
    }

    else if(req.params.file_name == 'callMain.js')
    {
        res.send( Build_Call_Main(`${test_list[current_test].args}`) );
    }

    else if(file_name_without_extension == 'TEST_END')
    {
        res.send( 'TEST_END' );
        Result_To_Tsv(results, "\t");
        exit(0);
    }

    else
    {
        res.sendFile( wasm_path + req.params.file_name );
    }
});

app.post(`/WASM/result`, (req, res) =>
{
    results.push(req.body);
    ++current_test;
    res.json({Response: req.body, New_link: `http://127.0.0.1:3000/WASM/${test_list[current_test].name}.html`});
});


port_listen = 3000;
app.listen(port_listen, () =>
{
    //console.log(`Server: OK \nPort: ${port_listen} \nURL: http://127.0.0.1:3000/WASM/${test_list[current_test].name}.html`);
});
