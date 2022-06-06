#include <iostream>
#include <thread>

// Source https://www.geeksforgeeks.org/c-program-to-check-prime-number/
bool isPrime(unsigned long long int n)
{
    // Corner case
    if (n <= 1)
        return false;
  
    // Check from 2 to n-1
    for (unsigned long long int i = 2; i < n; i++)
        if (n % i == 0)
            return false;
  
    return true;
}


int main(int argc, char* argv[])
{
    unsigned long long int number = std::strtoull( argv[1], NULL, 10 );
    unsigned long long int num_of_threads = std::strtoull( argv[2], NULL, 10 );

    std::cout << "Number: " << number << "\n";
    std::cout << "Number of threads: " << num_of_threads << "\n";

    std::thread threads_array[num_of_threads];

    for(unsigned long long int i = 0; i < num_of_threads; ++i)
    {
        threads_array[i] = std::thread(isPrime, number);
    }

    for(unsigned long long int i = 0; i < num_of_threads; ++i)
    {
        threads_array[i].join();
    }

    return 0;
}