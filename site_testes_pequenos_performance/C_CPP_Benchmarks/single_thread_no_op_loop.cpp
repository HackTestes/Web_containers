#include <iostream>

int main(int argc, char* argv[])
{
    unsigned long long int num_of_loops = std::strtoull( argv[1], NULL, 10 );
    std::cout << "Number of loops: " << num_of_loops << "\n";

    for(unsigned long long int i = 0; i < num_of_loops; ++i)
    {
    }

    return 0;
}