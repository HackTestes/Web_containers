import pandas
import pandasql
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy
import math

# Configuration
graphs_folder = './Graphs/'

# Graph template functions
def startup_Graph(timings_means, program_alias, experiment_types, legend_names, figure_name):
    # Bar plot
    #startup_tests = total_data.loc[total_data['Test_program'].str.contains('return_0') & ~total_data['Alias'].str.contains('podman')].sort_values(by=['Mean_microseconds'], ignore_index=True).replace({numpy.nan: None})
    print(startup_tests)

    #startup_tests = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Test_program LIKE 'return_0%' AND Command NOT LIKE '%podman%' ORDER BY Mean_microseconds """)
    #print(startup_tests)

    plt.rcParams.update({'font.size': 40})
    plt.subplots(figsize=(35,35))
    plt.xticks(rotation=45, horizontalalignment='right')
    plt.subplots_adjust(bottom=0.2)
    #plt.xlabel('Programas de teste', fontsize=45)
    plt.ylabel('Médias dos tempos (us)', fontsize=45)
    plt.title('Return_0 (tempos de inicialização e destruição)', fontsize=50)

    positions = range(0, timings_means.shape[0]*2, 2)
    colors = experiment_types.map({'native': 'royalblue', 'web_wasm': 'gold', 'container': 'olivedrab', 'custom_container': 'darkorange'})
    legend_handles = []

    bars = plt.bar(positions, timings_means.astype(int), tick_label=program_alias, color=colors)

    plt.grid(color='gray', linestyle=':', linewidth=2, axis='y')

    for index, item in enumerate(legend_names):
        legend_handles.append(mpatches.Patch(color=colors.unique()[index], label=item))
    plt.legend(handles=legend_handles, fontsize=45)

    # https://stackoverflow.com/questions/53066633/python-how-to-show-values-on-top-of-bar-plot
    for bar in bars:
        yval = bar.get_height()
        if(len(str(yval)) == 1):
            plt.text(bar.get_x() + bar.get_width()/4, yval + 0.5, yval)
        elif(len(str(yval)) == 2):
            plt.text(bar.get_x() + bar.get_width()/8, yval + 0.5, yval)
        elif(len(str(yval)) == 3):
            plt.text(bar.get_x() - bar.get_width()*0, yval + 0.5, yval)
        else:
            plt.text(bar.get_x() - bar.get_width()/6, yval + 0.5, yval)

    plt.savefig(f'{graphs_folder}{figure_name}.pdf', format='pdf', orientation='landscape')
    plt.savefig(f'{graphs_folder}{figure_name}.svg', format='svg', orientation='landscape')
    plt.close()


# Graphs gets distorted because of the porpotion
# Array[df], array[string], array[string], string, string, string, int, string
def relative_Perf_Graph(array_of_datasets, datasets_labels, dataset_colors, dataset_labels, ylabel, title, space_between_groups, threshold_label, figure_name):
    plt.rcParams.update({'font.size': 40})
    plt.subplots(figsize=(35,35))
    plt.xticks(rotation=20, horizontalalignment='right')
    plt.subplots_adjust(bottom=0.1)
    #plt.xlabel(xlabel, fontsize=45)
    plt.ylabel(ylabel, fontsize=45)
    plt.title(title, fontsize=50)

    positions_per_bar = 1
    step = len(array_of_datasets) * positions_per_bar + space_between_groups

    # Position list
    for index, dataset in enumerate(array_of_datasets):
        position = range(index * positions_per_bar, len(dataset)*step, step)
        bars = plt.bar(position, dataset, color=dataset_colors[index], label=datasets_labels[index])

        for bar in bars:
            yval = bar.get_height()
            yval_string = '{:.2f}'.format(yval) + 'x'

            if(len(yval_string) > 5):
                plt.text(bar.get_x() - bar.get_width()/6, yval, yval_string, fontsize=35, rotation=35)
            else:
                plt.text(bar.get_x() - bar.get_width()/9, yval, yval_string, fontsize=35, rotation=35)

    plt.xticks(range(1, len(dataset_labels)*step, step), labels=dataset_labels, fontsize=30)
    plt.axhline(y=1, color='black', linestyle='-', linewidth=4)
    plt.grid(color='gray', linestyle=':', linewidth=2, axis='y')
    plt.legend(fontsize=45)

    plt.savefig(f'{graphs_folder}{figure_name}.pdf', format='pdf', orientation='landscape')
    plt.savefig(f'{graphs_folder}{figure_name}.svg', format='svg', orientation='landscape')
    plt.close()


def boxplt_Template(array_of_timings, timings_labels, experiment_labels, ylabel, figure_name):

    # A image per experiment
    for exp_index, experiment in enumerate(experiment_labels):

        plt.rcParams.update({'font.size': 40})
        plt.subplots(figsize=(35,35))
        plt.xticks(rotation=20, horizontalalignment='right')
        plt.subplots_adjust(bottom=0.1)
        plt.ylabel(ylabel, fontsize=45)
        plt.title(experiment, fontsize=50)

        boxprops = dict(linestyle='-', linewidth=5, color='black')
        flierprops = dict(marker='o', markerfacecolor='black', markersize=15, linestyle='none')
        medianprops = dict(linestyle='-', linewidth=5, color='crimson')
        #meanprops = dict(marker='D', markeredgecolor='black', markerfacecolor='green')
        #meanlineprops = dict(linestyle='--', linewidth=4, color='black')

        for time_index, timings in enumerate(array_of_timings):
            plt.boxplot(timings[exp_index], positions=[time_index], labels=[timings_labels[time_index]], showfliers=False, showmeans=True, boxprops=boxprops, flierprops=flierprops, medianprops=medianprops)

        plt.grid(color='gray', linestyle=':', linewidth=2, axis='y')

        plt.savefig(f'{graphs_folder}Boxplot_{figure_name}_{experiment}.pdf', format='pdf', orientation='landscape')
        plt.savefig(f'{graphs_folder}Boxplot_{figure_name}_{experiment}.svg', format='svg', orientation='landscape')
        plt.close()


def line_Chart_Timings(array_of_timings, timings_labels, experiment_labels, subtitle, dataset_colors, xlabel, ylabel, figure_name):

    for exp_index, experiment in enumerate(experiment_labels):
        plt.rcParams.update({'font.size': 40})
        plt.subplots(figsize=(35,35))
        plt.xticks(rotation=45, horizontalalignment='right')
        plt.subplots_adjust(bottom=0.1)
        plt.xlabel(xlabel, fontsize=45)
        plt.ylabel(ylabel, fontsize=45)
        plt.title(experiment+subtitle, fontsize=50)

        for time_index, timings in enumerate(array_of_timings):
            plt.plot(timings[exp_index], linewidth=5, marker='o', markersize=10, label=timings_labels[time_index], color=dataset_colors[time_index])

        plt.grid(color='gray', linestyle=':', linewidth=2, axis='y')
        plt.legend(fontsize=45)

        plt.savefig(f'{graphs_folder}Lineplot_{figure_name}_{experiment}.pdf', format='pdf', orientation='landscape')
        plt.savefig(f'{graphs_folder}Lineplot_{figure_name}_{experiment}.svg', format='svg', orientation='landscape')
        plt.close()


# ---------------------------------------------------------------------------------------------------- #


def remove_Trailing_Space(x):
    if(type(x) == str):
        return x.strip()
    else:
        return x

# Transform a string list into an array
def string_To_List(string):
    string_list = string.split(' ')
    timings = numpy.array(list(map(lambda x: float(x), string_list)))

    # # Sort timings, makes the removal trivial
    # timings.sort()

    # # Remove best and worst case
    # timings = timings[1:(timings.size-1)]

    return timings

# https://towardsdatascience.com/normalization-vs-standardization-explained-209e84d0f81e?gi=f8efb318aa3b
def normalize_Array(array):
    normalized_array = list( map(lambda array_item: (array_item - numpy.min(array)) / (numpy.max(array) - numpy.min(array)), array) )

    #standardized_array = list( map(lambda array_item: (array_item - numpy.mean(array)) / (numpy.std(array, ddof=1)), array) )

    return normalized_array

total_data = pandas.read_csv('Perf_results.tsv', sep='\t')

# Remove unecessary spaces
total_data.columns = list(map(remove_Trailing_Space, total_data.columns))
total_data = total_data.applymap(remove_Trailing_Space)

total_data['Test_program'] = total_data['Test_program'].apply(lambda x: x.split('.')[0])

# Transform the timings into arrays
# Calculate means, median and standard deviation
# ddof (Degrees of Freedom) = 1, since this is a sample
total_data['Miliseconds'] = total_data['Miliseconds'].apply(string_To_List)

print(total_data)

total_data['Miliseconds_organized'] = total_data['Miliseconds'].apply(lambda x: numpy.sort(x)[1:( x.size-1 )])
total_data['Mean_miliseconds'] = total_data['Miliseconds_organized'].apply(lambda x: numpy.mean(x))
total_data['Median_miliseconds'] = total_data['Miliseconds_organized'].apply(lambda x: numpy.median(x))
total_data['Std_miliseconds'] = total_data['Miliseconds_organized'].apply(lambda x: numpy.std(x, ddof=1))
total_data['Miliseconds_max'] = numpy.vectorize(lambda x: numpy.max(x))(total_data['Miliseconds'])
total_data['Miliseconds_min'] = numpy.vectorize(lambda x: numpy.min(x))(total_data['Miliseconds'])
#total_data['Miliseconds_scale'] = total_data['Miliseconds'].apply(normalize_Array)



total_data['Microseconds'] = total_data['Microseconds'].apply(string_To_List)

total_data['Microseconds_organized'] = total_data['Microseconds'].apply(lambda x: numpy.sort(x)[1:( x.size-1 )]) # Remove the best and the worst case
total_data['Mean_microseconds'] = total_data['Microseconds_organized'].apply(lambda x: numpy.mean(x))
total_data['Median_microseconds'] = total_data['Microseconds_organized'].apply(lambda x: numpy.median(x))
total_data['Std_microseconds'] = total_data['Microseconds_organized'].apply(lambda x: numpy.std(x, ddof=1))
total_data['Microseconds_max'] = numpy.vectorize(lambda x: numpy.max(x))(total_data['Microseconds'])
total_data['Microseconds_min'] = numpy.vectorize(lambda x: numpy.min(x))(total_data['Microseconds'])
#total_data['Microseconds_scale'] = total_data['Microseconds'].apply(normalize_Array)


# Show the amount of runs
total_data['Number_of_executions'] = total_data['Microseconds'].apply(lambda x: len(x))


# Not necessary, the resolution is in microseconds anyways (browser)
total_data = total_data.drop(columns=['Nanoseconds']) 

# Index all items - preserve across queries
total_data['Index'] = total_data.index.values.tolist()

# Necessary for pandasql to work
#data_without_timings = total_data.drop(columns=['Miliseconds', 'Microseconds'])

print(total_data)

total_data.drop(columns=['Miliseconds', 'Miliseconds_organized', 'Microseconds', 'Microseconds_organized']).to_csv('Results_python.csv', index=False)


# ---------------------------------------------------------------------------------------------------- #

# Queries
#LLC = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'LLC' ORDER BY Test_program ASC""")
LLC = total_data.loc[total_data['Alias'] == 'LLC'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
LLC_no_return_0 = LLC.loc[LLC['Test_program'] != 'return_0']

#LLC_pivot_root = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'LLC(pivot-root)' ORDER BY Test_program ASC""") # Ajustar alias
LLC_pivot_root = total_data.loc[total_data['Alias'] == 'LLC(pivot-root)'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
LLC_pivot_root_no_return_0 = LLC_pivot_root.loc[LLC_pivot_root['Test_program'] != 'return_0']

#LLC_seccomp = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'LLC(seccomp)' ORDER BY Test_program ASC""")
LLC_seccomp = total_data.loc[total_data['Alias'] == 'LLC(seccomp)'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
LLC_seccomp_no_return_0 = LLC_seccomp.loc[LLC_seccomp['Test_program'] != 'return_0']


#chrome = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'chrome' ORDER BY Test_program ASC""")
chrome = total_data.loc[total_data['Alias'] == 'chrome'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
chrome_no_return_0 = chrome.loc[chrome['Test_program'] != 'return_0']

#chromium = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'chromium' ORDER BY Test_program ASC""")
chromium = total_data.loc[total_data['Alias'] == 'chromium'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
chromium_no_return_0 = chromium.loc[chromium['Test_program'] != 'return_0']

#firefox = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'firefox' ORDER BY Test_program ASC""")
firefox = total_data.loc[total_data['Alias'] == 'firefox'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
firefox_no_return_0 = firefox.loc[firefox['Test_program'] != 'return_0']

#native = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Type = 'native' ORDER BY Test_program ASC""")
native = total_data.loc[total_data['Type'] == 'native'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
native_no_return_0 = native.loc[native['Test_program'] != 'return_0']

# Startup
startup_tests = total_data.loc[total_data['Test_program'].str.contains('return_0') & ~total_data['Alias'].str.contains('podman') & ~total_data['Type'].str.contains('web_wasm')].sort_values(by=['Mean_microseconds'], ignore_index=True).replace({numpy.nan: None})

startup_Graph(startup_tests['Mean_microseconds'], startup_tests['Alias'], startup_tests['Type'], ['Nativo', 'Contêiner', 'LLC'], 'Startup')

# Bar plot
# Wasm vs
relative_Perf_Graph([native['Mean_microseconds']/chrome['Mean_microseconds'], native['Mean_microseconds']/chromium['Mean_microseconds'], native['Mean_microseconds']/firefox['Mean_microseconds']], ['chrome', 'chromium', 'firefox'], ['crimson', 'royalblue', 'gold'], chrome['Test_program'], 'Speedup', 'WASM vs Nativo', 1, 'Nativo', 'WASM_Native')
relative_Perf_Graph([native_no_return_0['Mean_microseconds']/chrome_no_return_0['Mean_microseconds'], native_no_return_0['Mean_microseconds']/chromium_no_return_0['Mean_microseconds'], native_no_return_0['Mean_microseconds']/firefox_no_return_0['Mean_microseconds']], ['chrome', 'chromium', 'firefox'], ['crimson', 'royalblue', 'gold'], chrome_no_return_0['Test_program'], 'Speedup', 'WASM vs Nativo', 1, 'Nativo', 'WASM_Native_02')

# LLC vs
relative_Perf_Graph([native['Mean_microseconds']/LLC['Mean_microseconds'], native['Mean_microseconds']/LLC_pivot_root['Mean_microseconds'], native['Mean_microseconds']/LLC_seccomp['Mean_microseconds']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], ['crimson', 'royalblue', 'gold'], LLC_seccomp['Test_program'], 'Speedup', 'LLC vs Nativo', 1, 'Nativo', 'LLC_Native')
relative_Perf_Graph([native_no_return_0['Mean_microseconds']/LLC_no_return_0['Mean_microseconds'], native_no_return_0['Mean_microseconds']/LLC_pivot_root_no_return_0['Mean_microseconds'], native_no_return_0['Mean_microseconds']/LLC_seccomp_no_return_0['Mean_microseconds']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], ['crimson', 'royalblue', 'gold'], LLC_seccomp_no_return_0['Test_program'], 'Speedup', 'LLC vs Nativo', 1, 'Nativo', 'LLC_Native_02')

relative_Perf_Graph([chrome['Mean_microseconds']/LLC['Mean_microseconds'], chrome['Mean_microseconds']/LLC_pivot_root['Mean_microseconds'], chrome['Mean_microseconds']/LLC_seccomp['Mean_microseconds']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], ['crimson', 'royalblue', 'gold'], LLC_seccomp['Test_program'], 'Speedup', 'LLC vs WASM(Chrome)', 1, 'WebAssembly', 'LLC_Chrome')
relative_Perf_Graph([chrome_no_return_0['Mean_microseconds']/LLC_no_return_0['Mean_microseconds'], chrome_no_return_0['Mean_microseconds']/LLC_pivot_root_no_return_0['Mean_microseconds'], chrome_no_return_0['Mean_microseconds']/LLC_seccomp_no_return_0['Mean_microseconds']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], ['crimson', 'royalblue', 'gold'], LLC_seccomp_no_return_0['Test_program'], 'Speedup', 'LLC vs WASM(Chrome)', 1, 'WebAssembly', 'LLC_Chrome_02')

relative_Perf_Graph([chromium['Mean_microseconds']/LLC['Mean_microseconds'], chromium['Mean_microseconds']/LLC_pivot_root['Mean_microseconds'], chromium['Mean_microseconds']/LLC_seccomp['Mean_microseconds']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], ['crimson', 'royalblue', 'gold'], LLC_seccomp['Test_program'], 'Speedup', 'LLC vs WASM(Chromium)', 1, 'WebAssembly', 'LLC_Chromium')
relative_Perf_Graph([chromium_no_return_0['Mean_microseconds']/LLC_no_return_0['Mean_microseconds'], chromium_no_return_0['Mean_microseconds']/LLC_pivot_root_no_return_0['Mean_microseconds'], chromium_no_return_0['Mean_microseconds']/LLC_seccomp_no_return_0['Mean_microseconds']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], ['crimson', 'royalblue', 'gold'], LLC_seccomp_no_return_0['Test_program'], 'Speedup', 'LLC vs WASM(Chromium)', 1, 'WebAssembly', 'LLC_Chromium_02')

relative_Perf_Graph([firefox_no_return_0['Mean_microseconds']/LLC_no_return_0['Mean_microseconds'], firefox_no_return_0['Mean_microseconds']/LLC_pivot_root_no_return_0['Mean_microseconds'], firefox_no_return_0['Mean_microseconds']/LLC_seccomp_no_return_0['Mean_microseconds']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], ['crimson', 'royalblue', 'gold'], LLC_seccomp_no_return_0['Test_program'], 'Speedup', 'LLC vs WASM(Firefox)', 1, 'WebAssembly', 'LLC_Firefox_02')

# Boxplot
#boxplt_Template([LLC['Microseconds_scale'], LLC_pivot_root['Microseconds_scale']], ['LLC', 'LLC_pivot_root'], LLC['Test_program'], 'Tempo de execução(us)', 'LLC')
#boxplt_Template([chrome['Microseconds_scale'], chromium['Microseconds_scale'], firefox['Microseconds_scale']], ['chrome', 'chromium', 'firefox'], chrome['Test_program'], 'Tempo de execução(us)', 'WASM')

# Line plot
#line_Chart_Timings([chrome['Microseconds_scale'], chromium['Microseconds_scale'], firefox['Microseconds_scale']], ['chrome', 'chromium', 'firefox'], chrome['Test_program'], '\n(todos os tempos de execução)', ['crimson', 'royalblue', 'gold'], 'Número de execuções', 'Tempo de execução(us)', 'WASM')
#line_Chart_Timings([LLC['Microseconds'], LLC_pivot_root['Microseconds'], LLC_seccomp['Microseconds']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], LLC['Test_program'], '\n(todos os tempos de execução)', ['crimson', 'royalblue', 'gold'], 'Número de execuções', 'Tempo de execução(us)', 'LLC')
#line_Chart_Timings([native['Microseconds']], ['Nativo'], native['Test_program'], '\n(todos os tempos de execução)', ['royalblue'], 'Número de execuções', 'Tempo de execução(us)', 'Nativo')
#
#line_Chart_Timings([chrome['Microseconds_organized'], chromium['Microseconds_organized'], firefox['Microseconds_organized']], ['chrome', 'chromium', 'firefox'], chrome['Test_program'], '\n(tempos de execução ordenados sem o melhor e pior caso)', ['crimson', 'royalblue', 'gold'], 'Número de execuções', 'Tempo de execução(us)', 'WASM_Sort')
#line_Chart_Timings([LLC['Microseconds_organized'], LLC_pivot_root['Microseconds_organized'], LLC_seccomp['Microseconds_organized']], ['LLC', 'LLC_pivot_root', 'LLC_seccomp'], LLC['Test_program'], '\n(tempos de execução ordenados sem o melhor e pior caso)', ['crimson', 'royalblue', 'gold'], 'Número de execuções', 'Tempo de execução(us)', 'LLC_Sort')
#line_Chart_Timings([native['Microseconds_organized']], ['Nativo'], native['Test_program'], '\n(tempos de execução ordenados sem o melhor e pior caso)', ['royalblue'], 'Número de execuções', 'Tempo de execução(us)', 'Nativo_Sort')

