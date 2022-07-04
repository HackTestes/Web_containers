#include <iostream>

int main(int argc, char* argv[])
{

    unsigned long long int array_size = std::strtoull( argv[1], NULL, 10 );
    unsigned long long int number_to_search = array_size -1;

    std::cout << "array_size: " << array_size << "\n";
    std::cout << "number_to_search: " << number_to_search << "\n";


    unsigned long long int *list = new unsigned long long int[array_size];

    for(unsigned long long int i = 0; i < array_size; ++i)
    {
        list[i] = i;
    }

    // Linear search
    for(unsigned long long int i = 0; i < array_size; ++i)
    {
        if(list[i] == number_to_search)
        {
            std::cout << "Found it! -> " << list[i] << '\n';
            break;
        }
    }

    delete[] list;

    return 0;
}