#include <iostream>

int main(int argc, char* argv[])
{
    unsigned long long int num_of_loops = std::strtoull( argv[1], NULL, 10 );
    std::cout << "Number of loops: " << num_of_loops << "\n";

    unsigned long long int loops_executed;
    for(unsigned long long int i = 0; i < num_of_loops; ++i)
    {
        loops_executed = i;
    }

    std:: cout << "Loops executed: " << loops_executed << '\n';

    return 0;
}