# Builds the C++ tests

CC=g++
WASM=emcc

CPP = $(wildcard *.cpp)
EXE = $(CPP:.cpp=.exe)
JS = $(CPP:.cpp=.js)

TARGETS = $(EXE) $(JS)

.PHONY: all

all: $(TARGETS)

%.exe: %.cpp
	$(CC) -o executable_dir/$@ $^ -pipe -static

%.js: %.cpp
	$(WASM) -o WASM_dir/$@ $^ -O0 -s EXIT_RUNTIME=0 -s INVOKE_RUN=0 -s ALLOW_MEMORY_GROWTH=1 -pthread -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=13 && sed -i '1i global_start = performance.now();' WASM_dir/$@
