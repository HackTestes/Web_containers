#include <iostream>

int main(int argc, char* argv[])
{

    unsigned long long int num_of_loops = std::strtoull( argv[1], NULL, 10 );
    //unsigned long long int j = 0;

    for(unsigned long long int i = 0; i < num_of_loops; ++i)
    {

    }

    //std::cout << "j: " << j << "\n";
    std::cout << "Number of loops: " << num_of_loops << "\n";

    return 0;
}