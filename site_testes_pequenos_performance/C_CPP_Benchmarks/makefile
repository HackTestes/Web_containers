# Builds the C++ tests

CC=g++
WASM=emcc
COMPRESSION_PROGRAM=zip

CPP = $(wildcard *.cpp)
EXE = $(CPP:.cpp=.exe)
JS = $(CPP:.cpp=.js)
ZIP = $(CPP:.cpp=.zip)

TARGETS = $(EXE) $(JS) $(ZIP)

.PHONY: all

all: $(TARGETS)

# Native
%.exe: %.cpp
	$(CC) -o executable_dir/$@ $^ -pipe -static -O3

# WASM
%.js: %.cpp
	$(WASM) -o WASM_dir/$@ $^ -O3 -s EXIT_RUNTIME=0 -s INVOKE_RUN=0 -s ALLOW_MEMORY_GROWTH=1 -pthread -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=13 && sed -i '1i global_start = performance.now();' WASM_dir/$@

# Compressed sources
%.zip: %.cpp
	$(COMPRESSION_PROGRAM) compressed_packages/$@ src/$^