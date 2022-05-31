# Builds the C++ tests

CC=g++

CPP = $(wildcard *.cpp)
EXE = $(CPP:.cpp=.exe)

.PHONY: all

all: $(EXE)

%.exe: %.cpp
	$(CC) -o executable_dir/$@ $^ -pipe -static

.PHONY: all