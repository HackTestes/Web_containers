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
	$(WASM) -o WASM_dir/$@ $^ -s EXIT_RUNTIME=0 -s INVOKE_RUN=0 && sed -i '1i global_start = performance.now();' WASM_dir/$@

.PHONY: all