#include <iostream>

int main(int argc, char* argv[])
{
    unsigned long long int initial_size = std::strtoull( argv[1], NULL, 10 );
    std::string unit = argv[2];

    std::cout << "Initial size: " << initial_size << "\n";
    std::cout << "Unit (Bytes, KiB, MiB, GiB): " << unit << "\n";

    unsigned long long int multiplier = 1;
    if(unit == "Bytes") {}
    else if(unit == "KiB") { multiplier = 1024; }
    else if(unit == "MiB") { multiplier = 1024 * 1024; }
    else if(unit == "GiB") { multiplier = 1024 * 1024 * 1024; }

    bool *array = new bool[initial_size * multiplier]();

    std::cin.ignore();

    delete [] array;
    return 0;
}