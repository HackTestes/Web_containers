#include <iostream>
#include <thread>

void NoOpLoop(unsigned long long int num_of_loops)
{
    for(unsigned long long int i = 0; i < num_of_loops; ++i)
    {
    }
}


int main(int argc, char* argv[])
{
    unsigned long long int num_of_loops = std::strtoull( argv[1], NULL, 10 );
    unsigned long long int num_of_threads = std::strtoull( argv[2], NULL, 10 );

    std::cout << "Number of loops per thread: " << num_of_loops << "\n";
    std::cout << "Number of threads: " << num_of_threads << "\n";

    std::thread threads_array[num_of_threads];

    for(unsigned long long int i = 0; i < num_of_threads; ++i)
    {
        threads_array[i] = std::thread(NoOpLoop, num_of_loops);
    }

    for(unsigned long long int i = 0; i < num_of_threads; ++i)
    {
        threads_array[i].join();
    }

    return 0;
}