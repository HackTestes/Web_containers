import pandas
import pandasql
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy
import math

# Configuration
graphs_folder = './Graphs/'

# Graph template functions
def startup_Graph():
    # Bar plot
    startup_tests = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Test_program LIKE 'return_0%' AND Command NOT LIKE '%podman%' ORDER BY Mean_microseconds """)

    print(startup_tests)

    plt.rcParams.update({'font.size': 40})
    plt.subplots(figsize=(35,35))
    plt.xticks(rotation=45, horizontalalignment='right')
    plt.subplots_adjust(bottom=0.3)
    plt.xlabel('Programas de teste', fontsize=45)
    plt.ylabel('Médias dos tempos (us)', fontsize=45)
    plt.title('Tempos de inicialização', fontsize=50)

    positions = range(0, startup_tests.shape[0]*2, 2)
    colors = startup_tests['Type'].map({'native': 'royalblue', 'web_wasm': 'gold', 'container': 'olivedrab', 'custom_container': 'darkorange'})
    legend_handles = []

    bars = plt.bar(positions, startup_tests['Mean_microseconds'].astype(int), tick_label=startup_tests['Alias'], color=colors)

    plt.grid(color='gray', linestyle=':', linewidth=2, axis='y')
    for index, item in enumerate(startup_tests['Type'].unique()):
        legend_handles.append(mpatches.Patch(color=colors.unique()[index], label=item))
    plt.legend(handles=legend_handles, fontsize=45)

    # https://stackoverflow.com/questions/53066633/python-how-to-show-values-on-top-of-bar-plot
    for bar in bars:
        yval = bar.get_height()
        if(len(str(yval)) == 2):
            plt.text(bar.get_x() + bar.get_width()/8, yval + 0.5, yval)
        elif(len(str(yval)) == 3):
            plt.text(bar.get_x() - bar.get_width()/6, yval + 0.5, yval)
        else:
            plt.text(bar.get_x() - bar.get_width()/3, yval + 0.5, yval)
    plt.savefig(f'{graphs_folder}Startup.pdf', format='pdf', orientation='landscape')


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

    plt.savefig(f'{graphs_folder}{figure_name}', format='pdf', orientation='landscape')
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


total_data['Microseconds'] = total_data['Microseconds'].apply(string_To_List)

total_data['Microseconds_organized'] = total_data['Microseconds'].apply(lambda x: numpy.sort(x)[1:( x.size-1 )]) # Remove the best and the worst case
total_data['Mean_microseconds'] = total_data['Microseconds_organized'].apply(lambda x: numpy.mean(x))
total_data['Median_microseconds'] = total_data['Microseconds_organized'].apply(lambda x: numpy.median(x))
total_data['Std_microseconds'] = total_data['Microseconds_organized'].apply(lambda x: numpy.std(x, ddof=1))

# Show the amount of runs
total_data['Number_of_executions'] = total_data['Microseconds'].apply(lambda x: len(x))


# Not necessary, the resolution is in microseconds anyways (browser)
total_data = total_data.drop(columns=['Nanoseconds']) 

# Index all items - preserve across queries
total_data['Index'] = total_data.index.values.tolist()

# Necessary for pandasql to work
data_without_timings = total_data.drop(columns=['Miliseconds', 'Microseconds'])

print(total_data)
total_data.to_csv('Results_python.csv', index=False)


# ---------------------------------------------------------------------------------------------------- #

# Queries
#sandbox = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'sandbox' ORDER BY Test_program ASC""")
sandbox = total_data.loc[total_data['Alias'] == 'sandbox'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
sandbox_no_return_0 = sandbox.loc[sandbox['Test_program'] != 'return_0']

#sandbox_pivot_root = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'sandbox(pivot-root)' ORDER BY Test_program ASC""") # Ajustar alias
sandbox_pivot_root = total_data.loc[total_data['Alias'] == 'sandbox(pivot-root)'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
sandbox_pivot_root_no_return_0 = sandbox_pivot_root.loc[sandbox_pivot_root['Test_program'] != 'return_0']

#sandbox_seccomp = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Alias = 'sandbox(seccomp)' ORDER BY Test_program ASC""")
sandbox_seccomp = total_data.loc[total_data['Alias'] == 'sandbox(seccomp)'].sort_values(by=['Test_program'], ignore_index=True).replace({numpy.nan: None})
sandbox_seccomp_no_return_0 = sandbox_seccomp.loc[sandbox_seccomp['Test_program'] != 'return_0']


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


startup_Graph()

# Bar plot
# Wasm vs
relative_Perf_Graph([native['Mean_microseconds']/chrome['Mean_microseconds'], native['Mean_microseconds']/chromium['Mean_microseconds'], native['Mean_microseconds']/firefox['Mean_microseconds']], ['chrome', 'chromium', 'firefox'], ['crimson', 'royalblue', 'gold'], chrome['Test_program'], 'Speedup', 'WASM vs Nativo', 1, 'Nativo', 'WASM_Native.pdf')
relative_Perf_Graph([native_no_return_0['Mean_microseconds']/chrome_no_return_0['Mean_microseconds'], native_no_return_0['Mean_microseconds']/chromium_no_return_0['Mean_microseconds'], native_no_return_0['Mean_microseconds']/firefox_no_return_0['Mean_microseconds']], ['chrome', 'chromium', 'firefox'], ['crimson', 'royalblue', 'gold'], chrome_no_return_0['Test_program'], 'Speedup', 'WASM vs Nativo', 1, 'Nativo', 'WASM_Native_02.pdf')

# Sandbox vs
relative_Perf_Graph([native['Mean_microseconds']/sandbox['Mean_microseconds'], native['Mean_microseconds']/sandbox_pivot_root['Mean_microseconds'], native['Mean_microseconds']/sandbox_seccomp['Mean_microseconds']], ['sandbox', 'sandbox_pivot_root', 'sandbox_seccomp'], ['crimson', 'royalblue', 'gold'], sandbox_seccomp['Test_program'], 'Speedup', 'Sandbox vs Nativo', 1, 'Nativo', 'Sandbox_Native.pdf')
relative_Perf_Graph([chrome['Mean_microseconds']/sandbox['Mean_microseconds'], chrome['Mean_microseconds']/sandbox_pivot_root['Mean_microseconds'], chrome['Mean_microseconds']/sandbox_seccomp['Mean_microseconds']], ['sandbox', 'sandbox_pivot_root', 'sandbox_seccomp'], ['crimson', 'royalblue', 'gold'], sandbox_seccomp['Test_program'], 'Speedup', 'Sandbox vs Chrome(WASM)', 1, 'WebAssembly', 'Sandbox_Chrome.pdf')
relative_Perf_Graph([chrome_no_return_0['Mean_microseconds']/sandbox_no_return_0['Mean_microseconds'], chrome_no_return_0['Mean_microseconds']/sandbox_pivot_root_no_return_0['Mean_microseconds'], chrome_no_return_0['Mean_microseconds']/sandbox_seccomp_no_return_0['Mean_microseconds']], ['sandbox', 'sandbox_pivot_root', 'sandbox_seccomp'], ['crimson', 'royalblue', 'gold'], sandbox_seccomp_no_return_0['Test_program'], 'Speedup', 'Sandbox vs Chrome(WASM)', 1, 'WebAssembly', 'Sandbox_Chrome_02.pdf')

relative_Perf_Graph([chromium['Mean_microseconds']/sandbox['Mean_microseconds'], chromium['Mean_microseconds']/sandbox_pivot_root['Mean_microseconds'], chromium['Mean_microseconds']/sandbox_seccomp['Mean_microseconds']], ['sandbox', 'sandbox_pivot_root', 'sandbox_seccomp'], ['crimson', 'royalblue', 'gold'], sandbox_seccomp['Test_program'], 'Speedup', 'Sandbox vs Chromium(WASM)', 1, 'WebAssembly', 'Sandbox_Chromium.pdf')
relative_Perf_Graph([chromium_no_return_0['Mean_microseconds']/sandbox_no_return_0['Mean_microseconds'], chromium_no_return_0['Mean_microseconds']/sandbox_pivot_root_no_return_0['Mean_microseconds'], chromium_no_return_0['Mean_microseconds']/sandbox_seccomp_no_return_0['Mean_microseconds']], ['sandbox', 'sandbox_pivot_root', 'sandbox_seccomp'], ['crimson', 'royalblue', 'gold'], sandbox_seccomp_no_return_0['Test_program'], 'Speedup', 'Sandbox vs Chromium(WASM)', 1, 'WebAssembly', 'Sandbox_Chromium_02.pdf')
relative_Perf_Graph([firefox_no_return_0['Mean_microseconds']/sandbox_no_return_0['Mean_microseconds'], firefox_no_return_0['Mean_microseconds']/sandbox_pivot_root_no_return_0['Mean_microseconds'], firefox_no_return_0['Mean_microseconds']/sandbox_seccomp_no_return_0['Mean_microseconds']], ['sandbox', 'sandbox_pivot_root', 'sandbox_seccomp'], ['crimson', 'royalblue', 'gold'], sandbox_seccomp_no_return_0['Test_program'], 'Speedup', 'Sandbox vs Firefox(WASM)', 1, 'WebAssembly', 'Sandbox_Firefox_02.pdf')

# Boxplot
boxplt_Template([sandbox['Microseconds'], sandbox_pivot_root['Microseconds']], ['sandbox', 'sandbox_pivot_root'], sandbox['Test_program'], 'Tempo de execução(us)', 'Sandbox')
boxplt_Template([chrome['Microseconds'], chromium['Microseconds'], firefox['Microseconds']], ['chrome', 'chromium', 'firefox'], chrome['Test_program'], 'Tempo de execução(us)', 'WASM')

# Line plot
line_Chart_Timings([chrome['Microseconds'], chromium['Microseconds'], firefox['Microseconds']], ['chrome', 'chromium', 'firefox'], chrome['Test_program'], '\n(todos os tempos de execução)', ['crimson', 'royalblue', 'gold'], 'Número de execuções', 'Tempo de execução(us)', 'WASM')
line_Chart_Timings([sandbox['Microseconds'], sandbox_pivot_root['Microseconds'], sandbox_seccomp['Microseconds']], ['sandbox', 'sandbox_pivot_root', 'sandbox_seccomp'], sandbox['Test_program'], '\n(todos os tempos de execução)', ['crimson', 'royalblue', 'gold'], 'Número de execuções', 'Tempo de execução(us)', 'Sandbox')
line_Chart_Timings([native['Microseconds']], ['Nativo'], native['Test_program'], '\n(todos os tempos de execução)', ['royalblue'], 'Número de execuções', 'Tempo de execução(us)', 'Nativo')

line_Chart_Timings([chrome['Microseconds_organized'], chromium['Microseconds_organized'], firefox['Microseconds_organized']], ['chrome', 'chromium', 'firefox'], chrome['Test_program'], '\n(tempos de execução ordenados sem o melhor e pior caso)', ['crimson', 'royalblue', 'gold'], 'Número de execuções', 'Tempo de execução(us)', 'WASM_Sort')
line_Chart_Timings([sandbox['Microseconds_organized'], sandbox_pivot_root['Microseconds_organized'], sandbox_seccomp['Microseconds_organized']], ['sandbox', 'sandbox_pivot_root', 'sandbox_seccomp'], sandbox['Test_program'], '\n(tempos de execução ordenados sem o melhor e pior caso)', ['crimson', 'royalblue', 'gold'], 'Número de execuções', 'Tempo de execução(us)', 'Sandbox_Sort')
line_Chart_Timings([native['Microseconds_organized']], ['Nativo'], native['Test_program'], '\n(tempos de execução ordenados sem o melhor e pior caso)', ['royalblue'], 'Número de execuções', 'Tempo de execução(us)', 'Nativo_Sort')

