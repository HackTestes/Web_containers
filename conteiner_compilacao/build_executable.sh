#!/bin/bash

# ROOT_PATH="/container/tmpfs"
# APP_PATH="${ROOT_PATH}/app"
# SRC_PATH="${ROOT_PATH}/app_source"
# COMPRESSED_SRC="${APP_PATH}/*.zip"

# unzip ${COMPRESSED_SRC} -d ${SRC_PATH}

# make -f makefile_internal_container_build -j

# -----------------------------------------------

cd $1;

APP_PATH=$(pwd)
SRC_PATH="${APP_PATH}/app_source"
COMPRESSED_SRC="${APP_PATH}/*.zip"

unzip ${COMPRESSED_SRC} -d ${SRC_PATH} &&

make -f /media/caioh/EXTERNAL_HDD1/TCC_CAIO/conteiner_compilacao/makefile_internal_container_build -j