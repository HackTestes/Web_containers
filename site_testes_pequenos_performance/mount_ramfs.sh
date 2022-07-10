#!/bin/bash

sudo mount -t ramfs none ./C_CPP_Benchmarks/executable_dir/ && sudo chown caioh:caioh ./C_CPP_Benchmarks/executable_dir/;

sudo mount -t ramfs none ./C_CPP_Benchmarks/compressed_packages/ && sudo chown caioh:caioh ./C_CPP_Benchmarks/compressed_packages/;

sudo mount -t ramfs none ./C_CPP_Benchmarks/WASM_dir/ && sudo chown caioh:caioh ./C_CPP_Benchmarks/WASM_dir/;
