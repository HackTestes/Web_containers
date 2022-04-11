#include <iostream>
#include <thread>

// Each threads gets a unique position
void AddMultiThreadMatrixItem(unsigned long long int array[], unsigned long long int array_item, unsigned long long int reserved_items, unsigned long long int array_size, unsigned long long int value)
{
    for(unsigned long long int i = 0; i < reserved_items; ++i)
    {
        if(array_item < array_size)
        {
            array[array_item] = array_item;
            array[array_item] = array[array_item] + value;
            ++array_item;
        }
        else
        {
            return;
        }
    }
}


int main(int argc, char* argv[])
{
    unsigned long long int array_size = std::strtoull( argv[1], NULL, 10 );
    unsigned long long int num_of_threads = std::strtoull( argv[2], NULL, 10 );
    unsigned long long int items_per_thread = (array_size/num_of_threads) + 1;
    unsigned long long int add_value = std::strtoull( argv[3], NULL, 10 );
    std::string mode = argv[4];

    std::cout << "Array size: " << array_size << "\n";
    std::cout << "Number of threads: " << num_of_threads << "\n";
    std::cout << "Items per thread: " << items_per_thread << "\n";
    std::cout << "Value to add: " << add_value << "\n";
    std::cout << "Mode: " << mode << "\n";

    unsigned long long int *value_array = (unsigned long long int*)malloc(sizeof(unsigned long long int) * array_size);

    if(mode == "multi")
    {
        std::thread threads_array[num_of_threads];

        for(unsigned long long int i = 0; i < num_of_threads; ++i)
        {
            unsigned long long int start_index = i * items_per_thread;
            threads_array[i] = std::thread(AddMultiThreadMatrixItem, value_array, start_index, items_per_thread, array_size, add_value);
        }

        for(unsigned long long int i = 0; i < num_of_threads; ++i)
        {
            threads_array[i].join();
        }
    }

    else if(mode == "single")
    {
        for(unsigned long long int i = 0; i < array_size; ++i)
        {
            value_array[i] = i;
            value_array[i] = i + add_value;
        }
    }

    else
    {
        std::cerr << "Invalid mode";
        exit(1);
    }

    /*for(unsigned long long int i = 0; i < array_size; ++i)
    {
        std::cout << "Valaue array: " << value_array[i] << "\n";
    }*/

    free(value_array);

    return 0;
}