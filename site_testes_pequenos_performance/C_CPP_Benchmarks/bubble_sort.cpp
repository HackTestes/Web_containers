#include <iostream>

// https://www.geeksforgeeks.org/bubble-sort/
int main(int argc, char* argv[])
{
    unsigned long long int array_size = std::strtoull( argv[1], NULL, 10 );

    std::cout << "array_size: " << array_size << "\n";

    unsigned long long int *list = new unsigned long long int[array_size];

    // Highest to lowest --> worst case
    for(unsigned long long int i = 0; i < array_size; ++i)
    {
        list[i] = (array_size-1) - i;
    }

    //for(unsigned long long int i = 0; i < array_size; ++i)
    //{
    //    std::cout << i << " - " << list[i] << '\n';
    //}

    for(unsigned long long int i = 0; i < array_size -1; ++i)
    {
        for(unsigned long long int j = 0; j < array_size -i -1; ++j)
        {
            if(list[j] > list[j+1])
            {
                unsigned long long int temp = list[j];
                list[j] = list[j+1];
                list[j+1] = temp;
            }
        }
    }

    //std::cout << "\n\n\n";
    //for(unsigned long long int i = 0; i < array_size; ++i)
    //{
    //   std::cout << i << " - " << list[i] << '\n';
    //}

    delete[] list;

    return 0;
}