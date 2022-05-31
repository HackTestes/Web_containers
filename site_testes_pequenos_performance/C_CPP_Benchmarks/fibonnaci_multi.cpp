#include <iostream>
#include <thread>

// https://www.delftstack.com/pt/howto/cpp/fibonacci-sequence-in-cpp/
unsigned long long generateFibonacci(unsigned long long n)
{
    if (n == 1)
    {
        return 0;
    }
    
    else if (n == 2 || n == 3)
    {
        return 1;
    }

    unsigned long long a = 1;
    unsigned long long b = 1;
    unsigned long long c;

    for (unsigned long long i = 3; i < n; i++)
    {
        c = a + b;
        a = b;
        b = c;
    }

    return c;
}

int main(int argc, char* argv[])
{
    unsigned long long int number_position = std::strtoull( argv[1], NULL, 10 );
    unsigned long long int num_of_threads = std::strtoull( argv[2], NULL, 10 );

    std::thread threads_array[num_of_threads];

    for(unsigned long long int i = 0; i < num_of_threads; ++i)
    {
        threads_array[i] = std::thread(generateFibonacci, number_position);
    }

    for(unsigned long long int i = 0; i < num_of_threads; ++i)
    {
        threads_array[i].join();
    }

    return 0;
}