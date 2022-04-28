# Builds the C++ tests

CC=g++

CPP = $(wildcard *.cpp)
EXE = $(CPP:.cpp=.exe)

.PHONY: all

all: $(EXE)

%.exe: %.cpp
	$(CC) -o $@ $^ -pipe -static

.PHONY: all