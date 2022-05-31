#!/usr/bin/node --unhandled-rejections=strict

const cors = require('cors');
const express = require('express');
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const util = require('util');

const app = express();
app.use(cors());
app.use(express.json());

wasm_path = '/media/caioh/EXTERNAL_HDD1/TCC_CAIO/site_testes_pequenos_performance/C_CPP_Benchmarks/WASM_dir/'

app.get(`/WASM`, (req, res) =>
{
    res.sendFile( wasm_path + 'return_0.html' );
});

app.get(`/WASM/:file_name`, (req, res) =>
{
    res.sendFile( wasm_path + req.params.file_name );
});

port_listen = 3000;
app.listen(port_listen, () =>
{
    console.log(`Server: OK \nPort: ${port_listen} \n`);
});
