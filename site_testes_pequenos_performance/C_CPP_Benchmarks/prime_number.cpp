#include <iostream>

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

    isPrime(number) ? std::cout << " true\n" : std::cout << " false\n";

    return 0;
}