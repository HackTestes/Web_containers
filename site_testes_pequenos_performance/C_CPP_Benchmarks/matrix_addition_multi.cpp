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

    std::cout << "Array size: " << array_size << "\n";
    std::cout << "Number of threads: " << num_of_threads << "\n";
    std::cout << "Items per thread: " << items_per_thread << "\n";
    std::cout << "Value to add: " << add_value << "\n";

    unsigned long long int *value_array = (unsigned long long int*)malloc(sizeof(unsigned long long int) * array_size);

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

    /*
    // Validation
    bool array_is_correct = true;
    for(unsigned long long int i = 0; i < array_size; ++i)
    {
        //std::cout << "Value array: " << value_array[i] << "\n";
        if(value_array[i] != (i + add_value))
        {
            array_is_correct = false;
        }
    }
    std::cout << "Is the array correct: " << array_is_correct << "\n";
    */

    free(value_array);

    return 0;
}